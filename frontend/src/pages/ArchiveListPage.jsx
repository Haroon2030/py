import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { documentAPI, branchAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Search, Filter, FileText, Eye, Trash2,
  Plus, Calendar, Building2, ChevronLeft,
  ChevronRight, User, Edit3, X
} from 'lucide-react';

const PAGE_SIZE = 6;

export default function ArchiveListPage() {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ employee_name: '', branch: '', document_date: '', notes: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const branch = searchParams.get('branch') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  useEffect(() => {
    branchAPI.list().then(res => {
      const data = res.data;
      setBranches(Array.isArray(data) ? data : data.results || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, format: 'json' };
    if (search) params.search = search;
    if (branch) params.branch = branch;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    documentAPI.list(params).then(res => {
      setDocuments(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / PAGE_SIZE));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, search, branch, dateFrom, dateTo]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`هل أنت متأكد من حذف مستند "${name}"؟`)) return;
    try {
      await documentAPI.delete(id);
      toast.success('تم حذف المستند بنجاح');
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ أثناء الحذف');
    }
  };

  const openEditDoc = (doc) => {
    setEditForm({
      employee_name: doc.employee_name || '',
      branch: doc.branch || '',
      document_date: doc.document_date || '',
      notes: doc.notes || '',
    });
    setEditModal(doc);
  };

  const handleEditDoc = async () => {
    if (!editForm.employee_name || !editForm.branch || !editForm.document_date) {
      toast.error('اسم الموظف والفرع والتاريخ مطلوبة');
      return;
    }
    setEditSubmitting(true);
    try {
      await documentAPI.update(editModal.id, editForm);
      toast.success('تم تحديث بيانات المستند بنجاح');
      setEditModal(null);
      // Refresh the list
      setLoading(true);
      const params = { page, format: 'json' };
      if (search) params.search = search;
      if (branch) params.branch = branch;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      documentAPI.list(params).then(res => {
        setDocuments(res.data.results || []);
        setTotalPages(Math.ceil((res.data.count || 0) / PAGE_SIZE));
        setLoading(false);
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ أثناء التحديث');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            أرشيف ملفات المطابقة
          </h1>
          <p className="text-gray-500 text-sm mt-1">إدارة وحفظ ملفات المطابقة اليومية</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 bg-gradient-to-l from-blue-500 to-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          رفع ملف جديد
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
          <div className={`${isAdmin ? 'md:col-span-2' : 'md:col-span-2'} relative`}>
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث باسم الموظف، ملاحظات..."
              defaultValue={search}
              onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
              onBlur={(e) => updateParam('search', e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 pr-11 pl-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300"
            />
          </div>
          {/* فلتر الفرع للمدير فقط */}
          {isAdmin && (
            <div className="relative">
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={branch}
                onChange={(e) => updateParam('branch', e.target.value)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all duration-300"
              >
                <option value="">جميع الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateParam('date_from', e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              placeholder="من تاريخ"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateParam('date_to', e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              placeholder="إلى تاريخ"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : documents.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">#</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">اسم الموظف</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">الفرع</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">تاريخ المستند</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">رفع بواسطة</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">تاريخ الرفع</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-500">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {documents.map((doc, idx) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-400 text-sm">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{doc.employee_name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-l from-blue-500 to-violet-600 text-white">
                          {doc.branch_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">{doc.document_date}</td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {doc.uploaded_by_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-xs">
                        {new Date(doc.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/archive/${doc.id}`}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            title="عرض"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditDoc(doc)}
                            className="p-2 rounded-lg text-violet-500 hover:bg-violet-50 transition-colors"
                            title="تعديل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <a
                            href={doc.pdf_file}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                            title="تحميل PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                          {/* المدير فقط يحذف */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(doc.id, doc.employee_name)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParam('page', String(page - 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => updateParam('page', String(p))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        p === page
                          ? 'bg-gradient-to-l from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => updateParam('page', String(page + 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-gray-500 font-bold text-lg mb-2">لا توجد ملفات</h3>
            <p className="text-gray-400 text-sm mb-6">ابدأ برفع ملف مطابقة جديد</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-l from-blue-500 to-violet-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              رفع ملف جديد
            </Link>
          </div>
        )}
      </div>

      {/* Edit Document Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">تعديل بيانات المستند</h3>
                <button onClick={() => setEditModal(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">اسم الموظف</label>
                  <input
                    type="text"
                    value={editForm.employee_name}
                    onChange={(e) => setEditForm({ ...editForm, employee_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">الفرع</label>
                  <select
                    value={editForm.branch}
                    onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">تاريخ المستند</label>
                  <input
                    type="date"
                    value={editForm.document_date}
                    onChange={(e) => setEditForm({ ...editForm, document_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ملاحظات</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditDoc}
                  disabled={editSubmitting}
                  className="flex-1 bg-gradient-to-l from-blue-500 to-violet-600 text-white py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50"
                >
                  {editSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  onClick={() => setEditModal(null)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
