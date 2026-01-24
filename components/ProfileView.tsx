
import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { User, Settings, Phone, Shield, Globe, LogOut, Star, MapPin, ChevronLeft, ChevronDown, PhoneCall, MessageCircle, X } from 'lucide-react';
import { SUPPORT_PHONES } from '../constants';

interface ProfileViewProps {
  onNavigate: (view: string) => void;
}

// --- SHARED: CONTACT ACTION MODAL (Replicated locally or could be exported if refactored) ---
const ContactActionModal: React.FC<{ phone: string | null; onClose: () => void }> = ({ phone, onClose }) => {
    if (!phone) return null;

    const handleCall = () => {
        window.open(`tel:${phone}`, '_self');
        onClose();
    };

    const handleWhatsApp = () => {
        const waNumber = `20${phone.replace(/^0+/, '')}`;
        window.open(`https://wa.me/${waNumber}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10">
                <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200">
                    <X size={20} className="text-gray-500" />
                </button>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-1">اختر وسيلة التواصل</h3>
                    <p className="text-lg font-bold text-primary">{phone}</p>
                </div>
                <div className="space-y-3">
                    <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg">
                        <MessageCircle size={24} />
                        تواصل عبر واتساب
                    </button>
                    <button onClick={handleCall} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg">
                        <PhoneCall size={24} />
                        اتصال هاتفي
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { currentUser, logout, orders } = useApp();
  const [showSupport, setShowSupport] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const totalOrders = orders.filter(o => 
      (currentUser?.role === 'DRIVER' && o.driverId === currentUser.id && o.status === 'DELIVERED') ||
      (currentUser?.role === 'CUSTOMER' && o.customerId === currentUser.id)
  ).length;

  return (
    <div className="space-y-6">
      <ContactActionModal phone={selectedContact} onClose={() => setSelectedContact(null)} />

      <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-bold border-2 border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary to-orange-400 opacity-20"></div>
          
          <div className="relative z-10">
              <div className="w-24 h-24 rounded-full border-4 border-white mx-auto shadow-lg bg-gray-200 overflow-hidden mb-3">
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <User size={48} />
                  </div>
              </div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">{currentUser?.name}</h2>
              <p className="text-gray-500 font-bold text-sm mb-4">{currentUser?.phone}</p>
              
              <div className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider">
                  {currentUser?.role}
              </div>
          </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-4 bg-orange-50 border-orange-100">
              <span className="text-2xl font-black text-primary block">{totalOrders}</span>
              <span className="text-xs text-orange-400 font-bold">طلبات</span>
          </Card>
          <Card className="text-center py-4 bg-blue-50 border-blue-100">
              <span className="text-2xl font-black text-secondary block">{currentUser?.score || 5.0}</span>
              <span className="text-xs text-blue-400 font-bold flex justify-center items-center gap-1">
                  <Star size={10} fill="currentColor" /> تقييم
              </span>
          </Card>
          <Card className="text-center py-4 bg-purple-50 border-purple-100">
              <span className="text-2xl font-black text-purple-600 block">0</span>
              <span className="text-xs text-purple-400 font-bold">نقاط</span>
          </Card>
      </div>

      {/* Menu */}
      <div className="space-y-3">
          <button onClick={() => onNavigate('ADDRESSES')} className="w-full bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-primary transition-colors group">
              <div className="bg-gray-100 p-2 rounded-xl text-gray-600 group-hover:bg-orange-100 group-hover:text-primary transition-colors"><MapPin size={20} /></div>
              <span className="font-bold flex-1 text-right text-gray-700 dark:text-gray-200">عناويني</span>
              <ChevronLeft size={20} className="text-gray-300 rtl:rotate-180" />
          </button>

          <button onClick={() => onNavigate('SETTINGS')} className="w-full bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-primary transition-colors group">
              <div className="bg-gray-100 p-2 rounded-xl text-gray-600 group-hover:bg-orange-100 group-hover:text-primary transition-colors"><Settings size={20} /></div>
              <span className="font-bold flex-1 text-right text-gray-700 dark:text-gray-200">الإعدادات</span>
              <ChevronLeft size={20} className="text-gray-300 rtl:rotate-180" />
          </button>
          
          <button className="w-full bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-primary transition-colors group">
              <div className="bg-gray-100 p-2 rounded-xl text-gray-600 group-hover:bg-orange-100 group-hover:text-primary transition-colors"><Globe size={20} /></div>
              <span className="font-bold flex-1 text-right text-gray-700 dark:text-gray-200">اللغة / Language</span>
              <span className="text-xs font-bold text-gray-400">العربية</span>
          </button>
          
          <button onClick={() => onNavigate('PRIVACY')} className="w-full bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-primary transition-colors group">
              <div className="bg-gray-100 p-2 rounded-xl text-gray-600 group-hover:bg-orange-100 group-hover:text-primary transition-colors"><Shield size={20} /></div>
              <span className="font-bold flex-1 text-right text-gray-700 dark:text-gray-200">السياسة والخصوصية</span>
              <ChevronLeft size={20} className="text-gray-300 rtl:rotate-180" />
          </button>
          
          {/* Support Dropdown */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
             <button onClick={() => setShowSupport(!showSupport)} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <div className="bg-gray-100 p-2 rounded-xl text-gray-600 group-hover:bg-orange-100 group-hover:text-primary transition-colors"><Phone size={20} /></div>
                  <span className="font-bold flex-1 text-right text-gray-700 dark:text-gray-200">أرقام الدعم الفني</span>
                  {showSupport ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronLeft size={20} className="text-gray-300 rtl:rotate-180" />}
             </button>
             
             {showSupport && (
                 <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                     {SUPPORT_PHONES.map((phone, idx) => (
                         <button key={idx} onClick={() => setSelectedContact(phone)} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-bold hover:border-primary transition-colors text-gray-700 dark:text-gray-300 justify-center">
                             <PhoneCall size={14} className="text-green-500" />
                             {phone}
                         </button>
                     ))}
                 </div>
             )}
          </div>
      </div>

      <Button variant="danger" fullWidth onClick={logout} className="gap-2 mt-4">
          <LogOut size={20} /> تسجيل الخروج
      </Button>
      
      <div className="text-center text-xs text-gray-400 font-medium pt-4">
          الإصدار 1.0.3 - نسخة مشتل كرم عاشور
      </div>
    </div>
  );
};
