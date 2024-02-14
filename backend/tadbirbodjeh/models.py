from django.db import models


class Financialـdoc(models.Model):
    name = models.CharField(max_length=255, blank=False)
    date_doc = models.DateTimeField()
    Costـtype = models.CharField(max_length=255, blank=False)
    descr = models.TextField()
    F_conf = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    programـid = models.CharField(max_length=255)
    topic_id = models.CharField(max_length=255)
    row_id = models.CharField(max_length=255)

    def _str_(self) -> str:
        return self.name

class LogisticsـDoc(models.Model):
    name = models.CharField(max_length=255, blank=False)
    type = models.BooleanField(default=True)
    Fdoc_key = models.ForeignKey(Financialـdoc, related_name="files", on_delete=models.set_null)
    price = models.FloatField(blank=False)
    seller = models.CharField(max_length=255)
    date_doc = models.DateTimeField()
    Location = models.CharField(max_length=255)
    Payment_type = models.BooleanField(default=True)
    descr = models.TextField()
    F_conf = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    measure = models.CharField(max_length=255)
    CostDriver = models.CharField(max_length=255)

    def _str_(self) -> str:
        return self.name


class LogisticsـUploads(models.Model):
    file = models.FileField(upload_to="uploads/")
    name = models.CharField(max_length=255, blank=False)
    Logisticsـkey = models.ForeignKey(LogisticsـDoc, related_name="files", on_delete=models.CASCADE)

    def _str_(self) -> str:
        return self.name