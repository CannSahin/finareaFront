import React, { JSX } from 'react'; // JSX importu eklendi/kontrol edildi
import Image from 'next/image';
import { getTranslations } from '@/lib/i18n';
import { Locale } from '@/app/page'; // Veya merkezi tip dosyasından

// Interface adını büyük harfle başlatın
interface FeaturesProps {
    locale: Locale;
}

const FeaturesSection = ({ locale }: FeaturesProps): JSX.Element => { // Interface adını düzeltin ve dönüş tipini ekleyin
    const t = getTranslations(locale)?.features || getTranslations('tr').features; // Fallback ile çevirileri al

    const featuresData = [
        { id: 1, iconSrc: '/images/flwbudget.png', altKey: 'feature1Alt', trKey: 'feature1' },
        { id: 2, iconSrc: '/images/graicon.png', altKey: 'feature2Alt', trKey: 'feature2' },
        { id: 3, iconSrc: '/images/preai.png', altKey: 'feature3Alt', trKey: 'feature3' },
        { id: 4, iconSrc: '/images/robochat.png', altKey: 'feature4Alt', trKey: 'feature4' },
    ];

    // Fonksiyonun dönüş tipini ': string' olarak belirtin
    const getAltText = (key: string): string => {
        // t[key]'in varlığını kontrol etmek daha güvenli olabilir
        const altText = t?.[key]; // Optional chaining
        return typeof altText === 'string' ? altText : 'Feature Icon'; // Tip kontrolü ve fallback
    };

    return (
        <section id="features" className="py-16 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{t?.title || 'Özellikler'}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t?.subtitle || 'Alt başlık...'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuresData.map((feature) => (
                        <div key={feature.id} className="bg-gray-50 p-6 rounded-lg shadow-sm text-center transition duration-300 hover:scale-105 hover:shadow-lg flex flex-col items-center">
                            <div className="relative h-16 w-16 mb-5">
                                <Image
                                    src={feature.iconSrc}
                                    // getAltText fonksiyonu artık string döndürdüğü için sorun olmamalı
                                    alt={getAltText(feature.altKey)}
                                    layout="fill"
                                    objectFit="contain"
                                />
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