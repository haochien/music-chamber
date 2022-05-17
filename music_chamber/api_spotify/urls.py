from django.urls import path
from .views import GetAuthURL, get_auth_callback, CheckUserAuth, GetUserToken, GetSongOnPlay, GetDevices, TransferDevice

urlpatterns = [
    path('check-user-auth', CheckUserAuth.as_view()),
    path('get-auth-url', GetAuthURL.as_view()),
    path('callback', get_auth_callback),

    path('get-access-token', GetUserToken.as_view()),
    path('get-song-on-play', GetSongOnPlay.as_view()),
    path('get-devices', GetDevices.as_view()),
    path('transfer-device', TransferDevice.as_view())

]