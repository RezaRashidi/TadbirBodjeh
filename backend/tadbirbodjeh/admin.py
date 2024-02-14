from django.contrib import admin




class TodoAdmin(admin.ModelAdmin):
    list_display = ("title", "description", "completed")


# Register your models here.