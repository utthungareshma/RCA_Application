from rest_framework import serializers
from .models import *

class ChatQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatQuestion
        fields = ['question_text', 'response_json', 'timestamp']


# from rest_framework import serializers

class WhatIfSerializer(serializers.Serializer):
    typ = serializers.CharField()
    d = serializers.JSONField()

