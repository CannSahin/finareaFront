'use client';

import React, { useState, JSX } from 'react';

import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhyFinAreaSection from "@/components/home/WhyFinAreaSection";
import FinalCTASection from "@/components/home/FinalCTASection";
import Footer from "@/components/layout/Footer";


// Locale tipi tanımı (Merkezi bir types dosyasından import edilebilir)
export type Locale = 'tr' | 'en';

export default function HomePage(): JSX.Element {
    // Dil state yönetimi
    const [locale, setLocale] = useState<Locale>('tr');

    return (
        <div className="flex flex-col min-h-screen bg-white" >
            {/* Header: Dil seçimi ve state güncelleme fonksiyonunu içerir */}
            <Header locale={locale} setLocale={setLocale} />

            {/* Ana içerik: Her bölüm seçilen dili prop olarak alır */}
            <main className="flex-grow">
                <HeroSection locale={locale} />
                <FeaturesSection locale={locale} />
                <HowItWorksSection locale={locale} />
                <WhyFinAreaSection locale={locale} />
                <FinalCTASection locale={locale} />
            </main>

            {/* Footer: Seçilen dili prop olarak alır */}
            <Footer locale={locale} />
        </div>
    );
}