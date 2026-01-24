
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './services/AppContext';
import { Role, OrderStatus } from './types';
import { CustomerView } from './components/CustomerView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { ProfileView } from './components/ProfileView';
import { OrdersView } from './components/OrdersView';
import { SettingsView } from './components/SettingsView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { QRScannerView } from './components/QRScannerView';
import { Button } from './components/ui/Button';
import { Truck, Lock, Phone as PhoneIcon, Home, Receipt, QrCode, User, Plus, HelpCircle, Loader2, MapPin, UserPlus, ArrowRight, Wallet, Activity, Bird, PhoneCall, MessageCircle, X, LogOut, LayoutDashboard, WifiOff } from 'lucide-react';
import { CURRENCY, SUPPORT_PHONES, HQ_ADDRESS } from './constants';

// --- SHARED: CONTACT ACTION MODAL ---
const ContactActionModal: React.FC<{ phone: string | null; onClose: () => void }> = ({ phone, onClose }) => {
    if (!phone) return null;

    const handleCall = () => {
        window.open(`tel:${phone}`, '_self');
        onClose();
    };

    const handleWhatsApp = () => {
        // Remove leading 0 and add 20
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

// --- NO INTERNET OVERLAY ---
const NoInternetScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-brand-red flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="bg-white/20 p-6 rounded-full mb-6 animate-pulse">
                <WifiOff size={64} />
            </div>
            <h1 className="text-3xl font-black mb-4">انقطع الاتصال!</h1>
            <p className="text-lg font-bold opacity-90 max-w-sm mb-8">
                التطبيق يتطلب اتصالاً نشطاً بالإنترنت للعمل. يرجى التحقق من الشبكة للمتابعة.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    );
};

// --- LOGIN SCREEN ---
const LoginScreen: React.FC = () => {
  const { login, register, zones } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  
  // Login State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState(''); 
  const [regAddress, setRegAddress] = useState('');
  const [regZone, setRegZone] = useState(zones[0]?.id || '');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Contact Modal State
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
        const result = await login(phoneNumber, password);
        if (!result.success) {
            setError(result.message || 'خطأ في الدخول. تأكد من الرقم وكلمة المرور.');
        }
    } catch (e) {
        setError('حدث خطأ غير متوقع');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (regPassword.length < 4) {
        setError('كلمة المرور يجب أن تكون 4 أرقام/حروف على الأقل');
        return;
    }

    setIsLoading(true);

    try {
        const result = await register(regName, regPhone, regPassword, regAddress, regZone);
        if (!result.success) {
            setError(result.message || 'خطأ في التسجيل');
        }
    } catch (e) {
        setError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
        setIsLoading(false);
    }
  };

  if (isRegister) {
      return (
        <div dir="rtl" className="bg-primary/5 min-h-screen flex items-center justify-center font-body p-4 pt-[max(3rem,env(safe-area-inset-top))]">
             <div className="w-full max-w-md md:max-w-lg bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-6 md:p-10 relative border-t-8 border-primary my-auto">
                 <button onClick={() => setIsRegister(false)} className="absolute top-6 left-6 text-gray-400 hover:text-primary">
                     <ArrowRight size={24} className="rotate-180" />
                 </button>
                 <h2 className="text-2xl font-black text-primary mb-6 text-center">انضم لـ ع الطاير</h2>
                 
                 <form onSubmit={handleRegister} className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">الاسم بالكامل</label>
                         <input required value={regName} onChange={e => setRegName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary outline-none" placeholder="مثال: أحمد محمد" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">رقم الموبايل</label>
                         <input required type="tel" maxLength={11} value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary outline-none" placeholder="01xxxxxxxxx" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">كلمة المرور</label>
                         <input required type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary outline-none" placeholder="اختر كلمة سر" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">العنوان بالتفصيل</label>
                         <input required value={regAddress} onChange={e => setRegAddress(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary outline-none" placeholder="الشارع، رقم العمارة..." />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">المنطقة</label>
                         <select value={regZone} onChange={e => setRegZone(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary outline-none">
                             {zones.map(z => <option key={z.id} value={z.id}>{z.name} - {z.price} {CURRENCY}</option>)}
                         </select>
                     </div>

                     {error && (
                        <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl text-center">
                            {error}
                        </div>
                     )}

                     <Button fullWidth size="lg" type="submit" disabled={isLoading} className="mt-2 bg-primary hover:bg-orange-700 text-white shadow-lg">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'إنشاء الحساب'}
                     </Button>
                 </form>
             </div>
        </div>
      );
  }

  return (
    <div dir="rtl" className="bg-primary/10 min-h-screen flex items-center justify-center font-body p-4 pt-[max(3rem,env(safe-area-inset-top))]">
      <ContactActionModal phone={selectedContact} onClose={() => setSelectedContact(null)} />

      <div className="relative w-full max-w-md md:max-w-5xl h-[100dvh] max-h-[900px] md:h-[700px] overflow-hidden bg-white dark:bg-gray-900 shadow-2xl sm:rounded-[2.5rem] flex flex-col md:flex-row">
        
        {/* BRANDED HEADER (Mobile Top / Desktop Right Side) */}
        <div className="relative h-[40%] md:h-full md:w-1/2 bg-secondary w-full flex flex-col items-center justify-center rounded-b-[3rem] md:rounded-b-none md:rounded-l-[4rem] shadow-xl z-10 overflow-hidden shrink-0 transition-all duration-500">
          {/* Cracked pattern simulation */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cracked-ground.png')]"></div>
          
          <div className="relative z-10 flex flex-col items-center mt-4 w-full px-6">
            <div className="w-full flex justify-between items-start mb-2">
                 <div className="text-white text-xs font-bold bg-black/20 px-3 py-1 rounded-full">ملوك الأونلاين</div>
                 <div className="text-white text-xs font-bold bg-black/20 px-3 py-1 rounded-full flex items-center gap-1">
                     <span className="material-icons-round text-sm">public</span>
                     شحن محافظات
                 </div>
            </div>

            {/* UPDATED LOGO FROM USER */}
            <div className="flex items-center justify-center mb-2 mt-2 w-full min-h-[160px] md:min-h-[220px]">
                {!logoError ? (
                     <img 
                        src="https://lh3.googleusercontent.com/d/1xWGm1mzXPy9y33jFux2Lqz3lJhVRgXUx" 
                        alt="Al-Tayyar Logo" 
                        referrerPolicy="no-referrer"
                        className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform"
                        onError={() => setLogoError(true)}
                     />
                ) : (
                    <div className="flex flex-col items-center animate-in fade-in">
                        <Bird size={64} className="text-white mb-2" strokeWidth={1.5} />
                        <h1 className="text-4xl font-black text-white text-stroke drop-shadow-lg tracking-tighter">
                            ع الطاير
                        </h1>
                        <p className="text-accent font-bold text-sm bg-black/20 px-3 py-0.5 rounded-full mt-1">أسرع دليفري في مصر</p>
                    </div>
                )}
            </div>
            
            <div className="mt-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2">
                <MapPin size={14} className="text-accent" />
                {HQ_ADDRESS}
            </div>
          </div>
        </div>

        {/* LOGIN FORM SECTION */}
        <div className="flex-1 px-8 pt-8 pb-4 md:p-12 flex flex-col bg-white dark:bg-gray-900 md:justify-center overflow-y-auto">
            <div className="mb-6 md:mb-10 text-center">
              <h2 className="text-xl md:text-3xl font-black text-gray-800 dark:text-white mb-2">تسجيل الدخول</h2>
              <p className="text-gray-400 text-sm font-bold">أهلاً بك مجدداً في ع الطاير</p>
            </div>
            
            <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
              <div className="relative">
                 <input 
                    className="block w-full px-4 py-4 pl-4 pr-12 text-right bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 text-lg font-bold outline-none transition-colors text-black" 
                    placeholder="رقم الموبايل" 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    maxLength={11}
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"><PhoneIcon size={20} /></div>
              </div>
              <div className="relative">
                 <input 
                    className="block w-full px-4 py-4 pl-4 pr-12 text-right bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 text-lg font-bold outline-none transition-colors text-black" 
                    placeholder="كلمة المرور" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"><Lock size={20} /></div>
              </div>
              
              {error && (
                  <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl border border-red-100 text-center animate-pulse">
                      {error}
                  </div>
              )}
              
              <Button fullWidth size="lg" type="submit" disabled={isLoading} className="mt-4 shadow-xl shadow-orange-200 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white border-none py-4">
                  {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'أنا جاي اهو (دخول)'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
                <button onClick={() => setIsRegister(true)} className="text-primary font-bold text-sm hover:underline">
                    ليس لديك حساب؟ اشترك الآن
                </button>
            </div>

            {/* CONTACT NUMBERS GRID */}
            <div className="mt-auto md:mt-8 pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center font-bold mb-2">أرقام التواصل (اضغط للتواصل)</p>
                <div className="grid grid-cols-3 gap-2">
                    {SUPPORT_PHONES.map(phone => (
                        <button key={phone} onClick={() => setSelectedContact(phone)} className="bg-green-50 text-green-700 text-[10px] font-bold py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 hover:bg-green-100 transition-colors">
                            <PhoneCall size={10} /> {phone}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT WITH FLOATING NAV ---
const MainLayout: React.FC = () => {
  const { currentUser, logout, isNetworkAvailable, verifyDeliveryCode, updateOrderStatus } = useApp();
  // Navigation State
  const [activeTab, setActiveTab] = useState<'HOME' | 'ORDERS' | 'PROFILE' | 'SETTINGS' | 'PRIVACY' | 'CREATE_ORDER' | 'ADDRESSES' | 'PERFORMANCE'>('HOME');
  const [showScanner, setShowScanner] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Detect keyboard on mobile to hide nav
  useEffect(() => {
    const initialHeight = window.innerHeight;
    const handleResize = () => {
      // If height shrinks by more than 20%, assume keyboard is open
      if (window.innerHeight < initialHeight * 0.8) setIsKeyboardOpen(true);
      else setIsKeyboardOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isNetworkAvailable) return <NoInternetScreen />;
  if (!currentUser) return <LoginScreen />;

  const handleScanComplete = (code: string) => {
    // Verify QR for driver
    if (currentUser.role === Role.DRIVER) {
        const result = verifyDeliveryCode(code);
        if (result.success && result.orderId) {
             updateOrderStatus(result.orderId, OrderStatus.DELIVERED, { isQrScan: true });
             alert("✅ تم تأكيد الاستلام بنجاح!");
             setShowScanner(false);
        } else {
             alert("❌ كود خاطئ أو طلب غير صالح.");
        }
    } else {
        alert(`كود: ${code}`);
        setShowScanner(false);
    }
  };

  const renderContent = () => {
      if (activeTab === 'PROFILE') return <ProfileView onNavigate={(view) => setActiveTab(view as any)} />;
      if (activeTab === 'ORDERS') return <OrdersView />;
      if (activeTab === 'SETTINGS') return <SettingsView onBack={() => setActiveTab('PROFILE')} />;
      if (activeTab === 'PRIVACY') return <PrivacyPolicyView onBack={() => setActiveTab('PROFILE')} />;
      if (activeTab === 'CREATE_ORDER') return <CustomerView initialView="create" />;
      if (activeTab === 'ADDRESSES') return <CustomerView initialView="addresses" />;
      if (activeTab === 'PERFORMANCE') return <DriverView />; 

      // Default HOME content based on role
      switch (currentUser.role) {
          case Role.CUSTOMER: return <CustomerView initialView="list" />;
          case Role.DRIVER: return <DriverView />;
          case Role.ADMIN: return <AdminView />;
          default: return <CustomerView />;
      }
  };

  // --- NAVIGATION ITEMS CONFIG ---
  const getNavItems = () => {
      const items = [
          { id: 'HOME', label: 'الرئيسية', icon: Home, show: true },
          { id: 'CREATE_ORDER', label: 'إنشاء', icon: Plus, show: currentUser.role === Role.CUSTOMER },
          { id: 'ORDERS', label: 'الطلبات', icon: Receipt, show: true },
          { id: 'PERFORMANCE', label: 'أدائي', icon: Activity, show: currentUser.role === Role.DRIVER },
          { id: 'PROFILE', label: 'حسابي', icon: User, show: true },
      ];
      return items.filter(i => i.show);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-body pb-safe flex flex-row">
      {/* Scanner Overlay */}
      {showScanner && <QRScannerView onClose={() => setShowScanner(false)} onScan={handleScanComplete} />}
      
      {/* --- DESKTOP SIDEBAR (Visible on md+) --- */}
      {!showScanner && (
        <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 h-screen sticky top-0 z-30 shadow-lg">
            <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800 min-h-[180px] justify-center">
                {!logoError ? (
                     <img 
                        src="https://lh3.googleusercontent.com/d/1xWGm1mzXPy9y33jFux2Lqz3lJhVRgXUx" 
                        alt="Al-Tayyar Logo" 
                        referrerPolicy="no-referrer"
                        className="h-32 w-auto object-contain mb-2 drop-shadow-md hover:scale-105 transition-transform"
                        onError={() => setLogoError(true)}
                     />
                ) : (
                    <div className="flex flex-col items-center animate-in fade-in">
                        <Bird size={48} className="text-primary mb-2" />
                        <h1 className="text-2xl font-black text-primary">ع الطاير</h1>
                    </div>
                )}
                <p className="text-xs text-gray-400 font-bold bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full mt-2">لوحة التحكم</p>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {getNavItems().map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id || (activeTab === 'ADDRESSES' && item.id === 'PROFILE') || (activeTab === 'SETTINGS' && item.id === 'PROFILE') ? 'bg-primary text-white shadow-lg shadow-orange-200' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'}`}
                    >
                        <item.icon size={24} />
                        <span className="font-bold">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={logout} className="w-full flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
                    <LogOut size={18} />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
          {!showScanner && (
              <header className="bg-primary dark:bg-orange-900 md:rounded-b-none md:rounded-bl-[3rem] rounded-b-3xl pt-[max(3.5rem,env(safe-area-inset-top))] pb-8 px-6 shadow-lg relative z-10 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cracked-ground.png')] pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-20 pt-4 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-accent bg-white overflow-hidden shadow-md flex items-center justify-center text-primary">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-orange-100 text-sm font-semibold">مرحباً يا بطل</p>
                            <h1 className="text-white text-xl font-bold">{currentUser.name.split(' ')[0]}</h1>
                        </div>
                    </div>
                    
                    {/* Desktop: Extra Header Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="bg-white/20 px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2">
                             <PhoneIcon size={16} />
                             الدعم الفني
                        </div>
                    </div>

                    <button onClick={logout} className="md:hidden p-2 bg-white/20 rounded-xl backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                        <span className="material-icons-round">logout</span>
                    </button>
                </div>
              </header>
          )}

          {/* CONTENT */}
          {!showScanner && (
              <main className="px-5 pt-8 w-full max-w-7xl mx-auto animate-in fade-in duration-300 pb-24 md:pb-8 flex-1">
                {renderContent()}
              </main>
          )}
      </div>

      {/* --- MOBILE BOTTOM NAV (Hidden on md+) --- */}
      {!showScanner && !isKeyboardOpen && (
        <nav className="md:hidden fixed bottom-0 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-3xl transition-transform duration-300 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex justify-between items-center pb-2 max-w-lg mx-auto">
                {getNavItems().map(item => (
                     <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === item.id || (activeTab === 'ADDRESSES' && item.id === 'PROFILE') || (activeTab === 'SETTINGS' && item.id === 'PROFILE') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                        <div className={`p-2 rounded-xl transition-transform ${activeTab === item.id || (activeTab === 'ADDRESSES' && item.id === 'PROFILE') || (activeTab === 'SETTINGS' && item.id === 'PROFILE') ? 'bg-orange-50 dark:bg-orange-900/30 scale-110' : 'group-hover:scale-105'}`}>
                            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}

                {/* DRIVER CENTER SCAN (Mobile Only) */}
                {currentUser.role === Role.DRIVER && (
                    <div className="relative -top-8 order-2">
                        <button onClick={() => setShowScanner(true)} className="bg-gradient-to-br from-secondary to-blue-600 text-white w-16 h-16 rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center border-4 border-surface-light dark:border-surface-dark transform hover:scale-105 active:scale-95 transition-all">
                            <QrCode size={28} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
