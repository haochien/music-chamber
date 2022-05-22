from datetime import timedelta
from requests import get, post, put

from .models import SpotifyUserToken
from django.utils import timezone
from django.conf import settings
from rest_framework import status

from common.utils.work_with_model import WorkWithModel
from common.utils import constant

env = settings.ENV
BASE_URL = "https://api.spotify.com/v1/"

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
        response = post(api_base, headers=headers, json=post_data)
        if response.ok:
            return {"Success": response.reason} if len(response.text) == 0 else {"Success": response.json()}
        else:
            return {"Error": response.json()}
    elif put_data:
        response = put(api_base, headers=headers, json=put_data)
        if response.ok:
            return {"Success": response.reason} if len(response.text) == 0 else {"Success": response.json()}
        else:
            return {"Error": response.json()}
    else:
        response = get(api_base, {}, headers=headers)
        try:
            return response.json()
        except Exception as ex:
            return {'Error': f'response not in proper json format. Detail: {ex}'}
    

def check_error_in_response(response, response_key_arg=None):
    if 'Error' in response:
        return {'Error_Type': 'Not Found', 'Error': response['Error'], 'Status': status.HTTP_404_NOT_FOUND}

    if 'error' in response:
        return {'Error_Type': 'No Content', 'Error': response['error'], 'Status': status.HTTP_204_NO_CONTENT}
    
    if response_key_arg is not None and response_key_arg not in response:
        return {'Error_Type': 'No Content', 'Error': f'key argument "{response_key_arg}" not in the response', 'Status': status.HTTP_204_NO_CONTENT}
    
    return None
    


def get_user_devices(user_session):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.devices)
    dict_error = check_error_in_response(response, 'devices')
    return response.get('devices') if dict_error is None else dict_error


def get_playback_state(user_session):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.playback_state)
    dict_error = check_error_in_response(response)
    return response if dict_error is None else dict_error



def breakdown_track_dict(response, only_id=False):

    item = response.get('item') if 'item' in response else response
    song_id = item.get('id')

    if only_id:
        return {'id': song_id}

    title = item.get('name')
    duration = item.get('duration_ms')
    album_cover = item.get('album').get('images')[0].get('url')
    popularity = item.get('popularity')
    uri = item.get('uri')
    progress = response.get('progress_ms') if 'progress_ms' in response else ""  #TODO: consider to implement progress time changing in future
    is_playing = response.get('is_playing') if 'is_playing' in response else ""

    artist_string = ""
    for i, artist in enumerate(item.get('artists')):
        artist_string  = artist_string + ", " + artist.get('name') if i > 0 else artist.get('name')
    
    return {'id': song_id, 'title': title, 'artist': artist_string, 'duration': duration, 
            'time': progress, 'image_url': album_cover, 'popularity':popularity,
            'uri': uri, 'is_playing': is_playing}


def get_song_on_play(user_session):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.currently_playing)
    dict_error = check_error_in_response(response, 'item')
    return breakdown_track_dict(response) if dict_error is None else dict_error


def get_song_info_by_id(user_session, song_id):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.song_info.format(id=song_id))
    dict_error = check_error_in_response(response)
    return breakdown_track_dict(response) if dict_error is None else dict_error


def get_my_playlist(user_session):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.my_playlist)
    dict_error = check_error_in_response(response)

    list_playlist_info = []
    if dict_error is None:
        items = response.get('items')
        for item in items:
            playlist_image = item.get("images")[0].get("url") if len(item.get("images")) > 0 else ""
            dict_playlist = {"id": item.get('id'), "name": item.get('name'), "tracks_href": item.get('tracks').get('href'),
                             "tracks_total": item.get('tracks').get('total'), "palylist_href": item.get('href'),
                             "uri": item.get('uri'), "playlist_cover": playlist_image}
            list_playlist_info.append(dict_playlist)

    return {"playlist_info": list_playlist_info} if dict_error is None else dict_error


def get_playlist_items(user_session, playlist_id):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.playlist_items.format(playlist_id=playlist_id))
    dict_error = check_error_in_response(response, "items")

    if dict_error is None:
        lst_item_details = [breakdown_track_dict(song_dict.get("track"), only_id=False) for song_dict in response.get("items")]

    return lst_item_details if dict_error is None else dict_error


def get_my_profile(user_session):
    response = spotify_web_api_operator(user_session=user_session, endpoint=constant.current_user)
    dict_error = check_error_in_response(response)

    if dict_error is None:
        user_image = response.get("images")[0].get("url") if len(response.get("images")) > 0 else ""
        user_profile = {"id": response.get("id"), "display_name": response.get("display_name"), "email": response.get("email"), 
                        "country": response.get("country"), "href": response.get("href"), "images": user_image}

    return user_profile if dict_error is None else dict_error


def create_playlist(user_session, user_id, data):

    response = spotify_web_api_operator(user_session=user_session, 
                                        endpoint=constant.create_playlist.format(user_id=user_id), post_data=data)  
    dict_error = check_error_in_response(response)

    if dict_error is None and "Success" in response:
        playlist_info = response["Success"]
        return {"id": playlist_info["id"], "name": playlist_info["name"], "description": playlist_info["description"]}

    return dict_error


def playlist_add_item(user_session, playlist_id, data):
    #TODO: check whether the track id has been in the playlist. If yes, then don't add
    response = spotify_web_api_operator(user_session=user_session, 
                                        endpoint=constant.playlist_items.format(playlist_id=playlist_id), post_data=data)  
    dict_error = check_error_in_response(response)

    if dict_error is None and "Success" in response:
        added_track_snapshot = response["Success"]
        return added_track_snapshot

    return dict_error


def resume_playlist(user_session, data):
    response = spotify_web_api_operator(user_session=user_session, 
                                        endpoint=constant.resume_playback, put_data=data)  
    dict_error = check_error_in_response(response)

    if dict_error is None and "Success" in response:
        play_track_info = response["Success"]
        return play_track_info

    return dict_error