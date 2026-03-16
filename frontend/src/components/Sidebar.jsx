import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Upload, Building2, LayoutDashboard,
  LogOut, ChevronLeft, Menu, X, Users, Sparkles, Shield
} from 'lucide-react';

const allNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم', adminOnly: false },
  { path: '/archive', icon: Archive, label: 'الأرشيف', adminOnly: false },
  { path: '/upload', icon: Upload, label: 'رفع ملف جديد', adminOnly: false },
  { path: '/branches', icon: Building2, label: 'إدارة الفروع', adminOnly: true },
  { path: '/users', icon: Users, label: 'المستخدمين', adminOnly: true },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Layered Background */}
      <div className="absolute inset-0 sidebar-bg" />
      <div className="absolute inset-0 sidebar-glow-top" />
      <div className="absolute inset-0 sidebar-glow-bottom" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="p-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Archive className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">الأرشيف</h1>
              <p className="text-blue-300/40 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400/60" />
                نظام إدارة الملفات
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((navItem) => (
            <NavLink
              key={navItem.path}
              to={navItem.path}
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              {({ isActive }) => (
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative ${
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                  whileHover={{ x: isActive ? 0 : -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute right-0 top-2 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-blue-400 to-violet-500"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-500/30'
                        : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <navItem.icon className="w-[18px] h-[18px]" />
                  </motion.div>

                  <span className="font-medium text-sm">{navItem.label}</span>

                  {isActive && (
                    <motion.div
                      className="mr-auto"
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <ChevronLeft className="w-4 h-4 text-blue-400/40" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-white/10">
              <span className="text-white font-bold text-sm">{user?.username?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-slate-500 text-[11px] flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {isAdmin ? 'مدير النظام' : 'موظف'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">تسجيل الخروج</span>
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <motion.button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-xl sidebar-bg text-white shadow-xl shadow-black/20 flex items-center justify-center border border-white/10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {mobileOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Menu className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed right-0 top-0 w-64 h-screen z-40 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: 260 }}
              animate={{ x: 0 }}
              exit={{ x: 260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 w-64 h-screen z-50 overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
