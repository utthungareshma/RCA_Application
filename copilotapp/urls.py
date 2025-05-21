from django.urls import path
from .views import *

urlpatterns = [
    path('create_prompt/', create_prompt),
    path('get_last_five_questions/', get_last_five_questions),
]