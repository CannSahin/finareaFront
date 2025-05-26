// app/(dashboard)/financial-status/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import CategoryTotalsDisplay from './components/CategoryTotalsCard';
import SpendingChart from './components/SpendingChart';
import { getTranslations, t as i18nLibraryT, TranslationData } from '@/lib/i18n';

interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

interface PeriodSummaryResponseDto {
    year: number;
    month: number;
    periodName: string;
    sources: any[]; // Daha spesifik bir tip kullanılabilir
    overallCategoryTotals: CategorySummaryDto[];
    grandTotal: number;
}

type SupportedLocale = 'tr' | 'en';

const FinancialStatusPage = () => {
    const router = useRouter();
    const [summaryData, setSummaryData] = useState<PeriodSummaryResponseDto | null>(null);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

    const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('tr');
    const [allTranslations, setAllTranslations] = useState<TranslationData | null>(null);
    const [areTranslationsLoading, setAreTranslationsLoading] = useState<boolean>(true);

    useEffect(() => {
        console.log(`[FinancialStatusPage] Locale changed to: ${currentLocale}. Initiating translation loading...`);
        setAreTranslationsLoading(true);
        // getTranslations'ın senkron olduğu varsayılıyor.
        const newTranslations = getTranslations(currentLocale);
        setAllTranslations(newTranslations);
        setAreTranslationsLoading(false); // Çeviriler yüklendi olarak işaretle
        console.log(`[FinancialStatusPage] Translations loaded for ${currentLocale}. areTranslationsLoading: false`);
    }, [currentLocale]);

    const t = useCallback((fullKey: string, fallback?: any): string => {
        if (areTranslationsLoading || !allTranslations) {
            // Bu log, t'nin neden fallback döndürdüğünü anlamanıza yardımcı olabilir.
            console.warn(`[t func] Fallback used. Key: ${fullKey}, areTranslationsLoading: ${areTranslationsLoading}, allTranslations is null: ${!allTranslations}`);
            return fallback || fullKey;
        }
        return i18nLibraryT(allTranslations, fullKey, fallback || fullKey);
    }, [allTranslations, areTranslationsLoading]);

    const yearOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYear - i), [currentYear]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    const fetchFinancialSummary = useCallback(async (year: number, month: number) => {
        if (areTranslationsLoading) {
            console.log("[FinancialStatusPage] fetchFinancialSummary skipped: Translations not ready.");
            return;
        }
        console.log(`[FinancialStatusPage] Fetching data for ${year}-${month}. Current locale for t: ${currentLocale}`);
        setIsDataLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setError(t('financialStatusPage.authRequiredError', "Kimlik doğrulaması gerekli. Lütfen giriş yapın."));
            setIsDataLoading(false);
            router.push('/login');
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const finalApiUrl = `${API_URL}/api/v1/summaries/expenses/${year}/${month}`;

        try {
            const response = await fetch(finalApiUrl, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (response.status === 401) {
                setError(t('financialStatusPage.sessionExpiredError', "Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın."));
                localStorage.removeItem('accessToken');
                router.push('/login');
                return;
            }
            if (!response.ok) {
                const apiErrorPrefix = t('financialStatusPage.apiErrorPrefix', "API Hatası:");
                throw new Error(`${apiErrorPrefix} ${response.status} ${response.statusText}`);
            }
            const data: PeriodSummaryResponseDto = await response.json();
            setSummaryData(data);
            console.log("[FinancialStatusPage] Data fetched successfully:", data);
        } catch (err: any) {
            console.error("Finansal özet çekilirken hata:", err);
            const errorMessage = err.message || t('financialStatusPage.dataLoadError', "Veriler yüklenirken bir hata oluştu.");
            setError(errorMessage);
            setSummaryData(null);
        } finally {
            setIsDataLoading(false);
            console.log("[FinancialStatusPage] Data fetching finished. isDataLoading: false");
        }
    }, [router, t, areTranslationsLoading, currentLocale]); // currentLocale'i ekledim, t fonksiyonu dolaylı olarak buna bağlı.

    useEffect(() => {
        if (!areTranslationsLoading) {
            console.log("[FinancialStatusPage] Translations ready. Triggering data fetch for:", selectedYear, selectedMonth);
            fetchFinancialSummary(selectedYear, selectedMonth);
        } else {
            console.log("[FinancialStatusPage] Translations not ready yet. Data fetch deferred.");
        }
    }, [selectedYear, selectedMonth, fetchFinancialSummary, areTranslationsLoading]);


    // YÜKLEME DURUMU (ÇEVİRİLER İÇİN)
    if (areTranslationsLoading) {
        console.log("[FinancialStatusPage] Rendering: Translations Loading Screen. typeof t at this point:", typeof t);
        // Bu noktada t henüz tam olarak hazır olmayabilir, bu yüzden doğrudan lib'den çağrı daha güvenli olabilir.
        // Ancak, t'nin fallback mekanizması zaten bunu yönetmeli.
        return (
            <div className="flex min-h-screen justify-center items-center p-4 md:p-6">
                <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-3 text-gray-600">
                    {i18nLibraryT(getTranslations(currentLocale), 'financialStatusPage.loading', 'Yükleniyor...')}
                </span>
            </div>
        );
    }

    // ANA İÇERİK RENDER EDİLMEDEN ÖNCE T'Yİ KONTROL ET
    // Bu log, `t` fonksiyonunun alt bileşenlere geçirilmeden hemen önceki durumunu gösterir.
    console.log('[FinancialStatusPage] About to render main content. typeof t:', typeof t, 'Is t a function:', typeof t === 'function', 'areTranslationsLoading:', areTranslationsLoading, 'allTranslations set:', !!allTranslations);

    if (typeof t !== 'function') {
        // Bu durum, `t`'nin `useCallback` veya state güncellemeleriyle ilgili beklenmedik bir sorun nedeniyle
        // fonksiyon olarak oluşturulmadığı anlamına gelir.
        console.error('[FinancialStatusPage] CRITICAL PRE-RENDER ERROR: `t` is NOT a function. Rendering error message.');
        return (
            <div className="bg-red-100 text-red-700 p-6 rounded-md m-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Internal Application Error</h2>
                <p>The translation service is currently unavailable. Please try refreshing the page or contact support if the issue persists.</p>
                <p className="text-sm mt-2">Details: Translation function (t) failed to initialize.</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-50">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-20"> {/* z-index artırıldı */}
                <div className="flex items-center space-x-2 bg-white p-1 rounded-md shadow">
                    <div className="text-sm">
                        <button
                            onClick={() => setCurrentLocale('tr')}
                            className={`px-2 py-1 rounded focus:outline-none transition-colors duration-200 ${currentLocale === 'tr' ? 'font-semibold text-blue-700 bg-blue-100' : 'text-gray-600 hover:text-blue-600'}`}
                            aria-pressed={currentLocale === 'tr'}
                            aria-label={t('financialStatusPage.langSwitcher.trLabel', "Türkçe Dil Seçeneği")}
                        >
                            TR
                        </button>
                        <span className="text-gray-300 mx-1" aria-hidden="true">|</span>
                        <button
                            onClick={() => setCurrentLocale('en')}
                            className={`px-2 py-1 rounded focus:outline-none transition-colors duration-200 ${currentLocale === 'en' ? 'font-semibold text-blue-700 bg-blue-100' : 'text-gray-600 hover:text-blue-600'}`}
                            aria-pressed={currentLocale === 'en'}
                            aria-label={t('financialStatusPage.langSwitcher.enLabel', "English Language Option")}
                        >
                            EN
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 pt-16 sm:pt-20 lg:pt-24 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                        {t('financialStatusPage.title', 'Finansal Durum')}
                    </h1>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <div>
                            <label htmlFor="fs-year-select" className="sr-only">
                                {t('financialStatusPage.filterLabelYear', 'Yıl Seçin')}
                            </label>
                            <select
                                id="fs-year-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                disabled={isDataLoading}
                                aria-label={t('financialStatusPage.filterLabelYear', 'Yıl Seçin')}
                            >
                                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="fs-month-select" className="sr-only">
                                {t('financialStatusPage.filterLabelMonth', 'Ay Seçin')}
                            </label>
                            <select
                                id="fs-month-select"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                disabled={isDataLoading}
                                aria-label={t('financialStatusPage.filterLabelMonth', 'Ay Seçin')}
                            >
                                {monthOptions.map(month => (
                                    <option key={month} value={month}>
                                        {new Date(selectedYear, month - 1).toLocaleString(currentLocale, { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {isDataLoading && !error && (
                    <div className="flex justify-center items-center py-10">
                        <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                        <span className="ml-3 text-gray-600">
                            {t('financialStatusPage.loading', 'Yükleniyor...')}
                        </span>
                    </div>
                )}

                {error && !isDataLoading && (
                    <div className="flex flex-col items-center text-red-600 bg-red-100 p-4 rounded-md">
                        <FiAlertTriangle className="h-8 w-8 mb-2" />
                        <p className="font-semibold">
                            {t('financialStatusPage.errorTitle', 'Bir Hata Oluştu')}
                        </p>
                        <p>{error}</p>
                    </div>
                )}

                {!isDataLoading && !error && summaryData && (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                    <FiCalendar className="mr-2 text-blue-500" />
                                    {summaryData.periodName} {t('financialStatusPage.periodSummaryTitleSuffix', 'Dönem Özeti')}
                                </h2>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">
                                        {t('financialStatusPage.totalSpendingLabel', 'Toplam Harcama')}
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 flex items-center justify-end">
                                        {summaryData.grandTotal?.toLocaleString(currentLocale, { style: 'currency', currency: 'TRY' }) || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <CategoryTotalsDisplay
                            categoryTotals={summaryData.overallCategoryTotals}
                            locale={currentLocale}
                            t={t}
                        />

                        <SpendingChart
                            categoryTotals={summaryData.overallCategoryTotals}
                            periodName={summaryData.periodName}
                            locale={currentLocale}
                            t={t}
                        />
                    </>
                )}
                {!isDataLoading && !error && !summaryData && (
                    <div className="text-center py-10 text-gray-500">
                        {t('financialStatusPage.noDataForPeriod', 'Seçili dönem için gösterilecek veri bulunmamaktadır.')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialStatusPage;