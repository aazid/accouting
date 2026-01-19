from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Company, Ledger, StockItem, Voucher, VoucherEntry, UserStorage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_superuser')

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ('user',)

class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = '__all__'

class StockItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockItem
        fields = '__all__'

class VoucherEntrySerializer(serializers.ModelSerializer):
    ledger_name = serializers.ReadOnlyField(source='ledger.name')

    class Meta:
        model = VoucherEntry
        fields = ('id', 'ledger', 'ledger_name', 'debit', 'credit')

class VoucherSerializer(serializers.ModelSerializer):
    entries = VoucherEntrySerializer(many=True)

    class Meta:
        model = Voucher
        fields = ('id', 'company', 'date', 'number', 'type', 'narration', 'total_amount', 'entries')

    def create(self, validated_data):
        entries_data = validated_data.pop('entries')
        voucher = Voucher.objects.create(**validated_data)
        for entry_data in entries_data:
            VoucherEntry.objects.create(voucher=voucher, **entry_data)
        return voucher

class UserStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStorage
        fields = ('data', 'updated_at')
