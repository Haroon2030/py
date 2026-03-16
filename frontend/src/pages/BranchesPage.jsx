import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { branchAPI } from '../api';
import toast from 'react-hot-toast';
import {
  Building2, Plus, Trash2, FileText, Calendar
} from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-purple-600" />
          إدارة الفروع
        </h1>
        <p className="text-gray-500 text-sm mt-1">إضافة وإدارة فروع الشركة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Branch */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              إضافة فرع جديد
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
                placeholder="اسم الفرع"
                required
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={adding}
                className="w-full gradient-primary text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                إضافة الفرع
              </motion.button>
            </form>
          </div>
        </div>

        {/* Branches List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-500" />
                قائمة الفروع
              </h2>
              <span className="px-3 py-1 rounded-full gradient-primary text-white text-sm font-medium">
                {branches.length} فرع
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : branches.length > 0 ? (
              <div className="divide-y divide-gray-50">
                <AnimatePresence>
                  {branches.map((branch) => (
                    <motion.div
                      key={branch.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{branch.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(branch.created_at).toLocaleDateString('ar-SA')}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <FileText className="w-3 h-3" />
                              {branch.document_count} ملف
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(branch.id, branch.name)}
                        className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Building2 className="w-14 h-14 mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400">لا توجد فروع بعد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
