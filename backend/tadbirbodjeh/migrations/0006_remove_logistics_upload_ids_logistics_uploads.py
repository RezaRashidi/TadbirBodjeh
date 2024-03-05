# Generated by Django 5.0 on 2024-03-05 06:29

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tadbirbodjeh", "0005_remove_logisticsuploads_logistics_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="logistics",
            name="upload_ids",
        ),
        migrations.AddField(
            model_name="logistics",
            name="uploads",
            field=models.ManyToManyField(
                blank=True, null=True, to="tadbirbodjeh.logisticsuploads"
            ),
        ),
    ]
