import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { documentAPI, branchAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Upload, FileText, User, Building2,
  Calendar, MessageSquare, CloudUpload, X, Check, Sparkles, Shield
} from 'lucide-react';

export default function UploadPage() {
  const { user, isAdmin, userBranchId } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [focused, setFocused] = useState('');
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

  // Auto-select branch for non-admin
  useEffect(() => {
    if (!isAdmin && userBranchId) {
      setForm(f => ({ ...f, branch: String(userBranchId) }));
    }
  }, [isAdmin, userBranchId]);

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

  // Step indicator
  const steps = [
    { done: !!form.employee_name, label: 'الموظف' },
    { done: !!form.branch, label: 'الفرع' },
    { done: !!file, label: 'الملف' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Upload className="w-5 h-5 text-white" />
            </motion.div>
            رفع ملف جديد
          </h1>
          <p className="text-gray-500 text-sm mt-1">رفع ملف مطابقة يومية جديد إلى الأرشيف</p>
        </div>
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  step.done
                    ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 text-slate-400'
                }`}
                animate={step.done ? { scale: [1, 1.15, 1] } : {}}
              >
                {step.done ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>
              <span className={`text-xs font-medium hidden sm:inline ${step.done ? 'text-blue-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
              {i < steps.length - 1 && <div className={`w-6 h-0.5 rounded ${step.done ? 'bg-blue-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee Name */}
          <motion.div
            className={`fi-card ${focused === 'employee' ? 'border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10' : ''}`}
            animate={focused === 'employee' ? { y: -2 } : { y: 0 }}
          >
            <label className="fi-label">
              <User className="w-4 h-4" />
              اسم الموظف
              <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="text"
              value={form.employee_name}
              onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
              onFocus={() => setFocused('employee')}
              onBlur={() => setFocused('')}
              className="fi-input"
              placeholder="أدخل اسم الموظف"
              required
            />
          </motion.div>

          {/* Branch & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div
              className={`fi-card ${focused === 'branch' ? 'border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10' : ''}`}
              animate={focused === 'branch' ? { y: -2 } : { y: 0 }}
            >
              <label className="fi-label">
                <Building2 className="w-4 h-4" />
                الفرع
                <span className="text-red-400 text-xs">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  onFocus={() => setFocused('branch')}
                  onBlur={() => setFocused('')}
                  className={`fi-input appearance-none cursor-pointer pr-4 ${!isAdmin && userBranchId ? 'bg-slate-50 opacity-75' : ''}`}
                  required
                  disabled={!isAdmin && !!userBranchId}
                >
                  <option value="">اختر الفرع</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              </div>
            </motion.div>

            <motion.div
              className={`fi-card ${focused === 'date' ? 'border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10' : ''}`}
              animate={focused === 'date' ? { y: -2 } : { y: 0 }}
            >
              <label className="fi-label">
                <Calendar className="w-4 h-4" />
                تاريخ المستند
                <span className="text-red-400 text-xs">*</span>
              </label>
              <input
                type="date"
                value={form.document_date}
                onChange={(e) => setForm({ ...form, document_date: e.target.value })}
                onFocus={() => setFocused('date')}
                onBlur={() => setFocused('')}
                className="fi-input"
                required
              />
            </motion.div>
          </div>

          {/* PDF Upload */}
          <motion.div
            className={`fi-card ${isDragActive ? 'border-blue-300 shadow-lg shadow-blue-500/10' : ''}`}
          >
            <label className="fi-label">
              <FileText className="w-4 h-4 text-red-500" />
              الملف المرفق (PDF)
              <span className="text-red-400 text-xs">*</span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50/50'
                  : file
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700">{file.name}</p>
                      <p className="text-sm text-emerald-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      إزالة الملف
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center"
                      animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                    >
                      <CloudUpload className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-blue-400'}`} />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-gray-700">
                        {isDragActive ? 'أفلت الملف هنا' : 'اسحب الملف هنا أو انقر للاختيار'}
                      </p>
                      <p className="text-sm text-slate-400">PDF فقط - الحد الأقصى 10 ميجابايت</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            className={`fi-card ${focused === 'notes' ? 'border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10' : ''}`}
            animate={focused === 'notes' ? { y: -2 } : { y: 0 }}
          >
            <label className="fi-label">
              <MessageSquare className="w-4 h-4" />
              ملاحظات
              <span className="text-slate-300 text-xs font-normal">(اختياري)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              onFocus={() => setFocused('notes')}
              onBlur={() => setFocused('')}
              rows={3}
              className="fi-input resize-none"
              placeholder="أضف ملاحظات..."
            />
          </motion.div>

          {/* Uploader Info */}
          <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-500 font-medium">سيتم الرفع بواسطة</p>
              <p className="font-bold text-blue-900">{user?.username}</p>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-l from-blue-500 to-violet-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                رفع الملف
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
