import React from 'react';
import { useApp } from '../services/AppContext';
import { Card } from './ui/Card';
import { CURRENCY } from '../constants';
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, History } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { currentUser, orders } = useApp();

  // Calculate transactions based on completed orders
  const transactions = orders
    .filter(o => 
      (currentUser?.role === 'DRIVER' && o.driverId === currentUser.id && o.status === 'DELIVERED') ||
      (currentUser?.role === 'CUSTOMER' && o.customerId === currentUser.id) ||
      (currentUser?.role === 'STORE' && o.storeId === currentUser.id)
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">المحفظة</h2>
        <button className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
            <History className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-secondary to-blue-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>
         
         <div className="relative z-10">
             <div className="flex items-center gap-2 mb-4 opacity-80">
                 <Wallet size={20} />
                 <span className="text-sm font-bold">الرصيد الحالي</span>
             </div>
             <div className="text-4xl font-black mb-2 tracking-tight">
                 {currentUser?.walletBalance || 0} <span className="text-lg font-medium opacity-80">{CURRENCY}</span>
             </div>
             
             {currentUser?.role === 'DRIVER' && (
                 <div className="mt-4 pt-4 border-t border-white/20 flex justify-between">
                     <div>
                         <span className="text-xs block opacity-70">كاش معك</span>
                         <span className="font-bold text-lg">{currentUser?.cashCollected || 0} {CURRENCY}</span>
                     </div>
                     <div className="text-left">
                         <span className="text-xs block opacity-70">الحد المسموح</span>
                         <span className="font-bold text-lg">{currentUser?.cashLimit || 2000} {CURRENCY}</span>
                     </div>
                 </div>
             )}
         </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
          <button className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-bold border-2 border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 group">
              <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft size={24} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300">شحن رصيد</span>
          </button>
          <button className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-bold border-2 border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 group">
              <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={24} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300">سحب رصيد</span>
          </button>
      </div>

      {/* Recent Activity */}
      <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">آخر العمليات</h3>
          <div className="space-y-3">
              {transactions.length > 0 ? transactions.map(t => (
                  <Card key={t.id} className="flex justify-between items-center py-3 px-4">
                      <div className="flex items-center gap-3">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
                              <CreditCard size={20} className="text-gray-500" />
                          </div>
                          <div>
                              <div className="font-bold text-sm text-gray-800 dark:text-white">{t.items}</div>
                              <div className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</div>
                          </div>
                      </div>
                      <div className={`font-bold ${currentUser?.role === 'CUSTOMER' ? 'text-red-500' : 'text-green-500'}`}>
                          {currentUser?.role === 'CUSTOMER' ? '-' : '+'}{t.price} {CURRENCY}
                      </div>
                  </Card>
              )) : (
                  <div className="text-center py-8 text-gray-400">لا توجد عمليات حديثة</div>
              )}
          </div>
      </div>
    </div>
  );
};