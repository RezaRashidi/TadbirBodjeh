import django.core.exceptions
import django.http
import rest_framework.decorators
import rest_framework.permissions
import rest_framework.views
import rest_framework_simplejwt.exceptions
import rest_framework_simplejwt.tokens
from django.db.models import Q
from rest_framework import filters
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response

from .models import Financial, Logistics, LogisticsUploads
from .serializers import (
    FinancialSerializer,
    LogisticsSerializer,
    LogisticsUploadsSerializer, LogisticsSerializerlist,
)


class FinancialViewSet(viewsets.ModelViewSet):
    queryset = Financial.objects.all().reverse().order_by('id')
    serializer_class = FinancialSerializer
    # permission_classes = [rest_framework.permissions.IsAuthenticated]

class LogisticsViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        Fdoc_key = self.request.query_params.get('Fdoc_key', None)
        get_nulls = self.request.query_params.get('get_nulls', None)
        if get_nulls is not None:
            return Logistics.objects.filter(Fdoc_key__isnull=True).reverse().order_by('id')
        elif Fdoc_key is not None:
            return Logistics.objects.filter(Q(Fdoc_key__exact=Fdoc_key)).reverse().order_by('id')
        else:
            return Logistics.objects.all().reverse().order_by('id')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return LogisticsSerializerlist
        return LogisticsSerializer


class LogisticsViewSetList(viewsets.ModelViewSet):
    queryset = Logistics.objects.all().reverse().order_by('id')
    serializer_class = LogisticsSerializerlist
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
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


@rest_framework.decorators.api_view(['GET', 'POST'])
def snippet_list(request):
    """
    List all code snippets, or create a new snippet.
    """
    if request.method == 'GET':
        snippets = Logistics.objects.all()
        serializer = LogisticsSerializer(snippets, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = LogisticsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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