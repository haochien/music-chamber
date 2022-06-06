from datetime import datetime, timedelta

from urllib import response
from django.shortcuts import render, redirect
from django.conf import settings
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from requests import Request, post, put

from .serializers import CreatePlaylistSerializer, PlaylistAddItemSerializer, ResumePlaybackSerializer
from .utils import create_or_update_user_token, is_user_authenticated, fetch_user_token_info,\
                   spotify_web_api_operator, get_user_devices, get_song_info_by_id, get_song_on_play, get_my_playlist,\
                   get_playlist_items, get_playback_state, get_my_profile, create_playlist, playlist_add_item,\
                   resume_playlist
from api.models import Chamber
from common.utils import constant
from common.utils.work_with_model import WorkWithModel

env = settings.ENV


class CheckUserAuth(APIView):
    def get(self, request):
        is_authenticated = is_user_authenticated(self.request.session.session_key)
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

    # store callback info with user session
    if not request.session.exists(request.session.session_key):
        request.session.create()
    
    create_or_update_user_token(request.session.session_key, refresh_token, access_token, expires_in, token_type)
    
    if 'chamber_id' in request.session:
        chamber_id = request.session['chamber_id']
        return redirect(f'/chamber/{chamber_id}')
    else:
        return redirect('/')


class GetUserToken(APIView):
    def get(self, request):
        instance_access_token = fetch_user_token_info(request.session.session_key, return_queryset=False)

        if instance_access_token is not None:
            return Response({"access_token": instance_access_token.access_token}, status=status.HTTP_200_OK)
        else:
            return Response({'Bad Request': "Access token for current session is not created yet"}, status=status.HTTP_400_BAD_REQUEST)


class GetDevices(APIView):
    def get(self, request):
        response = get_user_devices(user_session=self.request.session.session_key)
        if 'Error' in response:
            return Response({response['Error_Type']: response['Error']}, status=response['Status'])

        return Response(response, status=status.HTTP_200_OK)


class TransferDevice(APIView):
    def put(self, response):
        response = get_user_devices(user_session=self.request.session.session_key)
        if 'Error' in response:
            return Response({response['Error_Type']: response['Error']}, status=response['Status'])

        target_device_id = [dict_device['id'] for dict_device in response if dict_device['name']=='Music-Chamber']
        if len(target_device_id) == 0:
            return Response({"Not Found": "Cannot find spotify device of Music Chamber"}, status=status.HTTP_404_NOT_FOUND)

        data = {"device_ids": target_device_id, "play": True}
        response = spotify_web_api_operator(user_session=self.request.session.session_key, 
                                            endpoint=constant.playback_state, put_data=data)
        if 'Success' in response:
            return Response({"Success": f"Successfully connect to Music Chamber device {target_device_id}"}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({"Error": f"Device Transfer failed. Error: {response['Error']}"}, status=status.HTTP_406_NOT_ACCEPTABLE)


class GetPlaybackState(APIView):
    def get(self, request):
        playback_state = get_playback_state(user_session=self.request.session.session_key)

        if 'Error' in playback_state:
            return Response({playback_state['Error_Type']: playback_state['Error']}, status=playback_state['Status'])

        return Response(playback_state, status=status.HTTP_200_OK)


class ResumePlayback(APIView):
    serializer_class = ResumePlaybackSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            context_uri = constant.uri_playlist + serializer.data.get('context_uri')
            #uris = [uris.strip() for uris in serializer.data.get('uris').split(",")]
            uri = constant.uri_track + serializer.data.get('uris')
            offset = {"uri": uri} if len(uri) > 0 else {"position": serializer.data.get('offset')}
            position_ms = int(serializer.data.get('position_ms'))

            data = {"context_uri": context_uri, "offset": offset, "position_ms":position_ms}
            response = resume_playlist(user_session=self.request.session.session_key, data=data)

            if 'Error' in response:
                return Response({response['Error_Type']: response['Error']}, status=response['Status'])
            else:
                return Response(response, status=status.HTTP_202_ACCEPTED)
        

        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        chamber_id = self.request.session['chamber_id']
        chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
        if chamber_queryset.exists():
            chamber_instance = chamber_queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        play_list_on_play, song_on_play, song_progress = self.get_song_in_chamber(chamber_instance)
        uri = constant.uri_track + str(song_on_play)
        offset = {"uri": uri} if len(uri) > 0 else {"position": 0}

        data = {"context_uri": constant.uri_playlist+str(play_list_on_play), "offset": offset, "position_ms":song_progress}
        response = resume_playlist(user_session=self.request.session.session_key, data=data)

        if 'Error' in response:
            return Response({response['Error_Type']: response['Error']}, status=response['Status'])
        else:
            return Response(response, status=status.HTTP_202_ACCEPTED)
    
    def get_song_in_chamber(self, chamber_instance):
        play_list_on_play = chamber_instance.play_list_on_play
        song_on_play = chamber_instance.song_on_play
        song_end_at = chamber_instance.song_end_at
        song_duration = chamber_instance.song_duration
        song_progress = int(song_duration - (song_end_at - timezone.now()).total_seconds()*1000)
        return play_list_on_play, song_on_play, song_progress




class GetSongOnPlay(APIView):
    def get(self, request):
        chamber_id = self.request.session['chamber_id']
        chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
        if chamber_queryset.exists():
            chamber_instance = chamber_queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        host_name = chamber_instance.host_name  #TODO: should this function be only available to host?
        dict_song_info = get_song_on_play(user_session=host_name)

        if 'Error' in dict_song_info:
            return Response({dict_song_info['Error_Type']: dict_song_info['Error']}, status=dict_song_info['Status'])
        else:
            dict_song_info['votes'] = 0
            self.store_song_info(chamber_queryset, dict_song_info['id'], dict_song_info['duration'], dict_song_info['time'])

        return Response(dict_song_info, status=status.HTTP_200_OK)
    
    def store_song_info(self, chamber_queryset, song_id, song_duration, progress_time):
        song_end_at = timezone.now() + timedelta(seconds=(song_duration-progress_time)/1000)
        list_model_fields = ['song_on_play', 'song_duration', 'song_end_at']
        list_model_values = [song_id, song_duration, song_end_at]
        song_on_play = chamber_queryset[0].song_on_play

        if song_on_play != song_id:  #TODO: is the check required?
            WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', chamber_queryset)



class GetSongInfo(APIView):
    url_search_kwarg = 'song_id'

    def get(self, request):
        song_id = request.GET.get(self.url_search_kwarg)
        song_info = get_song_info_by_id(user_session=self.request.session.session_key, song_id=song_id)

        if 'Error' in song_info:
            return Response({song_info['Error_Type']: song_info['Error']}, status=song_info['Status'])

        return Response(song_info, status=status.HTTP_200_OK)


class GetMyPlaylist(APIView):
    def get(self, request):
        playlist_info = get_my_playlist(user_session=self.request.session.session_key)

        if 'Error' in playlist_info:
            return Response({playlist_info['Error_Type']: playlist_info['Error']}, status=playlist_info['Status'])

        if "playlist_info" in playlist_info:
            return Response(playlist_info["playlist_info"], status=status.HTTP_200_OK)
        
        return Response({"Error": "No Playlist Info"}, status=status.HTTP_404_NOT_FOUND)


class GetPlaylistItems(APIView):
    url_search_kwarg = 'playlist_id'

    def get(self, request):
        playlist_id = request.GET.get(self.url_search_kwarg)
        playlist_items = get_playlist_items(user_session=self.request.session.session_key, playlist_id=playlist_id)

        if 'Error' in playlist_items:
            return Response({playlist_items['Error_Type']: playlist_items['Error']}, status=playlist_items['Status'])

        return Response(playlist_items, status=status.HTTP_200_OK)


class GetMyProfile(APIView):
    def get(self, request):
        user_profile = get_my_profile(user_session=self.request.session.session_key)

        if 'Error' in user_profile:
            return Response({user_profile['Error_Type']: user_profile['Error']}, status=user_profile['Status'])

        return Response(user_profile, status=status.HTTP_200_OK)


class CreatePlaylist(APIView):
    serializer_class = CreatePlaylistSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            playlist_name = serializer.data.get('name')
            playlist_description = serializer.data.get('description')

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
                return Response(response, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)
    

    def put(self, request):
        chamber_id = self.request.session['chamber_id']
        chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
        if chamber_queryset.exists():
            chamber_instance = chamber_queryset[0]
        else:
            return Response({"Error": "Cannot find user's chamber id to create playlist"}, status=status.HTTP_404_NOT_FOUND)

        playlist_name = chamber_instance.chamber_name
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
            self.store_playlist_info(chamber_queryset, response["id"])
            return Response(response, status=status.HTTP_201_CREATED)

    def store_playlist_info(self, chamber_queryset, playlist_id):
        list_model_fields = ['play_list_on_play']
        list_model_values = [playlist_id]
        WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', chamber_queryset)


class PlaylistAddItem(APIView):
    serializer_class = PlaylistAddItemSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            playlist_id = serializer.data.get('playlist_id')
            track_uris = [constant.uri_track + uris.strip() for uris in serializer.data.get('track_id').split(",")]

            response = playlist_add_item(user_session=self.request.session.session_key, playlist_id=playlist_id, data={"uris": track_uris})

            if 'Error' in response:
                return Response({response['Error_Type']: response['Error']}, status=response['Status'])
            else:
                return Response(response, status=status.HTTP_201_CREATED)
        

        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)
    

    def put(self, request):
        serializer = self.serializer_class(data=request.data)

        chamber_id = self.request.session['chamber_id']
        chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
        if chamber_queryset.exists():
            chamber_instance = chamber_queryset[0]
        else:
            return Response({"Error": "Cannot find user's chamber id to create playlist"}, status=status.HTTP_404_NOT_FOUND)

        if serializer.is_valid():
            playlist_id = serializer.data.get('playlist_id')
            track_uris = [constant.uri_track + uris.strip() for uris in serializer.data.get('track_id').split(",")]

            response = playlist_add_item(user_session=self.request.session.session_key, playlist_id=playlist_id, data={"uris": track_uris})

            if 'Error' in response:
                return Response({response['Error_Type']: response['Error']}, status=response['Status'])
            else:
                song_id = track_uris[0].split(constant.uri_track)[1]
                song_info = get_song_info_by_id(user_session=self.request.session.session_key, song_id=song_id)

                if 'Error' in song_info:
                    return Response({song_info['Error_Type']: song_info['Error']}, status=song_info['Status'])
                else:
                    if chamber_instance.song_on_play is None:
                        self.store_song_info(chamber_queryset, song_id, song_info['duration'], song_info['time'])

                return Response(response, status=status.HTTP_201_CREATED)
        
        return Response({'Bad Request': 'Invalid Input. Details: ' + str(serializer.errors) }, status=status.HTTP_400_BAD_REQUEST)


    def store_song_info(self, chamber_queryset, song_id, song_duration, progress_time):
        song_end_at = timezone.now() + timedelta(seconds=(song_duration-progress_time)/1000)
        list_model_fields = ['song_on_play', 'song_duration', 'song_end_at']
        list_model_values = [song_id, song_duration, song_end_at]
        song_on_play = chamber_queryset[0].song_on_play

        #if song_on_play != song_id:
        WorkWithModel.create_or_update_model(Chamber, list_model_fields, list_model_values, 'update', chamber_queryset)
