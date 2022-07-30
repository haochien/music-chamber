# Spotify End Point
current_user = "me"
playback_state = "me/player"
resume_playback = "me/player/play"
change_volume = "me/player/volume?volume_percent={volume_percent}"
devices = "me/player/devices"
currently_playing = "me/player/currently-playing"
song_info = "tracks/{id}"
song_feature = "audio-features/{id}"
my_playlist = "me/playlists"
playlist_items_add = "playlists/{playlist_id}/tracks"
playlist_items_get = "playlists/{playlist_id}/tracks?limit={playlist_limit}&offset={playlist_offset}"
create_playlist = "users/{user_id}/playlists"

# Spotify Constant
uri_track = 'spotify:track:'
uri_playlist = 'spotify:playlist:'