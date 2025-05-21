from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib import admin

# Create your models here.
class User(AbstractUser):
    phone_number = models.CharField(max_length=120, blank=True, null=True)

admin.site.register(User)