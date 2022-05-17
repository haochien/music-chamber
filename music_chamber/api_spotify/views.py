from urllib import response
from django.shortcuts import render, redirect
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from requests import Request, post, put

from .utils import create_or_update_user_token, is_user_authenticated, fetch_user_token_info, spotify_web_api_operator, get_user_devices
from api.models import Chamber
from common.utils import constant

env = settings.ENV


class CheckUserAuth(APIView):
    def get(self, request):
        is_authenticated = is_user_authenticated(self.request.session.session_key)
        return Response({'is_auth': is_authenticated}, status=status.HTTP_200_OK)


class GetAuthURL(APIView):
    def get(self, request):
        #scopes = 'streaming user-read-email user-read-private'
        scopes = 'streaming user-read-email user-read-private user-read-playback-state user-read-currently-playing user-modify-playback-state'

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


class GetSongOnPlay(APIView):
    def get(self, request):
        chamber_id = self.request.session['chamber_id']
        chamber_queryset = Chamber.objects.filter(chamber_id=chamber_id)
        if chamber_queryset.exists():
            chamber_instance = chamber_queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        host_name = chamber_instance.host_name
        
        response = spotify_web_api_operator(user_session=host_name, endpoint=constant.currently_playing)
        if 'Error' in response:
            return Response({'Not Found': response['Error']}, status=status.HTTP_404_NOT_FOUND)
        elif 'error' in response:
            return Response({'No Content': response['error']}, status=status.HTTP_204_NO_CONTENT)
        elif 'item' not in response:
            return Response({'No Content': 'key argument "item" not in the response'}, status=status.HTTP_204_NO_CONTENT)
        
        item = response.get('item')
        title = item.get('name')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')  #TODO: consider to implement progress time changing in future
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""
        for i, artist in enumerate(item.get('artists')):
            artist_string  = artist_string + ", " + artist.get('name') if i > 0 else artist.get('name')
        
        dict_song_info = {'title': title, 'artist': artist_string, 'duration': duration,
                          'time': progress, 'image_url': album_cover, 'is_playing': is_playing,
                          'votes': 0, 'id': song_id}

        return Response(dict_song_info, status=status.HTTP_200_OK)

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
                                            endpoint=constant.transfer_device, put_data=data)
        if 'Success' in response:
            return Response({"Success": f"Successfully connect to Music Chamber device {target_device_id}"}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({"Error": f"Device Transfer failed. Error: {response['Error']}"}, status=status.HTTP_406_NOT_ACCEPTABLE)