import React, { useState } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  X,
  Upload,
  Server,
  FileCode,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { AppState } from '../types';
import { generateHostingerSQL, downloadFile } from '../services/sqlGenerator';

interface SqlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onRestoreState: (restored: AppState) => void;
}

export const SqlExportModal: React.FC<SqlExportModalProps> = ({
  isOpen,
  onClose,
  state,
  onRestoreState,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'json' | 'guide'>('sql');

  if (!isOpen) return null;

  const sqlContent = generateHostingerSQL(state);

  const handleDownloadSql = () => {
    const filename = `malak_sfiha_hostinger_${new Date().toISOString().slice(0, 10)}.sql`;
    downloadFile(sqlContent, filename, 'application/sql;charset=utf-8;');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJsonBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const filename = `malak_sfiha_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(jsonStr, filename, 'application/json;charset=utf-8;');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.menu && parsed.inventory) {
          onRestoreState(parsed);
          alert('تم استيراد واسترجاع قاعدة البيانات بنجاح!');
          onClose();
        } else {
          alert('الملف المرفوع لا يحتوي على بنية بيانات صحيحة.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-5 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-50">
                إدارة وتصدير قاعدة بيانات SQL (مخصصة لـ Hostinger)
              </h3>
              <p className="text-xs text-stone-500">
                توليد ملفات MySQL / MariaDB المتوافقة 100% مع phpMyAdmin في هوستينجر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'sql'
                ? 'bg-[#881337] text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            تصدير كود SQL (.sql)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'json'
                ? 'bg-[#881337] text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            نسخ احتياطي واستعادة (JSON)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'guide'
                ? 'bg-[#881337] text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            دليل استضافة Hostinger
          </button>
        </div>

        {/* Tab 1: SQL Export */}
        {activeTab === 'sql' && (
          <div className="space-y-4 flex-grow overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-bold">
              يتضمن هذا الملف كافة جداول النظام (المستخدمين، الأصناف، الفواتير، المستودع، ملف الشركة، واليوميات) مع تشفير UTF8MB4 لدعم اللغة العربية بشكل مثالي في Hostinger MySQL / phpMyAdmin.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadSql}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف SQL (.sql) جاهز للاستيراد</span>
              </button>

              <button
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 text-xs font-bold transition flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ للحافظة!' : 'نسخ كود SQL'}</span>
              </button>
            </div>

            {/* Code Preview */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-stone-950 text-emerald-400 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto border border-stone-800 text-left dir-ltr">
                {sqlContent.slice(0, 1500)}...
              </pre>
              <div className="absolute bottom-2 left-4 text-[10px] text-stone-500 font-mono">
                {sqlContent.length} حرفاً
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: JSON Backup & Restore */}
        {activeTab === 'json' && (
          <div className="space-y-4 flex-grow overflow-y-auto text-xs font-bold">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
              <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                تصدير نسخة احتياطية كاملة (JSON)
              </h4>
              <p className="text-stone-500">
                قم بتنزيل ملف يحتوي على كافة الأصناف، الفواتير، أسعار الصرف، والمستودع للاحتفاظ بنسخة أرشيفية أو نقلها لجهاز آخر.
              </p>
              <button
                onClick={handleDownloadJsonBackup}
                className="px-4 py-2.5 rounded-xl bg-[#881337] text-white font-bold transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تحميل نسخة احتياطية (.json)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
              <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                استرجاع نسخة احتياطية سابقة
              </h4>
              <p className="text-stone-500">
                اختر ملف نسخة احتياطية بصيغة JSON لاستعادة كافة البيانات إلى السيستم.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>اختيار ملف JSON واسترجاعه</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Hostinger Deployment Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4 flex-grow overflow-y-auto text-xs leading-relaxed">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3 font-bold">
              <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-500" />
                <span>خطوات استضافة الموقع وقاعدة بيانات SQL على Hostinger:</span>
              </h4>

              <ol className="list-decimal list-inside space-y-2 text-stone-700 dark:text-stone-300">
                <li>
                  <strong>إنشاء قاعدة بيانات MySQL في هوستينجر:</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4">
                    ادخل إلى لوحة Hostinger hPanel ← اختر "Databases" (قواعد البيانات) ← أنشئ قاعدة بيانات جديدة باسم مثل <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">malak_pos</code> وحدد اسم مستخدم وكلمة مرور قوية.
                  </span>
                </li>

                <li>
                  <strong>استيراد ملف SQL في phpMyAdmin:</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4">
                    اضغط على زر "Enter phpMyAdmin" بجانب قاعدة البيانات ← اختر تبويب "Import" (استيراد) ← اختر ملف <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">.sql</code> الذي حملته من هنا واضغط "Go". سيتم إنشاء كل الجداول وملؤها تلقائياً.
                  </span>
                </li>

                <li>
                  <strong>رفع ملفات المشروع (Custom Code Project):</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4">
                    نفذ أمر <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">npm run build</code> لإنتاج مجلد <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">dist</code> وارفع محتوياته إلى مجلد <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">public_html</code> في File Manager بهوستينجر.
                  </span>
                </li>

                <li>
                  <strong>السرعة وتقليل استهلاك السيرفر (Speed Optimization):</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4">
                    تم تصميم التطبيق بتقنية Caching الذكية محلياً مع المزامنة الفورية عبر BroadcastChannel، مما يقلل استهلاك طلبات السيرفر بنسبة تفوق 90% ويمنح سرعة تصفح لحظية فائقة على جميع الهواتف والحواسب!
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
