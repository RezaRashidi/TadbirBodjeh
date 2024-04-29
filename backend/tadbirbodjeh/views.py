import datetime
import logging

import django.contrib.auth.mixins
import django.core.exceptions
import django.http
import guardian.shortcuts
import rest_framework.permissions
import rest_framework.views
import rest_framework_simplejwt.exceptions
import rest_framework_simplejwt.tokens
from django.db.models import Q
from rest_framework import permissions
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework_guardian import filters

from .models import Financial, Logistics, LogisticsUploads
from .serializers import (
    FinancialSerializer,
    LogisticsSerializer,
    LogisticsUploadsSerializer, LogisticsSerializerlist,
)

logger = logging.getLogger(__name__)


class UserIsOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def check_object_permission(self, user, obj):
        return user and user.is_authenticated and (user.is_staff or obj == user)

    def has_object_permission(self, request, view, obj):
        return self.check_object_permission(request.user, obj)


class CustomObjectPermissions(permissions.DjangoObjectPermissions):
    """
    Similar to `DjangoObjectPermissions`, but adding 'view' permissions.
    """
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': ['%(app_label)s.view_%(model_name)s'],
        'HEAD': ['%(app_label)s.view_%(model_name)s'],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


class FinancialViewSet(viewsets.ModelViewSet):
    queryset = Financial.objects.all().reverse().order_by('id')
    serializer_class = FinancialSerializer
    permission_classes = [CustomObjectPermissions]
    filter_backends = [filters.ObjectPermissionsFilter]

    def perform_create(self, serializer):
        instance = serializer.save()
        guardian.shortcuts.assign_perm('view_financial', self.request.user, instance)


class LogisticsViewSet(viewsets.ModelViewSet):
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        Fdoc_key = self.request.query_params.get('Fdoc_key', None)
        get_nulls = self.request.query_params.get('get_nulls', None)
        if get_nulls is not None:
            return Logistics.objects.filter(Fdoc_key__isnull=True).reverse().order_by('id')
        elif Fdoc_key is not None:
            return Logistics.objects.filter(Q(Fdoc_key__exact=Fdoc_key)).reverse().order_by('id')
        else:
            return Logistics.objects.all().reverse().order_by('id')

    # def list(self, request, *args, **kwargs):
    #     logger.warning('Request method: %s', request.user)
    #     logger.warning('Request path: %s', request.user.is_authenticated)
    #     return super().list(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return LogisticsSerializerlist
        return LogisticsSerializer


# class LogisticsViewSetList(viewsets.ModelViewSet):
#     queryset = Logistics.objects.all().reverse().order_by('id')
#     serializer_class = LogisticsSerializerlist
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['name']


# def create(self, request, *args, **kwargs):
#     serializer = self.get_serializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogisticsUploadsViewSet(viewsets.ModelViewSet):
    queryset = LogisticsUploads.objects.all()
    serializer_class = LogisticsUploadsSerializer

    def destroy(self, request, *args, **kwargs):
        upload = self.get_object()
        # delete the file before the object
        upload.file.delete()
        try:
            instance = self.get_object()
            self.perform_destroy(instance)

        except django.http.Http404:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogoutView(rest_framework.views.APIView):
    permission_classes = (rest_framework.permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = rest_framework_simplejwt.tokens.RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_200_OK)
        except (django.core.exceptions.ObjectDoesNotExist, rest_framework_simplejwt.exceptions.TokenError):
            return Response(status=status.HTTP_400_BAD_REQUEST)


def index(request):
    now = datetime.datetime.now()
    html = "<html><body>It is now %s.</body></html>" % now
    return django.http.HttpResponse(html, status=403)