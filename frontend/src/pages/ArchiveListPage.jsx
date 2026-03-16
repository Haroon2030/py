import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { documentAPI, branchAPI } from '../api';
import toast from 'react-hot-toast';
import {
  Search, Filter, FileText, Eye, Trash2,
  Plus, Calendar, Building2, ChevronLeft,
  ChevronRight, User
} from 'lucide-react';

export default function ArchiveListPage() {
  const [documents, setDocuments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

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
      setTotalPages(Math.ceil((res.data.count || 0) / 15));
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
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-purple-600" />
            أرشيف ملفات المطابقة
          </h1>
          <p className="text-gray-500 text-sm mt-1">إدارة وحفظ ملفات المطابقة اليومية</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-5 h-5" />
          رفع ملف جديد
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث باسم الموظف، ملاحظات..."
              defaultValue={search}
              onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
              onBlur={(e) => updateParam('search', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-11 pl-4 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={branch}
              onChange={(e) => updateParam('branch', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:border-purple-300 appearance-none"
            >
              <option value="">جميع الفروع</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateParam('date_from', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-purple-300"
              placeholder="من تاريخ"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateParam('date_to', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-purple-300"
              placeholder="إلى تاريخ"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
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
                      className="hover:bg-purple-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-400 text-sm">{(page - 1) * 15 + idx + 1}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{doc.employee_name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium gradient-primary text-white">
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
                          <a
                            href={doc.pdf_file}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="تحميل PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(doc.id, doc.employee_name)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParam('page', String(p))}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      p === page
                        ? 'gradient-primary text-white shadow-lg shadow-purple-500/25'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
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
              className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              رفع ملف جديد
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
