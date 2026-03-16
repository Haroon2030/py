import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { statsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Upload, Building2, Calendar,
  ArrowUpLeft, Clock, TrendingUp
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
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
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Welcome Header */}
      <motion.div variants={item} className="gradient-primary rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">مرحباً بك، {user?.username} 👋</h1>
          <p className="text-white/70">لوحة تحكم نظام أرشيف ملفات المطابقة اليومية</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-500 text-sm">
              <TrendingUp className="w-4 h-4 ml-1" />
              <span>نشط</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats?.total_documents || 0}</h3>
          <p className="text-gray-500 text-sm mt-1">إجمالي الملفات</p>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-blue-500 text-sm">
              <Clock className="w-4 h-4 ml-1" />
              <span>اليوم</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats?.today_documents || 0}</h3>
          <p className="text-gray-500 text-sm mt-1">ملفات اليوم</p>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-danger flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats?.total_branches || 0}</h3>
          <p className="text-gray-500 text-sm mt-1">عدد الفروع</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/upload" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Upload className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">رفع ملف جديد</h3>
              <p className="text-gray-500 text-sm">رفع ملف مطابقة يومية جديد</p>
            </div>
            <ArrowUpLeft className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>
        </Link>

        <Link to="/archive" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <FileText className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">عرض الأرشيف</h3>
              <p className="text-gray-500 text-sm">تصفح وإدارة الملفات المحفوظة</p>
            </div>
            <ArrowUpLeft className="w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>
        </Link>
      </motion.div>

      {/* Recent Documents */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            آخر الملفات المرفوعة
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {stats?.recent_documents?.length > 0 ? (
            stats.recent_documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/archive/${doc.id}`}
                className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
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
            ))
          ) : (
            <div className="py-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد ملفات بعد</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
