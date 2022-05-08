from django.shortcuts import render, redirect
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from requests import Request, post

from .utils import create_or_update_user_token, is_user_authenticated, fetch_user_token_info

env = settings.ENV


class CheckUserAuth(APIView):
    def get(self, request):
        is_authenticated = is_user_authenticated(self.request.session.session_key)
        return Response({'is_auth': is_authenticated}, status=status.HTTP_200_OK)


class GetAuthURL(APIView):
    def get(self, request):
        #scopes = 'user-modify-playback-state user-read-playback-state user-read-currently-playing app-remote-control streaming'
        scopes = 'streaming user-read-email user-read-private'

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