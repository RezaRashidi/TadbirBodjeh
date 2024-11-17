import datetime
import logging
from io import BytesIO

import django.contrib.auth
import django.contrib.auth.decorators
import django.contrib.auth.mixins
import django.contrib.auth.models
import django.core.exceptions
import django.db.models
import django.http
import django.shortcuts
import django.utils.dateparse
import rest_framework.generics
import rest_framework.permissions
import rest_framework.views
import rest_framework_simplejwt.exceptions
import rest_framework_simplejwt.tokens
import xlsxwriter
from django.db.models import Q
from django.db.models import Sum
from django.http import HttpResponse
from rest_framework import permissions, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import tadbirbodjeh.serializers
from tadbirbodjeh.models import organization, unit, budget_chapter, budget_section, budget_row, program, \
    relation, Contract, Contractor_type, Contract_record
from tadbirbodjeh.serializers import organizationSerializer, unitSerializer, BudgetRowSerializer, \
    BudgetSectionSerializer, BudgetChapterSerializer, programSerializer, relationsSerializer, \
    relationsCreateSerializer
from .models import Financial, Logistics, LogisticsUploads, PettyCash, sub_unit
from .serializers import (
    FinancialSerializer,
    LogisticsSerializer,
    LogisticsUploadsSerializer, LogisticsSerializerlist, sub_unitSerializer,
    PasswordChangeSerializer, pettyCashListSerializer, pettyCashCreateSerializer,
)

logger = logging.getLogger(__name__)


# حذف شود دیگر نیازی نیست
# class LogisticsCustomPagination(rest_framework.pagination.PageNumberPagination):
#     sub_units = sub_unit.objects.all()
#     serialized_sub_units = sub_unitSerializer(sub_units, many=True).data
#
#     def get_paginated_response(self, data):
#         return Response({
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#             'sub_units': self.serialized_sub_units,  # Add your sub_units data here
#         })


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
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        fin_state = self.request.query_params.get('fin_state', None)
        queryset = self.queryset
        if fin_state is not None:
            queryset = queryset.filter(fin_state=fin_state)

        if self.request.user.is_staff or any(name.startswith("financial") for name in group_names):
            return queryset
        return queryset.filter(created_by=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]

        # Check if any group name starts with "Financial"
        if any(name.startswith("financial") for name in group_names):
            # Only allow updating the fin_state field
            if 'fin_state' in request.data:
                if instance.fin_state == 3:
                    return Response({"error": "cant changed from state final."},
                                    status=status.HTTP_400_BAD_REQUEST)
                instance.fin_state = request.data['fin_state']
                instance.save()
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            else:
                return Response({"error": "Only fin_state field can be updated in financial."},
                                status=status.HTTP_400_BAD_REQUEST)

        elif (name.startswith("logistics") for name in group_names):
            # allow updating the fin_state field only from 1.0 to 2
            if 'fin_state' in request.data:
                if instance.fin_state == 0 and request.data['fin_state'] == 1:
                    instance.fin_state = request.data['fin_state']
                    instance.save()
                    serializer = self.get_serializer(instance)
                    return Response(serializer.data)
                else:
                    return Response({"error": "Only fin_state field can be updated form 0 to 1 in logistics."},
                                    status=status.HTTP_400_BAD_REQUEST)
            else:
                # save it with the same data
                return self.partial_update(request, *args, **kwargs)

        else:
            return Response({"error": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)

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
    # user_filter_backends = [filters.ObjectPermissionsFilter]
    permission_classes = [CustomObjectPermissions]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        if any(name.startswith("logistics") for name in group_names):
            if 'L_conf' in request.data and len(request.data) == 1:

                instance.L_conf = request.data['L_conf']
                instance.save()
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            else:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_400_BAD_REQUEST)

        elif any(name.startswith("financial") for name in group_names):
            if 'F_conf' in request.data and len(request.data) == 1:
                instance.F_conf = request.data['F_conf']
                instance.save()
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            else:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"error": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        if instance.L_conf == True and instance.F_conf is None:
            if any(name.startswith("logistics") for name in group_names):
                return super().update(request, *args, **kwargs)
            else:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_403_FORBIDDEN)
        elif instance.L_conf is None and instance.F_conf == True:
            if any(name.startswith("financial") for name in group_names):
                return super().update(request, *args, **kwargs)
            else:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"error": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return pettyCashCreateSerializer
        return pettyCashListSerializer

    def perform_create(self, serializer):
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        if any(name.startswith("logistics") for name in group_names) and not self.request.user.is_staff:
            instance = serializer.save(forwhom=self.request.user, created_by=self.request.user)
            return
        instance = serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = self.queryset
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        get_nulls = self.request.query_params.get('get_nulls', None)
        if get_nulls is not None and any(name.startswith("logistics") for name in group_names):
            queryset = queryset.filter(L_conf__isnull=True).filter(forwhom=self.request.user)
        if get_nulls is not None and any(name.startswith("financial") for name in group_names):
            queryset = queryset.filter(F_conf__isnull=True)
        if self.request.user.is_staff or any(name.startswith("financial") for name in group_names):
            return queryset
        return queryset.filter(forwhom=self.request.user)


# create  view that report all PettyCash and Financial between two date in query params by date_doc filed
class pettyCashReport(rest_framework.views.APIView):
    def post(self, request, format=None):
        start_date_str = request.data.get('start_date', None)
        end_date_str = request.data.get('end_date', None)
        user_id = request.data.get('user', None)
        print(user_id)
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]

        if start_date_str and end_date_str:
            start_date = django.utils.dateparse.parse_datetime(start_date_str)
            end_date = django.utils.dateparse.parse_datetime(end_date_str)
            if request.user.is_staff or any(name.startswith("financial") for name in group_names):
                petty_cash_objects = PettyCash.objects.filter(date_doc__range=[start_date, end_date],
                                                              forwhom__id=user_id, L_conf=True, F_conf=True)
                financial_objects = Financial.objects.filter(date_doc__range=[start_date, end_date],
                                                             created_by__id=user_id)
            else:
                petty_cash_objects = PettyCash.objects.filter(date_doc__range=[start_date, end_date],
                                                              forwhom=request.user, L_conf=True, F_conf=True)
                financial_objects = Financial.objects.filter(date_doc__range=[start_date, end_date],
                                                             created_by=request.user)
            # for x in petty_cash_objects:
            #     print(x)
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

    # pagination_class = LogisticsCustomPagination

    def get_queryset(self):
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
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
            if get_nulls == 'true':
                if self.request.user.is_staff:
                    return Logistics.objects.filter(Fdoc_key__isnull=True).reverse().order_by('id')
                return Logistics.objects.filter(Fdoc_key__isnull=True).reverse().order_by('id').filter(
                    created_by=self.request.user)
            elif get_nulls == 'false':
                if self.request.user.is_staff:
                    return Logistics.objects.filter(Fdoc_key__isnull=False).reverse().order_by('id')
                return Logistics.objects.filter(Fdoc_key__isnull=False).reverse().order_by('id').filter(
                    created_by=self.request.user)
        elif Fdoc_key is not None:
            if self.request.user.is_staff or any(name.startswith("financial") for name in group_names):
                return Logistics.objects.filter(Q(Fdoc_key__exact=Fdoc_key)).order_by('id')
            return Logistics.objects.filter(Q(Fdoc_key__exact=Fdoc_key)).order_by('id').filter(
                created_by=self.request.user)
        else:
            if self.request.user.is_staff or any(name.startswith("financial") for name in group_names):
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
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        if instance.Fdoc_key is not None:
            if any(name.startswith("financial") for name in group_names) and instance.Fdoc_key.fin_state > 2:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_403_FORBIDDEN)
            if any(name.startswith("logistic") for name in group_names) and instance.Fdoc_key.fin_state > 1:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        if instance.Fdoc_key is not None:
            if any(name.startswith("financial") for name in group_names) and instance.Fdoc_key.fin_state > 2:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_403_FORBIDDEN)

            if any(name.startswith("logistic") for name in group_names) and instance.Fdoc_key.fin_state > 1:
                return Response({"error": "You do not have permission to perform this action."},
                                status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

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




# برای‌ استفاده در ایجاد مدرک بدون پیجنشن
# class units(viewsets.ModelViewSet):
#     queryset = sub_unit.objects.all()
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = sub_unitSerializer
#     pagination_class = None


class get_user_info(rest_framework.views.APIView):
    permission_classes = [rest_framework.permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        return django.http.JsonResponse({
            'username': user.username,
            'email': user.email,
            'name': user.first_name + ' ' + user.last_name,
            'admin': user.is_staff,
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


##############################################
class changeOwnerFinancial(rest_framework.views.APIView):
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.IsAdminUser]

    def post(self, request, format=None):
        fin_id = request.data.get('fin_id', None)
        new_user_id = request.data.get('new_user_id', None)
        if fin_id and new_user_id:
            f_doc = django.shortcuts.get_object_or_404(Financial, id=fin_id)
            if f_doc.fin_state == 0:
                f_doc.created_by_id = new_user_id
                f_doc.save()
                for logistics_entry in f_doc.logistics.all():
                    logistics_entry.created_by_id = new_user_id
                    logistics_entry.save()
                return Response("success", status=200)
            else:
                return Response({"error": "fin_state"}, status=400)

        else:
            return Response({"error": "Invalid data"}, status=400)


class getAllLogisticUser(rest_framework.views.APIView):
    permission_classes = [rest_framework.permissions.IsAuthenticated]

    # get All  User of groupOfUser that starts with "Logistics"
    def get(self, request, format=None):
        user_groups = self.request.user.groups.all()
        group_names = [group.name for group in user_groups]
        if self.request.user.is_staff or any(name.startswith("financial") for name in group_names):
            # Get all groups whose names start with "Logistics"
            logistic_groups = django.contrib.auth.models.Group.objects.filter(name__startswith="logistics")

            # Get all users belonging to these groups
            logistic_users = django.contrib.auth.models.User.objects.filter(groups__in=logistic_groups).distinct()
            # for user in logistic_users:
            #     print(user.id)
            user_data = [
                {
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                }
                for user in logistic_users
            ]
            return Response(user_data, status=status.HTTP_200_OK)
        else:
            return Response("You are not authorized to view this data", status=status.HTTP_403_FORBIDDEN)


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


class PasswordResetView(rest_framework.generics.UpdateAPIView):
    """
    An endpoint for changing password.
    """

    serializer_class = PasswordChangeSerializer
    model = django.contrib.auth.models.User
    permission_classes = (rest_framework.permissions.IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            django.contrib.auth.update_session_auth_hash(request, self.object)  # Important!
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# write view for organization,unit,sub_unit model

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = organization.objects.all()
    serializer_class = organizationSerializer
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = organization.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        return queryset


class UnitViewSet(viewsets.ModelViewSet):
    queryset = unit.objects.all()
    serializer_class = unitSerializer
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = unit.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        return queryset


class SubUnitViewSet(viewsets.ModelViewSet):
    queryset = sub_unit.objects.all()
    serializer_class = sub_unitSerializer
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = sub_unit.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        return queryset


class BudgetChapterViewSet(viewsets.ModelViewSet):
    queryset = budget_chapter.objects.all()
    serializer_class = BudgetChapterSerializer
    permission_classes = [IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = budget_chapter.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        return queryset


class BudgetSectionViewSet(viewsets.ModelViewSet):
    queryset = budget_section.objects.all()
    serializer_class = BudgetSectionSerializer
    permission_classes = [IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = budget_section.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        return queryset


class BudgetRowViewSet(viewsets.ModelViewSet):
    queryset = budget_row.objects.all()
    serializer_class = BudgetRowSerializer
    permission_classes = [IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = budget_row.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        return queryset


# class BudgetSubRowViewSet(viewsets.ModelViewSet):
#     queryset = budget_sub_row.objects.all()
#     serializer_class = BudgetSubRowSerializer
#     permission_classes = [IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]
#
#     def get_queryset(self):
#         queryset = budget_sub_row.objects.all()
#         no_pagination = self.request.query_params.get('no_pagination', None)
#         year = self.request.query_params.get('year', None)
#         if no_pagination == 'true' and year:
#             queryset = queryset.filter(year=year)
#             self.pagination_class = None
#         if no_pagination == 'true':
#             self.pagination_class = None
#         if year:
#             queryset = queryset.filter(year=year)
#         return queryset


class programViewSet(viewsets.ModelViewSet):
    queryset = program.objects.all()
    serializer_class = programSerializer
    permission_classes = [IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = program.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        return queryset


class relationViewSet(viewsets.ModelViewSet):
    queryset = relation.objects.all()
    serializer_class = relationsSerializer
    permission_classes = [IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return relationsCreateSerializer
        return relationsSerializer

    def get_queryset(self):
        queryset = relation.objects.all()

        no_pagination = self.request.query_params.get('no_pagination', None)
        organization_id = self.request.query_params.get('organization', None)
        year = self.request.query_params.get('year', None)
        if no_pagination == 'true' and year:
            queryset = queryset.filter(year=year)
            self.pagination_class = None
        if no_pagination == 'true':
            self.pagination_class = None
        if year:
            queryset = queryset.filter(year=year)
        if organization_id:
            queryset = queryset.filter(organization=organization_id)
        return queryset


class GenerateExcelView(rest_framework.views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, financial_id):
        try:
            financial = Financial.objects.get(id=financial_id)

            if not financial.Payment_type:
                return Response({"error": "Payment_type is not true for this Financial record"},
                                status=status.HTTP_400_BAD_REQUEST)

            logistics = Logistics.objects.filter(Fdoc_key=financial)

            # Group by account_number and account_name, sum the prices
            grouped_logistics = logistics.values('account_number', 'account_name', 'bank_name').annotate(
                total_price=Sum('price'))

            # Create a workbook and add a worksheet.
            output = BytesIO()
            workbook = xlsxwriter.Workbook(output)
            worksheet = workbook.add_worksheet('ACHGroupTransfer')

            # Add headers
            headers = ['Amount', 'CreditIBAN', 'CurrencyCode', 'CreditAccountOwnerName', 'CreditAccountOwnerIdentifier',
                       'Identifier', 'Description']
            for col, header in enumerate(headers):
                worksheet.write(0, col, header)

            # Add data
            for row, item in enumerate(grouped_logistics, start=1):
                worksheet.write(row, 0, item['total_price'])
                worksheet.write(row, 1, f"IR{item['account_number']}")
                worksheet.write(row, 2, '')  # CurrencyCode (empty)
                worksheet.write(row, 3, item['account_name'])
                worksheet.write(row, 4, '')  # CreditAccountOwnerIdentifier (empty)
                worksheet.write(row, 5, '')  # Identifier (empty)
                worksheet.write(row, 6, '')  # Description (empty)

            workbook.close()

            # Create the HttpResponse object with Excel mime type
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename=financial_{financial_id}_logistics.xlsx'
            response.write(output.getvalue())

            return response

        except Financial.DoesNotExist:
            return Response({"error": "Financial record not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContractView(viewsets.ModelViewSet):
    queryset = Contract.objects.all().reverse()
    serializer_class = tadbirbodjeh.serializers.ContractSerializer
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def perform_create(self, serializer):
        # get sum of prices of all  related logstics
        instance = serializer.save(created_by=self.request.user)

class Contractor_type_View(viewsets.ModelViewSet):
    queryset = Contractor_type.objects.all()
    serializer_class = tadbirbodjeh.serializers.Contractor_type_Serializer
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = Contractor_type.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        contractor_level = self.request.query_params.get('contractor_level', None)
        if no_pagination == 'true':
            self.pagination_class = None
        if contractor_level:
            queryset = queryset.filter(Contractor_level=contractor_level)
        return queryset

class ContractRecordViewSet(viewsets.ModelViewSet):
    queryset = Contract_record.objects.all()
    serializer_class = tadbirbodjeh.serializers.ContractRecordSerializer
    permission_classes = [rest_framework.permissions.IsAuthenticated, rest_framework.permissions.DjangoModelPermissions]

    def perform_create(self, serializer):
        # get sum of prices of all  related logstics
        instance = serializer.save(created_by=self.request.user)
    def get_queryset(self):
        queryset = Contract_record.objects.all()
        no_pagination = self.request.query_params.get('no_pagination', None)
        contract = self.request.query_params.get('contract', None)
        if no_pagination == 'true':
            self.pagination_class = None
        if contract:
            queryset = queryset.filter(Contract=contract)
        return queryset