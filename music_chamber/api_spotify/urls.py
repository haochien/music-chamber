from django.urls import path
from .views import GetAuthURL, get_auth_callback, CheckUserAuth

urlpatterns = [
    path('check-user-auth', CheckUserAuth.as_view()),
    path('get-auth-url', GetAuthURL.as_view()),
    path('callback', get_auth_callback),

]