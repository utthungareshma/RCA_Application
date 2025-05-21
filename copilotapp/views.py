from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import ChatQuestion
from .serializer import ChatQuestionSerializer
import requests
from django.db.models import Q
import json
from decouple import config
from decouple import Csv


# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prompt(request):
    try:
        user_prompt = request.data.get('prompt').strip()
        isAnalyzer = request.data.get('isAnalyzer')

        existing_qn = ChatQuestion.objects.filter(Q(question_text__iexact=user_prompt)).first()

        if not isAnalyzer:
            response_data = existing_qn.response_json
            existing_qn.save()

        else:
            #   calling HMI COPILOT API
            try:
                url = config('HMI_URL')
                token = config('HMI_TOKEN')
                # jwt = 'Bearer ' + token
                jwt = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoibmlraGlscGF0YW5nZSIsImV4cGlyZXMiOjE3MTQ1MTQwMDMuMTkyNDYzMn0.EPhl6ZhVa-T8fIu_nsW90w7FgVLANbrN0XV8w9XASKQ'
                headers = {'Authorization':jwt}
                payload = {'prompt': user_prompt}
                resp = requests.post(url=url, headers=headers,json=payload)

                if resp.status_code != 200:
                    return Response({"error": "Failed to fetch data from the HMI COPILOT API"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                response_data = resp.json()
                if response_data.get("type") == 1:
                     return Response({"error": "Could not generate response at the moment, please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                code_data = [] 
                code_items = response_data.get("code")
                if code_items is not None and isinstance(code_items, list):
                    for item in code_items:
                        if isinstance(item, str):
                            try:
                                code_item = json.loads(item)
                                code_data.append(code_item)
                            except json.JSONDecodeError:
                                return Response({"error": "Error while parsing"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        elif isinstance(item, dict):
                            code_data.append(item)
                        else:
                            return Response({"error": "Invalid 'code' item"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                response_data["code"] = code_data
                
                if not existing_qn: 
                    new_prompt = ChatQuestion.objects.create(user=request.user, question_text=user_prompt, response_json=response_data)
                else:
                    existing_qn.response_json = response_data
                    existing_qn.save()

            except Exception as e:
                return Response({"error":str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error":str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_last_five_questions(request):
    try:
        question_list = ChatQuestion.objects.filter(user=request.user).order_by('-timestamp')[:5]
        questions = ChatQuestionSerializer(question_list, many=True).data
        # create list of questions
        return Response({'data':questions}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error":str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    