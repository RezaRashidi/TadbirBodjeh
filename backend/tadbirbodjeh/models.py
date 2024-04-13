from django.db import models


class LogisticsUploads(models.Model):
    file = models.FileField(upload_to="./uploads/")
    name = models.CharField(max_length=255, blank=False)

    # Logistics = models.ForeignKey(
    #     Logistics, related_name="files", on_delete=models.CASCADE
    # )

    def _str_(self) -> str:
        return self.name


class Financial(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    date_doc = models.DateTimeField(blank=True, null=True)
    CostType = models.CharField(max_length=255, blank=True, null=True)
    descr = models.TextField(blank=True, null=True)
    F_conf = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    programId = models.CharField(max_length=255, blank=True, null=True)
    topicId = models.CharField(max_length=255, blank=True, null=True)
    rowId = models.CharField(max_length=255, blank=True, null=True)
    tax = models.CharField(max_length=255, blank=True, null=True)
    # Logistics = models.ManyToManyField('Logistics', blank=True, null=True)

    def _str_(self) -> str:
        return self.name


class Logistics(models.Model):
    name = models.CharField(max_length=255, blank=True)
    type = models.BooleanField(default=True)
    Fdoc_key = models.ForeignKey(
        Financial, related_name="Logistics", on_delete=models.SET_NULL, null=True
    )
    price = models.FloatField(blank=True, null=True)
    seller = models.CharField(max_length=255, blank=True)
    seller_id = models.CharField(max_length=255, blank=True)
    date_doc = models.DateTimeField(blank=True)
    Location = models.CharField(max_length=255, blank=True)
    Payment_type = models.BooleanField(default=True, blank=True)
    descr = models.TextField(blank=True)
    F_conf = models.BooleanField(default=False, blank=True)
    created = models.DateTimeField(auto_now_add=True, blank=True)
    updated = models.DateTimeField(auto_now=True, blank=True)
    measure = models.CharField(max_length=255, null=True, blank=True)
    CostDriver = models.CharField(max_length=255, null=True, blank=True)
    # filed for array of upload id for each file
    uploads = models.ManyToManyField(LogisticsUploads, blank=True, null=True)

    # upload_ids= models.CharField(max_length=255, null=True, blank=True)
    def _str_(self) -> str:
        return self.name