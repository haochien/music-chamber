from django.urls import path
from .views import ChamberView

urlpatterns = [
    path('chamber', ChamberView.as_view()),
]
