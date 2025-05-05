import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from '@/lib/i18n';

const HeroSection = ({ locale }) => {
    const t = getTranslations(locale).hero;

    return (
        <section className="bg-gradient-to-b from-blue-50 via-white to-white pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Metin İçeriği */}
                <div className="text-center lg:text-left">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                        {t.title || 'Başlık Yükleniyor...'}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                        {t.subtitle || 'Açıklama yükleniyor...'}
                    </p>
                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center lg:justify-start">
                        <Link href="/kaydol" className="w-full sm:w-auto inline-block text-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold text-lg transition duration-300 shadow-md hover:shadow-lg">
                            {t.ctaPrimary || 'Başla'}
                        </Link>
                        <Link href="#features" className="w-full sm:w-auto inline-block text-center bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-md font-semibold text-lg transition duration-300 border border-gray-300 shadow-sm hover:shadow-md">
                            {t.ctaSecondary || 'Öğren'}
                        </Link>
                    </div>
                </div>

                {/* Görsel Alanı */}
                <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
                    <div className="relative w-full max-w-xl aspect-video rounded-lg overflow-hidden shadow-xl"> {/* Aspect ratio eklendi */}
                        <Image
                            src="/finEra.png" // Resim public klasöründe olmalı
                            alt={t.imageAlt || 'FinArea Görseli'}
                            layout="fill"
                            objectFit="cover" // Veya "contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;