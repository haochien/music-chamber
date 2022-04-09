from django.urls import path
from .views import ChamberView, CreateChamberView

urlpatterns = [
    path('chamber', ChamberView.as_view()),
    path('create-chamber', CreateChamberView.as_view()),
]
