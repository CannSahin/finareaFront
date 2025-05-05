import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Logoyu Image ile ekleyelim
import { getTranslations } from '@/lib/i18n'; // Çeviri fonksiyonunu import et

const Header = ({ locale, setLocale }) => {
    const t = getTranslations(locale).nav;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center"> {/* Padding biraz azaltıldı */}
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link href="/" className="flex items-center"> {/* Flex container */}
                        <Image
                            src="/finEra.png" // Public klasöründeki logo
                            alt="FinArea Logo"
                            width={120} // Gerçek logo genişliği
                            height={35} // Gerçek logo yüksekliği (veya width'e göre otomatik oran için h-auto?)
                            priority // Hızlı yüklenmesi için
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
                        >
                            TR
                        </button>
                        <span className="text-gray-300 mx-1">|</span>
                        <button
                            onClick={() => setLocale('en')}
                            className={`px-2 py-1 rounded focus:outline-none transition-colors duration-200 ${locale === 'en' ? 'font-semibold text-blue-700 bg-blue-100' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            EN
                        </button>
                    </div>
                    <Link href="/login" className="hidden sm:inline-block text-gray-700 hover:text-blue-600 px-4 py-2 rounded font-medium text-sm">
                        {t.login || 'Giriş Yap'}
                    </Link>
                    <Link href="/kaydol" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        {t.signUp || 'Kaydol'}
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header; // Export etmeyi unutmayın