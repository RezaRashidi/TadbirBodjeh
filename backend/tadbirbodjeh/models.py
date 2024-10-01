import enum

from django.contrib.auth.models import User
from django.db import models


class fin_state(enum.Enum):
    start = 0
    cheek = 1
    final = 2


class LogisticsUploads(models.Model):
    file = models.FileField(upload_to="./uploads/", max_length=1000)
    name = models.CharField(max_length=255, blank=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='LogisticsUploads', null=True)

    # Logistics = models.ForeignKey(
    #     Logistics, related_name="files", on_delete=models.CASCADE
    # )

    def __str__(self) -> str:
        return self.name


class PettyCash(models.Model):
    name = models.CharField(max_length=255, blank=True)
    doc_num = models.CharField(max_length=255, blank=True)
    date_doc = models.DateTimeField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    price = models.FloatField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='pettycash', null=True)
    F_conf = models.BooleanField(blank=True, null=True)
    L_conf = models.BooleanField(blank=True, null=True)
    descr = models.TextField(blank=True)
    forwhom = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='pettycashowner', null=True)

    def __str__(self) -> str:
        return self.name


class Logistics(models.Model):
    name = models.CharField(max_length=255, blank=True)
    type = models.BooleanField(default=True)
    Fdoc_key = models.ForeignKey(
        'Financial', related_name="logistics", on_delete=models.SET_NULL, null=True
    )
    price = models.FloatField(blank=True, null=True)
    seller = models.CharField(max_length=255, blank=True)
    seller_id = models.CharField(max_length=255, blank=True)
    date_doc = models.DateTimeField(blank=True)
    Location = models.ForeignKey("sub_unit", on_delete=models.SET_NULL, related_name='Logistics', null=True)
    descr = models.TextField(blank=True)
    F_conf = models.BooleanField(default=False, blank=True)
    created = models.DateTimeField(auto_now_add=True, blank=True)
    updated = models.DateTimeField(auto_now=True, blank=True)
    measure = models.CharField(max_length=255, null=True, blank=True)
    CostDriver = models.CharField(max_length=255, null=True, blank=True)
    uploads = models.ManyToManyField(LogisticsUploads, blank=True)
    vat = models.FloatField(blank=True, null=True)
    account_number = models.CharField(max_length=255, null=True, blank=True)
    account_name = models.CharField(max_length=255, null=True, blank=True)
    bank_name = models.CharField(max_length=255, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='Logistics', null=True)

    # filed for array of upload id for each file
    # upload_ids= models.CharField(max_length=255, null=True, blank=True)
    def __str__(self) -> str:
        return self.name


class Financial(models.Model):
    name = models.CharField(max_length=255, blank=True, default="بدون نام")
    date_doc = models.DateTimeField(blank=True, null=True)
    CostType = models.CharField(max_length=255, blank=True, null=True)
    descr = models.TextField(blank=True, null=True)
    fin_state = models.IntegerField(choices=[(e.value, e.name) for e in fin_state], default=fin_state.start.value)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    programId = models.CharField(max_length=255, blank=True, null=True)
    topicId = models.CharField(max_length=255, blank=True, null=True)
    rowId = models.CharField(max_length=255, blank=True, null=True)
    tax = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='financials', null=True)
    Payment_type = models.BooleanField(default=False, blank=True)

    # price = models.FloatField(blank=True, null=True)
    # logistics = models.ManyToManyField(Logistics, blank=True)

    def __str__(self):
        return self.name


class credit(models.Model):
    code = models.CharField(max_length=255, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    updated = models.DateTimeField(auto_now=True)
    descr = models.TextField(blank=True)
    price_public = models.FloatField(blank=True, null=True)
    price_pubic = models.FloatField(blank=True, null=True)
    price_pubic_transfer = models.FloatField(blank=True, null=True)
    price_exclusive = models.FloatField(blank=True, null=True)
    price_exclusiveـtransfer = models.FloatField(blank=True, null=True)
    price_other = models.FloatField(blank=True, null=True)

    def __str__(self) -> str:
        return self.name


class budget_chapter(models.Model):
    code = models.IntegerField(blank=True, null=True, default=0)
    fin_code = models.IntegerField(blank=True, null=True, default=0)
    name = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class budget_section(models.Model):
    code = models.IntegerField(blank=True, null=True, default=0)
    fin_code = models.IntegerField(blank=True, null=True, default=0)
    name = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    budget_chapter = models.ForeignKey(budget_chapter, on_delete=models.SET_NULL, related_name='budget_section',
                                       null=True)

    def __str__(self) -> str:
        return self.name


class budget_row(models.Model):
    code = models.IntegerField(blank=True, null=True, default=0)
    fin_code = models.IntegerField(blank=True, null=True, default=0)
    name = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    budget_section = models.ForeignKey(budget_section, on_delete=models.SET_NULL, related_name='budget_row', null=True)

    def __str__(self) -> str:
        return self.name


class budget_sub_row(models.Model):
    code = models.IntegerField(blank=True, null=True, default=0)
    fin_code = models.IntegerField(blank=True, null=True, default=0)
    name = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    budget_row = models.ForeignKey(budget_row, on_delete=models.SET_NULL, related_name='budget_sub_row', null=True)

    def __str__(self) -> str:
        return self.name


class organization(models.Model):
    code = models.IntegerField(blank=True, null=True, default=0)
    name = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.name


class unit(models.Model):
    code = models.IntegerField(blank=True, null=True, default=0)
    name = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True)
    organization = models.ForeignKey(organization, on_delete=models.SET_NULL, related_name='unit', null=True)

    def __str__(self) -> str:
        return self.name


class sub_unit(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    code = models.IntegerField(blank=True, null=True, default=0)
    year = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True)
    unit = models.ForeignKey(unit, on_delete=models.SET_NULL, related_name='sub_unit', null=True)

    def __str__(self) -> str:
        return self.name


class program(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    code = models.IntegerField(blank=True, null=True, default=0)
    fin_code = models.IntegerField(blank=True, null=True, default=0)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True)
    general_cost = models.IntegerField(blank=True, null=True, default=0)
    specific_cost = models.IntegerField(blank=True, null=True, default=0)
    other_cost = models.IntegerField(blank=True, null=True, default=0)