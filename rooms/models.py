from django.db import models
from users.models import User
from videos.models import Video

# Create your models here.

class StreamSession(models.Model):
    host = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='hosted_streams'
    )
    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name='stream_sessions'
    )

    link = models.URLField(unique=True)
    code = models.CharField(max_length=20, unique=True)

    is_active = models.BooleanField(default=True)
    is_playing = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)


class StreamParticipant(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='stream_participations'
    )
    stream = models.ForeignKey(
        StreamSession,
        on_delete=models.CASCADE,
        related_name='participants'
    )

    role = models.CharField(max_length=20, default='viewer')

    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)