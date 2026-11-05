import secrets
import threading
from typing import cast

from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.core.files import File
from django.contrib.auth.decorators import login_required


from videos.models import Video
from videos.services import process_video_with_ffmpeg, save_uploaded_video
from .models import StreamSession
from .services import create_session


# Create your views here.
@login_required
def render_landing(request):
    user = request.user
    videos = Video.objects.filter(owner=user)
    context = {
        'videos': videos
    }
    return render(request, 'rooms/index.html', context)

@login_required
def create_room(request):
    if request.method != 'POST':
        return HttpResponse("Méthode non autorisée.", status=405)
    
    user = request.user

    pk_video = request.POST.get("pk_video")

    if pk_video:
        video = get_object_or_404(Video, pk=pk_video)
    
        
        session = create_session(video=video, host=user)
        return redirect('detail', session.code)

    video_file = cast(File, request.FILES.get('video_file'))
    
    if video_file:

        video = save_uploaded_video(video_file, user)
        
        thread = threading.Thread(
            target=process_video_with_ffmpeg, 
            args=(video, video_file.name)
        )

        thread.daemon = True
        thread.start()

        session = create_session(video=video, host=user)
        return redirect('detail', session.code)
    
    return HttpResponse("Bad request", status=400)




@login_required
def detail(request, code):

    session = get_object_or_404(StreamSession, code=code)
    video = session.video 
    context = {
        'video': video,
        'session': session
    }
    return render(request, 'rooms/room.html', context)