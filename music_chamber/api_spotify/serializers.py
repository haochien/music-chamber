from rest_framework import serializers


class CreatePlaylistSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=200, default="")


class PlaylistAddItemSerializer(serializers.Serializer):
    playlist_id = serializers.CharField(max_length=100)
    track_uris = serializers.CharField()


class ResumePlaybackSerializer(serializers.Serializer):
    context_uri = serializers.CharField()
    uris = serializers.CharField(default="")
    offset = serializers.IntegerField(default=0)
    position_ms = serializers.IntegerField(default=0)