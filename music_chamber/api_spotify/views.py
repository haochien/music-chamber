from datetime import datetime, timedelta
import time

from urllib import response
from django.shortcuts import render, redirect
from django.conf import settings
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from requests import Request, post, put

from .serializers import CreatePlaylistSerializer, PlaylistAddItemSerializer, ResumePlaybackSerializer, \
                         ChangePlaybackVolumeSerializer
from .utils import is_user_authenticated, spotify_web_api_operator, get_user_devices,\
                   transfer_device, get_song_info_by_id, get_song_on_play, get_my_playlist,\
                   get_playlist_items, get_playback_state, get_my_profile, create_playlist, playlist_add_item,\
                   resume_playlist, change_playback_volume, get_song_feature_by_id, get_playlist_total, get_login_user_profile
from api.models import Chamber
from common.utils import constant
from common.utils.work_with_model import WorkWithModel

from django.contrib.auth import authenticate, login

env = settings.ENV


class CheckUserAuth(APIView):
    def get(self, request):
        is_authenticated = is_user_authenticated(request)
        return Response({'is_auth': is_authenticated}, status=status.HTTP_200_OK)


class GetAuthURL(APIView):
    def get(self, request):
        #scopes = 'streaming user-read-email user-read-private'
        scopes = 'streaming user-read-email user-read-private user-read-playback-state user-read-currently-playing user-modify-playback-state playlist-modify-private playlist-modify-public'

        #TODO: add state into request
        auth_url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'client_id': env.str('SPOTIFY_CLIENT_ID'),
            'response_type': 'code',
            'scope': scopes, 
            'redirect_uri': env.str('SPOTIFY_REDIRECT_URL')   
        }).prepare().url


        return Response({"auth_url": auth_url}, status=status.HTTP_200_OK)


def get_auth_callback(request):
    code = request.GET.get('code')
    state = request.GET.get('state')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'code': code,
        'redirect_uri': env.str('SPOTIFY_REDIRECT_URL'),
        'grant_type': 'authorization_code',
        'client_id': env.str('SPOTIFY_CLIENT_ID'),
        'client_secret': env.str('SPOTIFY_CLIENT_SECRET')
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    scope = response.get('scope')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if error:
        #TODO: render to error page
        raise Exception(f"Spotify User Login Failed. Details: {error}")

    # get user profile
    dict_user_profile = get_login_user_profile(access_token=access_token)
    if 'Error' in response:
        return Exception(f"get_login_user_profile failed. Details: {response}")
    
    user_data = {**response, **dict_user_profile}

    # store callback info with user session
    spotify_user = authenticate(request, user_data=user_data)
    login(request, spotify_user, backend='api_spotify.auth.SpotifyAuthenticationBackend')

    # redirect to app
    if 'chamber_id' in request.session:
        chamber_id = request.session['chamber_id']
        return redirect(f'/chamber/{chamber_id}')
    else:
        return redirect('/')


class GetUserToken(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_token = request.user.access_token
        if user_token is not None:
            return Response({"access_token": user_token}, status=status.HTTP_200_OK)
        else:
            return Response({'Bad Request': "Access token for current session is not created yet"}, status=status.HTTP_400_BAD_REQUEST)


class GetDevices(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = get_user_devices(access_token=request.user.access_token)
        if 'Error' in response:
            return Response({response['Error_Type']: response['Error']}, status=response['Status'])

        return Response(response, status=status.HTTP_200_OK)


class TransferDevice(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        time.sleep(5)
        response = get_user_devices(access_token=request.user.access_token)
        if 'Error' in response:
            return Response({response['Error_Type']: response['Error']}, status=response['Status'])

        target_device_id = [dict_device['id'] for dict_device in response if dict_device['name']=='DESKTOP-181617V']
        if len(target_device_id) == 0:
            return Response({"Not Found": "Cannot find spotify device of Music Chamber"}, status=status.HTTP_404_NOT_FOUND)

        response = transfer_device(access_token=request.user.access_token, target_device_id=target_device_id)
        if 'Error' in response:
            return Response({response['Error_Type']: response['Error']}, status=response['Status'])
        
        return Response({"Success": f"Successfully connect to Music Chamber device - {target_device_id}"}, status=status.HTTP_204_NO_CONTENT)


class GetPlaybackState(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        playback_state = get_playback_state(access_token=request.user.access_token)

        if 'Error' in playback_state:
            return Response({playback_state['Error_Type']: playback_state['Error']}, status=playback_state['Status'])

        return Response(playback_state, status=status.HTTP_200_OK)


# class ResumePlayback(APIView):
#     serializer_class = ResumePlaybackSerializer

#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             context_uri = constant.uri_playlist + serializer.data.get('context_uri')
#             #uris = [uris.strip() for uris in serializer.data.get('uris').split(",")]
#             uri = constant.uri_track + serializer.data.get('uris')
#             offset = {"uri": uri} if len(uri) > 0 else {"position": serializer.data.get('offset')}
#             position_ms = int(serializer.data.get('position_ms'))

#             data = {"context_uri": context_uri, "offset": offset, "position_ms":position_ms}
#             response = resume_playlist(user_session=self.request.session.session_key, data=data)

#             if 'Error' in response:
#                 return Response({response['Error_Type']: response['Error']}, status=response['Status'])
#             else:
#                 return Response(response, status=status.HTTP_202_ACCEPTED)
        

#         return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)
    
#     def put(self, request):
#         chamber_id = self.request.session['chamber_id']
#         chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
#         if chamber_queryset.exists():
#             chamber_instance = chamber_queryset[0]
#         else:
#             return Response({}, status=status.HTTP_404_NOT_FOUND)

#         playlist_on_play, song_on_play, song_progress = self.get_song_in_chamber(chamber_instance)
#         uri = constant.uri_track + str(song_on_play)
#         offset = {"uri": uri} if len(uri) > 0 else {"position": 0}

#         data = {"context_uri": constant.uri_playlist+str(playlist_on_play), "offset": offset, "position_ms":song_progress}
#         response = resume_playlist(user_session=self.request.session.session_key, data=data)

#         if 'Error' in response:
#             return Response({response['Error_Type']: response['Error']}, status=response['Status'])
#         else:
#             return Response(response, status=status.HTTP_202_ACCEPTED)
    
#     def get_song_in_chamber(self, chamber_instance):
#         playlist_on_play = chamber_instance.playlist_on_play
#         song_on_play = chamber_instance.song_on_play
#         song_end_at = chamber_instance.song_end_at
#         song_duration = chamber_instance.song_duration
#         song_progress = int(song_duration - (song_end_at - timezone.now()).total_seconds()*1000)
#         return playlist_on_play, song_on_play, song_progress

class ResumePlayback(APIView):
    serializer_class = ResumePlaybackSerializer

    def put(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            host_name = ""
            chamber_id = self.request.session['chamber_id']
            chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
            
            if len(serializer.data.get('playlist_id')) > 0:
                playlist_on_play = serializer.data.get('playlist_id')
            elif chamber_queryset.exists():
                chamber_instance = chamber_queryset[0]
                playlist_on_play = chamber_instance.playlist_on_play
                host_name = chamber_instance.host_name
            else:
                return Response({"Error": "Cannot find user's chamber id"}, status=status.HTTP_404_NOT_FOUND)

            offset_by_song_id = constant.uri_track + serializer.data.get('offset_by_song_id')
            offset_by_song_position = serializer.data.get('offset_by_song_position')

            playlist_uri = constant.uri_playlist + str(playlist_on_play)
            offset = {"uri": offset_by_song_id} if len(serializer.data.get('offset_by_song_id')) > 0 else {"position": offset_by_song_position}
            song_progress = serializer.data.get('position_ms')
            data = {"context_uri": playlist_uri, "offset": offset, "position_ms":song_progress}

            response = resume_playlist(user_session=self.request.session.session_key, data=data)

            if 'Error' in response:
                return Response({response['Error_Type']: response['Error']}, status=response['Status'])
            else:
                # host changes is_play in model Chamber to True if song starts to be played 
                if host_name != "" and host_name == self.request.session.session_key and not chamber_instance.is_playing:
                    try:
                        self._update_is_playing_status(chamber_queryset, is_playing=True)
                    except Exception as ex:
                        return Response({'Storage Error': 'Cannot update is_playing status to database'}, status=status.HTTP_406_NOT_ACCEPTABLE)

                return Response(response, status=status.HTTP_202_ACCEPTED)
        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)
    
    def _update_is_playing_status(self, chamber_queryset, is_playing):
        list_model_fields = ['is_playing']
        list_model_values = [is_playing]
        WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', chamber_queryset)


class GetSongOnPlay(APIView):
    def get(self, request):
        chamber_id = self.request.session['chamber_id']
        chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
        if chamber_queryset.exists():
            chamber_instance = chamber_queryset[0]
        else:
            return Response({"Error": "Cannot find user's chamber id"}, status=status.HTTP_404_NOT_FOUND)

        host_name = chamber_instance.host_name
        dict_song_info = get_song_on_play(user_session=self.request.session.session_key)

        if 'Error' in dict_song_info:
            return Response({dict_song_info['Error_Type']: dict_song_info['Error']}, status=dict_song_info['Status'])
        
        if host_name != "" and host_name == self.request.session.session_key:
            try:
                self._store_current_song_info(chamber_queryset, dict_song_info['id'])
            except Exception as ex:
                return Response({'Storage Error': 'Cannot persist current song info to database'}, status=status.HTTP_406_NOT_ACCEPTABLE)

        return Response(dict_song_info, status=status.HTTP_200_OK)
    
    def _store_current_song_info(self, chamber_queryset, song_id):
        list_model_fields = ['song_on_play']
        list_model_values = [song_id]
        song_on_play = chamber_queryset[0].song_on_play
        if song_on_play != song_id:
            WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', chamber_queryset)



# class GetSongOnPlay(APIView):
#     def get(self, request):
#         chamber_id = self.request.session['chamber_id']
#         chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
#         if chamber_queryset.exists():
#             chamber_instance = chamber_queryset[0]
#         else:
#             return Response({}, status=status.HTTP_404_NOT_FOUND)

#         host_name = chamber_instance.host_name
#         dict_song_info = get_song_on_play(user_session=self.request.session.session_key)

#         if 'Error' in dict_song_info:
#             return Response({dict_song_info['Error_Type']: dict_song_info['Error']}, status=dict_song_info['Status'])
        
#         if host_name == self.request.session.session_key:
#             dict_song_info['votes'] = 0
#             self.store_song_info(chamber_queryset, dict_song_info['id'], dict_song_info['duration'], dict_song_info['time'])

#         return Response(dict_song_info, status=status.HTTP_200_OK)
    
#     def store_song_info(self, chamber_queryset, song_id, song_duration, progress_time):
#         song_end_at = timezone.now() + timedelta(seconds=(song_duration-progress_time)/1000)
#         list_model_fields = ['song_on_play', 'song_duration', 'song_end_at']
#         list_model_values = [song_id, song_duration, song_end_at]
#         song_on_play = chamber_queryset[0].song_on_play

#         if song_on_play != song_id:  #TODO: is the check required?
#             WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', chamber_queryset)



class GetSongInfo(APIView):
    permission_classes = [IsAuthenticated]
    url_search_kwarg = 'song_id'

    def get(self, request):
        access_token=request.user.access_token
        song_id = request.GET.get(self.url_search_kwarg)
        song_info = get_song_info_by_id(access_token=access_token, song_id=song_id)

        if 'Error' in song_info:
            return Response({song_info['Error_Type']: song_info['Error']}, status=song_info['Status'])

        return Response(song_info, status=status.HTTP_200_OK)


class GetMyPlaylist(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        playlist_info = get_my_playlist(access_token=request.user.access_token)

        if 'Error' in playlist_info:
            return Response({playlist_info['Error_Type']: playlist_info['Error']}, status=playlist_info['Status'])

        if "playlist_info" in playlist_info:
            return Response(playlist_info["playlist_info"], status=status.HTTP_200_OK)
        
        return Response({"Error": "No Playlist Info"}, status=status.HTTP_404_NOT_FOUND)


class GetPlaylistItems(APIView):
    permission_classes = [IsAuthenticated]
    url_search_kwarg_id = 'playlist_id'
    url_search_kwarg_limit = 'limit'
    url_search_kwarg_offset = 'offset'

    def get(self, request):
        playlist_id = request.GET.get(self.url_search_kwarg_id)

        playlist_limit = request.GET.get(self.url_search_kwarg_limit)
        playlist_limit = 100 if playlist_limit is None or len(playlist_limit) == 0 else int(playlist_limit)

        playlist_offset = request.GET.get(self.url_search_kwarg_offset)
        playlist_offset = 0 if playlist_offset is None or len(playlist_offset) == 0 else int(playlist_offset)

        playlist_items = get_playlist_items(access_token=request.user.access_token, playlist_id=playlist_id, 
                                            playlist_limit=playlist_limit, playlist_offset=playlist_offset)

        if 'Error' in playlist_items:
            return Response({playlist_items['Error_Type']: playlist_items['Error']}, status=playlist_items['Status'])

        return Response(playlist_items, status=status.HTTP_200_OK)


class GetPlaylistAllItems(APIView):
    permission_classes = [IsAuthenticated]
    url_search_kwarg_id = 'playlist_id'

    def get(self, request):
        playlist_id = request.GET.get(self.url_search_kwarg_id)
        playlist_items = get_playlist_total(access_token=request.user.access_token, playlist_id=playlist_id)

        if 'Error' in playlist_items:
            return Response({playlist_items['Error_Type']: playlist_items['Error']}, status=playlist_items['Status'])

        return Response(playlist_items, status=status.HTTP_200_OK)


class GetMyProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_profile = get_my_profile(access_token=request.user.access_token)

        if 'Error' in user_profile:
            return Response({user_profile['Error_Type']: user_profile['Error']}, status=user_profile['Status'])

        return Response(user_profile, status=status.HTTP_200_OK)


class CreatePlaylist(APIView):
    serializer_class = CreatePlaylistSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            host_name = ""
            chamber_id = self.request.session['chamber_id']
            chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
        
            if len(serializer.data.get('name')) > 0:
                playlist_name = serializer.data.get('name')
            elif chamber_queryset.exists():
                chamber_instance = chamber_queryset[0]
                playlist_name = chamber_instance.chamber_name
                host_name = chamber_instance.host_name
            else:
                return Response({"Error": "Cannot find user's chamber id"}, status=status.HTTP_404_NOT_FOUND)

            if len(serializer.data.get('description')) > 0:
                playlist_description = serializer.data.get('description')
            else:
                playlist_description = f"Playlist created by Music Chamber for the chamber '{playlist_name}'"

            user_profile = get_my_profile(user_session=self.request.session.session_key)
            if 'Error' in user_profile:
                return Response({user_profile['Error_Type']: user_profile['Error']}, status=user_profile['Status'])
            else:
                user_id = user_profile.get("id")

            data = {'name': playlist_name, 'public': False, 'collaborative': True, 'description': playlist_description}
            response = create_playlist(user_session=self.request.session.session_key, user_id=user_id, data=data)

            if 'Error' in response:
                return Response({response['Error_Type']: response['Error']}, status=response['Status'])
            else:
                # host persist created list info in model Chamber
                if host_name != "" and host_name == self.request.session.session_key:
                    try:
                        self._store_playlist_info(chamber_queryset, response["id"])
                    except Exception as ex:
                        return Response({'Storage Error': 'Cannot persist created playlist info to database'}, status=status.HTTP_406_NOT_ACCEPTABLE)

                return Response(response, status=status.HTTP_201_CREATED)
        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)

    def _store_playlist_info(self, chamber_queryset, playlist_id):
        list_model_fields = ['playlist_on_play']
        list_model_values = [playlist_id]
        WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', chamber_queryset)


class PlaylistAddItem(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PlaylistAddItemSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            playlist_id = serializer.data.get('playlist_id')
            track_uris = [constant.uri_track + uris.strip() for uris in serializer.data.get('track_id').split(",")]

            response = playlist_add_item(access_token=request.user.access_token, playlist_id=playlist_id, data={"uris": track_uris})

            if 'Error' in response:
                return Response({response['Error_Type']: response['Error']}, status=response['Status'])

            return Response(response, status=status.HTTP_201_CREATED)
        
        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)


class ChangePlaybackVolume(APIView): 
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePlaybackVolumeSerializer

    def put(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            response = change_playback_volume(access_token=request.user.access_token, 
                                              volume_percent= serializer.data.get('volume_percent'))     
            if 'Error' in response:
                return Response({response['Error_Type']: response['Error']}, status=response['Status'])
            else:
                return Response(response, status=status.HTTP_204_NO_CONTENT)

        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)

