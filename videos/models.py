from django.db import models

from users.models import User

# Create your models here.
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