import datetime
import logging

import django.contrib.auth.decorators
import django.contrib.auth.mixins
import django.core.exceptions
import django.db.models
import django.http
import django.shortcuts
import django.utils.dateparse
import rest_framework.pagination
import rest_framework.views
import rest_framework_simplejwt.exceptions
import rest_framework_simplejwt.tokens
from django.db.models import Q
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response

from .models import Financial, Logistics, LogisticsUploads, PettyCash, credit, sub_unit
from .serializers import (
    FinancialSerializer,
    LogisticsSerializer,
    LogisticsUploadsSerializer, LogisticsSerializerlist, pettyCashSerializer, CreditSerializer, sub_unitSerializer,
)

logger = logging.getLogger(__name__)


class LogisticsCustomPagination(rest_framework.pagination.PageNumberPagination):
    sub_units = sub_unit.objects.all()
    serialized_sub_units = sub_unitSerializer(sub_units, many=True).data

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'sub_units': self.serialized_sub_units,  # Add your sub_units data here
        })


# class UserIsOwnerOrAdmin(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return request.user and request.user.is_authenticated
#
#     def check_object_permission(self, user, obj):
#         return user and user.is_authenticated and (user.is_staff or obj == user)
#
#     def has_object_permission(self, request, view, obj):
#         return self.check_object_permission(request.user, obj)


class CustomObjectPermissions(permissions.DjangoModelPermissions):
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
    # user_filter_backends = [filters.ObjectPermissionsFilter]
    permission_classes = [CustomObjectPermissions]

    # def filter_queryset(self, queryset):
    #     if self.request.user.is_staff:  # Check if the user is an admin user
    #         for backend in list(self.filter_backends):
    #             queryset = backend().filter_queryset(self.request, queryset, self)
    #         return queryset
    #     else:
    #         for backend in self.user_filter_backends:
    #             queryset = backend().filter_queryset(self.request, queryset, self)
    #         return queryset

    def perform_create(self, serializer):
        # get sum of prices of all  related logstics
        instance = serializer.save(created_by=self.request.user)

    #     guardian.shortcuts.assign_perm('view_financial', self.request.user, instance)
    #     guardian.shortcuts.assign_perm('change_financial', self.request.user, instance)
    #     guardian.shortcuts.assign_perm('delete_financial', self.request.user, instance)
    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(created_by=self.request.user)

    # def get_object(self):
    #     obj = django.shortcuts.get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
    #
    #     if self.request.user.is_staff or (obj.created_by == self.request.user):
    #         return obj
    #     else:
    #         self.permission_denied(
    #             self.request,
    #             message="You do not have permission to perform this action.",
    #             code="404"
    #         )
    #     return obj


class pettyCashViewSet(viewsets.ModelViewSet):
    queryset = PettyCash.objects.all().reverse().order_by('id')
    serializer_class = pettyCashSerializer
    # user_filter_backends = [filters.ObjectPermissionsFilter]
    permission_classes = [CustomObjectPermissions]

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(created_by=self.request.user)


# create  view that report all PettyCash and Financial between two date in query params by date_doc filed
class pettyCashReport(rest_framework.views.APIView):
    def post(self, request, format=None):
        start_date_str = request.data.get('start_date', None)
        end_date_str = request.data.get('end_date', None)

        if start_date_str and end_date_str:
            start_date = django.utils.dateparse.parse_datetime(start_date_str)
            end_date = django.utils.dateparse.parse_datetime(end_date_str)
            if request.user.is_staff:
                petty_cash_objects = PettyCash.objects.filter(date_doc__range=[start_date, end_date])
                financial_objects = Financial.objects.filter(date_doc__range=[start_date, end_date])
            else:
                petty_cash_objects = PettyCash.objects.filter(date_doc__range=[start_date, end_date],
                                                              created_by=request.user)
                financial_objects = Financial.objects.filter(date_doc__range=[start_date, end_date],
                                                             created_by=request.user)
            petty_cash_total_price = petty_cash_objects.aggregate(django.db.models.Sum('price'))['price__sum']
            grouped_by_payment_type = [True, False]
            results = []
            for group in grouped_by_payment_type:
                financial_objects_payment_type = financial_objects.filter(Payment_type=group)
                grouped_by_fin_state = financial_objects_payment_type.values('fin_state').annotate(
                    total_price=django.db.models.Sum('logistics__price'))
                results.append({
                    'Payment_type': group,
                    'fin_state_groups': list(grouped_by_fin_state)
                })
            # petty_cash_serializer = pettyCashSerializer(petty_cash_objects, many=True)
            # financial_serializer = FinancialSerializer(financial_objects, many=True)
            return Response({
                'petty_cash': petty_cash_total_price,
                'aggregated_financials': list(results)
            })

        return Response({"error": "start_date and end_date are required in the request body"}, status=400)


# return user group name and id


class LogisticsViewSet(viewsets.ModelViewSet):
    permission_classes = [CustomObjectPermissions]
    pagination_class = LogisticsCustomPagination

    def get_queryset(self):
        Fdoc_key = self.request.query_params.get('Fdoc_key', None)
        get_nulls = self.request.query_params.get('get_nulls', None)
        search = self.request.query_params.get('search', None)
        if get_nulls is not None:
            if search is not None:
                if self.request.user.is_staff:
                    return Logistics.objects.filter(Fdoc_key__isnull=True).filter(
                        Q(name__icontains=search) | Q(id__icontains=search)).reverse().order_by('id')
                return Logistics.objects.filter(Fdoc_key__isnull=True).filter(
                    Q(name__icontains=search) | Q(id__icontains=search)).reverse().order_by('id').filter(
                    created_by=self.request.user)
            if self.request.user.is_staff:
                return Logistics.objects.filter(Fdoc_key__isnull=True).reverse().order_by('id')
            return Logistics.objects.filter(Fdoc_key__isnull=True).reverse().order_by('id').filter(
                created_by=self.request.user)
        elif Fdoc_key is not None:
            if self.request.user.is_staff:
                return Logistics.objects.filter(Q(Fdoc_key__exact=Fdoc_key)).order_by('id')
            return Logistics.objects.filter(Q(Fdoc_key__exact=Fdoc_key)).order_by('id').filter(
                created_by=self.request.user)
        else:
            if self.request.user.is_staff:
                return Logistics.objects.all().reverse().order_by('id')
            return Logistics.objects.all().reverse().order_by('id').filter(created_by=self.request.user)

    # def filter_queryset(self, queryset):
    #     if self.request.user.is_staff:  # Check if the user is an admin user
    #         for backend in list(self.filter_backends):
    #             queryset = backend().filter_queryset(self.request, queryset, self)
    #         return queryset
    #     else:
    #         for backend in self.user_filter_backends:
    #             queryset = backend().filter_queryset(self.request, queryset, self)
    #         return queryset

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)

    #     guardian.shortcuts.assign_perm('view_logistics', self.request.user, instance)
    #     guardian.shortcuts.assign_perm('change_logistics', self.request.user, instance)
    #     guardian.shortcuts.assign_perm('delete_logistics', self.request.user, instance)

    # def list(self, request, *args, **kwargs):
    #     logger.warning('Request method: %s', request.user)
    #     logger.warning('Request path: %s', request.user.is_authenticated)
    #     return super().list(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.Fdoc_key:
            return Response({"error": "This object is related to a financial document"}, status=400)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return LogisticsSerializerlist
        return LogisticsSerializer


class LogisticsUploadsViewSet(viewsets.ModelViewSet):
    queryset = LogisticsUploads.objects.all()
    serializer_class = LogisticsUploadsSerializer
    permission_classes = [permissions.DjangoModelPermissions]

    # user_filter_backends = [filters.ObjectPermissionsFilter]

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)

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


class CreditViewSet(viewsets.ModelViewSet):
    queryset = credit.objects.all()
    serializer_class = CreditSerializer


class units(viewsets.ModelViewSet):
    queryset = sub_unit.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = sub_unitSerializer
    pagination_class = None


class get_user_info(rest_framework.views.APIView):
    permission_classes = [rest_framework.permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        return django.http.JsonResponse({
            'username': user.username,
            'email': user.email,
            'name': user.first_name + ' ' + user.last_name,
            # add any other user fields you are interested in
        })


class cheekGroupOfUser(rest_framework.views.APIView):
    permission_classes = [rest_framework.permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        group = user.groups.first()
        if group:
            return Response(group.name)
        else:
            return Response('None')


def index(request):
    now = datetime.datetime.now()
    html = "<html><body>It is now %s.</body></html>" % now
    return django.http.HttpResponse(html, status=403)

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