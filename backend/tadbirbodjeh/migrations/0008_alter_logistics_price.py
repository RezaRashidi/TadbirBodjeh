# Generated by Django 5.0 on 2024-03-05 11:29

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tadbirbodjeh", "0007_alter_logistics_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="logistics",
            name="price",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
