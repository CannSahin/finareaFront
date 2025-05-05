// components/layout/Header.tsx

import React, { Dispatch, SetStateAction, JSX } from 'react'; // Dispatch, SetStateAction, JSX eklendi
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from '@/lib/i18n';
import { Locale } from '@/app/page'; // Locale tipini import et

// Prop tiplerini tanımla
interface HeaderProps {
    locale: Locale;
    setLocale: Dispatch<SetStateAction<Locale>>; // useState setter fonksiyonunun tipi
}

const Header = ({ locale, setLocale }: HeaderProps): JSX.Element => { // Tipleri kullan
                                                                      // Fallback mekanizması ile dil verilerini al
    const t = getTranslations(locale)?.nav || getTranslations('tr').nav;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/logoo.png"
                            alt="FinArea Logo" // Dil dosyasına taşınabilir: t.logoAlt || 'FinArea Logo'
                            width={90}
                            height={90}
                            priority
                        />
                    </Link>
                </div>

                {/* Orta Alan Boş */}
                <div className="hidden md:flex flex-grow justify-center"></div>

                {/* Dil Seçimi ve Butonlar */}
                <div className="flex items-center space-x-4">
                    <div className="text-sm">
                        <button
                            onClick={() => setLocale('tr')}
                            className={`px-2 py-1 rounded focus:outline-none transition-colors duration-200 ${locale === 'tr' ? 'font-semibold text-blue-700 bg-blue-100' : 'text-gray-600 hover:text-blue-600'}`}
                            aria-pressed={locale === 'tr'} // Erişilebilirlik
                            aria-label="Türkçe Dil Seçeneği"
                        >
                            TR
                        </button>
                        <span className="text-gray-300 mx-1" aria-hidden="true">|</span>
                        <button
                            onClick={() => setLocale('en')}
                            className={`px-2 py-1 rounded focus:outline-none transition-colors duration-200 ${locale === 'en' ? 'font-semibold text-blue-700 bg-blue-100' : 'text-gray-600 hover:text-blue-600'}`}
                            aria-pressed={locale === 'en'} // Erişilebilirlik
                            aria-label="English Language Option"
                        >
                            EN
                        </button>
                    </div>
                    <Link href="/login" className="hidden sm:inline-block text-gray-700 hover:text-blue-600 px-4 py-2 rounded font-medium text-sm">
                        {t?.login || 'Giriş Yap'}
                    </Link>
                    <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        {t?.signUp || 'Kaydol'}
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;