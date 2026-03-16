import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { branchAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Building2, Plus, Trash2, FileText, Calendar, Search,
  Hash, TrendingUp, Sparkles, Edit3, Check, X, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const PAGE_SIZE = 6;

// Color tokens for consistent theming
const colors = {
  primary: { gradient: 'from-blue-500 to-violet-600', shadow: 'shadow-blue-500/20', bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500/10', border: 'border-blue-200' },
  info: { gradient: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  success: { gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50', text: 'text-emerald-600' },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }
  }),
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } }
};

export default function BranchesPage() {
  const { isAdmin } = useAuth();
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBranches = () => {
    branchAPI.list().then(res => {
      const data = res.data;
      setBranches(Array.isArray(data) ? data : data.results || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await branchAPI.create(name);
      toast.success('تم إضافة الفرع بنجاح');
      setName('');
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || 'حدث خطأ');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, branchName) => {
    if (!confirm(`هل أنت متأكد من حذف فرع "${branchName}"؟`)) return;
    try {
      await branchAPI.delete(id);
      toast.success('تم حذف الفرع');
      setBranches(b => b.filter(x => x.id !== id));
    } catch {
      toast.error('لا يمكن حذف الفرع - قد يحتوي على ملفات');
    }
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await branchAPI.update(id, editName);
      toast.success('تم تعديل الفرع');
      setEditingId(null);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || 'حدث خطأ');
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = branches
    .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name, 'ar');
      else if (sortField === 'date') cmp = new Date(a.created_at) - new Date(b.created_at);
      else if (sortField === 'docs') cmp = (a.document_count || 0) - (b.document_count || 0);
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const totalDocs = branches.reduce((s, b) => s + (b.document_count || 0), 0);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedBranches = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page on search/sort change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortField, sortDir]);

  const SortIcon = ({ field }) => (
    <span className="inline-flex flex-col mr-1">
              <ChevronUp className={`w-3 h-3 -mb-1 transition-colors ${sortField === field && sortDir === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} />
      <ChevronDown className={`w-3 h-3 transition-colors ${sortField === field && sortDir === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} />
    </span>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Building2 className="w-7 h-7 text-purple-600" />
            </motion.div>
            إدارة الفروع
          </h1>
          <p className="text-gray-500 text-sm mt-1">إضافة وإدارة فروع الشركة</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'إجمالي الفروع', value: branches.length, icon: Building2, color: colors.primary.gradient, glow: colors.primary.shadow },
          { label: 'إجمالي الملفات', value: totalDocs, icon: FileText, color: colors.info.gradient, glow: colors.info.shadow },
          { label: 'متوسط الملفات/فرع', value: branches.length ? Math.round(totalDocs / branches.length) : 0, icon: TrendingUp, color: colors.success.gradient, glow: colors.success.shadow },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
            className={`relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 overflow-hidden shadow-lg ${stat.glow}`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-l ${stat.color}`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">{stat.label}</p>
                <motion.p
                  className="text-xl sm:text-2xl font-bold text-gray-800"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                >
                  {stat.value}
                </motion.p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Branch Form - Compact Inline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6"
      >
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="fi-input pr-11"
              placeholder="أدخل اسم الفرع الجديد..."
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={adding}
            className="bg-gradient-to-l from-blue-500 to-violet-600 text-white font-medium py-3 px-8 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 whitespace-nowrap"
          >
            {adding ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            إضافة فرع
          </motion.button>
        </form>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              قائمة الفروع
            </h2>
            <span className="px-3 py-1 rounded-full bg-gradient-to-l from-blue-500 to-violet-600 text-white text-xs font-bold">
              {filtered.length}
            </span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الفروع..."
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">جاري تحميل الفروع...</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-l from-gray-50 to-gray-50/50">
                    <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">
                      <Hash className="w-4 h-4 inline" />
                    </th>
                    <th
                      className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                      onClick={() => toggleSort('name')}
                    >
                      <span className="flex items-center gap-1">
                        اسم الفرع
                        <SortIcon field="name" />
                      </span>
                    </th>
                    <th
                      className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                      onClick={() => toggleSort('docs')}
                    >
                      <span className="flex items-center gap-1">
                        عدد الملفات
                        <SortIcon field="docs" />
                      </span>
                    </th>
                    <th
                      className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="flex items-center gap-1">
                        تاريخ الإنشاء
                        <SortIcon field="date" />
                      </span>
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-40">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginatedBranches.map((branch, idx) => (
                      <motion.tr
                        key={branch.id}
                        custom={idx}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-all group"
                      >
                        <td className="py-4 px-6">
                          <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            {(currentPage - 1) * PAGE_SIZE + idx + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {editingId === branch.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-white border-2 border-blue-400 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEdit(branch.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                              <button onClick={() => handleEdit(branch.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-gray-800">{branch.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[120px]">
                              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-l from-blue-500 to-violet-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, ((branch.document_count || 0) / Math.max(1, ...branches.map(b => b.document_count || 0))) * 100)}%` }}
                                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold min-w-[60px] justify-center">
                              <FileText className="w-3 h-3" />
                              {branch.document_count || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(branch.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setEditingId(branch.id); setEditName(branch.name); }}
                              className="p-2 rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            {isAdmin && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(branch.id, branch.name)}
                                className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {paginatedBranches.map((branch, idx) => (
                  <motion.div
                    key={branch.id}
                    custom={idx}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="p-4 hover:bg-purple-50/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon & Number */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {(currentPage - 1) * PAGE_SIZE + idx + 1}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {editingId === branch.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-white border-2 border-blue-400 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                              autoFocus
                            />
                            <button onClick={() => handleEdit(branch.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-bold text-gray-800 text-base truncate">{branch.name}</h3>
                        )}

                        {/* Meta Row */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            <FileText className="w-3 h-3" />
                            {branch.document_count || 0} ملف
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(branch.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2.5">
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-l from-blue-500 to-violet-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, ((branch.document_count || 0) / Math.max(1, ...branches.map(b => b.document_count || 0))) * 100)}%` }}
                              transition={{ delay: 0.3 + idx * 0.08, duration: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditingId(branch.id); setEditName(branch.name); }}
                          className="p-2 rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(branch.id, branch.name)}
                            className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Building2 className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            </motion.div>
            <h3 className="text-gray-400 font-bold text-lg mb-1">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد فروع بعد'}
            </h3>
            <p className="text-gray-300 text-sm">
              {searchQuery ? 'جرّب كلمة بحث مختلفة' : 'أضف فرعاً جديداً للبدء'}
            </p>
          </div>
        )}

        {/* Footer Stats + Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      p === currentPage
                        ? 'bg-gradient-to-l from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/20'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>عرض {paginatedBranches.length} من {filtered.length} فرع</span>
              <span>إجمالي الملفات: {totalDocs}</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
