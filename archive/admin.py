from django.contrib import admin
from .models import Branch, ArchiveDocument, UserProfile


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(ArchiveDocument)
class ArchiveDocumentAdmin(admin.ModelAdmin):
    list_display = ('employee_name', 'branch', 'document_date', 'uploaded_by', 'created_at')
    list_filter = ('branch', 'document_date')
    search_fields = ('employee_name', 'notes')
    date_hierarchy = 'document_date'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'branch')
    list_filter = ('branch',)
    search_fields = ('user__username',)
