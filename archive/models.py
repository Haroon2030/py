from django.db import models
from django.contrib.auth.models import User


class Branch(models.Model):
    name = models.CharField(max_length=100, verbose_name='اسم الفرع')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'فرع'
        verbose_name_plural = 'الفروع'
        ordering = ['name']

    def __str__(self):
        return self.name


class ArchiveDocument(models.Model):
    employee_name = models.CharField(max_length=200, verbose_name='اسم الموظف')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, verbose_name='الفرع')
    document_date = models.DateField(verbose_name='تاريخ المستند')
    pdf_file = models.FileField(upload_to='archives/%Y/%m/%d/', verbose_name='الملف المرفق (PDF)')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='تم الإضافة بواسطة')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الرفع')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخر تعديل')

    class Meta:
        verbose_name = 'مستند أرشيف'
        verbose_name_plural = 'الأرشيف'
        ordering = ['-document_date', '-created_at']

    def __str__(self):
        return f"{self.employee_name} - {self.branch} - {self.document_date}"
