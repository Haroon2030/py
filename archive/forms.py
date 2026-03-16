from django import forms
from .models import ArchiveDocument, Branch


class ArchiveDocumentForm(forms.ModelForm):
    class Meta:
        model = ArchiveDocument
        fields = ['employee_name', 'branch', 'document_date', 'pdf_file', 'notes']
        widgets = {
            'employee_name': forms.TextInput(attrs={
                'class': 'form-control form-control-lg',
                'placeholder': 'أدخل اسم الموظف',
            }),
            'branch': forms.Select(attrs={
                'class': 'form-select form-select-lg',
            }),
            'document_date': forms.DateInput(attrs={
                'class': 'form-control form-control-lg',
                'type': 'date',
            }),
            'pdf_file': forms.FileInput(attrs={
                'class': 'form-control form-control-lg',
                'accept': '.pdf',
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'ملاحظات إضافية (اختياري)',
            }),
        }

    def clean_pdf_file(self):
        file = self.cleaned_data.get('pdf_file')
        if file:
            if not file.name.endswith('.pdf'):
                raise forms.ValidationError('يرجى رفع ملف PDF فقط.')
            if file.size > 10 * 1024 * 1024:  # 10MB
                raise forms.ValidationError('حجم الملف يجب أن لا يتجاوز 10 ميجابايت.')
        return file


class BranchForm(forms.ModelForm):
    class Meta:
        model = Branch
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control form-control-lg',
                'placeholder': 'أدخل اسم الفرع',
            }),
        }
