
import React, { useState, useMemo } from 'react';
import { useApp } from '../services/AppContext';
import { Button } from './ui/Button';
import { CURRENCY } from '../constants';
import { Order, OrderStatus, Role } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, MapPin, Navigation, UserPlus, AlertTriangle, Settings, ChevronDown, ChevronUp, Users, Phone, X, Package, Store, Clock, Wifi, WifiOff, Eye, Calendar, Wallet, History, Bike, CheckCircle, PieChart as PieIcon, BarChart as BarIcon, Shield, Truck, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const AdminView: React.FC = () => {
  const { orders, users, zones, updateZonePrice, adminCreateUser } = useApp();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'DRIVERS' | 'SETTINGS'>('DASHBOARD');
  
  // Management State
  const [mgmtTab, setMgmtTab] = useState<'ZONES' | 'ADD_DRIVER' | 'ADD_ADMIN'>('ADD_DRIVER');
  
  // Zone Editing
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  // User Creation State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDriverHistoryId, setSelectedDriverHistoryId] = useState<string | null>(null);
  
  const allOrdersList = orders.sort((a, b) => b.createdAt - a.createdAt);
  const allDrivers = users.filter(u => u.role === 'DRIVER');

  // --- ANALYTICS DATA PREP ---
  const ordersByStatusData = useMemo(() => {
      const counts: Record<string, number> = {
          [OrderStatus.DELIVERED]: 0,
          [OrderStatus.CANCELLED]: 0,
          [OrderStatus.PENDING]: 0,
          [OrderStatus.ON_THE_WAY]: 0
      };
      orders.forEach(o => {
          if (counts[o.status] !== undefined) counts[o.status]++;
          else counts[o.status] = 1;
      });
      return [
          { name: 'مكتمل', value: counts[OrderStatus.DELIVERED], color: '#22c55e' },
          { name: 'جاري', value: counts[OrderStatus.ON_THE_WAY] + counts[OrderStatus.PENDING] + (counts[OrderStatus.PICKED_UP] || 0), color: '#FF6600' }, // Primary Orange
          { name: 'ملغي', value: counts[OrderStatus.CANCELLED] + (counts[OrderStatus.RETURNED] || 0), color: '#ef4444' },
      ].filter(i => i.value > 0);
  }, [orders]);

  const revenueData = useMemo(() => {
      // Group by day (last 5 days)
      const days: Record<string, number> = {};
      orders.forEach(o => {
          if (o.status === OrderStatus.DELIVERED) {
             const date = new Date(o.createdAt).toLocaleDateString('ar-EG', { weekday: 'short' });
             days[date] = (days[date] || 0) + o.price;
          }
      });
      return Object.keys(days).map(key => ({ name: key, revenue: days[key] }));
  }, [orders]);

  // --- ORDER GROUPING LOGIC ---
  const groupedOrders = useMemo(() => {
      const groups: Record<string, { orders: Order[], total: number, count: number }> = {};
      
      allOrdersList.forEach(order => {
          const date = new Date(order.createdAt);
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          let label = date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          
          if (date.toDateString() === today.toDateString()) label = 'اليوم';
          else if (date.toDateString() === yesterday.toDateString()) label = 'أمس';

          if (!groups[label]) {
              groups[label] = { orders: [], total: 0, count: 0 };
          }
          
          groups[label].orders.push(order);
          groups[label].total += (order.price || 0);
          groups[label].count += 1;
      });
      return groups;
  }, [allOrdersList]);

  const handleEditZone = (zoneId: string, currentPrice: number) => {
      setEditingZone(zoneId);
      setNewPrice(currentPrice);
  };

  const handleSaveZone = (zoneId: string) => {
      updateZonePrice(zoneId, newPrice);
      setEditingZone(null);
  };

  const handleCreateUser = async (role: Role) => {
      if (!newUserName || !newUserPhone || !newUserPass) {
          alert("من فضلك املأ جميع البيانات");
          return;
      }
      setIsLoading(true);
      const result = await adminCreateUser(newUserName, newUserPhone, newUserPass, role);
      setIsLoading(false);
      
      if (result.success) {
          alert(`تم إضافة ${role === Role.ADMIN ? 'أدمن' : 'كابتن'} بنجاح!`);
          setNewUserName('');
          setNewUserPhone('');
          setNewUserPass('');
      } else {
          alert(result.message || "فشل الإضافة");
      }
  };

  const getDriverName = (id?: string) => {
      if (!id) return 'غير معين';
      return users.find(u => u.id === id)?.name || 'غير معروف';
  };
  
  const getDriverActiveOrder = (driverId: string) => {
      return orders.find(o => o.driverId === driverId && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED);
  };

  const getDriverHistory = (driverId: string) => {
      return orders.filter(o => o.driverId === driverId && o.status === OrderStatus.DELIVERED).sort((a, b) => b.createdAt - a.createdAt);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Top Stats / Tabs Switcher */}
      <div className="-mt-6 relative z-20 grid grid-cols-4 md:flex md:justify-center md:gap-4 gap-2 px-2 mb-4">
        <div onClick={() => setActiveTab('DASHBOARD')} className={`p-2 md:px-6 md:py-3 rounded-2xl text-white relative overflow-hidden shadow-lg transition-all cursor-pointer border-2 flex flex-col items-center justify-center ${activeTab === 'DASHBOARD' ? 'bg-gray-800 border-white scale-105 z-10' : 'bg-gray-300 border-transparent opacity-80'}`}>
            <BarIcon size={20} className="mb-1" />
            <span className="text-[10px] md:text-sm font-bold">تقارير</span>
        </div>
        <div onClick={() => setActiveTab('ORDERS')} className={`p-2 md:px-6 md:py-3 rounded-2xl text-white relative overflow-hidden shadow-lg transition-all cursor-pointer border-2 flex flex-col items-center justify-center ${activeTab === 'ORDERS' ? 'bg-primary border-white scale-105 z-10' : 'bg-gray-300 border-transparent opacity-80'}`}>
            <Package size={20} className="mb-1" />
            <span className="text-[10px] md:text-sm font-bold">الطلبات</span>
        </div>
        <div onClick={() => setActiveTab('DRIVERS')} className={`p-2 md:px-6 md:py-3 rounded-2xl text-white relative overflow-hidden shadow-lg transition-all cursor-pointer border-2 flex flex-col items-center justify-center ${activeTab === 'DRIVERS' ? 'bg-secondary border-white scale-105 z-10' : 'bg-gray-300 border-transparent opacity-80'}`}>
            <Users size={20} className="mb-1" />
            <span className="text-[10px] md:text-sm font-bold">الكباتن</span>
        </div>
        <div onClick={() => setActiveTab('SETTINGS')} className={`p-2 md:px-6 md:py-3 rounded-2xl text-white relative overflow-hidden shadow-lg transition-all cursor-pointer border-2 flex flex-col items-center justify-center ${activeTab === 'SETTINGS' ? 'bg-gray-700 border-white scale-105 z-10' : 'bg-gray-300 border-transparent opacity-80'}`}>
            <Settings size={20} className="mb-1" />
            <span className="text-[10px] md:text-sm font-bold">الإعدادات</span>
        </div>
      </div>

      <div className="flex justify-between items-center px-4">
         <h2 className="text-xl font-black text-gray-800 dark:text-white border-r-4 border-primary pr-3">
             {activeTab === 'DASHBOARD' ? 'نظرة عامة' : activeTab === 'ORDERS' ? 'سجل الطلبات' : activeTab === 'DRIVERS' ? 'متابعة الكباتن' : 'إعدادات النظام'}
         </h2>
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'DASHBOARD' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
                  <div className="bg-gradient-to-br from-primary to-orange-600 rounded-3xl p-5 text-white shadow-lg shadow-orange-200">
                      <p className="text-orange-100 text-xs font-bold mb-1">إجمالي الإيراد</p>
                      <h3 className="text-2xl font-black">{orders.reduce((acc, o) => o.status === 'DELIVERED' ? acc + o.price : acc, 0)} {CURRENCY}</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-gray-400 text-xs font-bold mb-1">عدد الطلبات</p>
                      <h3 className="text-2xl font-black text-gray-800 dark:text-white">{orders.length}</h3>
                  </div>
                   <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-gray-400 text-xs font-bold mb-1">عدد الكباتن</p>
                      <h3 className="text-2xl font-black text-gray-800 dark:text-white">{users.filter(u => u.role === Role.DRIVER).length}</h3>
                  </div>
                   <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-gray-400 text-xs font-bold mb-1">عدد العملاء</p>
                      <h3 className="text-2xl font-black text-gray-800 dark:text-white">{users.filter(u => u.role === Role.CUSTOMER).length}</h3>
                  </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-2">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                        <PieIcon size={18} className="text-primary" />
                        حالة الطلبات
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ordersByStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {ordersByStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                        <BarIcon size={18} className="text-secondary" />
                        الإيرادات (آخر أيام)
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="revenue" fill="#29ABE2" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
              </div>
          </section>
      )}

      {/* --- SETTINGS TAB (Users & Zones) --- */}
      {activeTab === 'SETTINGS' && (
          <section className="space-y-4 px-2 animate-in fade-in slide-in-from-right-4">
              <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                      {/* Tabs */}
                      <div className="flex gap-2 mb-6 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
                          <button onClick={() => setMgmtTab('ADD_DRIVER')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-colors ${mgmtTab === 'ADD_DRIVER' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>إضافة كابتن</button>
                          <button onClick={() => setMgmtTab('ADD_ADMIN')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-colors ${mgmtTab === 'ADD_ADMIN' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>إضافة أدمن</button>
                          <button onClick={() => setMgmtTab('ZONES')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-colors ${mgmtTab === 'ZONES' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>أسعار المناطق</button>
                      </div>

                      {/* Add Driver / Admin Content */}
                      {(mgmtTab === 'ADD_DRIVER' || mgmtTab === 'ADD_ADMIN') && (
                          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm space-y-4 animate-in fade-in max-w-lg mx-auto">
                              <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2 mb-2 text-lg">
                                  {mgmtTab === 'ADD_DRIVER' ? <Truck size={24} className="text-secondary" /> : <Shield size={24} className="text-red-500" />}
                                  {mgmtTab === 'ADD_DRIVER' ? 'تسجيل كابتن جديد' : 'تسجيل مسؤول جديد'}
                              </h3>
                              
                              <div className="space-y-3">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">الاسم</label>
                                      <div className="relative">
                                          <input 
                                              className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none" 
                                              placeholder="الاسم الثلاثي" 
                                              value={newUserName}
                                              onChange={e => setNewUserName(e.target.value)}
                                          />
                                          <UserPlus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">رقم الموبايل</label>
                                      <div className="relative">
                                          <input 
                                              className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none" 
                                              placeholder="01xxxxxxxxx" 
                                              type="tel"
                                              maxLength={11}
                                              value={newUserPhone}
                                              onChange={e => setNewUserPhone(e.target.value)}
                                          />
                                          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">كلمة المرور</label>
                                      <div className="relative">
                                          <input 
                                              className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none" 
                                              placeholder="******" 
                                              type="password"
                                              value={newUserPass}
                                              onChange={e => setNewUserPass(e.target.value)}
                                          />
                                          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                      </div>
                                  </div>
                              </div>

                              <Button fullWidth onClick={() => handleCreateUser(mgmtTab === 'ADD_DRIVER' ? Role.DRIVER : Role.ADMIN)} disabled={isLoading}>
                                  {isLoading ? 'جاري الإضافة...' : `إضافة ${mgmtTab === 'ADD_DRIVER' ? 'الكابتن' : 'الأدمن'}`}
                              </Button>
                          </div>
                      )}

                      {/* Zones Content */}
                      {mgmtTab === 'ZONES' && (
                         <div className="space-y-3 max-w-xl mx-auto">
                            <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2 mb-4 text-lg">
                                <MapPin size={24} className="text-primary" />
                                أسعار التوصيل للمناطق
                            </h3>
                            {zones.map(zone => (
                                <div key={zone.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100 dark:border-gray-700">
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{zone.name}</span>
                                    <div className="flex items-center gap-2">
                                        {editingZone === zone.id ? (
                                            <>
                                                <input 
                                                    type="number" 
                                                    className="w-20 p-2 border-2 border-primary rounded-lg font-bold text-center text-sm bg-white" 
                                                    value={newPrice} 
                                                    onChange={e => setNewPrice(Number(e.target.value))} 
                                                />
                                                <Button size="sm" onClick={() => handleSaveZone(zone.id)}>حفظ</Button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="font-black text-primary text-lg">{zone.price} {CURRENCY}</span>
                                                <button onClick={() => handleEditZone(zone.id, zone.price)} className="bg-gray-100 p-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 hover:text-primary transition-colors">تعديل</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                         </div>
                      )}
                  </div>
              </div>
          </section>
      )}

      {/* --- ORDERS FEED TAB --- */}
      {activeTab === 'ORDERS' && (
      <section>
          <div className="space-y-6">
              {Object.keys(groupedOrders).length === 0 ? (
                  <div className="text-center py-12 opacity-50 bg-gray-50 dark:bg-gray-800 rounded-3xl mx-2 border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Package size={48} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 font-bold">لا توجد طلبات في النظام</p>
                  </div>
              ) : (
                  Object.keys(groupedOrders).map((dateLabel) => (
                      <div key={dateLabel} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {/* Date Header */}
                          <div className="flex items-center justify-between px-2 mb-3 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-xl sticky top-0 z-10 backdrop-blur-md">
                              <div className="flex items-center gap-2">
                                  <Calendar size={18} className="text-primary" />
                                  <span className="font-bold text-gray-700 dark:text-gray-200">{dateLabel}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                  <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded-lg font-bold text-gray-500">
                                      {groupedOrders[dateLabel].count} طلب
                                  </span>
                                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 px-2 py-1 rounded-lg font-black flex items-center gap-1">
                                      {groupedOrders[dateLabel].total} {CURRENCY}
                                  </span>
                              </div>
                          </div>

                          {/* Orders List for this Date */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {groupedOrders[dateLabel].orders.map(order => (
                                  <div 
                                    key={order.id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 active:scale-[0.99] transition-transform cursor-pointer relative group hover:border-primary"
                                  >
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex-1 min-w-0">
                                              <span className="font-bold text-gray-800 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{order.items}</span>
                                              <span className="text-[10px] text-gray-400 font-mono">#{order.id.slice(-4)}</span>
                                          </div>
                                          <StatusBadge status={order.status} />
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                          <MapPin size={12} /> <span className="truncate">{order.deliveryAddress.title}</span>
                                      </div>
                                      <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-800 mt-2">
                                          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                              <div className={`w-2 h-2 rounded-full ${order.driverId ? 'bg-green-500' : 'bg-red-400'}`}></div>
                                              {order.driverId ? getDriverName(order.driverId) : 'لم يعين كابتن'}
                                          </span>
                                          <span className="font-black text-primary">{order.price} {CURRENCY}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))
              )}
          </div>
      </section>
      )}

      {/* --- DRIVERS LIST TAB --- */}
      {activeTab === 'DRIVERS' && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDrivers.length === 0 ? (
                   <p className="col-span-full text-center text-gray-400 py-8">لا يوجد كباتن مسجلين</p>
              ) : (
                  allDrivers.map(driver => {
                      const activeOrder = getDriverActiveOrder(driver.id);
                      // Determine status logic
                      let statusText = 'غير متصل';
                      let statusColor = 'bg-gray-100 text-gray-500';
                      let statusIcon = <WifiOff size={14} />;

                      if (driver.isOnline) {
                          if (activeOrder) {
                              statusText = 'مشغول بطلب';
                              statusColor = 'bg-orange-100 text-orange-700';
                              statusIcon = <Bike size={14} />;
                          } else {
                              statusText = 'متاح للعمل';
                              statusColor = 'bg-green-100 text-green-700';
                              statusIcon = <Wifi size={14} />;
                          }
                      }

                      return (
                          <div key={driver.id} className="bg-surface-light dark:bg-surface-dark rounded-[2rem] p-5 shadow-md border-2 border-gray-100 dark:border-gray-700 relative overflow-hidden">
                              
                              {/* Driver Header */}
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex gap-3">
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${driver.isOnline ? 'bg-gradient-to-br from-secondary to-blue-600' : 'bg-gray-300'}`}>
                                          {driver.name.charAt(0)}
                                      </div>
                                      <div>
                                          <h3 className="font-black text-gray-800 dark:text-white text-lg">{driver.name}</h3>
                                          <a href={`tel:${driver.phone}`} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors mt-1">
                                              <Phone size={12} /> {driver.phone}
                                          </a>
                                      </div>
                                  </div>
                                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm ${statusColor}`}>
                                      {statusIcon}
                                      {statusText}
                                  </div>
                              </div>
                              
                              {/* ACTIVE ORDER SECTION */}
                              {activeOrder ? (
                                  <div className="mb-4 animate-in zoom-in duration-300">
                                      <div className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                          المهمة الحالية
                                      </div>
                                      <div 
                                        onClick={() => setSelectedOrder(activeOrder)}
                                        className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-100 transition-colors group relative overflow-hidden"
                                      >
                                          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                          <div className="flex justify-between items-center mb-1">
                                              <span className="text-xs font-black text-orange-600 bg-white px-2 py-0.5 rounded-lg">#{activeOrder.id.slice(-4)}</span>
                                              <span className="text-xs font-bold text-gray-500">{new Date(activeOrder.createdAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
                                          </div>
                                          <p className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1 mb-2">{activeOrder.items}</p>
                                          <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                                  <MapPin size={12} className="text-orange-500" />
                                                  <span className="truncate max-w-[120px]">{activeOrder.deliveryAddress.title}</span>
                                              </div>
                                              <StatusBadge status={activeOrder.status} />
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-200 text-center">
                                      <span className="text-xs font-bold text-gray-400">لا توجد طلبات نشطة الآن</span>
                                  </div>
                              )}

                              {/* FOOTER ACTIONS */}
                              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                  <button 
                                    onClick={() => setSelectedDriverHistoryId(driver.id)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-colors"
                                  >
                                      <History size={16} />
                                      سجل الطلبات
                                  </button>
                                  <div className="flex-1 flex flex-col items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                                      <span className="text-[10px] text-green-600 font-bold">في جيبه</span>
                                      <span className="text-sm font-black text-gray-800 dark:text-white">{driver.cashCollected || 0} {CURRENCY}</span>
                                  </div>
                              </div>
                          </div>
                      )
                  })
              )}
          </section>
      )}

      {/* ADMIN ORDER DETAIL MODAL (Existing) */}
      {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                  <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
                      <div>
                          <h3 className="text-xl font-bold">إدارة الطلب</h3>
                          <p className="text-gray-400 text-sm">#{selectedOrder.id}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      <div className="flex items-center justify-between">
                          <StatusBadge status={selectedOrder.status} />
                          <span className="font-black text-xl text-primary">{selectedOrder.price} {CURRENCY}</span>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                          <p className="font-bold text-gray-800 dark:text-white">{selectedOrder.items}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <p className="font-bold text-gray-500 mb-1">من</p>
                              <p className="font-semibold">{selectedOrder.pickupAddress}</p>
                          </div>
                          <div>
                              <p className="font-bold text-gray-500 mb-1">إلى</p>
                              <p className="font-semibold">{selectedOrder.deliveryAddress.title}</p>
                              <p className="text-xs text-gray-400">{selectedOrder.deliveryAddress.details}</p>
                          </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                          <p className="font-bold text-gray-500 mb-2">الكابتن المسؤول</p>
                          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                              <span className="font-bold text-blue-900 dark:text-blue-100">{getDriverName(selectedOrder.driverId)}</span>
                              {selectedOrder.driverId && (
                                  <a href={`tel:${users.find(u => u.id === selectedOrder.driverId)?.phone}`} className="text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm text-gray-600 font-bold flex items-center gap-1">
                                      <Phone size={12} />
                                      {users.find(u => u.id === selectedOrder.driverId)?.phone}
                                  </a>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* DRIVER HISTORY MODAL (New) */}
      {selectedDriverHistoryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in slide-in-from-bottom-10 duration-200">
              <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                  {/* Modal Header */}
                  <div className="bg-secondary p-6 text-white shrink-0">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-2xl font-black">{users.find(u => u.id === selectedDriverHistoryId)?.name}</h3>
                              <div className="flex items-center gap-2 opacity-90 font-bold text-sm">
                                  <Phone size={14} />
                                  {users.find(u => u.id === selectedDriverHistoryId)?.phone}
                              </div>
                          </div>
                          <button onClick={() => setSelectedDriverHistoryId(null)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                              <X size={20} />
                          </button>
                      </div>
                      
                      {/* Summary Stats in Modal */}
                      <div className="flex gap-3">
                          <div className="flex-1 bg-black/20 rounded-2xl p-3 backdrop-blur-sm">
                               <div className="text-[10px] font-bold opacity-70 mb-1">إجمالي الطلبات</div>
                               <div className="text-2xl font-black">{getDriverHistory(selectedDriverHistoryId).length}</div>
                          </div>
                          <div className="flex-1 bg-black/20 rounded-2xl p-3 backdrop-blur-sm">
                               <div className="text-[10px] font-bold opacity-70 mb-1">إجمالي التحصيل</div>
                               <div className="text-2xl font-black">
                                   {getDriverHistory(selectedDriverHistoryId).reduce((sum, o) => sum + o.price, 0)} {CURRENCY}
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* History List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                      {getDriverHistory(selectedDriverHistoryId).length === 0 ? (
                          <div className="text-center py-10 text-gray-400">
                              <History size={48} className="mx-auto mb-2 opacity-50" />
                              <p>لا يوجد سجل طلبات مكتملة</p>
                          </div>
                      ) : (
                          getDriverHistory(selectedDriverHistoryId).map(order => (
                              <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">#{order.id.slice(-4)}</span>
                                          <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                                      </div>
                                      <div className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">{order.items}</div>
                                      <div className="text-[10px] text-gray-500 mt-0.5">{order.deliveryAddress.title}</div>
                                  </div>
                                  <div className="text-right">
                                      <div className="font-black text-primary">{order.price} {CURRENCY}</div>
                                      <div className="text-green-500 text-[10px] font-bold flex items-center justify-end gap-0.5">
                                          <CheckCircle size={10} /> تم
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
