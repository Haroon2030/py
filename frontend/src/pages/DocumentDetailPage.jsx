import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { documentAPI } from '../api';
import toast from 'react-hot-toast';
import {
  FileText, ArrowRight, Download, Trash2,
  User, Building2, Calendar, Clock, MessageSquare
} from 'lucide-react';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentAPI.get(id).then(res => {
      setDoc(res.data);
      setLoading(false);
    }).catch(() => {
      toast.error('المستند غير موجود');
      navigate('/archive');
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
    try {
      await documentAPI.delete(id);
      toast.success('تم حذف المستند بنجاح');
      navigate('/archive');
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/archive" className="flex items-center gap-1 text-purple-600 text-sm mb-2 hover:underline">
            <ArrowRight className="w-4 h-4" />
            العودة للأرشيف
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">تفاصيل المستند</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Info Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Doc Icon */}
            <div className="gradient-primary p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-white font-bold text-lg">{doc.employee_name}</h2>
              <span className="inline-block mt-2 px-4 py-1 rounded-full bg-white/20 text-white text-sm">
                {doc.branch_name}
              </span>
            </div>

            {/* Details */}
            <div className="divide-y divide-gray-50">
              <DetailRow icon={User} label="اسم الموظف" value={doc.employee_name} />
              <DetailRow icon={Building2} label="الفرع" value={doc.branch_name} />
              <DetailRow icon={Calendar} label="تاريخ المستند" value={doc.document_date} />
              <DetailRow icon={User} label="رفع بواسطة" value={doc.uploaded_by_name} />
              <DetailRow icon={Clock} label="تاريخ الرفع" value={new Date(doc.created_at).toLocaleString('ar-SA')} />
              {doc.notes && <DetailRow icon={MessageSquare} label="ملاحظات" value={doc.notes} />}
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
              <a
                href={doc.pdf_file}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-5 h-5" />
                تحميل الملف
              </a>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 w-full border-2 border-red-200 text-red-500 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                حذف المستند
              </button>
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-700">معاينة الملف</h3>
              </div>
              <a
                href={doc.pdf_file}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-purple-600 hover:underline"
              >
                فتح في نافذة جديدة ↗
              </a>
            </div>
            <object
              data={`${doc.pdf_file}#toolbar=1&navpanes=0&scrollbar=1`}
              type="application/pdf"
              className="w-full"
              style={{ height: '700px' }}
            >
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <FileText className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium mb-2">لا يمكن عرض الملف</p>
                <p className="text-sm mb-4">المتصفح لا يدعم عرض PDF مباشرة</p>
                <a
                  href={doc.pdf_file}
                  target="_blank"
                  rel="noreferrer"
                  className="gradient-primary text-white px-6 py-2 rounded-lg text-sm"
                >
                  تحميل الملف
                </a>
              </div>
            </object>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="flex items-center gap-2 text-gray-500 text-sm">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <span className="font-medium text-gray-800 text-sm">{value}</span>
    </div>
  );
}
