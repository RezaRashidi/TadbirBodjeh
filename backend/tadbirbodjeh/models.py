from django.db import models

# Create your models here.


class Todo(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    completed = models.BooleanField(default=False)

    def _str_(self) -> str:
        return self.title


class Menu(models.Model):
    name = models.CharField(max_length=255)
    price = models.FloatField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class LogisticsـDoc(models.Model):
    name = models.CharField(max_length=255, blank=False)
    type = models.CharField(max_length=255)
    Fdoc_id = models.CharField(max_length=255)
    price = models.FloatField()
    seller = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    Location = models.CharField(max_length=255)
    Payment_type = models.CharField(max_length=255)
    descr = models.TextField()
    attachment = models.FileField(upload_to="uploads/")
    json = models.TextField()
    docType = models.CharField(
        max_length=255,
    )
    inFdoc = models.CharField(max_length=255)
    measure = models.CharField(max_length=255)
    CostـDriver = models.CharField(max_length=255)
    F_conf = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def _str_(self) -> str:
        return self.name
