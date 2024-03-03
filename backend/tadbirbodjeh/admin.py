from django.contrib import admin

import tadbirbodjeh.models

admin.site.register(tadbirbodjeh.models.Logistics)
admin.site.register(tadbirbodjeh.models.Financial)
admin.site.register(tadbirbodjeh.models.LogisticsUploads)

class TodoAdmin(admin.ModelAdmin):
    list_display = ("title", "description", "completed")


# Register your models here.