import enum

from django.contrib.auth.models import User
from django.db import models


class fin_state(enum.Enum):
    start = 0
    cheek = 1
    final = 2


class LogisticsUploads(models.Model):
    file = models.FileField(upload_to="./uploads/")
    name = models.CharField(max_length=255, blank=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='LogisticsUploads', null=True)

    # Logistics = models.ForeignKey(
    #     Logistics, related_name="files", on_delete=models.CASCADE
    # )

    def _str_(self) -> str:
        return self.name


class PettyCash(models.Model):
    name = models.CharField(max_length=255, blank=True)
    doc_num = models.CharField(max_length=255, blank=True)
    date_doc = models.DateTimeField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    price = models.FloatField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='pettycash', null=True)
    F_conf = models.BooleanField(default=False, blank=True)
    descr = models.TextField(blank=True)

    def _str_(self) -> str:
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
    Location = models.CharField(max_length=255, blank=True)
    descr = models.TextField(blank=True)
    F_conf = models.BooleanField(default=False, blank=True)
    created = models.DateTimeField(auto_now_add=True, blank=True)
    updated = models.DateTimeField(auto_now=True, blank=True)
    measure = models.CharField(max_length=255, null=True, blank=True)
    CostDriver = models.CharField(max_length=255, null=True, blank=True)
    # filed for array of upload id for each file
    uploads = models.ManyToManyField(LogisticsUploads, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='Logistics', null=True)

    # upload_ids= models.CharField(max_length=255, null=True, blank=True)
    def _str_(self) -> str:
        return self.name


class Financial(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
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

    def _str_(self) -> str:
        return self.name