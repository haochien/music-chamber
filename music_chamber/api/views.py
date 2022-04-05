from django.shortcuts import render
from rest_framework import generics
from .serializers import ChamberSerializer
from .models import Chamber


class ChamberView(generics.ListAPIView):
    queryset = Chamber.objects.all()
    serializer_class = ChamberSerializer
