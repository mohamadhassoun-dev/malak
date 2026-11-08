import React, { useState } from 'react';
import {
  Plus,
  PenSquare,
  Trash2,
  Camera,
  Check,
  X,
  Wheat,
  Eye,
  EyeOff
} from 'lucide-react';
import { MenuItem } from '../types';
import { formatLbp } from '../services/storageService';

interface MenuManagementViewProps {
  menu: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: number) => void;
}

export const MenuManagementView: React.FC<MenuManagementViewProps> = ({
  menu,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}) => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states
  const [itemName, setItemName] = useState<string>('');
  const [itemCategory, setItemCategory] = useState<string>('صفيحة على الحطب');
  const [itemPrice, setItemPrice] = useState<string>('');
  const [itemDeductBread, setItemDeductBread] = useState<boolean>(true);
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemBadge, setItemBadge] = useState<string>('');
  const [itemImage, setItemImage] = useState<string>('');

  const openAdd = () => {
    setItemName('');
    setItemCategory('صفيحة على الحطب');
    setItemPrice('');
    setItemDeductBread(true);
    setItemDescription('');
    setItemBadge('');
    setItemImage(menu[0]?.image || '');
    setShowAddModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemPrice(item.price.toString());
    setItemDeductBread(item.deductBread);
    setItemDescription(item.description || '');
    setItemBadge(item.badge || '');
    setItemImage(item.image);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>, targetItem?: MenuItem) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 400;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        if (targetItem) {
          onUpdateMenuItem({ ...targetItem, image: dataUrl });
        } else {
          setItemImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(itemPrice);
    if (!itemName.trim() || isNaN(price) || price <= 0) {
      return alert('يرجى التأكد من اسم الصنف وإدخال سعر صحيح');
    }

    if (editingItem) {
      onUpdateMenuItem({
        ...editingItem,
        name: itemName.trim(),
        category: itemCategory,
        price,
        deductBread: itemDeductBread,
        description: itemDescription.trim(),
        badge: itemBadge.trim(),
        image: itemImage || editingItem.image
      });
      setEditingItem(null);
    } else {
      onAddMenuItem({
        name: itemName.trim(),
        category: itemCategory,
        price,
        deductBread: itemDeductBread,
        description: itemDescription.trim(),
        badge: itemBadge.trim(),
        image: itemImage || menu[0]?.image || '',
        isAvailable: true
      });
      setShowAddModal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">
            إدارة قائمة الأصناف، الأسعار والصور
          </h2>
          <p className="text-xs text-stone-500">
            تعديل أسعار الصفيحة، تفعيل أو إيقاف خصم الخبز الأسمر، وتحديث صور القائمة
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      {/* Menu Edit Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-xs text-right">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 pb-3">
              <th className="py-3 font-bold">الصورة</th>
              <th className="py-3 font-bold">الصنف</th>
              <th className="py-3 font-bold">القسم</th>
              <th className="py-3 font-bold">السعر (ل.ل)</th>
              <th className="py-3 font-bold text-center">خصم خبز أسمر؟</th>
              <th className="py-3 font-bold text-center">الحالة</th>
              <th className="py-3 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {menu.map(item => (
              <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                <td className="py-3">
                  <div className="relative group w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <label
                      htmlFor={`img-upload-${item.id}`}
                      className="absolute inset-0 bg-stone-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="تغيير الصورة"
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                    <input
                      id={`img-upload-${item.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFile(e, item)}
                      className="hidden"
                    />
                  </div>
                </td>

                <td className="py-3 font-black text-stone-900 dark:text-stone-100">
                  <div>{item.name}</div>
                  {item.badge && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                      [{item.badge}]
                    </span>
                  )}
                </td>

                <td className="py-3 font-bold text-stone-500">
                  {item.category}
                </td>

                <td className="py-3 font-black text-[#881337] dark:text-rose-400 tabular-nums">
                  {formatLbp(item.price)}
                </td>

                <td className="py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.deductBread
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-stone-100 text-stone-500 dark:bg-stone-800'
                    }`}
                  >
                    <Wheat className="w-3 h-3" />
                    <span>{item.deductBread ? 'يخصم رغيف' : 'لا يخصم'}</span>
                  </span>
                </td>

                <td className="py-3 text-center">
                  <button
                    onClick={() => onUpdateMenuItem({ ...item, isAvailable: !item.isAvailable })}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                    }`}
                  >
                    {item.isAvailable ? 'متوفر' : 'غير متوفر'}
                  </button>
                </td>

                <td className="py-3 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition"
                      title="تعديل بيانات الصنف"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`حذف صنف "${item.name}" نهائياً من القائمة؟`)) {
                          onDeleteMenuItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 transition"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Item Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-base text-stone-900 dark:text-stone-50 border-b pb-2">
              {editingItem ? `تعديل صنف: ${editingItem.name}` : 'إضافة صنف جديد للقائمة'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-stone-500 mb-1">اسم الصنف:</label>
                <input
                  type="text"
                  placeholder="مثال: صفيحة طرابلسية بالرمان"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">القسم / التصنيف:</label>
                  <input
                    type="text"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="صفيحة على الحطب"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">السعر (ل.ل):</label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="70000"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">شارة مميزة (اختياري):</label>
                <input
                  type="text"
                  value={itemBadge}
                  onChange={(e) => setItemBadge(e.target.value)}
                  placeholder="مثال: الأكثر طلباً، جديد، خلطة الشيف..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">وصف الصنف والمكونات:</label>
                <textarea
                  rows={2}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="اكتب تفاصيل المكونات والتتبيلة..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <input
                  id="deduct-bread-check"
                  type="checkbox"
                  checked={itemDeductBread}
                  onChange={(e) => setItemDeductBread(e.target.checked)}
                  className="w-4 h-4 accent-[#881337] cursor-pointer"
                />
                <label htmlFor="deduct-bread-check" className="cursor-pointer text-stone-800 dark:text-stone-200">
                  يخصم رغيف خبز أسمر من رصيد المستودع عند كل عملية بيع
                </label>
              </div>

              {/* Image Preview & Upload */}
              <div>
                <label className="block text-stone-500 mb-1">صورة الصنف:</label>
                <div className="flex items-center gap-3">
                  {itemImage && (
                    <img src={itemImage} alt="Preview" className="w-14 h-14 rounded-xl object-cover border" />
                  )}
                  <label className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border hover:bg-stone-200 cursor-pointer flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>تحميل صورة من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFile(e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#881337] text-white font-bold"
                >
                  حفظ الصنف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
