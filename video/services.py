import os
import subprocess

from django.conf import settings
from django.core.files import File

from appstreamint.models import Video, User


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


def save_uploaded_video(file: File) -> Video:
    name = file.name
    dir_path = get_original_dir()
    ensure_directory_exists(dir_path)
    file_path = get_original_path(name)
    write_file_chunks(file_path, file)
    owner = User.objects.first()
    if owner is None:
        owner = User(username='test', email='test@gmail.com')
        owner.save()

    new_video = Video(title=get_clean_name(name), status=Video.Status.UPLOADED)
   
    new_video.owner = owner
    new_video.save()
    return new_video

def process_video_with_ffmpeg(video:Video, filename:str) -> str | None:
    print("Processing video to multi-resolution HLS...")
    name = filename
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
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-filter_complex",
        "[0:v]fps=30,scale=w=1920:h=1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2[v1]; [0:v]fps=30,scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v2]; [0:v]fps=30,scale=w=854:h=480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2[v3]",
        "-map", "[v1]",
        "-c:v:0", "libx264",
        "-b:v:0", "4M",
        "-maxrate:v:0", "4.2M",
        "-bufsize:v:0", "6M",
        "-preset", "medium",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-map", "[v2]",
        "-c:v:1", "libx264",
        "-b:v:1", "2M",
        "-maxrate:v:1", "2.1M",
        "-bufsize:v:1", "3M",
        "-preset", "medium",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-map", "[v3]",
        "-c:v:2", "libx264",
        "-b:v:2", "800k",
        "-maxrate:v:2", "850k",
        "-bufsize:v:2", "1.2M",
        "-preset", "medium",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-map", "1:a",
        "-c:a:0", "aac",
        "-b:a:0", "128k",
        "-map", "1:a",
        "-c:a:1", "aac",
        "-b:a:1", "128k",
        "-map", "1:a",
        "-c:a:2", "aac",
        "-b:a:2", "96k",
        "-shortest",
        "-f", "hls",
        "-hls_time", "4",
        "-hls_playlist_type", "vod",
        "-hls_flags", "independent_segments",
        "-hls_segment_type", "mpegts",
        "-hls_segment_filename", os.path.join(video_hls_dir, "stream_%v_%d.ts"),
        "-master_pl_name", "master.m3u8",
        "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2",
        os.path.join(video_hls_dir, "stream_%v.m3u8")
    ]

    try:
        video.status = Video.Status.PROCESSING
        execute_ffmpeg_command(command)
        print("\nVIDEO SUCCESSFULLY PROCESSED TO MULTI-RESOLUTION HLS\n")
        video.status = Video.Status.READY
        video.save()
        return f"hls/{clean_name}/master.m3u8"
        
    except subprocess.CalledProcessError as e:
        error_message = e.stderr if e.stderr else "Erreur inconnue"
        print(f"Erreur lors de l'exécution de FFmpeg :\n{error_message}")
        return None