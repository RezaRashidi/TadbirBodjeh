import django.contrib.auth.models
import django.db.models
from rest_framework import serializers

from .models import Financial, Logistics, LogisticsUploads, PettyCash, credit, sub_unit


class sub_unitSerializer(serializers.ModelSerializer):
    class Meta:
        model = sub_unit
        fields = ['name', 'id']


class FinancialSerializer(serializers.ModelSerializer):
    total_logistics_price = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    user_group = serializers.SerializerMethodField()

    def get_user_group(self, obj):
        if obj.created_by is None:
            return 'Unknown'
        else:
            group = obj.created_by.groups.first().name
            if group is None:
                return 'Unknown'
            else:
                return group

    def get_user(self, obj):
        first_name = obj.created_by.first_name if obj.created_by and obj.created_by.first_name else ''
        last_name = obj.created_by.last_name if obj.created_by and obj.created_by.last_name else ''
        return f"{first_name} {last_name}".strip()

    def get_total_logistics_price(self, obj):
        return obj.logistics.aggregate(django.db.models.Sum('price'))['price__sum'] or 0

    class Meta:
        model = Financial
        # fields = '__all__'
        exclude = ['created_by']


class pettyCashCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PettyCash
        fields = '__all__'


class pettyCashListSerializer(serializers.ModelSerializer):
    forwhom = serializers.SerializerMethodField()

    def get_forwhom(self, obj):
        user = obj.forwhom
        if user:
            return {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}",
            }
        return None

    # forhome
    class Meta:
        model = PettyCash
        fields = '__all__'
        # exclude = ['created_by']


class LogisticsUploadsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogisticsUploads
        exclude = ['created_by']


class LogisticsSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        return obj.created_by.first_name + ' ' + obj.created_by.last_name

    class Meta:
        model = Logistics
        exclude = ['created_by']


class LogisticsUploadsSerializerforlist(serializers.ModelSerializer):
    class Meta:
        model = LogisticsUploads
        fields = ['name', 'file', 'id']


class LogisticsSerializerlist(serializers.ModelSerializer):
    uploads = LogisticsUploadsSerializerforlist(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    Location = sub_unitSerializer()

    # sub_units = serializers.SerializerMethodField()  # New field
    #
    # def get_sub_units(self, obj):  # New method
    #     sub_units = sub_unit.objects
    #     return sub_unitSerializer(sub_units, many=True).data

    def get_user(self, obj):
        if obj.created_by is not None:
            return obj.created_by.first_name + ' ' + obj.created_by.last_name
        else:
            return 'Unknown User'

    class Meta:
        model = Logistics
        exclude = ['created_by']


class CreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = credit
        fields = '__all__'


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change endpoints.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)