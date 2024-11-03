from django.contrib import admin

import tadbirbodjeh.models

admin.site.register(tadbirbodjeh.models.Logistics)
admin.site.register(tadbirbodjeh.models.Financial)
admin.site.register(tadbirbodjeh.models.LogisticsUploads)
admin.site.register(tadbirbodjeh.models.PettyCash)
admin.site.register(tadbirbodjeh.models.organization)
admin.site.register(tadbirbodjeh.models.unit)
admin.site.register(tadbirbodjeh.models.sub_unit)
admin.site.register(tadbirbodjeh.models.budget_chapter)
admin.site.register(tadbirbodjeh.models.budget_section)
admin.site.register(tadbirbodjeh.models.budget_row)
# admin.site.register(tadbirbodjeh.models.budget_sub_row)

admin.site.register(tadbirbodjeh.models.program)
admin.site.register(tadbirbodjeh.models.relation)
admin.site.register(tadbirbodjeh.models.Contract)
admin.site.register(tadbirbodjeh.models.Contractor_type)



class tadbirAdmin(admin.ModelAdmin):
    list_display = ("title", "description", "completed")


# Register your models here.