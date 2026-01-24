
import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Card } from './ui/Card';
import { StatusBadge } from './StatusBadge';
import { CURRENCY } from '../constants';
import { Package, Clock, CheckCircle } from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { currentUser, orders } = useApp();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const myOrders = orders.filter(o => 
      (currentUser?.role === 'DRIVER' && (o.driverId === currentUser.id || o.status === 'PENDING')) ||
      (currentUser?.role === 'CUSTOMER' && o.customerId === currentUser.id) ||
      (currentUser?.role === 'STORE' && o.storeId === currentUser.id) ||
      (currentUser?.role === 'ADMIN')
  ).sort((a, b) => b.createdAt - a.createdAt);

  const activeOrders = myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RETURNED');
  const historyOrders = myOrders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED' || o.status === 'RETURNED');

  const displayOrders = tab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-black text-gray-800 dark:text-white">طلباتي</h2>
       
       <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex max-w-md">
           <button onClick={() => setTab('active')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'active' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`}>
               الجارية ({activeOrders.length})
           </button>
           <button onClick={() => setTab('history')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`}>
               السابقة ({historyOrders.length})
           </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {displayOrders.length === 0 ? (
               <div className="col-span-full text-center py-12 opacity-50">
                   <Package size={48} className="mx-auto mb-2 text-gray-300" />
                   <p className="font-bold text-gray-400">لا توجد طلبات هنا</p>
               </div>
           ) : (
               displayOrders.map(order => (
                   <Card key={order.id} className="relative overflow-hidden group hover:border-primary transition-colors">
                       <div className="flex justify-between items-start mb-3">
                           <div className="flex gap-3">
                               <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl text-primary">
                                   <Package size={24} />
                               </div>
                               <div className="min-w-0">
                                   <div className="font-bold text-gray-800 dark:text-white truncate">{order.items}</div>
                                   <div className="text-xs text-gray-500 flex items-center gap-1">
                                       <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                                   </div>
                               </div>
                           </div>
                           <StatusBadge status={order.status} />
                       </div>
                       
                       <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                           <div className="text-sm text-gray-500 truncate max-w-[60%]">{order.deliveryAddress.title}</div>
                           <div className="font-black text-lg text-gray-800 dark:text-white">{order.price} {CURRENCY}</div>
                       </div>
                   </Card>
               ))
           )}
       </div>
    </div>
  );
};
