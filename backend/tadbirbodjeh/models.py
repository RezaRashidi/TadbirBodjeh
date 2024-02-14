from django.db import models


class Financial(models.Model):
    name = models.CharField(max_length=255, blank=False)
    date_doc = models.DateTimeField()
    CostType = models.CharField(max_length=255, blank=False)
    descr = models.TextField()
    F_conf = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    programId = models.CharField(max_length=255,null=True)
    topicId = models.CharField(max_length=255,null=True)
    rowId = models.CharField(max_length=255,null=True)

    def _str_(self) -> str:
        return self.name


class Logistics(models.Model):
    name = models.CharField(max_length=255, blank=False)
    type = models.BooleanField(default=True)
    Fdoc_key = models.ForeignKey(Financial, related_name="Logistics", on_delete=models.SET_NULL,null=True)
    price = models.FloatField(blank=False)
    seller = models.CharField(max_length=255)
    date_doc = models.DateTimeField()
    Location = models.CharField(max_length=255)
    Payment_type = models.BooleanField(default=True)
    descr = models.TextField()
    F_conf = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    measure = models.CharField(max_length=255,null=True)
    CostDriver = models.CharField(max_length=255,null=True)

    def _str_(self) -> str:
        return self.name


class LogisticsUploads(models.Model):
    file = models.FileField(upload_to="uploads/")
    name = models.CharField(max_length=255, blank=False)
    Logistics = models.ForeignKey(Logistics, related_name="files", on_delete=models.CASCADE)

    def _str_(self) -> str:
        return self.name