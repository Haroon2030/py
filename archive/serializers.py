from rest_framework import serializers
from django.contrib.auth.models import User
from archive.models import Branch, ArchiveDocument


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'last_login']


class BranchSerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = ['id', 'name', 'created_at', 'document_count']

    def get_document_count(self, obj):
        return obj.archivedocument_set.count()


class ArchiveDocumentSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = ArchiveDocument
        fields = [
            'id', 'employee_name', 'branch', 'branch_name',
            'document_date', 'pdf_file', 'notes',
            'uploaded_by', 'uploaded_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']


class ArchiveDocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchiveDocument
        fields = ['employee_name', 'branch', 'document_date', 'pdf_file', 'notes']

    def validate_pdf_file(self, value):
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('يُسمح فقط بملفات PDF')
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('حجم الملف يجب أن لا يتجاوز 10 ميجابايت')
        return value
