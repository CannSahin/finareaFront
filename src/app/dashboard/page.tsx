// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Link'i kullanacağız ama sayfa içi render için doğrudan state değişimine odaklanacağız.
import Image from 'next/image';
import {
    FiLogOut,
    FiMenu,
    FiX,
    FiTrendingUp,
    FiDollarSign,
    FiCalendar,
    FiLoader,
    FiAlertTriangle,
    FiPlusSquare, // Manuel Ekle ikonu
    FiUploadCloud // Ekstre Yükle ikonu
} from 'react-icons/fi';
import Footer from "@/components/layout/Footer";
import { Locale } from "@/app/page";

// --- FinancialStatusPage'den taşınan tipler ve bileşenler ---
interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

interface PeriodSummaryResponseDtoFS { // Financial Status için olan DTO
    year: number;
    month: number;
    periodName: string;
    sources: any[]; // Bu sayfada direkt kullanılmayacak ama DTO'nun bir parçası
    overallCategoryTotals: CategorySummaryDto[];
    grandTotal: number;
}

// --- FinancialStatusPage Sonu ---


// --- TransactionsList'ten (Finans Hareketleri) gelen tipler ve mantık için alan ---
// TransactionsList'in kendi içindeki DTO'ları kullanacağız.
// TransactionsPage'i import etmeyeceğiz, onun yerine TransactionsList componentini direkt kullanacağız.
import CategoryTotalsDisplay from "@/app/dashboard/financal-status/components/CategoryTotalsCard";
import SpendingChart from "@/app/dashboard/financal-status/components/SpendingChart";
import TransactionsList from "@/app/dashboard/transactions/TransactionsList"; // TransactionsList bileşeninin doğru yolu

interface UserInfo {
    email: string | null;
}

// Hangi içeriğin gösterileceğini belirleyen tip
type DashboardView = 'financialStatus' | 'transactions';

export default function DashboardPage(): JSX.Element | null {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo>({ email: null });
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [locale, setLocale] = useState<Locale>('tr');
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

    // --- Aktif görünümü tutacak state ---
    const [activeView, setActiveView] = useState<DashboardView>('financialStatus'); // Varsayılan olarak finansal durumu göster

    // --- FinancialStatusPage State ve Mantığı BAŞLANGIÇ ---
    const [summaryDataFS, setSummaryDataFS] = useState<PeriodSummaryResponseDtoFS | null>(null);
    const [isSummaryLoadingFS, setIsSummaryLoadingFS] = useState<boolean>(false); // Financial Status için ayrı loading
    const [summaryErrorFS, setSummaryErrorFS] = useState<string | null>(null); // Financial Status için ayrı error

    const currentYearFS = new Date().getFullYear();
    const currentMonthFS = new Date().getMonth() + 1;
    const [selectedYearFS, setSelectedYearFS] = useState<number>(currentYearFS);
    const [selectedMonthFS, setSelectedMonthFS] = useState<number>(currentMonthFS);

    const yearOptionsFS = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYearFS - i), [currentYearFS]);
    const monthOptionsFS = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    const fetchFinancialSummary = useCallback(async (year: number, month: number) => {
        setIsSummaryLoadingFS(true);
        setSummaryErrorFS(null);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Ana yükleme zaten yönlendirme yapar, burada sadece API çağrısını durduruyoruz
            setSummaryErrorFS("Kimlik doğrulaması gerekli.");
            setIsSummaryLoadingFS(false);
            router.push('/login'); // Ekstra güvenlik
            return;
        }
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const finalApiUrl = `${API_URL}/api/v1/summaries/expenses/${year}/${month}`;

        try {
            const response = await fetch(finalApiUrl, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (response.status === 401) {
                localStorage.removeItem('accessToken'); localStorage.removeItem('userEmail');
                router.push('/login'); return;
            }
            if (!response.ok) throw new Error(`API Hatası: ${response.status}`);
            const data: PeriodSummaryResponseDtoFS = await response.json();
            setSummaryDataFS(data);
        } catch (err: any) {
            setSummaryErrorFS(err.message || "Veriler yüklenirken bir hata oluştu.");
            setSummaryDataFS(null);
        } finally {
            setIsSummaryLoadingFS(false);
        }
    }, [router]);

    useEffect(() => {
        if (!isPageLoading && activeView === 'financialStatus') {
            fetchFinancialSummary(selectedYearFS, selectedMonthFS);
        }
    }, [selectedYearFS, selectedMonthFS, fetchFinancialSummary, isPageLoading, activeView]);
    // --- FinancialStatusPage State ve Mantığı SON ---


    // --- TransactionsList (Finans Hareketleri) için state veya effect'ler burada olabilir ---
    // TransactionsList kendi içinde veri çekme mantığına sahip olduğu için burada ek bir state'e şimdilik gerek yok.
    // Eğer TransactionsList'i bu sayfadan tetiklemek gerekirse (örneğin yıl/ay filtreleri ortaksa), o zaman buraya da state'ler eklenebilir.

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        } else {
            const userEmail = localStorage.getItem('userEmail');
            setUserInfo({ email: userEmail || 'User' });
            setIsPageLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        router.push('/login');
    };

    if (isPageLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <FiLoader className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    const renderActiveView = () => {
        switch (activeView) {
            case 'financialStatus':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Finansal Durum</h1>
                            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                <div>
                                    <label htmlFor="fs-year-select" className="sr-only">Yıl</label>
                                    <select
                                        id="fs-year-select"
                                        value={selectedYearFS}
                                        onChange={(e) => setSelectedYearFS(parseInt(e.target.value, 10))}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        disabled={isSummaryLoadingFS}
                                    >
                                        {yearOptionsFS.map(year => <option key={year} value={year}>{year}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="fs-month-select" className="sr-only">Ay</label>
                                    <select
                                        id="fs-month-select"
                                        value={selectedMonthFS}
                                        onChange={(e) => setSelectedMonthFS(parseInt(e.target.value, 10))}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        disabled={isSummaryLoadingFS}
                                    >
                                        {monthOptionsFS.map(month => (
                                            <option key={month} value={month}>
                                                {new Date(selectedYearFS, month - 1).toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isSummaryLoadingFS && (
                            <div className="flex justify-center items-center py-10">
                                <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                                <span className="ml-3 text-gray-600">Finansal Özet Yükleniyor...</span>
                            </div>
                        )}

                        {summaryErrorFS && !isSummaryLoadingFS && (
                            <div className="flex flex-col items-center text-red-600 bg-red-100 p-4 rounded-md">
                                <FiAlertTriangle className="h-8 w-8 mb-2" />
                                <p className="font-semibold">Bir hata oluştu:</p>
                                <p>{summaryErrorFS}</p>
                            </div>
                        )}

                        {!isSummaryLoadingFS && !summaryErrorFS && summaryDataFS && (
                            <>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                            <FiCalendar className="mr-2 text-blue-500" />
                                            {summaryDataFS.periodName} Özeti
                                        </h2>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Toplam Harcama</p>
                                            <p className="text-2xl font-bold text-red-600 flex items-center justify-end">
                                                <FiDollarSign className="mr-1"/>
                                                {summaryDataFS.grandTotal?.toLocaleString(locale, { style: 'currency', currency: 'TRY' }) || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <CategoryTotalsDisplay categoryTotals={summaryDataFS.overallCategoryTotals} locale={locale} />
                                <SpendingChart categoryTotals={summaryDataFS.overallCategoryTotals} periodName={summaryDataFS.periodName} locale={locale} />
                            </>
                        )}
                        {!isSummaryLoadingFS && !summaryErrorFS && !summaryDataFS && (
                            <div className="text-center py-10 text-gray-500">
                                Seçili dönem için gösterilecek finansal veri bulunamadı.
                            </div>
                        )}
                    </div>
                );
            case 'transactions':
                return (
                    // TransactionsPage'in içeriği buraya gelecek, TransactionsList'i çağıracağız
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">Finans Hareketleri Özeti</h1>
                        {/* TransactionsList componentini burada çağırıyoruz */}
                        <TransactionsList locale={locale} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className={`absolute inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
                <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                    <button onClick={() => router.push('/dashboard')} className="flex items-center"> {/* Link yerine button + router.push */}
                        <Image src="/images/logoo.png" alt="FinArea Logo" width={60} height={60} />
                    </button>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
                        <FiX className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <button
                        onClick={() => setActiveView('financialStatus')}
                        className={`flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${activeView === 'financialStatus' ? 'bg-gray-700 text-white' : ''}`}
                    >
                        <FiDollarSign className="mr-3 h-5 w-5" />
                        Finansal Durum
                    </button>
                    <button
                        onClick={() => setActiveView('transactions')}
                        className={`flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${activeView === 'transactions' ? 'bg-gray-700 text-white' : ''}`}
                    >
                        <FiTrendingUp className="mr-3 h-5 w-5" />
                        Finans Hareketleri
                    </button>

                </nav>
                <div className="px-2 py-4 mt-auto border-t border-gray-700">
                    <p className="px-4 text-xs text-gray-400 truncate mb-2">{userInfo.email}</p>
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-700 hover:text-white rounded-md">
                        <FiLogOut className="mr-3 h-5 w-5" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                        <FiMenu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-3 lg:hidden">{userInfo.email}</span>
                        <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                            <FiLogOut className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderActiveView()}
                </main>
                <Footer locale={locale} variant="dashboard" />
            </div>
        </div>
    );
}