
import React, { useState, useEffect } from 'react';
import { useApp } from '../services/AppContext';
import { OrderType, Address, Order, OrderStatus } from '../types';
import { Button } from './ui/Button';
import { StatusBadge } from './StatusBadge';
import { MapPin, Clock, Plus, Trash2, AlertTriangle, Phone, Package, ShoppingBag, Utensils, Star, Wallet, Navigation, Headset, Home, Tag, Heart, ChevronRight, ArrowUp, ArrowDown, X, User, Store, QrCode } from 'lucide-react';
import { CURRENCY } from '../constants';

interface CustomerViewProps {
  initialView?: 'list' | 'create' | 'addresses';
}

export const CustomerView: React.FC<CustomerViewProps> = ({ initialView = 'list' }) => {
  const { currentUser, orders, zones, createOrder, addAddress, deleteAddress, users, rateDriver } = useApp();
  const [view, setView] = useState<'list' | 'create' | 'addresses'>(initialView);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Rating State
  const [ratingModal, setRatingModal] = useState<Order | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
     if (initialView) setView(initialView);
  }, [initialView]);
  
  useEffect(() => {
      const unrated = orders.find(o => 
          o.customerId === currentUser?.id && 
          o.status === OrderStatus.DELIVERED && 
          !o.rating
      );
      if (unrated) setRatingModal(unrated);
  }, [orders, currentUser]);

  const handleSubmitRating = () => {
      if (ratingModal) {
          rateDriver(ratingModal.id, ratingVal, ratingComment);
          setRatingModal(null);
          setRatingVal(5); setRatingComment('');
      }
  };

  // Create Order State
  const [orderType, setOrderType] = useState<OrderType>(OrderType.RESTAURANT);
  const [items, setItems] = useState('');
  const [pickup, setPickup] = useState('');
  const [isMeRecipient, setIsMeRecipient] = useState(true);
  const [recipientPhone, setRecipientPhone] = useState(''); 
  const [selectedAddrId, setSelectedAddrId] = useState(currentUser?.savedAddresses?.[0]?.id || '');
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrDetails, setNewAddrDetails] = useState('');
  const [newAddrZone, setNewAddrZone] = useState(zones[0].id);

  const myOrders = orders.filter(o => 
      o.customerId === currentUser?.id || 
      (o.recipientPhone && o.recipientPhone === currentUser?.phone)
  );
  const activeOrders = myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RETURNED');
  const selectedAddress = currentUser?.savedAddresses?.find(a => a.id === selectedAddrId);
  const currentZone = zones.find(z => z.id === selectedAddress?.zoneId);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) return alert("اختر عنواناً");
    const finalRecipientPhone = isMeRecipient ? currentUser?.phone : recipientPhone;
    createOrder({ 
        type: orderType, 
        items, 
        pickupAddress: pickup, 
        deliveryAddress: selectedAddress, 
        price: currentZone?.price || 0,
        recipientPhone: finalRecipientPhone
    });
    setView('list'); setItems(''); setPickup(''); setRecipientPhone(''); setIsMeRecipient(true);
  };

  const handleAddAddress = (e: React.FormEvent) => {
      e.preventDefault();
      addAddress(currentUser!.id, { id: `addr-${Date.now()}`, title: newAddrTitle, details: newAddrDetails, zoneId: newAddrZone });
      setNewAddrTitle(''); setNewAddrDetails(''); setView('list');
  };

  const getDriverForOrder = (order: Order) => {
      if (!order.driverId) return null;
      return users.find(u => u.id === order.driverId);
  };

  // --- RATING MODAL ---
  if (ratingModal) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-500 mb-4">
                      <Star size={32} fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">كيف كانت تجربتك؟</h3>
                  <p className="text-sm text-gray-500 mb-6">قيم الكابتن لطلبك الأخير</p>
                  <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setRatingVal(star)} className={`transition-transform hover:scale-110 ${ratingVal >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                              <Star size={32} fill="currentColor" />
                          </button>
                      ))}
                  </div>
                  <textarea className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm" placeholder="أضف تعليق (اختياري)..." value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
                  <Button fullWidth onClick={handleSubmitRating}>إرسال التقييم</Button>
              </div>
          </div>
      )
  }

  // --- CREATE VIEW ---
  if (view === 'create') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-primary">طلب جديد</h2>
          <button onClick={() => setView('list')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">
             <X size={20} />
          </button>
        </div>
        <form onSubmit={handleCreateOrder} className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
             <button type="button" onClick={() => setOrderType(OrderType.RESTAURANT)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === OrderType.RESTAURANT ? 'border-primary bg-orange-50 text-primary' : 'border-gray-100 bg-white text-gray-500'}`}>
                <Utensils size={24} />
                <span className="font-bold text-xs">مطعم/متجر</span>
             </button>
             <button type="button" onClick={() => setOrderType(OrderType.SEND_PACKAGE)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === OrderType.SEND_PACKAGE ? 'border-primary bg-orange-50 text-primary' : 'border-gray-100 bg-white text-gray-500'}`}>
                <ArrowUp size={24} />
                <span className="font-bold text-xs">إرسال طرد</span>
             </button>
             <button type="button" onClick={() => setOrderType(OrderType.RECEIVE_PACKAGE)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === OrderType.RECEIVE_PACKAGE ? 'border-primary bg-orange-50 text-primary' : 'border-gray-100 bg-white text-gray-500'}`}>
                <ArrowDown size={24} />
                <span className="font-bold text-xs">استلام طرد</span>
             </button>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl shadow-bold space-y-4 border-2 border-gray-100">
             {orderType === OrderType.RESTAURANT && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم المطعم / المتجر</label>
                        <input required type="text" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="مثال: كنتاكي - شارع الاستاد" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ماذا تريد أن تطلب؟</label>
                        <textarea required className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none transition-colors" rows={3} value={items} onChange={e => setItems(e.target.value)} placeholder="اكتب تفاصيل الطلب هنا..." />
                    </div>
                </>
             )}
             {orderType === OrderType.SEND_PACKAGE && (
                 <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">وصف الطرد</label>
                        <textarea required className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none transition-colors" rows={2} value={items} onChange={e => setItems(e.target.value)} placeholder="مثال: شنطة ملابس، مفاتيح..." />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان الاستلام (مكان الطرد الآن)</label>
                        <input required type="text" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="عنوانك الحالي أو مكان الاستلام" />
                    </div>
                 </>
             )}
             {orderType === OrderType.RECEIVE_PACKAGE && (
                 <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">وصف الطرد</label>
                        <textarea required className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none transition-colors" rows={2} value={items} onChange={e => setItems(e.target.value)} placeholder="مثال: أوراق من المكتب..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">مكان الطرد (من أين نحضره؟)</label>
                        <input required type="text" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="اسم المكان أو العنوان" />
                    </div>
                 </>
             )}

             <div className="pt-2">
                 <div className="flex items-center gap-3 mb-3">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isMeRecipient} onChange={() => setIsMeRecipient(!isMeRecipient)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                     </label>
                     <span className="text-sm font-bold text-gray-700">أنا المستلم للطلب (استخدم رقمي)</span>
                 </div>
                 {!isMeRecipient && (
                     <div className="animate-in fade-in slide-in-from-top-2">
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رقم موبايل المستلم</label>
                         <input required={!isMeRecipient} type="tel" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="01xxxxxxxxx" />
                     </div>
                 )}
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان التوصيل (الوجهة)</label>
                <div className="relative">
                   <select className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none appearance-none" value={selectedAddrId} onChange={e => setSelectedAddrId(e.target.value)}>
                      {currentUser?.savedAddresses?.map(addr => (
                         <option key={addr.id} value={addr.id}>{addr.title}</option>
                      ))}
                   </select>
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <span className="material-icons-round">expand_more</span>
                   </div>
                </div>
                {selectedAddress && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-gray-600">
                        <MapPin size={16} className="text-secondary flex-shrink-0" />
                        <span>{selectedAddress.details} - {currentZone?.name}</span>
                    </div>
                )}
             </div>
             
             <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-bold">رسوم التوصيل</span>
                <span className="text-2xl font-black text-primary">{currentZone?.price || 0} {CURRENCY}</span>
             </div>
          </div>
          <Button fullWidth size="lg" type="submit">تأكيد الطلب</Button>
        </form>
      </div>
    );
  }

  if (view === 'addresses') {
      return (
          <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-primary">عناويني</h2>
                <button onClick={() => setView('list')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">
                   <span className="material-icons-round">arrow_back</span>
                </button>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-bold border-2 border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">إضافة عنوان جديد</h3>
                  <form onSubmit={handleAddAddress} className="space-y-3">
                      <input type="text" placeholder="الاسم (مثال: المنزل)" className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100" required value={newAddrTitle} onChange={e => setNewAddrTitle(e.target.value)} />
                      <input type="text" placeholder="العنوان بالتفصيل" className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100" required value={newAddrDetails} onChange={e => setNewAddrDetails(e.target.value)} />
                      <select className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-100" value={newAddrZone} onChange={e => setNewAddrZone(e.target.value)}>
                          {zones.map(z => <option key={z.id} value={z.id}>{z.name} - {z.price} {CURRENCY}</option>)}
                      </select>
                      <Button type="submit" fullWidth variant="secondary">حفظ العنوان</Button>
                  </form>
              </div>
              <div className="space-y-3">
                  {currentUser?.savedAddresses?.map(addr => (
                      <div key={addr.id} className="bg-white p-4 rounded-xl border-2 border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <div className="bg-orange-100 p-2 rounded-full text-primary"><MapPin size={20} /></div>
                              <div>
                                  <div className="font-bold text-gray-800">{addr.title}</div>
                                  <div className="text-xs text-gray-500">{zones.find(z => z.id === addr.zoneId)?.name}</div>
                                  <div className="text-[10px] text-gray-400 mt-1">{addr.details}</div>
                              </div>
                          </div>
                          <button onClick={() => deleteAddress(currentUser.id, addr.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  // --- DASHBOARD LIST VIEW ---
  return (
    <div className="space-y-6 pb-20 relative">
      {/* Welcome Banner */}
      <div className="-mt-4 relative bg-primary rounded-3xl p-6 shadow-lg text-white overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center">
             <div>
                 <p className="text-orange-100 font-bold mb-1">أهلاً بك 👋</p>
                 <h2 className="text-3xl font-black">{currentUser?.name.split(' ')[0]}</h2>
             </div>
             <button onClick={() => setView('create')} className="bg-white text-primary p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                 <Plus size={28} />
             </button>
          </div>
      </div>

      {/* Active Orders Section */}
      <section>
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Package className="text-primary" />
                طلباتك الحالية
            </h2>
            {activeOrders.length > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{activeOrders.length}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.length === 0 ? (
                  <div className="col-span-full bg-surface-light dark:bg-surface-dark rounded-3xl p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center gap-3">
                      <div className="bg-gray-50 p-4 rounded-full">
                          <Package className="text-gray-300" size={32} />
                      </div>
                      <div>
                          <p className="text-gray-500 font-bold">لا توجد طلبات نشطة</p>
                          <p className="text-xs text-gray-400 mt-1">اطلب الآن وسنوصلك في أسرع وقت</p>
                      </div>
                      <button onClick={() => setView('create')} className="mt-2 bg-primary/10 text-primary px-6 py-2 rounded-xl font-bold hover:bg-primary/20 transition-colors">
                          اطلب الآن
                      </button>
                  </div>
              ) : (
                  activeOrders.map(order => (
                    <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden active:scale-[0.98] transition-transform group hover:border-primary">
                        <div className={`absolute top-0 left-0 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-sm z-10 ${order.status === OrderStatus.ON_THE_WAY ? 'bg-green-500 animate-pulse' : 'bg-primary'}`}>
                             {order.status.replace(/_/g, ' ')}
                        </div>
                        
                        <div className="flex gap-4 mt-3">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                <Package className="text-gray-400" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg mb-1 line-clamp-1 text-gray-800 dark:text-white">#{order.id.slice(-4)}</h3>
                                    <span className="text-sm font-black text-primary">{order.price} {CURRENCY}</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-1 font-medium">{order.items}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <MapPin size={10} />
                                    <span className="truncate">{order.deliveryAddress.title}</span>
                                </p>
                            </div>
                        </div>

                        {/* QR CODE SECTION FOR DELIVERY */}
                        {(order.status === OrderStatus.ON_THE_WAY || order.status === OrderStatus.PICKED_UP) && (
                            <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-between">
                                <div className="text-xs text-gray-500 dark:text-gray-300">
                                    <p className="font-bold text-gray-800 dark:text-white mb-0.5">رمز الاستلام</p>
                                    <p>أظهر الكود للكابتن</p>
                                </div>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${order.deliveryCode}`} 
                                    className="w-12 h-12 rounded-lg mix-blend-multiply dark:mix-blend-normal"
                                    alt="QR"
                                />
                            </div>
                        )}
                        
                        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="text-gray-300 rtl:rotate-180" />
                        </div>
                    </div>
                  ))
              )}
          </div>
      </section>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                  <div className="bg-primary p-6 text-white flex justify-between items-start">
                      <div>
                          <h3 className="text-2xl font-black">تفاصيل الطلب</h3>
                          <p className="opacity-80 font-bold">#{selectedOrder.id}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                      {/* Status */}
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                          <span className="font-bold text-gray-600 dark:text-gray-300">حالة الطلب</span>
                          <StatusBadge status={selectedOrder.status} />
                      </div>

                      {/* Items */}
                      <div>
                          <h4 className="text-sm font-bold text-gray-500 mb-2">المحتويات</h4>
                          <p className="text-lg font-bold text-gray-800 dark:text-white leading-relaxed">{selectedOrder.items}</p>
                      </div>

                      {/* Locations */}
                      <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                          <div className="flex gap-3">
                              <div className="mt-1"><Store size={20} className="text-gray-400" /></div>
                              <div>
                                  <p className="text-xs font-bold text-gray-500">من</p>
                                  <p className="font-bold text-gray-800 dark:text-white">{selectedOrder.pickupAddress}</p>
                              </div>
                          </div>
                          <div className="flex gap-3">
                              <div className="mt-1"><MapPin size={20} className="text-gray-400" /></div>
                              <div>
                                  <p className="text-xs font-bold text-gray-500">إلى</p>
                                  <p className="font-bold text-gray-800 dark:text-white">{selectedOrder.deliveryAddress.title}</p>
                                  <p className="text-xs text-gray-400">{selectedOrder.deliveryAddress.details}</p>
                              </div>
                          </div>
                      </div>

                      {/* DRIVER INFO - Only if assigned */}
                      {selectedOrder.driverId && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                              <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                  <User size={16} /> بيانات الكابتن
                              </h4>
                              {getDriverForOrder(selectedOrder) ? (
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <p className="font-black text-lg text-gray-800 dark:text-white">{getDriverForOrder(selectedOrder)?.name}</p>
                                          <p className="text-xs text-gray-500">كابتن ع الطاير</p>
                                      </div>
                                      <a href={`tel:${getDriverForOrder(selectedOrder)?.phone}`} className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors">
                                          <Phone size={24} />
                                      </a>
                                  </div>
                              ) : (
                                  <p className="text-sm text-gray-500">جاري تحميل البيانات...</p>
                              )}
                          </div>
                      )}

                      {/* Cost */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <span className="font-bold text-gray-600">التكلفة الكلية</span>
                          <span className="text-2xl font-black text-primary">{selectedOrder.price} {CURRENCY}</span>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
