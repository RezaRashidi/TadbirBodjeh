# Generated by Django 5.0.1 on 2024-10-19 11:30

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("tadbirbodjeh", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="relation",
            name="budget_row",
        ),
        migrations.RemoveField(
            model_name="relation",
            name="updated",
        ),
    ]
