from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, LedgerViewSet, StockItemViewSet, VoucherViewSet, UserViewSet, UserStorageViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'ledgers', LedgerViewSet, basename='ledger')
router.register(r'stock-items', StockItemViewSet, basename='stockitem')
router.register(r'vouchers', VoucherViewSet, basename='voucher')
router.register(r'user-storage', UserStorageViewSet, basename='userstorage')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
