from django.db import models
from django.contrib.auth.models import AbstractBaseUser

# Create your models here.
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