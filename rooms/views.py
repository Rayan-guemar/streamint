import secrets
import threading
from typing import cast

from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.core.files import File

from users.models import User
from videos.models import Video
from videos.services import process_video_with_ffmpeg, save_uploaded_video
from .models import StreamSession
from .service import create_session

# Create your views here.
def render_landing(request):
    videos = Video.objects.all()
    context = {
        'videos': videos
    }
    return render(request, 'rooms/index.html', context)


def create_room(request):
    if request.method != 'POST':
        return HttpResponse("Méthode non autorisée.", status=405)

    pk_video = request.POST.get("pk_video")

    if pk_video:
        video = Video.objects.get(pk=pk_video)
        if video is None:
            return HttpResponse("Video non trouvé.", status=404)
        
        session = create_session(video=video, host=video.owner)
        return redirect('detail', session.code)

    video_file = cast(File, request.FILES.get('video_file'))
    
    if video_file:

        video = save_uploaded_video(video_file)
        
        thread = threading.Thread(
            target=process_video_with_ffmpeg, 
            args=(video, video_file.name)
        )

        thread.daemon = True
        thread.start()

        session = create_session(video=video, host=video.owner)
        return redirect('detail', session.code)
    
    return HttpResponse("Bad request", status=400)





def detail(request, code):

    session = get_object_or_404(StreamSession, code=code)
    video = session.video 
    context = {
        'video': video,
        'session': session
    }
    return render(request, 'rooms/room.html', context)