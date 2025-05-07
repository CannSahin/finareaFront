import React from 'react';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';
import { Locale } from "@/app/page"; // Projenizdeki Locale tipini import edin
import CopyrightNotice from './CopyrightNotice'; // Oluşturduğumuz alt bileşeni import ediyoruz

interface FooterProps {
    locale: Locale;
    variant?: 'public' | 'dashboard'; // 'public' (varsayılan) veya 'dashboard'
}

const Footer = ({ locale, variant = 'public' }: FooterProps) => {
    const translations = getTranslations(locale);
    const t = translations?.footer || getTranslations('tr').footer;

    // Varyanta göre temel footer stilleri
    const footerBaseClass = "text-gray-400";
    const publicFooterClasses = "bg-gray-900 py-12";
    const dashboardFooterClasses = "bg-gray-800 py-6 border-t border-gray-700"; // Dashboard için daha sade, üst border eklendi.

    const containerPaddingClass = "px-4 sm:px-6 lg:px-8";

    return (
        <footer className={`${footerBaseClass} ${variant === 'public' ? publicFooterClasses : dashboardFooterClasses}`}>
            <div className={`container mx-auto ${containerPaddingClass}`}>
                {variant === 'public' && (
                    <>
                        {/* Detaylı Public Footer İçeriği */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
                            {/* Sütun 1: Logo & Kısa Açıklama */}
                            <div className="col-span-2 lg:col-span-1 mb-6 lg:mb-0">
                                <Link href="/" className="inline-block mb-3"> {/* Logo linki ana sayfaya gitsin */}
                                    <span className="text-xl font-bold text-white">FinArea</span>
                                </Link>
                                <p className="text-sm text-gray-500">
                                    {t.description || 'Yapay zeka destekli kişisel finans yönetimi.'}
                                </p>
                            </div>

                            {/* Sütun 2: Keşfet */}
                            <div>
                                <h5 className="font-semibold text-gray-100 mb-3 tracking-wide">{t?.infoTitle || 'Keşfet'}</h5>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/about" className="hover:text-white transition-colors">{t.about || 'Hakkımızda'}</Link></li>
                                    <li><Link href="/careers" className="hover:text-white transition-colors">{t.careers || 'Kariyer'}</Link></li>
                                    <li><Link href="/blog" className="hover:text-white transition-colors">{t.blog || 'Blog'}</Link></li>
                                    <li><Link href="/contact" className="hover:text-white transition-colors">{t.contact || 'İletişim'}</Link></li>
                                </ul>
                            </div>

                            {/* Sütun 3: Kaynaklar */}
                            <div>
                                <h5 className="font-semibold text-gray-100 mb-3 tracking-wide">{t?.resourcesTitle || 'Kaynaklar'}</h5>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/help" className="hover:text-white transition-colors">{t.help || 'Yardım Merkezi'}</Link></li>
                                    <li><Link href="/faq" className="hover:text-white transition-colors">{t.faq || 'SSS'}</Link></li>
                                    <li><Link href="/security" className="hover:text-white transition-colors">{t.security || 'Güvenlik'}</Link></li>
                                </ul>
                            </div>

                            {/* Sütun 4: Yasal */}
                            <div>
                                <h5 className="font-semibold text-gray-100 mb-3 tracking-wide">{t?.legalTitle || 'Yasal'}</h5>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/privacy" className="hover:text-white transition-colors">{t.privacy || 'Gizlilik Politikası'}</Link></li>
                                    <li><Link href="/terms" className="hover:text-white transition-colors">{t.terms || 'Kullanım Koşulları'}</Link></li>
                                    <li><Link href="/cookies" className="hover:text-white transition-colors">{t.cookies || 'Çerez Politikası'}</Link></li>
                                </ul>
                            </div>

                            {/* Sütun 5: Sosyal Medya */}
                            <div>
                                <h5 className="font-semibold text-gray-100 mb-3 tracking-wide">{t.follow || 'Bizi Takip Edin'}</h5>
                                <div className="flex space-x-4">
                                    <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-white transition-colors">[LN]</a>
                                    <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-white transition-colors">[TW]</a>
                                </div>
                            </div>
                        </div>
                        {/* Public footer için copyright kısmı, üstte bir ayıraç ile */}
                        <CopyrightNotice locale={locale} className="border-t border-gray-700 pt-8" />
                    </>
                )}

                {variant === 'dashboard' && (
                    // Dashboard footer için sadece copyright gösterilir.
                    // dashboardFooterClasses zaten padding (py-6) ve üst border (border-t border-gray-700) sağlıyor.
                    // CopyrightNotice'a ekstra class vermeye gerek kalmayabilir.
                    <CopyrightNotice locale={locale} />
                )}
            </div>
        </footer>
    );
};

export default Footer;