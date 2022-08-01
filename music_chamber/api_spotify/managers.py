from django.contrib.auth import models
from django.utils import timezone
from datetime import timedelta

class SpotifyUserLoginManager(models.UserManager):

  def create_new_spotify_user(self, user):
    expire_time = timezone.now() + timedelta(seconds=user['expires_in'])
    
    new_user = self.create(
      spotify_id=user['id'],
      display_name=user['display_name'],
      email=user['email'],
      country=user['country'],
      images=user['images'],
      product=user['product'],

      refresh_token=user['refresh_token'],
      access_token=user['access_token'],
      expires_in=expire_time,
      token_type=user['token_type'],
    )
    return new_user