from django.db import models
from userapp.models import User
from django.contrib import admin
from django.contrib.postgres.fields import JSONField

# Create your models here.
class ChatQuestion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatquestions')
    question_text = models.TextField()
    response_json = models.JSONField(blank=True, null=True, default=dict)
    timestamp = models.DateTimeField(auto_now=True)

admin.site.register(ChatQuestion)