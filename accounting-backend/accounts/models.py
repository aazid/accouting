from django.db import models
from django.contrib.auth.models import User

class Company(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='companies')
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    pan_vat_number = models.CharField(max_length=50, blank=True, null=True)
    financial_year_start = models.DateField()
    financial_year_end = models.DateField()
    currency = models.CharField(max_length=10, default='NPR')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Ledger(models.Model):
    GROUP_CHOICES = [
        ('Assets', 'Assets'),
        ('Liabilities', 'Liabilities'),
        ('Equity', 'Equity'),
        ('Income', 'Income'),
        ('Expenses', 'Expenses'),
    ]
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='ledgers')
    name = models.CharField(max_length=255)
    group = models.CharField(max_length=50, choices=GROUP_CHOICES)
    sub_group = models.CharField(max_length=100, blank=True, null=True)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.company.name})"

class StockItem(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='stock_items')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    unit = models.CharField(max_length=50, default='Pcs')
    current_stock = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    sales_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.company.name})"

class Voucher(models.Model):
    VOUCHER_TYPES = [
        ('Payment', 'Payment'),
        ('Receipt', 'Receipt'),
        ('Journal', 'Journal'),
        ('Contra', 'Contra'),
        ('Purchase', 'Purchase'),
        ('Sales', 'Sales'),
    ]
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='vouchers')
    date = models.DateField()
    number = models.CharField(max_length=50)
    type = models.CharField(max_length=50, choices=VOUCHER_TYPES)
    narration = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.number} - {self.type} ({self.company.name})"

class VoucherEntry(models.Model):
    voucher = models.ForeignKey(Voucher, on_delete=models.CASCADE, related_name='entries')
    ledger = models.ForeignKey(Ledger, on_delete=models.CASCADE)
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.voucher.number} - {self.ledger.name}"

class UserStorage(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='storage')
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Storage for {self.user.username}"
