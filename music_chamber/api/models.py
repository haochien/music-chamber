from django.db import models
from django.contrib.auth.models import User
import uuid

class Chamber(models.Model):
    #TODO: create FK to User or Profile model 
    chamber_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    chamber_name = models.CharField(max_length=50)
    host_name = models.CharField(max_length=50, unique=True)
    access_guest_can_pause = models.BooleanField(default=True)
    votes_song_skip = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    max_participant_number = models.IntegerField(default=1)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    song_on_play = models.CharField(max_length=50, null=True, blank=True)
    song_duration = models.IntegerField(null=True, blank=True)
    song_end_at = models.DateTimeField(null=True, blank=True)
    play_list_on_play = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return str(self.chamber_name)


#class ChamberCurrentSong(models.Model):
