from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from .managers import SpotifyUserLoginManager


class SpotifyUserToken(models.Model):
    objects = SpotifyUserLoginManager()

    id = models.AutoField(primary_key=True)
    spotify_id = models.CharField(max_length=300, unique=True, null=True, blank=True)
    display_name = models.CharField(max_length=200, null=True, blank=True)
    email = models.CharField(max_length=500, null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    images = models.CharField(max_length=500, null=True, blank=True)
    product = models.CharField(max_length=50, null=True, blank=True)
    
    refresh_token = models.CharField(max_length=300)
    access_token = models.CharField(max_length=300)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    last_login = models.DateTimeField(null=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    def is_authenticated(self, request):
        return True
    
    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.is_admin
