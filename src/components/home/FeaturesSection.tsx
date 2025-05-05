import React from 'react';
import { getTranslations } from '@/lib/i18n';
// İkonları import edin (örnek: react-icons/hi)
// import { HiOutlineWallet, HiOutlineChartPie, HiOutlineCpuChip, HiOutlineLightBulb } from 'react-icons/hi2';

const FeaturesSection = ({ locale }) => {
    const t = getTranslations(locale).features;
    const featuresData = [
        // { id: 1, icon: HiOutlineWallet, trKey: 'feature1' },
        // { id: 2, icon: HiOutlineChartPie, trKey: 'feature2' },
        // { id: 3, icon: HiOutlineCpuChip, trKey: 'feature3' },
        // { id: 4, icon: HiOutlineLightBulb, trKey: 'feature4' },
        { id: 1, icon: 'ICON1', trKey: 'feature1' }, // Placeholder ikonlar
        { id: 2, icon: 'ICON2', trKey: 'feature2' },
        { id: 3, icon: 'ICON3', trKey: 'feature3' },
        { id: 4, icon: 'ICON4', trKey: 'feature4' },
    ];

    return (
        <section id="features" className="py-16 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{t.title || 'Özellikler'}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle || 'Alt başlık...'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuresData.map((feature) => (
                        <div key={feature.id} className="bg-gray-50 p-6 rounded-lg shadow-sm text-center transition duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-5">
                                {/* Gerçek ikonu render edin */}
                                {/* <feature.icon className="w-6 h-6" /> */}
                                <span className="text-xl"> {/* Placeholder */} {feature.icon} </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t[feature.trKey]?.title || 'Özellik Başlığı'}</h3>
                            <p className="text-gray-600 text-sm">{t[feature.trKey]?.description || 'Özellik açıklaması...'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;