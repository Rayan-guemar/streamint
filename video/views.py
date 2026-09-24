import os
import threading

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core.files import File
from typing import cast

from video.services import ensure_directory_exists, get_hls_dir, save_uploaded_video, process_video_with_ffmpeg

#tmp
def get_all_video_folders() -> list[str]:
    hls_dir = get_hls_dir()
    ensure_directory_exists(hls_dir)
    return [
        d for d in os.listdir(hls_dir) 
        if os.path.isdir(os.path.join(hls_dir, d))
    ]

def upload_form_view(request):

    videos = get_all_video_folders
    context = {
        'videos': videos
    }
    return render(request, 'video/upload.html', context)

def handle_upload_view(request):
    """Réceptionne le fichier envoyé par le formulaire."""

    if request.method != 'POST':
        return HttpResponse("Méthode non autorisée.", status=405)
    
    video_file = cast(File, request.FILES.get('video_file'))
    
    if video_file:
        save_uploaded_video(video_file)

        thread = threading.Thread(
            target=process_video_with_ffmpeg, 
            args=(video_file.name)
        )

        thread.daemon = True
        thread.start()
        return redirect('upload_page')
    
    return redirect('upload_page')