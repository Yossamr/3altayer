
import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { OrderStatus, OrderType } from '../types';
import { WORKFLOW_CONFIG, CURRENCY } from '../constants';
import { Button } from './ui/Button';
import { StatusBadge } from './StatusBadge';
import { Camera, Navigation, AlertTriangle, XCircle, MapPin, Phone, ArrowRight, QrCode, Upload, MessageCircle } from 'lucide-react';

export const DriverView: React.FC = () => {
  const { currentUser, orders, acceptOrder, updateOrderStatus, reportIssue } = useApp();
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  
  const cashOnHand = currentUser?.cashCollected || 0;
  const cashLimit = currentUser?.cashLimit || 2000;
  const isLimitExceeded = cashOnHand >= cashLimit;

  // Stats
  const completedOrders = orders.filter(o => o.driverId === currentUser?.id && o.status === OrderStatus.DELIVERED).length;
  
  const handleProofAction = (orderId: string, nextStatus: OrderStatus) => {
    // If delivery, show options
    if (nextStatus === OrderStatus.DELIVERED) {
         const choice = window.confirm("هل تريد مسح كود QR للتأكيد؟ (اضغط إلغاء لرفع صورة)");
         if (choice) {
             alert("اضغط على زر المسح (Scan) في القائمة السفلية");
         } else {
             const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
             updateOrderStatus(orderId, nextStatus, { imageUrl: mockImageUrl });
             alert("تم رفع إثبات التوصيل");
         }
    } else {
        const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
        updateOrderStatus(orderId, nextStatus, { imageUrl: mockImageUrl });
    }
  };

  const handleNoProofAction = (orderId: string, nextStatus: OrderStatus) => {
     updateOrderStatus(orderId, nextStatus);
  }

  const handleAccept = (orderId: string) => {
    if (isLimitExceeded) {
        alert("You have exceeded your cash limit.");
        return;
    }
    const allowTracking = window.confirm("Share LIVE LOCATION?");
    acceptOrder(orderId, currentUser!.id, allowTracking);
    setActiveTab('active');
  };

  const openWhatsApp = (phone: string | undefined, orderId: string) => {
      if (!phone) {
          alert("رقم الهاتف غير متوفر");
          return;
      }
      const message = `أهلاً يا فندم، أنا كابتن ع الطاير ومعايا الأوردر رقم ${orderId.slice(-4)}. أنا في الطريق إليك!`;
      const url = `https://wa.me/20${phone.replace(/^0+/, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  const availableOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const myActiveOrders = orders.filter(o => o.driverId === currentUser?.id && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary dark:bg-blue-800 p-4 rounded-2xl text-white relative overflow-hidden chunk-shadow group">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="material-icons-round bg-white/20 p-1.5 rounded-lg text-sm">payments</span>
                    <span className="text-blue-100 text-xs font-semibold">اليوم</span>
                </div>
                <div className="text-3xl font-black mb-1">{cashOnHand}</div>
                <div className="text-blue-100 text-sm font-bold">{CURRENCY}</div>
            </div>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 chunk-shadow">
            <div className="flex items-center justify-between mb-2">
                <span className="material-icons-round bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 p-1.5 rounded-lg text-sm">local_shipping</span>
                <span className="text-gray-400 text-xs font-semibold">أكملت</span>
            </div>
            <div className="text-3xl font-black text-gray-800 dark:text-white mb-1">{completedOrders}</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm font-bold">طلب توصيل</div>
        </div>
      </div>

      {isLimitExceeded && (
          <div className="bg-red-50 border-2 border-red-100 p-3 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
              <div className="bg-red-100 p-2 rounded-full"><XCircle size={20} /></div>
              <div>حد الكاش! يجب توريد المبلغ للشركة.</div>
          </div>
      )}

      {/* Toggle Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl max-w-md">
        <button 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'available' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`} 
            onClick={() => setActiveTab('available')}>
            طلبات جديدة ({availableOrders.length})
        </button>
        <button 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`} 
            onClick={() => setActiveTab('active')}>
            جارية ({myActiveOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'available' ? availableOrders : myActiveOrders).map(order => {
            const nextStep = WORKFLOW_CONFIG[order.type as OrderType][order.status as OrderStatus];
            const isActionable = activeTab === 'active';

            return (
                <div key={order.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 chunk-shadow border-2 border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col justify-between h-full">
                    <div>
                        {/* Status Banner */}
                        <div className="absolute top-0 right-0 bg-accent text-black text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-20">
                            {order.status.replace(/_/g, ' ')}
                        </div>

                        <div className="flex gap-4 mt-4">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0 overflow-hidden relative border border-gray-300 dark:border-gray-600 cursor-pointer" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=Damanhour`, '_blank')}>
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <MapPin className="text-primary drop-shadow-md" size={32} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg mb-1 truncate text-gray-800 dark:text-white">{order.items}</h3>
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-1 truncate">
                                    <span className="material-icons-round text-sm">store</span>
                                    {order.pickupAddress}
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm truncate">
                                    <span className="material-icons-round text-sm text-green-500">location_on</span>
                                    {order.deliveryAddress.title}
                                </div>
                            </div>
                        </div>

                        {/* Price Tag */}
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                            <div className="text-primary font-black text-xl">{order.price} <span className="text-sm font-medium text-gray-500">{CURRENCY}</span></div>
                            <div className="text-xs text-gray-400 font-mono">#{order.id.slice(-4)}</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {isActionable ? (
                            nextStep ? (
                                <>
                                    <button 
                                        onClick={() => nextStep.requireProof ? handleProofAction(order.id, nextStep.next) : handleNoProofAction(order.id, nextStep.next)}
                                        className="col-span-2 bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 chunk-shadow transition-colors"
                                    >
                                        {nextStep.next === OrderStatus.DELIVERED ? <QrCode size={20} /> : <Camera size={20} />}
                                        {nextStep.label}
                                    </button>
                                </>
                            ) : (
                                <div className="col-span-2 bg-green-100 text-green-700 text-center py-2 rounded-xl font-bold">مكتملة</div>
                            )
                        ) : (
                            <button 
                                onClick={() => handleAccept(order.id)}
                                disabled={isLimitExceeded}
                                className="col-span-2 bg-secondary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 chunk-shadow transition-colors disabled:opacity-50"
                            >
                                <span className="material-icons-round">check_circle</span>
                                قبول الطلب
                            </button>
                        )}
                        
                        {isActionable && (
                             <>
                                <button onClick={() => openWhatsApp(order.recipientPhone, order.id)} className="bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 chunk-shadow">
                                    <MessageCircle size={18} />
                                    واتساب
                                </button>
                                <a href={`tel:${order.recipientPhone || '000'}`} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                                    <Phone size={18} />
                                    اتصال
                                </a>
                             </>
                        )}
                    </div>
                </div>
            );
        })}

        {(activeTab === 'available' ? availableOrders : myActiveOrders).length === 0 && (
             <div className="col-span-full text-center py-12 opacity-50">
                 <div className="material-icons-round text-6xl text-gray-300 mb-2">inbox</div>
                 <p>لا توجد طلبات حالياً</p>
             </div>
        )}
      </section>

      {/* Performance Stats */}
      <section className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-center border border-indigo-100 dark:border-indigo-800">
            <span className="material-icons-round text-indigo-500 text-2xl mb-1">star</span>
            <div className="text-lg font-bold text-gray-800 dark:text-white">{currentUser?.score || 5}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">تقييمك</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center border border-green-100 dark:border-green-800">
            <span className="material-icons-round text-green-500 text-2xl mb-1">timelapse</span>
            <div className="text-lg font-bold text-gray-800 dark:text-white">98%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">قبول</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-center border border-purple-100 dark:border-purple-800">
            <span className="material-icons-round text-purple-500 text-2xl mb-1">emoji_events</span>
            <div className="text-lg font-bold text-gray-800 dark:text-white">2</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">مكافآت</div>
        </div>
      </section>
    </div>
  );
};
