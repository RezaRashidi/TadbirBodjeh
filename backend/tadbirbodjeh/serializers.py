from rest_framework import serializers

from .models import Financial, Logistics, LogisticsUploads


class FinancialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financial
        fields = '__all__'


class LogisticsUploadsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogisticsUploads
        fields = '__all__'

class LogisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logistics
        fields = '__all__'


class LogisticsUploadsSerializerforlist(serializers.ModelSerializer):
    class Meta:
        model = LogisticsUploads
        fields = ['name', 'file', 'id']


class LogisticsSerializerlist(serializers.ModelSerializer):
    uploads = LogisticsUploadsSerializerforlist(many=True, read_only=True)

    class Meta:
        model = Logistics
        fields = '__all__'