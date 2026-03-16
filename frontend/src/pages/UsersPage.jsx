import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, Search, Shield, ShieldOff,
  Key, Trash2, Mail, Calendar, FileText,
  Eye, EyeOff, CheckCircle, XCircle, Sparkles
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // New user form
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', is_staff: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.list({ search });
      setUsers(res.data.results || res.data);
    } catch {
      toast.error('خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('اسم المستخدم وكلمة المرور مطلوبة');
      return;
    }
    setSubmitting(true);
    try {
      await userAPI.create(form);
      toast.success(`تم إنشاء المستخدم ${form.username} بنجاح`);
      setForm({ username: '', email: '', first_name: '', last_name: '', password: '', is_staff: false });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data;
      if (msg?.username) toast.error(msg.username[0]);
      else toast.error('حدث خطأ أثناء إنشاء المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const res = await userAPI.toggleActive(userId);
      toast.success(res.data.is_active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    try {
      await userAPI.resetPassword(resetModal.id, newPassword);
      toast.success(`تم تغيير كلمة مرور ${resetModal.username}`);
      setResetModal(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    }
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id) {
      toast.error('لا يمكنك حذف حسابك!');
      return;
    }
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${u.username}"؟`)) return;
    try {
      await userAPI.delete(u.id);
      toast.success(`تم حذف ${u.username}`);
      fetchUsers();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          >
            <Users className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
            <p className="text-gray-500 text-sm">إضافة وإدارة حسابات المستخدمين</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-l from-blue-500 to-violet-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/25"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={showAddForm ? { rotate: 45 } : { rotate: 0 }}>
            <UserPlus className="w-5 h-5" />
          </motion.div>
          {showAddForm ? 'إلغاء' : 'إضافة مستخدم'}
        </motion.button>
      </motion.div>

      {/* Add User Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </motion.div>
                <h2 className="font-bold text-gray-800 text-lg">مستخدم جديد</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="fi-label">اسم المستخدم *</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    className="fi-input"
                    placeholder="username"
                    required
                  />
                </div>
                <div>
                  <label className="fi-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="fi-input"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="fi-label">الاسم الأول</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                    className="fi-input"
                    placeholder="الاسم الأول"
                  />
                </div>
                <div>
                  <label className="fi-label">الاسم الأخير</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                    className="fi-input"
                    placeholder="الاسم الأخير"
                  />
                </div>
                <div>
                  <label className="fi-label">كلمة المرور *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="fi-input pl-10"
                      placeholder="6 أحرف على الأقل"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_staff}
                      onChange={e => setForm({ ...form, is_staff: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:-right-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:-translate-x-full peer-checked:after:-translate-x-0" />
                  </label>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    صلاحيات المدير
                  </span>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-l from-blue-500 to-violet-600 text-white px-8 py-2.5 rounded-xl font-medium disabled:opacity-50 shadow-lg shadow-blue-500/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    جاري الإنشاء...
                  </span>
                ) : 'إنشاء المستخدم'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div variants={item} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-xl pr-12 pl-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
            placeholder="بحث عن مستخدم..."
          />
        </div>
      </motion.div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <motion.div
            className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : (
        <motion.div variants={item} className="grid gap-4">
          <AnimatePresence>
            {users.map((u, index) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-all duration-300 ${
                  !u.is_active ? 'border-red-100 bg-red-50/30' : 'border-slate-100 hover:border-blue-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Avatar */}
                  <motion.div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      u.is_staff
                        ? 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-blue-500/25'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/25'
                    }`}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  >
                    {u.username.charAt(0).toUpperCase()}
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{u.username}</h3>
                      {u.is_staff && (
                        <motion.span
                          className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-0.5"
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                        >
                          <Shield className="w-2.5 h-2.5" /> مدير
                        </motion.span>
                      )}
                      {u.is_active ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5" /> نشط
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-0.5">
                          <XCircle className="w-2.5 h-2.5" /> معطل
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      {u.email && (
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                      )}
                      {(u.first_name || u.last_name) && (
                        <span>{u.first_name} {u.last_name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        انضم {new Date(u.date_joined).toLocaleDateString('ar-SA')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {u.document_count} ملف
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <motion.button
                      onClick={() => handleToggleActive(u.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        u.is_active
                          ? 'text-orange-500 hover:bg-orange-50'
                          : 'text-green-500 hover:bg-green-50'
                      }`}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title={u.is_active ? 'تعطيل' : 'تفعيل'}
                      disabled={u.id === currentUser?.id}
                    >
                      {u.is_active ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      onClick={() => { setResetModal(u); setNewPassword(''); }}
                      className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title="تغيير كلمة المرور"
                    >
                      <Key className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(u)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title="حذف"
                      disabled={u.id === currentUser?.id}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {users.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              </motion.div>
              <p className="text-lg font-medium">لا يوجد مستخدمين</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setResetModal(null)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Key className="w-5 h-5 text-blue-600" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-gray-800">تغيير كلمة المرور</h3>
                  <p className="text-sm text-gray-500">للمستخدم: {resetModal.username}</p>
                </div>
              </div>
              <div className="relative mb-4">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="fi-input pl-10"
                  placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleResetPassword}
                  className="flex-1 bg-gradient-to-l from-blue-500 to-violet-600 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  تغيير كلمة المرور
                </motion.button>
                <button
                  onClick={() => setResetModal(null)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
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
