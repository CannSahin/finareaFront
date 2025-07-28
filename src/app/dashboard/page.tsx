// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiLogOut, FiMenu, FiX, FiTrendingUp, FiDollarSign, FiCalendar,
    FiLoader, FiAlertTriangle, FiTarget
} from 'react-icons/fi';
import Footer from "@/components/layout/Footer";
import { getTranslations, t as i18nLibraryT, TranslationData } from '@/lib/i18n';

// --- Tipler ---
interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

interface PeriodSummaryResponseDtoShared {
    year: number;
    month: number;
    periodName: string;
    sources: any[]; // Bu tipin detayı backend'den geldiği gibi kullanılabilir
    overallCategoryTotals: CategorySummaryDto[];
    grandTotal: number;
}

// Component importları
import CategoryTotalsDisplay from "@/app/dashboard/financal-status/components/CategoryTotalsCard";
import SpendingChart from "@/app/dashboard/financal-status/components/SpendingChart";
import TransactionsList from "@/app/dashboard/transactions/TransactionsList";
import SavingsAdvisorPage from '@/app/dashboard/savings-advisor/page';

interface UserInfo {
    email: string | null;
}

type DashboardView = 'financialStatus' | 'transactions' | 'savingsAdvisor';
type SupportedLocale = 'tr' | 'en';

export default function DashboardPage(): JSX.Element | null {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo>({ email: null });
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
    const [activeView, setActiveView] = useState<DashboardView>('financialStatus');

    const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('tr'); // Varsayılan dil
    const [allTranslations, setAllTranslations] = useState<TranslationData | null>(null);
    const [areTranslationsLoading, setAreTranslationsLoading] = useState<boolean>(true);

    useEffect(() => {
        setAreTranslationsLoading(true);
        const newTranslations = getTranslations(currentLocale);
        setAllTranslations(newTranslations);
        setAreTranslationsLoading(false);
    }, [currentLocale]);

    const t = useCallback((fullKey: string, fallback?: any): string => {
        if (areTranslationsLoading || !allTranslations) {
            return fallback || fullKey; // Yüklenirken veya çeviri yoksa fallback göster
        }
        return i18nLibraryT(allTranslations, fullKey, fallback || fullKey);
    }, [allTranslations, areTranslationsLoading]);

    const [summaryData, setSummaryData] = useState<PeriodSummaryResponseDtoShared | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // JavaScript ayları 0'dan başlar
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

    const yearOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYear - i), [currentYear]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    const fetchFinancialSummary = useCallback(async (year: number, month: number) => {
        if (areTranslationsLoading) { // Çeviriler yüklenmeden API çağrısı yapma
            return;
        }
        setIsSummaryLoading(true);
        setSummaryError(null);
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setSummaryError(t('financialStatusPage.authRequiredError', "Kimlik doğrulaması gerekli."));
            setIsSummaryLoading(false);
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
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userEmail');
                setSummaryError(t('financialStatusPage.sessionExpiredError', "Oturum süresi dolmuş."));
                router.push('/login');
                return;
            }
            if (!response.ok) {
                const apiErrorPrefix = t('financialStatusPage.apiErrorPrefix', "API Hatası:");
                throw new Error(`${apiErrorPrefix} ${response.status}`);
            }
            const data: PeriodSummaryResponseDtoShared = await response.json();
            setSummaryData(data);
        } catch (err: any) {
            setSummaryError(err.message || t('financialStatusPage.dataLoadError', "Veriler yüklenirken bir hata oluştu."));
            setSummaryData(null);
        } finally {
            setIsSummaryLoading(false);
        }
    }, [router, t, areTranslationsLoading]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        } else {
            const userEmail = localStorage.getItem('userEmail');
            setUserInfo({ email: userEmail || 'User' }); // 'User' bir fallback olabilir
        }
    }, [router]);

    useEffect(() => {
        if (!areTranslationsLoading && localStorage.getItem('accessToken')) {
            setIsPageLoading(false);
        } else if (!localStorage.getItem('accessToken')) {
            router.push('/login'); // Token yoksa ve çeviriler yüklendiyse login'e yönlendir
        }
    }, [areTranslationsLoading, router]);


    useEffect(() => {
        // Sadece sayfa ve çeviriler yüklendikten sonra ve aktif view financialStatus ise veri çek
        if (!isPageLoading && !areTranslationsLoading && activeView === 'financialStatus') {
            fetchFinancialSummary(selectedYear, selectedMonth);
        }
    }, [selectedYear, selectedMonth, fetchFinancialSummary, isPageLoading, areTranslationsLoading, activeView]);


    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        router.push('/login');
    };

    if (areTranslationsLoading || isPageLoading) {
        // İlk yüklemede hangi dilin seçili olduğuna bağlı olarak bir çeviri göster
        const initialTranslations = getTranslations(currentLocale);
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <FiLoader className="animate-spin h-12 w-12 text-blue-600" />
                <span className="ml-3 text-gray-700">
                    {i18nLibraryT(initialTranslations, 'financialStatusPage.loading', 'Yükleniyor...')}
                </span>
            </div>
        );
    }

    const renderActiveView = () => {
        // t fonksiyonunun yüklenip yüklenmediğini kontrol etmeye gerek yok, areTranslationsLoading ile kontrol ediliyor.
        switch (activeView) {
            case 'financialStatus':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                                {/* Ana başlık için `financialStatusPage.title` kullanıyoruz */}
                                {t('financialStatusPage.title', 'Financial Status')}
                            </h1>
                            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                <div>
                                    <label htmlFor="fs-year-select" className="sr-only">{t('financialStatusPage.filterLabelYear', 'Yıl')}</label>
                                    <select
                                        id="fs-year-select"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        disabled={isSummaryLoading}
                                    >
                                        {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="fs-month-select" className="sr-only">{t('financialStatusPage.filterLabelMonth', 'Ay')}</label>
                                    <select
                                        id="fs-month-select"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        disabled={isSummaryLoading}
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

                        {isSummaryLoading && (
                            <div className="flex justify-center items-center py-10">
                                <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                                <span className="ml-3 text-gray-600">{t('financialStatusPage.loading', 'Yükleniyor...')}</span>
                            </div>
                        )}

                        {summaryError && !isSummaryLoading && (
                            <div className="flex flex-col items-center text-red-600 bg-red-100 p-4 rounded-md">
                                <FiAlertTriangle className="h-8 w-8 mb-2" />
                                <p className="font-semibold">{t('financialStatusPage.errorTitle', 'Bir hata oluştu:')}</p>
                                <p>{summaryError}</p>
                            </div>
                        )}

                        {!isSummaryLoading && !summaryError && summaryData && (
                            <>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                            <FiCalendar className="mr-2 text-blue-500" />
                                            {summaryData.periodName} {t('financialStatusPage.periodSummaryTitleSuffix', 'Özeti')}
                                        </h2>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">{t('financialStatusPage.totalSpendingLabel', 'Toplam Harcama')}</p>
                                            <p className="text-2xl font-bold text-red-600 flex items-center justify-end">
                                                {summaryData.grandTotal?.toLocaleString(currentLocale, { style: 'currency', currency: 'TRY' }) || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <CategoryTotalsDisplay categoryTotals={summaryData.overallCategoryTotals} locale={currentLocale} t={t} />
                                <SpendingChart categoryTotals={summaryData.overallCategoryTotals} periodName={summaryData.periodName} locale={currentLocale} t={t} />
                            </>
                        )}
                        {!isSummaryLoading && !summaryError && !summaryData && (
                            <div className="text-center py-10 text-gray-500">
                                {t('financialStatusPage.noDataForPeriod', 'Seçili dönem için gösterilecek finansal veri bulunamadı.')}
                            </div>
                        )}
                    </div>
                );
            case 'transactions':
                return (
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                            {/* JSON yapınıza göre: financialStatusPage.dashboard.sidebar.transactions */}
                            {t('financialStatusPage.dashboard.sidebar.transactions', 'Finans Hareketleri')}
                        </h1>
                        <TransactionsList locale={currentLocale} t={t} />
                    </div>
                );
            case 'savingsAdvisor':
                return (
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                            {/* JSON yapınıza göre: financialStatusPage.dashboard.sidebar.savingsAdvisor */}
                            {t('financialStatusPage.dashboard.sidebar.savingsAdvisor', 'Tasarruf Danışmanı')}
                        </h1>
                        <SavingsAdvisorPage locale={currentLocale} t={t} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`absolute inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
                <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                    <button onClick={() => router.push('/dashboard')} className="flex items-center">
                        <Image src="/images/logoo.png" alt={t('hero.imageAlt', "FinArea Logosu")} width={60} height={60} />
                    </button>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
                        <FiX className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <button
                        onClick={() => setActiveView('financialStatus')}
                        className={`flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${activeView === 'financialStatus' ? 'bg-gray-700 text-white' : ''}`}
                    >
                        <FiDollarSign className="mr-3 h-5 w-5" />
                        {/* JSON yapınıza göre: financialStatusPage.dashboard.sidebar.financialStatus */}
                        {t('financialStatusPage.dashboard.sidebar.financialStatus', 'Financial Status')}
                    </button>
                    <button
                        onClick={() => setActiveView('transactions')}
                        className={`flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${activeView === 'transactions' ? 'bg-gray-700 text-white' : ''}`}
                    >
                        <FiTrendingUp className="mr-3 h-5 w-5" />
                        {/* JSON yapınıza göre: financialStatusPage.dashboard.sidebar.transactions */}
                        {t('financialStatusPage.dashboard.sidebar.transactions', 'Finans Hareketleri')}
                    </button>
                    <button
                        onClick={() => setActiveView('savingsAdvisor')}
                        className={`flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${activeView === 'savingsAdvisor' ? 'bg-gray-700 text-white' : ''}`}
                    >
                        <FiTarget className="mr-3 h-5 w-5" />
                        {/* JSON yapınıza göre: financialStatusPage.dashboard.sidebar.savingsAdvisor */}
                        {t('financialStatusPage.dashboard.sidebar.savingsAdvisor', 'Tasarruf Danışmanı')}
                    </button>
                </nav>
                <div className="px-4 py-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400 truncate mb-2">
                        {/* JSON yapınıza göre: financialStatusPage.dashboard.sidebar.languageLabel */}
                        {t('financialStatusPage.dashboard.sidebar.languageLabel', 'Language')}:
                    </p>
                    <div className="flex space-x-2 justify-center">
                        <button
                            onClick={() => setCurrentLocale('tr')}
                            className={`px-3 py-1 text-xs rounded-md ${currentLocale === 'tr' ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
                        >
                            TR
                        </button>
                        <button
                            onClick={() => setCurrentLocale('en')}
                            className={`px-3 py-1 text-xs rounded-md ${currentLocale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>
                <div className="px-2 py-4 mt-auto border-t border-gray-700">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-700 hover:text-white rounded-md">
                        <FiLogOut className="mr-3 h-5 w-5" />
                        {/* JSON yapınıza göre: financialStatusPage.dashboard.sidebar.logout */}
                        {t('financialStatusPage.dashboard.sidebar.logout', 'Çıkış Yap')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                        <FiMenu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-3 lg:hidden">{userInfo.email}</span>
                        <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                            {/* Mobil headerdaki logout butonu için de çeviri kullanılabilir */}
                            <FiLogOut className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderActiveView()}
                </main>
                <Footer locale={currentLocale} t={t} variant="dashboard" />
            </div>
        </div>
    );
}