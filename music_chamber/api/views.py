from django.shortcuts import render
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import ChamberSerializer, CreateChamberSerializer
from .models import Chamber

from common.utils.work_with_model import WorkWithModel



class ChamberView(generics.ListAPIView):
    queryset = Chamber.objects.all()
    serializer_class = ChamberSerializer


class CreateChamberView(APIView):
    serializer_class = CreateChamberSerializer

    def post(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()


        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            chamber_name = serializer.data.get('chamber_name')
            access_guest_can_pause = serializer.data.get('access_guest_can_pause')
            votes_song_skip = serializer.data.get('votes_song_skip')
            is_public = serializer.data.get('is_public')
            host_name = self.request.session.session_key

            queryset_filter = Q(host_name=host_name) & Q(is_active=True)
            queryset = Chamber.objects.filter(queryset_filter)
            list_model_fields = ['chamber_name', 'access_guest_can_pause', 'votes_song_skip', 'is_public', 'host_name']
            list_model_values = [chamber_name, access_guest_can_pause, votes_song_skip, is_public, host_name]

            if queryset.exists():
                WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', queryset)
                instance = queryset[0]
                return Response(ChamberSerializer(instance).data, status=status.HTTP_200_OK)
            else:
                instance = WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'create')
                return Response(ChamberSerializer(instance).data, status=status.HTTP_201_CREATED)
        
        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)