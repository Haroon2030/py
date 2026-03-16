import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:mr-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
