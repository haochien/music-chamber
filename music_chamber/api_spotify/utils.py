from datetime import timedelta
from requests import get, post, put

from .models import SpotifyUserToken
from django.utils import timezone
from django.conf import settings
from rest_framework import status

from common.utils.work_with_model import WorkWithModel
from common.utils import constant

env = settings.ENV
BASE_URL = "https://api.spotify.com/v1/me/"

def fetch_user_token_info(user_session, return_queryset=True):
    queryset_user_token = SpotifyUserToken.objects.filter(user_session=user_session)
    if queryset_user_token.exists():
        return queryset_user_token if return_queryset else queryset_user_token[0]
    else:
        return None


def create_or_update_user_token(user_session, refresh_token, access_token, expires_in, token_type):
    queryset_user_token = fetch_user_token_info(user_session)
    expire_time = timezone.now() + timedelta(seconds=expires_in)

    list_model_fields = ['user_session', 'refresh_token', 'access_token', 'expires_in', 'token_type']
    list_model_values = [user_session, refresh_token, access_token, expire_time, token_type]

    if queryset_user_token is not None:
        WorkWithModel.create_or_update_model(SpotifyUserToken, list_model_fields, list_model_values, 'update', queryset_user_token)
    else:
        WorkWithModel.create_or_update_model(SpotifyUserToken, list_model_fields, list_model_values, 'create')


def refresh_user_token(user_session):
    refresh_token = fetch_user_token_info(user_session, return_queryset=False).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': env.str('SPOTIFY_CLIENT_ID'),
        'client_secret': env.str('SPOTIFY_CLIENT_SECRET')
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token') if response.get('refresh_token') is not None else refresh_token

    create_or_update_user_token(user_session, refresh_token, access_token, expires_in, token_type)


def is_user_authenticated(user_session):
    instance_user_token = fetch_user_token_info(user_session, return_queryset=False)

    if instance_user_token is not None:
        # check whether user token needs to be refreshed
        expire_in = instance_user_token.expires_in
        if expire_in <= timezone.now():
            refresh_user_token(user_session)
        
        return True
    return False



def spotify_web_api_operator(user_session, endpoint, post_data=False, put_data=False):
    api_base = BASE_URL + endpoint
    instance_user_token = fetch_user_token_info(user_session, return_queryset=False)
    if instance_user_token is not None:
        headers = {'Content-Type': 'application/json', 
                   'Authorization': "Bearer " + instance_user_token.access_token}
    else:
        return {'Error': 'No access token found.'}

    if post_data:
        response = post(api_base, headers=headers, data=post_data)
        return {"Success": response.reason} if response.ok else {"Error": response.json()}
    elif put_data:
        response = put(api_base, headers=headers, json=put_data)
        return {"Success": response.reason} if response.ok else {"Error": response.json()}
    else:
        response = get(api_base, {}, headers=headers)
        try:
            return response.json()
        except Exception as ex:
            return {'Error': f'response not in proper json format. Detail: {ex}'}
    

def get_user_devices(user_session):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.devices)

    if 'Error' in response:
        return {'Error_Type': 'Not Found', 'Error': response['Error'], 'Status': status.HTTP_404_NOT_FOUND}

    if 'error' in response:
        return {'Error_Type': 'No Content', 'Error': response['error'], 'Status': status.HTTP_204_NO_CONTENT}

    if 'devices' not in response:
        return {'Error_Type': 'No Content', 'Error': 'key argument "devices" not in the response', 'Status': status.HTTP_204_NO_CONTENT}

    return response.get('devices')