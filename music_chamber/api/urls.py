from django.urls import path
from .views import ChamberView, CreateChamberView, GetChamberView

urlpatterns = [
    path('chamber', ChamberView.as_view()),
    path('create-chamber', CreateChamberView.as_view()),
    path('get-chamber', GetChamberView.as_view())
]
