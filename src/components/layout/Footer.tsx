import React from 'react';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';
import {Locale} from "@/app/page";
interface footer {
    locale: Locale;
}
const Footer = ({ locale }: footer) => {
    const t = getTranslations(locale)?.footer || getTranslations('tr').footer; // Fallback ile çevirileri al
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-400 py-12"> {/* Arka plan rengi biraz koyulaştırıldı */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10"> {/* Daha fazla sütun için lg:grid-cols-5 */}

                    {/* Sütun 1: Logo & Kısa Açıklama */}
                    <div className="col-span-2 lg:col-span-1 mb-6 lg:mb-0">
                        <Link href="/public" className="inline-block mb-3">
                            {/* Logo (varsa) veya Metin Logo */}
                            <span className="text-xl font-bold text-white">FinArea</span>
                        </Link>
                        <p className="text-sm text-gray-500">
                            {t.description || 'Yapay zeka destekli kişisel finans yönetimi.'}
                        </p>
                    </div>


                    {/* Sütun 2: Discover */}
                    <div>
                        <h5 className="font-semibold text-gray-100 mb-3 tracking-wide">{t?.infoTitle || 'Keşfet'}</h5> {/* Başlık stili */}
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
                            <li><Link href="#security" className="hover:text-white transition-colors">{t.security || 'Güvenlik'}</Link></li>
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
                            {/* Sosyal Medya İkonları Buraya (Örn: react-icons) */}
                            <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-white transition-colors">[LN]</a>
                            <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-white transition-colors">[TW]</a>
                            {/* <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-white transition-colors">[FB]</a> */}
                        </div>
                    </div>

                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-sm">
                    {/* Copyright metninde dinamik yıl kullanımı */}
                    <p>{t?.copyright?.replace('{year}', currentYear) || `© ${currentYear} FinArea. All Rights Reserved.`}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;