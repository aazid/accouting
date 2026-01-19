from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Company, Ledger, StockItem, Voucher, UserStorage
from .serializers import UserSerializer, CompanySerializer, LedgerSerializer, StockItemSerializer, VoucherSerializer, UserStorageSerializer

class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer

    def get_queryset(self):
        return Company.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LedgerViewSet(viewsets.ModelViewSet):
    serializer_class = LedgerSerializer

    def get_queryset(self):
        return Ledger.objects.filter(company__user=self.request.user)

class StockItemViewSet(viewsets.ModelViewSet):
    serializer_class = StockItemSerializer

    def get_queryset(self):
        return StockItem.objects.filter(company__user=self.request.user)

class VoucherViewSet(viewsets.ModelViewSet):
    serializer_class = VoucherSerializer

    def get_queryset(self):
        return Voucher.objects.filter(company__user=self.request.user)

class UserStorageViewSet(viewsets.ModelViewSet):
    serializer_class = UserStorageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserStorage.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get', 'post', 'put'])
    def sync(self, request):
        storage, created = UserStorage.objects.get_or_create(user=request.user)
        if request.method in ['POST', 'PUT']:
            storage.data = request.data.get('data', {})
            storage.save()
            return Response(UserStorageSerializer(storage).data)
        return Response(UserStorageSerializer(storage).data)

class UserViewSet(viewsets.GenericViewSet):
    def get_permissions(self):
        if self.action == 'register':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def register(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If username is not provided, use email as username
        if not username:
            username = email

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        UserStorage.objects.create(user=user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
