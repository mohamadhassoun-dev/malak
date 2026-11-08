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
  HelpCircle,
  FileText
} from 'lucide-react';
import { AppState } from '../types';
import { generateHostingerSQL, generateHostingerHtaccess, downloadFile } from '../services/sqlGenerator';

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
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedHtaccess, setCopiedHtaccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'htaccess' | 'json' | 'guide'>('sql');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const sqlContent = generateHostingerSQL(state);
  const htaccessContent = generateHostingerHtaccess();

  const handleDownloadSql = () => {
    const filename = `malak_sfiha_hostinger_${new Date().toISOString().slice(0, 10)}.sql`;
    downloadFile(sqlContent, filename, 'application/sql;charset=utf-8;');
    setStatusMessage({ text: 'تم تحميل ملف SQL بنجاح! يمكنك الآن استيراده في phpMyAdmin على هوستينجر.', type: 'success' });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadHtaccess = () => {
    downloadFile(htaccessContent, '.htaccess', 'text/plain;charset=utf-8;');
    setStatusMessage({ text: 'تم تحميل ملف .htaccess المخصص لـ Hostinger بنجاح! ارفعه إلى public_html لمنع أخطاء 404.', type: 'success' });
  };

  const handleCopyHtaccess = () => {
    navigator.clipboard.writeText(htaccessContent);
    setCopiedHtaccess(true);
    setTimeout(() => setCopiedHtaccess(false), 2000);
  };

  const handleDownloadJsonBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const filename = `malak_sfiha_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(jsonStr, filename, 'application/json;charset=utf-8;');
    setStatusMessage({ text: 'تم تحميل النسخة الاحتياطية بصيغة JSON بنجاح.', type: 'success' });
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
          setStatusMessage({ text: 'تم استيراد واسترجاع قاعدة البيانات بنجاح!', type: 'success' });
        } else {
          setStatusMessage({ text: 'الملف المرفوع لا يحتوي على بنية بيانات صحيحة.', type: 'error' });
        }
      } catch (err) {
        setStatusMessage({ text: 'حدث خطأ أثناء قراءة ملف JSON: ' + (err as Error).message, type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-50">
                إدارة وتصدير قاعدة بيانات SQL وتجهيز ملفات Hostinger
              </h3>
              <p className="text-xs text-stone-500">
                توليد ملفات MySQL / MariaDB المتوافقة 100% مع phpMyAdmin وملف .htaccess في هوستينجر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification banner (NO window.alert) */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
            statusMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300'
          }`}>
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="p-1 hover:opacity-75 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-100 dark:border-stone-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'sql'
                ? 'dynamic-bg text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            تصدير كود SQL (.sql)
          </button>
          <button
            onClick={() => setActiveTab('htaccess')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'htaccess'
                ? 'dynamic-bg text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            ملف .htaccess لهوستينجر
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'json'
                ? 'dynamic-bg text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            نسخ واستعادة (JSON)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'dynamic-bg text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            دليل استضافة Hostinger الكامل
          </button>
        </div>

        {/* Tab 1: SQL Export */}
        {activeTab === 'sql' && (
          <div className="space-y-4 flex-grow overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-bold">
              يتضمن هذا الملف كافة جداول النظام (المستخدمين، الأصناف، الفواتير، المستودع، ملف الشركة، واليوميات، وتخصيصات الألوان والشعار) مع تشفير UTF8MB4 لدعم اللغة العربية بشكل مثالي في Hostinger MySQL / phpMyAdmin.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadSql}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف SQL (.sql) جاهز للاستيراد</span>
              </button>

              <button
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'تم النسخ للحافظة!' : 'نسخ كود SQL'}</span>
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

        {/* Tab 2: .htaccess Generator */}
        {activeTab === 'htaccess' && (
          <div className="space-y-4 flex-grow overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-bold">
              ملف <code className="bg-emerald-200 dark:bg-emerald-900 px-1 py-0.5 rounded">.htaccess</code> ضروري جداً لرفع موقع React على Hostinger لمنع مشكلة خطأ 404 عند تحديث الصفحة أو تصفح الروابط، بالإضافة لتفعيل ضغط GZIP والتخزين المؤقت للصور.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadHtaccess}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف .htaccess</span>
              </button>

              <button
                onClick={handleCopyHtaccess}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                {copiedHtaccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHtaccess ? 'تم النسخ!' : 'نسخ ملف .htaccess'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-stone-950 text-amber-300 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto border border-stone-800 text-left dir-ltr">
                {htaccessContent}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: JSON Backup & Restore */}
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
                className="px-4 py-2.5 rounded-xl dynamic-bg text-white font-bold transition flex items-center gap-2 cursor-pointer active:scale-95"
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

        {/* Tab 4: Hostinger Deployment Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4 flex-grow overflow-y-auto text-xs leading-relaxed">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3 font-bold">
              <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-500" />
                <span>دليل الرفع الكامل لـ Hostinger (خطوة بخطوة):</span>
              </h4>

              <ol className="list-decimal list-inside space-y-3 text-stone-700 dark:text-stone-300">
                <li>
                  <strong>إنشاء قاعدة بيانات MySQL في لوحة هوستينجر (hPanel):</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4 block mt-1">
                    ادخل إلى لوحة Hostinger hPanel ← اختر <strong>Databases</strong> ← أنشئ قاعدة بيانات جديدة باسم مثل <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">malak_pos</code> وحدد اسم المستخدم وكلمة المرور.
                  </span>
                </li>

                <li>
                  <strong>استيراد ملف SQL في phpMyAdmin:</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4 block mt-1">
                    اضغط على زر <strong>Enter phpMyAdmin</strong> بجانب قاعدة البيانات ← اختر تبويب <strong>Import (استيراد)</strong> ← اختر ملف <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">.sql</code> المحمل من التبويب الأول واضغط <strong>Go</strong>. ستنشأ كل الجداول فوراً.
                  </span>
                </li>

                <li>
                  <strong>بناء ورفع ملفات الموقع:</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4 block mt-1">
                    نفذ أمر <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">npm run build</code> داخل المشروع لإنتاج مجلد <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">dist</code>. ارفع جميع الملفات الموجودة داخل مجلد <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">dist</code> مباشرة إلى مجلد <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">public_html</code> في File Manager بهوستينجر.
                  </span>
                </li>

                <li>
                  <strong>رفع ملف .htaccess في public_html:</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4 block mt-1">
                    حمّل ملف <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">.htaccess</code> من التبويب الثاني وارفعه في <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">public_html</code> لضمان عمل كافة الروابط وسرعة التخزين المؤقت.
                  </span>
                </li>

                <li>
                  <strong>نظام المزامنة والعمل أوفلاين:</strong>
                  <br />
                  <span className="text-stone-500 text-[11px] font-normal mr-4 block mt-1">
                    الموقع يعمل بتقنية المزامنة الفورية عبر التخزين المحلي وBroadcastChannel بين شاشات الكاشير والمطبخ والزبائن، حتى لو انقطع الإنترنت للحظات!
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
            className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
