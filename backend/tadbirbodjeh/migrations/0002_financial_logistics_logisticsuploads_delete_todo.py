# Generated by Django 5.0 on 2024-02-14 10:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tadbirbodjeh", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Financial",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("date_doc", models.DateTimeField()),
                ("CostType", models.CharField(max_length=255)),
                ("descr", models.TextField()),
                ("F_conf", models.BooleanField(default=False)),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("updated", models.DateTimeField(auto_now=True)),
                ("programId", models.CharField(max_length=255)),
                ("topicId", models.CharField(max_length=255)),
                ("rowId", models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="Logistics",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("type", models.BooleanField(default=True)),
                ("price", models.FloatField()),
                ("seller", models.CharField(max_length=255)),
                ("date_doc", models.DateTimeField()),
                ("Location", models.CharField(max_length=255)),
                ("Payment_type", models.BooleanField(default=True)),
                ("descr", models.TextField()),
                ("F_conf", models.BooleanField(default=False)),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("updated", models.DateTimeField(auto_now=True)),
                ("measure", models.CharField(max_length=255)),
                ("CostDriver", models.CharField(max_length=255)),
                (
                    "Fdoc_key",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="Logistics",
                        to="tadbirbodjeh.financial",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="LogisticsUploads",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("file", models.FileField(upload_to="uploads/")),
                ("name", models.CharField(max_length=255)),
                (
                    "Logistics",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="files",
                        to="tadbirbodjeh.logistics",
                    ),
                ),
            ],
        ),
        migrations.DeleteModel(
            name="Todo",
        ),
    ]
