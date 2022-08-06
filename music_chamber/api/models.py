from django.db import models
from django.contrib.auth.models import User
import uuid

from api_spotify.models import SpotifyUserToken

class Chamber(models.Model):
    chamber_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    chamber_name = models.CharField(max_length=50)
    host_spotify_id = models.ForeignKey(SpotifyUserToken, on_delete=models.DO_NOTHING, to_field="spotify_id", db_column="host_spotify_id")
    access_guest_can_pause = models.BooleanField(default=True)
    votes_song_skip = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    max_participant_number = models.IntegerField(default=1)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    song_on_play = models.CharField(max_length=50, null=True, blank=True)
    song_duration = models.IntegerField(null=True, blank=True)
    song_end_at = models.DateTimeField(null=True, blank=True)
    playlist_on_play = models.CharField(max_length=50, null=True, blank=True)
    is_playing = models.BooleanField(default=False)

    def __str__(self):
        return str(self.chamber_name)


class ChamberMembers(models.Model):
    #TODO: if host is not in chmaber, his/her is_host should be set to False and reasign other as host?
    chamber_id = models.ForeignKey(Chamber, on_delete=models.CASCADE, db_column="chamber_id")
    spotify_id = models.ForeignKey(SpotifyUserToken,on_delete=models.CASCADE, to_field="spotify_id", db_column="spotify_id")
    is_in_chamber = models.BooleanField(default=True)

    def __str__(self):
        return str(self.chamber_id)
    
