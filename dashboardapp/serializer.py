from rest_framework import serializers

class XAISerializer(serializers.Serializer):
    typ = serializers.CharField()
    mdl = serializers.CharField()
    pred = serializers.DictField(child=serializers.FloatField())
    d = serializers.DictField(child=serializers.FloatField())



class WhatIfSerializer(serializers.Serializer):
    typ = serializers.CharField()
    d = serializers.JSONField()

