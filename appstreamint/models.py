from django.db import models
from django.contrib.auth.models import AbstractBaseUser


class User(AbstractBaseUser):
    email = models.EmailField(unique=True, null=False, blank=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    username = models.CharField(
        unique=True,
        max_length=30,
        null=False,
        blank=False
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Video(models.Model):

    class Status(models.TextChoices):
        UPLOADED = 'Uploaded'
        PROCESSING = 'Processing'
        READY = 'Ready'
        ERROR = 'Error'

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='videos'
    )

    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='videos/')

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED
    )

    created_at = models.DateTimeField(auto_now_add=True)


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