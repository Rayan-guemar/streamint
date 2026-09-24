import os
import subprocess

from django.core.files import File
from django.conf import settings


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
    return base_name

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
    
    for line in process.stderr:
        print(line, end="")
        
    process.wait()
    
    if process.returncode != 0:
        raise subprocess.CalledProcessError(process.returncode, command)


def save_uploaded_video(file: File) -> str:
    name = file.name
    dir_path = get_original_dir()
    ensure_directory_exists(dir_path)
    file_path = get_original_path(name)
    write_file_chunks(file_path, file)
    return file_path


def process_video_with_ffmpeg(name: str) -> str | None:
    clean_name = get_clean_name(name)
    
    original_file_path = get_original_path(name)
    hls_dir = get_hls_dir()
    video_hls_dir = get_hls_path(clean_name)
    
    ensure_directory_exists(hls_dir)
    ensure_directory_exists(video_hls_dir)

    playlist_path = os.path.join(video_hls_dir, 'playlist.m3u8')

    command = [
        "ffmpeg",
        "-i",
        original_file_path,
        "-f",
        "hls",
        playlist_path
    ]

    try:
        execute_ffmpeg_command(command)
        return f"hls/{clean_name}/playlist.m3u8"
        
    except subprocess.CalledProcessError as e:
        error_message = e.stderr.decode('utf-8', errors='ignore')
        print(f"Erreur lors de l'exécution de FFmpeg :\n{error_message}")
        return None