import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface PrivacyProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
           <ArrowRight size={20} className="rtl:rotate-180" />
        </button>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">السياسة والخصوصية</h2>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-bold border-2 border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                  <ShieldCheck size={48} />
              </div>
          </div>
          
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
              <h3 className="font-bold text-lg text-primary">1. جمع المعلومات</h3>
              <p className="text-gray-600 dark:text-gray-300">
                  نحن نجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل، مثل اسمك، رقم هاتفك، وعناوين التوصيل. كما نجمع بيانات الموقع الجغرافي لتسهيل عملية التوصيل.
              </p>

              <h3 className="font-bold text-lg text-primary">2. استخدام المعلومات</h3>
              <p className="text-gray-600 dark:text-gray-300">
                  نستخدم المعلومات لتقديم خدمات التوصيل، تحسين التطبيق، والتواصل معك بخصوص طلباتك. لن نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية دون موافقتك.
              </p>

              <h3 className="font-bold text-lg text-primary">3. أمان البيانات</h3>
              <p className="text-gray-600 dark:text-gray-300">
                  نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف.
              </p>

              <h3 className="font-bold text-lg text-primary">4. حقوق المستخدم</h3>
              <p className="text-gray-600 dark:text-gray-300">
                  لديك الحق في الوصول إلى بياناتك الشخصية، تصحيحها، أو طلب حذفها في أي وقت من خلال إعدادات التطبيق أو التواصل مع الدعم الفني.
              </p>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
              آخر تحديث: 25 أكتوبر 2023
          </div>
      </div>
    </div>
  );
};