from django.urls import path
from .views import GetAuthURL, get_auth_callback, CheckUserAuth, GetUserToken, GetSongOnPlay, \
                   GetDevices, TransferDevice, GetSongInfo, GetMyPlaylist, GetPlaylistItems, \
                   GetPlaybackState, GetMyProfile, CreatePlaylist, PlaylistAddItem, ResumePlayback

urlpatterns = [
    path('check-user-auth', CheckUserAuth.as_view()),
    path('get-auth-url', GetAuthURL.as_view()),
    path('callback', get_auth_callback),

    path('get-access-token', GetUserToken.as_view()),
    path('get-devices', GetDevices.as_view()),
    path('transfer-device', TransferDevice.as_view()),
    path('get-playback-state', GetPlaybackState.as_view()),
    
    path('get-song-on-play', GetSongOnPlay.as_view()),
    path('get-song-info', GetSongInfo.as_view()),
    path('get-my-playlist', GetMyPlaylist.as_view()),
    path('get-playlist-items', GetPlaylistItems.as_view()),

    path('get-my-profile', GetMyProfile.as_view()),
    path('create-playlist', CreatePlaylist.as_view()),
    path('playlist-add-item', PlaylistAddItem.as_view()),

    path('resume-playback', ResumePlayback.as_view()),
    

]