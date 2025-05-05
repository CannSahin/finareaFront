// components/home/FinalCTASection.tsx

import React, { JSX } from 'react';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';
import { Locale } from '@/app/page'; // Veya merkezi tipler dosyasından

interface FinalCTAProps {
    locale: Locale;
}

const FinalCTASection = ({ locale }: FinalCTAProps): JSX.Element => {
    const t = getTranslations(locale)?.finalCta || getTranslations('tr').finalCta;

    const defaultTitle = 'Finansal Özgürlüğe İlk Adımı Atın!';
    const defaultSubtitle = 'FinArea\'ya bugün ücretsiz katılın ve paranızı daha akıllıca yönetmeye başlayın.';
    const defaultButton = 'Şimdi Kaydol';

    return (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    {t?.title || defaultTitle}
                </h2>
                <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                    {t?.subtitle || defaultSubtitle}
                </p>
                <Link
                    href="/register"
                    className="inline-block bg-white hover:bg-gray-100 text-blue-700 px-10 py-3 rounded-md font-semibold text-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                    {t?.button || defaultButton}
                </Link>
            </div>
        </section>
    );
};

export default FinalCTASection;