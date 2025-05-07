'use client';

import React, { useState, JSX } from 'react';
// Güncellenmiş TransactionsList componentini (artık özet gösteriyor) import et
import TransactionsList from '@/app/dashboard/TransactionsList';
// Locale import yolu (kendi projenize göre doğrulayın)
import { Locale } from '@/lib/i18n';

export default function TransactionsPage(): JSX.Element {
    // Locale state'i ve kullanılmayan setter için _ ön eki
    const [locale, _setLocale] = useState<Locale>('tr');

    return (
        <div> {/* Dashboard layout'unun ana içerik alanı */}
            {/* Başlığı, componentin yeni işlevine uygun olarak değiştirmek daha doğru olabilir */}
            {/* Örneğin: <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dönem Harcama Özeti</h1> */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Finans Hareketleri Özeti</h1>

            {/* Artık özet verisini gösteren TransactionsList componentini çağır */}
            <TransactionsList locale={locale} />
        </div>
    );
}