import django.contrib.auth.models
import django.db.models
from rest_framework import serializers

from .models import Financial, Logistics, LogisticsUploads, PettyCash


class FinancialSerializer(serializers.ModelSerializer):
    total_logistics_price = serializers.SerializerMethodField()

    def get_total_logistics_price(self, obj):
        return obj.logistics.aggregate(django.db.models.Sum('price'))['price__sum'] or 0

    class Meta:
        model = Financial
        # fields = '__all__'
        exclude = ['created_by']


class pettyCashSerializer(serializers.ModelSerializer):
    class Meta:
        model = PettyCash
        # fields = '__all__'
        exclude = ['created_by']


class LogisticsUploadsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogisticsUploads
        exclude = ['created_by']


class LogisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logistics
        exclude = ['created_by']


class LogisticsUploadsSerializerforlist(serializers.ModelSerializer):
    class Meta:
        model = LogisticsUploads
        fields = ['name', 'file', 'id']


class LogisticsSerializerlist(serializers.ModelSerializer):
    uploads = LogisticsUploadsSerializerforlist(many=True, read_only=True)

    class Meta:
        model = Logistics
        exclude = ['created_by']