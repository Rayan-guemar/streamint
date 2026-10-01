import os
import subprocess

from django.conf import settings
from django.core.files import File


def get_hls_dir() -> str:
    return os.path.join(settings.MEDIA_ROOT, 'hls')

def get_hls_path(name: str) -> str:
    return os.path.join(get_hls_dir(), name)

def get_original_dir() -> str:
    return os.path.join(settings.MEDIA_ROOT, 'originals')

def get_original_path(name: str) -> str:
    return os.path.join(get_original_dir(), name)

def get_clean_name(name: str) -> str:
    base_name, _ = os.path.splitext(name)
    return base_name.replace(" ", "_")

def ensure_directory_exists(dir_path: str) -> None:
    os.makedirs(dir_path, exist_ok=True)

def write_file_chunks(file_path: str, file: File) -> None:
    with open(file_path, "wb") as f:
        for chunk in file.chunks():
            f.write(chunk)

def execute_ffmpeg_command(command: list) -> None:
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    stderr_output = []
    for line in process.stderr:
        print(line, end="")
        stderr_output.append(line)
        
    process.wait()
    
    if process.returncode != 0:
        raise subprocess.CalledProcessError(
            process.returncode, 
            command, 
            stderr="".join(stderr_output)
        )


def save_uploaded_video(file: File) -> str:
    name = file.name
    dir_path = get_original_dir()
    ensure_directory_exists(dir_path)
    file_path = get_original_path(name)
    write_file_chunks(file_path, file)
    return file_path


def process_video_with_ffmpeg(name: str) -> str | None:
    print("Processing video to multi-resolution HLS...")
    clean_name = get_clean_name(name)
    
    original_file_path = get_original_path(name)
    hls_dir = get_hls_dir()
    video_hls_dir = get_hls_path(clean_name)
    
    ensure_directory_exists(hls_dir)
    ensure_directory_exists(video_hls_dir)

    command = [
        "ffmpeg",
        "-y",
        "-i", original_file_path,
        
        # Si la vidéo n'a pas d'audio, on génère une piste audio silencieuse de secours
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        
        # 1. Filtre complexe : [0:v] pour la vidéo de l'input 0, split en 2
        "-filter_complex", "[0:v]split=2[v1][v2]; [v1]scale=1280:-2[out1]; [v2]scale=854:-2[out2]",
        
        # --- Flux Vidéo 0 (720p) ---
        "-map", "[out1]",
        "-c:v:0", "libx264",
        "-b:v:0", "2500k",
        "-preset", "fast",
        
        # --- Flux Vidéo 1 (480p) ---
        "-map", "[out2]",
        "-c:v:1", "libx264",
        "-b:v:1", "1000k",
        "-preset", "fast",
        
        # --- Flux Audio : On prend l'audio de la source (0:a) s'il existe, sinon l'input 1 (silence) ---
        # L'utilisation de '?' évite le crash si 0:a n'existe pas
        "-map", "0:a?", 
        "-map", "1:a",
        "-c:a", "aac",
        "-b:a", "128k",
        
        # --- Paramètres HLS & Master ---
        "-f", "hls",
        "-hls_time", "6",
        "-hls_list_size", "0",
        
        "-master_pl_name", "master.m3u8",
        "-var_stream_map", "v:0,a:0 v:1,a:0", # On associe les deux flux vidéo au flux audio disponible
        
        "-hls_segment_filename", os.path.join(video_hls_dir, "stream_%v_%03d.ts"),
        os.path.join(video_hls_dir, "stream_%v.m3u8")
    ]
    
    try:
        execute_ffmpeg_command(command)
        print("\nVIDEO SUCCESSFULLY PROCESSED TO MULTI-RESOLUTION HLS\n")
        # On retourne le chemin relatif du master pour le stocker en base de données
        return f"hls/{clean_name}/master.m3u8"
        
    except subprocess.CalledProcessError as e:
        error_message = e.stderr if e.stderr else "Erreur inconnue"
        print(f"Erreur lors de l'exécution de FFmpeg :\n{error_message}")
        return None