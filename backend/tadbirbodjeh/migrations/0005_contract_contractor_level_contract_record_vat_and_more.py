# Generated by Django 5.0.1 on 2024-11-03 11:27

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tadbirbodjeh", "0004_remove_contract_final_payable_amount_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="contract",
            name="Contractor_level",
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name="contract_record",
            name="vat",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="advance_payment_deductions",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="final_payable_amount",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="insurance",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="overhead_percentage",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="payable_amount_after_deductions",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="performanceـwithholding",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="performanceـwithholding_percentage",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="requested_performance_amount",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="tax_amount",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="tax_percentage",
            field=models.FloatField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="contract_record",
            name="treasury_deduction_percent",
            field=models.FloatField(max_length=255, null=True),
        ),
    ]
