from django.contrib import admin

from .models import Todo

from tadbirbodjeh.models import Financialـdoc


class TodoAdmin(admin.ModelAdmin):
    list_display = ("title", "description", "completed")


# Register your models here.

admin.site.register(Todo, TodoAdmin)


@admin.register(Financialـdoc)
class FinancialـdocAdmin(admin.ModelAdmin):
    pass