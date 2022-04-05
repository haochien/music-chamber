from django.db import models
from django.contrib.auth.models import User
import uuid

class Chamber(models.Model):
    #TODO: create FK to User or Profile model 
    room_id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    room_name = models.CharField(max_length=50)
    host_name = models.CharField(max_length=50, unique=True)
    access_guest_pause = models.BooleanField(default=True)
    votes_song_skip = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    max_participant_number = models.IntegerField(default=1)
    active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.room_name)


