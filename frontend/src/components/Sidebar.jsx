import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Upload, Building2, LayoutDashboard,
  LogOut, User, ChevronRight, Menu, X, Users, Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم', color: 'from-purple-500 to-indigo-500', glow: 'shadow-purple-500/30' },
  { path: '/archive', icon: Archive, label: 'الأرشيف', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/30' },
  { path: '/upload', icon: Upload, label: 'رفع ملف جديد', color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/30' },
  { path: '/branches', icon: Building2, label: 'إدارة الفروع', color: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/30' },
  { path: '/users', icon: Users, label: 'المستخدمين', color: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/30' },
];

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.2, rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5, ease: 'easeInOut' } },
  tap: { scale: 0.9 },
  active: { scale: [1, 1.15, 1], transition: { duration: 0.4 } },
};

const glowVariants = {
  rest: { opacity: 0, scale: 0.8 },
  hover: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Archive className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">الأرشيف</h1>
            <p className="text-gray-400 text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              نظام إدارة الملفات
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((navItem) => (
          <NavLink
            key={navItem.path}
            to={navItem.path}
            onClick={() => setMobileOpen(false)}
            className="block"
          >
            {({ isActive }) => (
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 relative overflow-hidden ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                animate={isActive ? 'active' : 'rest'}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-gradient-to-b ${navItem.color}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div className="relative">
                  <motion.div variants={glowVariants} className={`absolute inset-0 rounded-lg bg-gradient-to-br ${navItem.color} blur-md opacity-0`} />
                  <motion.div
                    variants={iconVariants}
                    className={`relative w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive
                        ? `bg-gradient-to-br ${navItem.color} shadow-lg ${navItem.glow}`
                        : 'bg-white/5'
                    }`}
                  >
                    <navItem.icon className="w-[18px] h-[18px]" />
                  </motion.div>
                </div>

                <span className="font-medium text-sm">{navItem.label}</span>

                <motion.div
                  className="mr-auto"
                  variants={{ rest: { x: 5, opacity: 0 }, hover: { x: 0, opacity: 1 } }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <motion.div
          className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl hover:bg-white/5 transition-colors cursor-default"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
            whileHover={{ rotate: [0, -5, 5, 0] }}
          >
            <User className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <p className="text-white text-sm font-medium">{user?.username}</p>
            <p className="text-gray-500 text-xs">مدير النظام</p>
          </div>
        </motion.div>
        <motion.button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div whileHover={{ rotate: -15 }}>
            <LogOut className="w-4 h-4" />
          </motion.div>
          <span className="text-sm">تسجيل الخروج</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <motion.button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-gray-900 text-white shadow-lg"
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
      <aside className="hidden lg:block fixed right-0 top-0 w-64 h-screen bg-gray-900 z-40">
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
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: 260 }}
              animate={{ x: 0 }}
              exit={{ x: 260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 w-64 h-screen bg-gray-900 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
