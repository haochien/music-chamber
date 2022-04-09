from rest_framework import serializers
from .models import Chamber

class ChamberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamber
        fields = '__all__'


class CreateChamberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamber
        fields = ('room_name', 'access_guest_can_pause', 'votes_song_skip', 'is_public')