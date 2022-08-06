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

def fetch_user_token_info(user_id, return_queryset=True):
    queryset_user_token = SpotifyUserToken.objects.filter(spotify_id=user_id)
    if queryset_user_token.exists():
        return queryset_user_token if return_queryset else queryset_user_token[0]
    else:
        return None


def refresh_user_token(user_id, refresh_token):
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': env.str('SPOTIFY_CLIENT_ID'),
        'client_secret': env.str('SPOTIFY_CLIENT_SECRET')
    }).json()

    queryset_user = SpotifyUserToken.objects.filter(spotify_id=user_id)
    if queryset_user.exists():
        expire_time = timezone.now() + timedelta(seconds=response.get('expires_in'))
        refresh_token = response.get('refresh_token') if response.get('refresh_token') is not None else refresh_token

        queryset_user.update(access_token=response.get('access_token'), refresh_token=refresh_token,
                             token_type=response.get('token_type'), expires_in=expire_time)


def is_user_authenticated(request):
    #instance_user_token = fetch_user_token_info(user_session, return_queryset=False)

    #if instance_user_token is not None:
    if request.user.is_authenticated:
        # check whether user token needs to be refreshed
        expire_in = request.user.expires_in
        refresh_token = request.user.refresh_token
        user_id = request.user.spotify_id
        if expire_in <= timezone.now():
            refresh_user_token(user_id, refresh_token)
        
        return True
    return False



def spotify_web_api_operator(access_token, endpoint, post_data=False, put_data=False):
    api_base = BASE_URL + endpoint
    if access_token is not None:
        headers = {'Content-Type': 'application/json', 
                   'Authorization': "Bearer " + access_token}
    else:
        return {'Error': 'No access token found.'}

    if post_data != False:
        response = post(api_base, headers=headers, json=post_data)
        if response.ok:
            return {"Success": response.reason} if len(response.text) == 0 else {"Success": response.json()}
        else:
            return {"Error": response.json()}

    elif put_data != False:
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
    

def get_login_user_profile(access_token):

    api_base = BASE_URL + constant.current_user
    headers = {'Content-Type': 'application/json', 'Authorization': "Bearer " + access_token}

    response = get(api_base, {}, headers=headers)
    try:
        response = response.json()
    except Exception as ex:
        response = {'Error': f'response not in proper json format. Detail: {ex}'}

    dict_error = check_error_in_response(response)

    if dict_error is None:
        user_image = response.get("images")[0].get("url") if len(response.get("images")) > 0 else ""
        user_profile = {"id": response.get("id"), "display_name": response.get("display_name"), "email": response.get("email"), 
                        "country": response.get("country"), "href": response.get("href"), "images": user_image, "product": response.get("product")}

    return user_profile if dict_error is None else dict_error


def get_user_devices(access_token):
    response = spotify_web_api_operator(access_token=access_token, endpoint=constant.devices)
    dict_error = check_error_in_response(response, 'devices')
    return response.get('devices') if dict_error is None else dict_error


def transfer_device(access_token, target_device_id):
    data = {"device_ids": target_device_id, "play": False}
    response = spotify_web_api_operator(access_token=access_token, endpoint=constant.playback_state, put_data=data)
    dict_error = check_error_in_response(response)
    return response if dict_error is None else dict_error


def get_playback_state(access_token):
    response = spotify_web_api_operator(access_token=access_token, endpoint=constant.playback_state)
    dict_error = check_error_in_response(response)
    return response if dict_error is None else dict_error



def breakdown_playlist_items_dict(response):
    item = response.get('item') if 'item' in response else response
    song_id = item.get('id')
    title = item.get('name') if 'name' in item else ""

    artist_string = ""
    for i, artist in enumerate(item.get('artists')):
        artist_string  = artist_string + ", " + artist.get('name') if i > 0 else artist.get('name')

    album_cover = item.get('album').get('images')[0].get('url')

    return {'id': song_id, 'song_name': title, 'song_singer': artist_string, 'song_image_url': album_cover} 



def breakdown_track_dict(response, only_id=False):

    item = response.get('item') if 'item' in response else response
    song_id = item.get('id')

    if only_id:
        return {'id': song_id}

    title = item.get('name') if 'name' in item else ""
    duration = item.get('duration_ms') if 'duration_ms' in item else ""
    album_cover = item.get('album').get('images')[0].get('url')
    popularity = item.get('popularity') if 'popularity' in item else ""
    uri = item.get('uri') if 'uri' in item else ""
    progress = response.get('progress_ms') if 'progress_ms' in response else 0
    is_playing = response.get('is_playing') if 'is_playing' in response else ""

    artist_string = ""
    for i, artist in enumerate(item.get('artists')):
        artist_string  = artist_string + ", " + artist.get('name') if i > 0 else artist.get('name')

    # song feature part
    song_energy = response.get('energy') if 'energy' in response else ""
    song_danceability = response.get('danceability') if 'danceability' in response else ""
    song_happiness = response.get('valence') if 'valence' in response else ""
    song_acousticness = response.get('acousticness') if 'acousticness' in response else ""
    song_speechiness = response.get('speechiness') if 'speechiness' in response else ""
    song_tempo = response.get('tempo') if 'tempo' in response else ""
    
    return {'id': song_id, 'song_name': title, 'song_singer': artist_string, 'durationInMs': duration, 
            'progressMs': progress, 'song_image_url': album_cover, 'song_popularity':popularity,
            'uri': uri, 'is_playing': is_playing,
            'song_energy': song_energy, 'song_danceability': song_danceability, 'song_happiness': song_happiness, 
            'song_acousticness': song_acousticness, 'song_speechiness': song_speechiness, 'song_tempo': song_tempo}



def get_song_feature_by_id(access_token, song_id):
    response = spotify_web_api_operator(access_token=access_token, endpoint=constant.song_feature.format(id=song_id))
    dict_error = check_error_in_response(response)
    if dict_error is None:
        return response

    print(f"Cannot get feature. Details: {dict_error}")
    return {}


def get_song_on_play(access_token):
    dict_song_info = spotify_web_api_operator(access_token=access_token, endpoint=constant.currently_playing)
    dict_error = check_error_in_response(dict_song_info, 'item')

    song_id = dict_song_info.get('item').get('id')
    dict_song_feature = get_song_feature_by_id(access_token, song_id)

    if dict_error is not None:
        return dict_error
    elif len(dict_song_feature) > 0:
        response = {**dict_song_feature, **dict_song_info}
        return breakdown_track_dict(response)
    else:
        return breakdown_track_dict(dict_song_info)


def get_song_info_by_id(access_token, song_id):
    dict_song_info = spotify_web_api_operator(access_token=access_token, endpoint=constant.song_info.format(id=song_id))
    dict_error = check_error_in_response(dict_song_info)

    dict_song_feature = get_song_feature_by_id(access_token, song_id)

    if dict_error is not None:
        return dict_error
    elif len(dict_song_feature) > 0:
        response = {**dict_song_feature, **dict_song_info}
        return breakdown_track_dict(response)
    else:
        return breakdown_track_dict(dict_song_info)


def get_my_playlist(access_token):
    response = spotify_web_api_operator(access_token=access_token, endpoint=constant.my_playlist)
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


def get_playlist_items(access_token, playlist_id, playlist_limit, playlist_offset):
    response = spotify_web_api_operator(access_token=access_token, 
                                        endpoint=constant.playlist_items_get.format(playlist_id=playlist_id, playlist_limit=playlist_limit, 
                                                                                    playlist_offset=playlist_offset))
    dict_error = check_error_in_response(response, "items")

    if dict_error is None:
        lst_item_details = [breakdown_playlist_items_dict(song_dict.get("track")) for song_dict in response.get("items")]

    return lst_item_details if dict_error is None else dict_error


def get_playlist_total(access_token, playlist_id):
    total_songs_in_playlist = 0
    lst_playlist_items = []
    playlist_offset = 0

    while len(lst_playlist_items) == 0 or len(lst_playlist_items) < total_songs_in_playlist:
        response = spotify_web_api_operator(access_token=access_token, 
                                            endpoint=constant.playlist_items_get.format(playlist_id=playlist_id, playlist_limit=100, 
                                                                                        playlist_offset=playlist_offset))
        dict_error = check_error_in_response(response, "items")

        if dict_error is None:
            lst_item_details = [breakdown_playlist_items_dict(song_dict.get("track")) for song_dict in response.get("items")]
            lst_playlist_items += lst_item_details
            playlist_offset += 100
            if total_songs_in_playlist == 0:
                total_songs_in_playlist = response.get("total")
        else:
            break

    return lst_playlist_items if dict_error is None else dict_error



def get_my_profile(access_token):
    response = spotify_web_api_operator(access_token=access_token, endpoint=constant.current_user)
    dict_error = check_error_in_response(response)

    if dict_error is None:
        user_image = response.get("images")[0].get("url") if len(response.get("images")) > 0 else ""
        user_profile = {"id": response.get("id"), "display_name": response.get("display_name"), "email": response.get("email"), 
                        "country": response.get("country"), "href": response.get("href"), "images": user_image, "product": response.get("product")}

    return user_profile if dict_error is None else dict_error


def create_playlist(access_token, user_id, data):

    response = spotify_web_api_operator(access_token=access_token, 
                                        endpoint=constant.create_playlist.format(user_id=user_id), post_data=data)  
    dict_error = check_error_in_response(response)

    if dict_error is None and "Success" in response:
        playlist_info = response["Success"]
        return {"id": playlist_info["id"], "name": playlist_info["name"], "description": playlist_info["description"]}

    return dict_error


def playlist_add_item(access_token, playlist_id, data):
    #TODO: check whether the track id has been in the playlist. If yes, then don't add
    response = spotify_web_api_operator(access_token=access_token, 
                                        endpoint=constant.playlist_items_add.format(playlist_id=playlist_id), post_data=data)  
    dict_error = check_error_in_response(response)

    if dict_error is None and "Success" in response:
        added_track_snapshot = response["Success"]
        return added_track_snapshot

    return dict_error


def resume_playlist(access_token, data):
    response = spotify_web_api_operator(access_token=access_token, 
                                        endpoint=constant.resume_playback, put_data=data)  
    dict_error = check_error_in_response(response)

    if dict_error is None and "Success" in response:
        play_track_info = response["Success"]
        return play_track_info

    return dict_error


def change_playback_volume(access_token, volume_percent):
    response = spotify_web_api_operator(access_token=access_token, 
                                        endpoint=constant.change_volume.format(volume_percent=volume_percent), put_data={})  
    dict_error = check_error_in_response(response)

    if dict_error is None and "Success" in response:
        play_track_info = response["Success"]
        return play_track_info

    return dict_error
