import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Bell, Moon, Volume2, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sounds, setSounds] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
           <ArrowRight size={20} className="rtl:rotate-180" />
        </button>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">الإعدادات</h2>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-2 shadow-bold border-2 border-gray-100 dark:border-gray-700">
          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600"><Bell size={20} /></div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">الإشعارات</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600"><Moon size={20} /></div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">الوضع الليلي</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
          </div>

          {/* Sounds Toggle */}
          <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600"><Volume2 size={20} /></div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">الأصوات</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={sounds} onChange={() => setSounds(!sounds)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
          </div>
      </div>

      <div className="space-y-3">
          <button className="w-full bg-red-50 p-4 rounded-2xl border-2 border-red-100 flex items-center gap-3 text-red-600 font-bold hover:bg-red-100 transition-colors">
              <AlertTriangle size={20} />
              <span>الإبلاغ عن مشكلة تقنية</span>
          </button>
          
          <button className="w-full bg-gray-100 p-4 rounded-2xl border-2 border-gray-200 flex items-center gap-3 text-gray-600 font-bold hover:bg-gray-200 transition-colors">
              <Shield size={20} />
              <span>تغيير كلمة المرور</span>
          </button>
      </div>
    </div>
  );
};