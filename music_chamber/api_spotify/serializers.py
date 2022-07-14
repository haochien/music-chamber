from rest_framework import serializers


class CreatePlaylistSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=200, default="")


class PlaylistAddItemSerializer(serializers.Serializer):
    playlist_id = serializers.CharField(max_length=100)
    track_id = serializers.CharField()


class ResumePlaybackSerializer(serializers.Serializer):
    playlist_id = serializers.CharField(allow_blank=True)
    offset_by_song_id = serializers.CharField(allow_blank=True)
    offset_by_song_position = serializers.IntegerField(default=0)
    position_ms = serializers.IntegerField(default=0)


class ChangePlaybackVolumeSerializer(serializers.Serializer):
    volume_percent = serializers.IntegerField(min_value=0, max_value=100)