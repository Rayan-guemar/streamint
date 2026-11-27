import os
import threading
import secrets
from typing import cast

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core.files import File
from django.contrib.auth.decorators import login_required


from videos.services import ensure_directory_exists, get_hls_dir, save_uploaded_video, process_video_with_ffmpeg

from videos.models import Video
from rooms.models import StreamSession
from videos.tasks import task_process_video



#tmp
def get_all_video_folders() -> list[str]:
    hls_dir = get_hls_dir()
    ensure_directory_exists(hls_dir)
    return [
        d for d in os.listdir(hls_dir) 
        if os.path.isdir(os.path.join(hls_dir, d))
    ]

# def upload_form_view(request):

#     videos = Video.objects.all()
#     context = {
#         'videos': videos
#     }
#     return render(request, 'video/upload.html', context)
@login_required
def handle_upload_view(request):

    if request.method != 'POST':
        return HttpResponse("Méthode non autorisée.", status=405)
    
    video_file = cast(File, request.FILES.get('video_file'))
    
    if video_file:

  
        video = save_uploaded_video(video_file, request.user)
        
        task_process_video.delay(video.pk, video_file.name)

        return redirect('create_room')
    
    return redirect('render_landing')