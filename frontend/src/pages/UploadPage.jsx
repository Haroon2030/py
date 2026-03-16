import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { documentAPI, branchAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Upload, FileText, User, Building2,
  Calendar, MessageSquare, CloudUpload, X, Check
} from 'lucide-react';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    employee_name: '',
    branch: '',
    document_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    branchAPI.list().then(res => {
      const data = res.data;
      setBranches(Array.isArray(data) ? data : data.results || []);
    });
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
    } else {
      toast.error('يرجى اختيار ملف PDF فقط');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('يرجى اختيار ملف PDF');
    if (!form.employee_name) return toast.error('يرجى إدخال اسم الموظف');
    if (!form.branch) return toast.error('يرجى اختيار الفرع');

    setLoading(true);
    const formData = new FormData();
    formData.append('employee_name', form.employee_name);
    formData.append('branch', form.branch);
    formData.append('document_date', form.document_date);
    formData.append('pdf_file', file);
    if (form.notes) formData.append('notes', form.notes);

    try {
      await documentAPI.upload(formData);
      toast.success('تم رفع المستند بنجاح!');
      navigate('/archive');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).flat().forEach(e => toast.error(e));
      } else {
        toast.error('حدث خطأ أثناء الرفع');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Upload className="w-7 h-7 text-purple-600" />
          رفع ملف جديد
        </h1>
        <p className="text-gray-500 text-sm mt-1">رفع ملف مطابقة يومية جديد إلى الأرشيف</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Name */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <User className="w-4 h-4 text-purple-500" />
              اسم الموظف
            </label>
            <input
              type="text"
              value={form.employee_name}
              onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
              placeholder="أدخل اسم الموظف"
              required
            />
          </div>

          {/* Branch & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Building2 className="w-4 h-4 text-purple-500" />
                الفرع
              </label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-400 appearance-none"
                required
              >
                <option value="">اختر الفرع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 text-purple-500" />
                تاريخ المستند
              </label>
              <input
                type="date"
                value={form.document_date}
                onChange={(e) => setForm({ ...form, document_date: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-400"
                required
              />
            </div>
          </div>

          {/* PDF Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileText className="w-4 h-4 text-red-500" />
              الملف المرفق (PDF)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-purple-500 bg-purple-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700">{file.name}</p>
                    <p className="text-sm text-green-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                    إزالة الملف
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                    <CloudUpload className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">
                      {isDragActive ? 'أفلت الملف هنا' : 'اسحب الملف هنا أو انقر للاختيار'}
                    </p>
                    <p className="text-sm text-gray-400">PDF فقط - الحد الأقصى 10 ميجابايت</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              ملاحظات (اختياري)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-400 focus:bg-white resize-none transition-all"
              placeholder="أضف ملاحظات..."
            />
          </div>

          {/* Uploaded By Info */}
          <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-500">سيتم الرفع بواسطة</p>
              <p className="font-bold text-purple-800">{user?.username}</p>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25 text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                رفع الملف
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
