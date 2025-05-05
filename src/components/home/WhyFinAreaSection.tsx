// components/home/WhyFinAreaSection.tsx
import React, {JSX} from 'react';
import { getTranslations } from '@/lib/i18n';
import { Locale } from '@/app/page'; // Locale tipini import edin

// İkonları import edin (örnek)
// import { HiOutlineCpuChip, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineClock } from 'react-icons/hi2';

interface WhyFinAreaProps {
    locale: Locale;
}

const WhyFinAreaSection = ({ locale }: WhyFinAreaProps): JSX.Element => {
    const t = getTranslations(locale)?.whyFinArea || getTranslations('tr').whyFinArea;
    const benefitsData = [
        // { id: 1, icon: HiOutlineCpuChip, trKey: 'benefitAi' },
        // ... diğer ikonlar ...
        { id: 1, icon: 'AI', trKey: 'benefitAi' },
        { id: 2, icon: 'SEC', trKey: 'benefitSecurity' },
        { id: 3, icon: 'UI', trKey: 'benefitUi' },
        { id: 4, icon: 'TIME', trKey: 'benefitTime' },
    ];

    return (
        <section id="why-finarea" className="py-16 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                        {t?.title || 'Finansal Geleceğiniz İçin Akıllı Seçim'}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        {t?.subtitle || 'FinArea, sadece verilerinizi görselleştirmekle kalmaz, yapay zeka gücüyle finansal kararlarınızı destekler ve hedeflerinize daha hızlı ulaşmanızı sağlar.'}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
                    {benefitsData.map((benefit) => (
                        <div key={benefit.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-lg font-bold mt-1">
                                {/* <benefit.icon className="w-6 h-6" /> */}
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                    {t[benefit.trKey]?.title || 'Fayda Başlığı'}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {t[benefit.trKey]?.description || 'Fayda açıklaması...'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyFinAreaSection;