from rest_framework import serializers
from .models import Chamber

class ChamberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamber
        fields = '__all__'