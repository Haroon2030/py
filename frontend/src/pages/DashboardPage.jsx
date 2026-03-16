import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { statsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Upload, Building2, Calendar,
  ArrowUpLeft, Clock, TrendingUp, Users, Sparkles, Zap
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const floatingIcon = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.get().then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Welcome Header */}
      <motion.div variants={item} className="rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #8b5cf6 100%)' }}
      >
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
        <motion.div className="absolute top-6 left-20" animate={{ y: [0,-8,0], rotate: [0,15,-15,0], opacity: [0.5,1,0.5] }} transition={{ duration: 3, repeat: Infinity }}>
          <Sparkles className="w-5 h-5 text-amber-300/60" />
        </motion.div>
        <motion.div className="absolute bottom-8 left-40" animate={{ y: [0,6,0], rotate: [0,-10,10,0], opacity: [0.3,0.8,0.3] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
          <Zap className="w-4 h-4 text-amber-300/40" />
        </motion.div>
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">مرحباً بك، {user?.username} 👋</h1>
          <p className="text-white/70">لوحة تحكم نظام أرشيف ملفات المطابقة اليومية</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={item} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
              whileHover={{ scale: 1.1, rotate: [0,-5,5,0] }}
            >
              <motion.div {...floatingIcon}>
                <FileText className="w-7 h-7 text-white" />
              </motion.div>
            </motion.div>
            <motion.div
              className="flex items-center text-emerald-600 text-sm bg-emerald-50 px-2.5 py-1 rounded-full"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
            >
              <TrendingUp className="w-3.5 h-3.5 ml-1" />
              <span className="text-xs font-medium">نشط</span>
            </motion.div>
          </div>
          <motion.h3
            className="text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {stats?.total_documents || 0}
          </motion.h3>
          <p className="text-gray-500 text-sm mt-1">إجمالي الملفات</p>
        </motion.div>

        <motion.div variants={item} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20"
              whileHover={{ scale: 1.1, rotate: [0,-5,5,0] }}
            >
              <motion.div {...floatingIcon}>
                <Calendar className="w-7 h-7 text-white" />
              </motion.div>
            </motion.div>
            <motion.div
              className="flex items-center text-blue-600 text-sm bg-blue-50 px-2.5 py-1 rounded-full"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
            >
              <Clock className="w-3.5 h-3.5 ml-1" />
              <span className="text-xs font-medium">اليوم</span>
            </motion.div>
          </div>
          <motion.h3
            className="text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            {stats?.today_documents || 0}
          </motion.h3>
          <p className="text-gray-500 text-sm mt-1">ملفات اليوم</p>
        </motion.div>

        <motion.div variants={item} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-violet-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20"
              whileHover={{ scale: 1.1, rotate: [0,-5,5,0] }}
            >
              <motion.div {...floatingIcon}>
                <Building2 className="w-7 h-7 text-white" />
              </motion.div>
            </motion.div>
          </div>
          <motion.h3
            className="text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {stats?.total_branches || 0}
          </motion.h3>
          <p className="text-gray-500 text-sm mt-1">عدد الفروع</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/upload" className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors"
              whileHover={{ scale: 1.1, y: -3 }}
            >
              <Upload className="w-7 h-7 text-blue-600" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">رفع ملف جديد</h3>
              <p className="text-gray-500 text-sm">رفع ملف مطابقة يومية جديد</p>
            </div>
            <motion.div whileHover={{ x: -5, y: -5 }}>
              <ArrowUpLeft className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </motion.div>
          </div>
        </Link>

        <Link to="/archive" className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors"
              whileHover={{ scale: 1.1, y: -3 }}
            >
              <FileText className="w-7 h-7 text-teal-600" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">عرض الأرشيف</h3>
              <p className="text-gray-500 text-sm">تصفح وإدارة الملفات المحفوظة</p>
            </div>
            <motion.div whileHover={{ x: -5, y: -5 }}>
              <ArrowUpLeft className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
            </motion.div>
          </div>
        </Link>

        <Link to="/users" className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-violet-200 transition-all duration-300">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors"
              whileHover={{ scale: 1.1, y: -3 }}
            >
              <Users className="w-7 h-7 text-violet-600" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">المستخدمين</h3>
              <p className="text-gray-500 text-sm">إدارة حسابات المستخدمين</p>
            </div>
            <motion.div whileHover={{ x: -5, y: -5 }}>
              <ArrowUpLeft className="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors" />
            </motion.div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Documents */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <Clock className="w-5 h-5 text-blue-500" />
            </motion.div>
            آخر الملفات المرفوعة
          </h2>
        </div>
        <div className="divide-y divide-slate-50">
          {stats?.recent_documents?.length > 0 ? (
            stats.recent_documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/archive/${doc.id}`}
                  className="flex items-center justify-between p-4 px-6 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      <FileText className="w-5 h-5 text-red-500" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-800">{doc.employee_name}</p>
                      <p className="text-xs text-gray-400">{doc.branch_name}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">{doc.document_date}</p>
                    <p className="text-xs text-gray-400">{doc.uploaded_by_name}</p>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400">
              <motion.div {...floatingIcon}>
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              </motion.div>
              <p>لا توجد ملفات بعد</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
