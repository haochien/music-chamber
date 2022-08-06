from django.shortcuts import render
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import ChamberSerializer, CreateChamberSerializer
from .models import Chamber, ChamberMembers
from .utils import check_user_in_another_chamber

from common.utils.work_with_model import WorkWithModel



class ChamberView(generics.ListAPIView):
    queryset = Chamber.objects.all()
    serializer_class = ChamberSerializer


class CreateChamberView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateChamberSerializer

    def post(self, request):
        #TODO: split update and create. When user has been in another chamber and try to create another chamber, display error
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            chamber_name = serializer.data.get('chamber_name')
            access_guest_can_pause = serializer.data.get('access_guest_can_pause')
            votes_song_skip = serializer.data.get('votes_song_skip')
            is_public = serializer.data.get('is_public')
            user_spotify_id = request.user.spotify_id

            queryset_filter = Q(host_spotify_id=user_spotify_id) & Q(is_active=True)
            queryset = Chamber.objects.filter(queryset_filter)
            list_model_fields = ['chamber_name', 'access_guest_can_pause', 'votes_song_skip', 'is_public', 'host_spotify_id_id']
            list_model_values = [chamber_name, access_guest_can_pause, votes_song_skip, is_public, user_spotify_id]

            if queryset.exists():
                WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', queryset)
                instance = queryset[0]
                return Response(ChamberSerializer(instance).data, status=status.HTTP_200_OK)
            else:
                # check whether user has been in another chamber
                dict_check_result = check_user_in_another_chamber(chamber_id=None, user_spotify_id=user_spotify_id)
                if len(dict_check_result) > 0:
                    return Response(dict_check_result, status=status.HTTP_400_BAD_REQUEST)

                instance = WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'create')
                return Response(ChamberSerializer(instance).data, status=status.HTTP_201_CREATED)
        
        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)


class GetChamberView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChamberSerializer
    url_search_kwarg = 'id'
    
    def get(self, request):
        chamber_id = request.GET.get(self.url_search_kwarg)
        if chamber_id is not None:
            queryset = Chamber.objects.filter(chamber_id=chamber_id)

            if queryset.exists():
                user_spotify_id = request.user.spotify_id
                
                # check whether user has been in another chamber
                dict_check_result = check_user_in_another_chamber(chamber_id, user_spotify_id)
                if len(dict_check_result) > 0:
                    return Response(dict_check_result, status=status.HTTP_400_BAD_REQUEST)

                # create or update member status to the chamber
                filter_members = Q(chamber_id=chamber_id) & Q(spotify_id=user_spotify_id)
                queryset_members = ChamberMembers.objects.filter(filter_members)
                if queryset_members.exists():
                    WorkWithModel.create_or_update_model(ChamberMembers, ['is_in_chamber'], [True], 'update', queryset_members)
                else:
                    list_model_fields =  ['chamber_id_id', 'spotify_id_id', 'is_in_chamber']
                    list_model_values = [chamber_id, user_spotify_id, True]
                    WorkWithModel.create_or_update_model(ChamberMembers, list_model_fields, list_model_values, 'create')

                self.request.session['chamber_id'] = chamber_id  # store chamber_id in user session for rejoin

                # check whether member is host
                serializer_data = ChamberSerializer(queryset[0]).data
                serializer_data['is_host'] = queryset[0].host_spotify_id_id == user_spotify_id
                return Response(serializer_data, status=status.HTTP_200_OK)

            return Response({'Bad Request': 'Invalud Chamber ID'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': "No searching parameter 'id' in the request"}, status=status.HTTP_400_BAD_REQUEST)




        