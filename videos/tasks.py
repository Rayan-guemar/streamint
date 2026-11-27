from celery import shared_task
from videos.models import Video
from videos.services import process_video_with_ffmpeg



@shared_task(bind=True, max_retries=3)
def task_process_video(self, video_id: int, filename: str):
    try:
        video = Video.objects.get(pk=video_id)

        process_video_with_ffmpeg(video, filename)
    except Video.DoesNotExist:
        pass
    except Exception as exc:
        raise self.retry(exc=exc, countdown=10)