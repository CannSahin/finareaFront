// components/home/HowItWorksSection.tsx
import React, {JSX} from 'react';
import { getTranslations } from '@/lib/i18n';
import { Locale } from '@/app/page'; // Locale tipini ana sayfadan veya merkezi bir tipler dosyasından import edin

// Component'in alacağı prop'ları tanımlayan interface
interface HowItWorksProps {
    locale: Locale;
}

const HowItWorksSection = ({ locale }: HowItWorksProps): JSX.Element => { // Prop tipini ve dönüş tipini belirtin
    const t = getTranslations(locale)?.howItWorks || getTranslations('tr').howItWorks;
    const stepsData = [
        { id: 1, trKey: 'step1' },
        { id: 2, trKey: 'step2' },
        { id: 3, trKey: 'step3' },
    ];

    return (
        <section id="how-it-works" className="py-16 lg:py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 lg:mb-20">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                        {t.title || 'Sadece 3 Basit Adımda Başlayın'}
                    </h2>
                </div>
                <div className="relative max-w-5xl mx-auto">
                    <div
                        className="hidden md:block absolute top-8 left-16 right-16 h-1 bg-blue-200 rounded-full"
                        style={{ zIndex: 0 }}
                    ></div>
                    <div className="relative flex flex-col md:flex-row justify-between items-start space-y-16 md:space-y-0 md:space-x-8">
                        {stepsData.map((step, index) => (
                            <div key={step.id} className="text-center flex-1 px-2 relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-2xl font-bold mx-auto mb-5 border-4 border-white shadow-lg">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {t[step.trKey]?.title || `Adım ${index + 1} Başlık`}
                                </h3>
                                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                                    {t[step.trKey]?.description || `Adım ${index + 1} açıklaması buraya gelecek.`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorksSection;