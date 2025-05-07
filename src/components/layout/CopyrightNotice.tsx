import React from 'react';
import { getTranslations } from '@/lib/i18n';
import { Locale } from "@/app/page"; // Projenizdeki Locale tipini import edin

interface CopyrightNoticeProps {
    locale: Locale;
    className?: string; // İsteğe bağlı ek stil sınıfları için
}

const CopyrightNotice = ({ locale, className = "" }: CopyrightNoticeProps) => {
    // Çevirileri alırken null/undefined kontrolü
    const translations = getTranslations(locale);
    const footerTranslations = translations?.footer || getTranslations('tr').footer;
    const currentYear = new Date().getFullYear();

    const copyrightText = footerTranslations?.copyright
        ? footerTranslations.copyright.replace('{year}', currentYear.toString())
        : `© ${currentYear} FinArea. Tüm Hakları Saklıdır.`;

    return (
        <div className={`text-center text-sm text-gray-400 ${className}`}>
            <p>{copyrightText}</p>
        </div>
    );
};

export default CopyrightNotice;