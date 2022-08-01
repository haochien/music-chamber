from django.contrib.auth.backends import BaseBackend
from .models import SpotifyUserToken
from django.contrib.auth.models import User
from datetime import datetime


class SpotifyAuthenticationBackend(BaseBackend):
  def authenticate(self, request, user_data):

    queryset_user = SpotifyUserToken.objects.filter(spotify_id=user_data['id'])

    if queryset_user.exists():
        SpotifyUserToken.last_login = datetime.now()
        return queryset_user[0]
    
    new_user_instance = SpotifyUserToken.objects.create_new_spotify_user(user_data)
    return new_user_instance


  def get_user(self, user_id):
    try:
      return SpotifyUserToken.objects.get(pk=user_id)
    except SpotifyUserToken.DoesNotExist:
      return None