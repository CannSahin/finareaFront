// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    FiLogOut,
    FiMenu,
    FiX,
    FiTrendingUp,
    FiDollarSign,
    FiCalendar,
    // FiBarChart2, // SpendingChart içinde kullanılıyor olabilir, burada direkt değil.
    FiFilter,    // Henüz kullanılmıyor ama FinancialStatusPage'de vardı.
    FiLoader,
    FiAlertTriangle
} from 'react-icons/fi';
import Footer from "@/components/layout/Footer";
import { Locale } from "@/app/page"; // Locale tipini projenizdeki yerden import edin

// FinancialStatusPage'den taşınan tipler
interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

interface PeriodSummaryResponseDto {
    year: number;
    month: number;
    periodName: string;
    sources: any[];
    overallCategoryTotals: CategorySummaryDto[];
    grandTotal: number;
}

// FinancialStatusPage'den taşınan bileşenler
// Yolların projenizdeki gerçek konuma göre ayarlandığından emin olun.
// Varsayılan olarak, (dashboard) route group'undaki financial-status altındaki components'ten geldiğini varsayıyorum.
import SpendingChart from "@/app/dashboard/financal-status/components/SpendingChart";
import CategoryTotalsDisplay from "@/app/dashboard/financal-status/components/CategoryTotalsCard";

interface UserInfo {
    email: string | null;
}

export default function DashboardPage(): JSX.Element | null {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo>({ email: null });
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [locale, setLocale] = useState<Locale>('tr'); // Varsayılan veya alınacak locale
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true); // Sayfanın genel yükleme durumu

    // --- FinancialStatusPage'den taşınan state ve mantık BAŞLANGIÇ ---
    const [summaryData, setSummaryData] = useState<PeriodSummaryResponseDto | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

    const yearOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYear - i), [currentYear]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    const fetchFinancialSummary = useCallback(async (year: number, month: number) => {
        setIsSummaryLoading(true);
        setSummaryError(null);
        const token = localStorage.getItem('accessToken');

        // DashboardPage zaten token kontrolü yapıyor ama API çağrısı için de önemli.
        if (!token) {
            setSummaryError("Kimlik doğrulaması gerekli. Lütfen giriş yapın.");
            setIsSummaryLoading(false);
            // router.push('/login'); // Ana token kontrolü zaten bunu yapacak
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const finalApiUrl = `${API_URL}/api/v1/summaries/expenses/${year}/${month}`;

        try {
            const response = await fetch(finalApiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                setSummaryError("Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.removeItem('accessToken'); // Token'ı temizle
                localStorage.removeItem('userEmail'); // Kullanıcı bilgisini de temizle
                router.push('/login'); // Login sayfasına yönlendir
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `API Hatası: ${response.status} ${response.statusText}`);
            }
            const data: PeriodSummaryResponseDto = await response.json();
            setSummaryData(data);
        } catch (err: any) {
            console.error("Finansal özet çekilirken hata:", err);
            setSummaryError(err.message || "Veriler yüklenirken bir hata oluştu.");
            setSummaryData(null);
        } finally {
            setIsSummaryLoading(false);
        }
    }, [router]); // router'ı dependency array'e ekledik, locale'e gerek yok çünkü direkt kullanılıyor.

    useEffect(() => {
        // Sadece sayfa yüklendikten ve token doğrulandıktan sonra finansal özeti çek
        if (!isPageLoading) {
            fetchFinancialSummary(selectedYear, selectedMonth);
        }
    }, [selectedYear, selectedMonth, fetchFinancialSummary, isPageLoading]);
    // --- FinancialStatusPage'den taşınan state ve mantık SON ---

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        } else {
            const userEmail = localStorage.getItem('userEmail');
            setUserInfo({ email: userEmail || 'User' });
            setIsPageLoading(false); // Sayfa yüklemesi ve auth kontrolü bitti
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        router.push('/login');
    };

    if (isPageLoading) {
        // Genel sayfa yüklenirken (token kontrolü vs.) bir yükleyici gösterilebilir
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <FiLoader className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`absolute inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
                <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                    <Link href="/dashboard" className="flex items-center">
                        <Image src="/images/logoo.png" alt="FinArea Logo" width={60} height={60} />
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
                        <FiX className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">

                    {/* Bu link artık bu sayfanın kendisi olduğu için /dashboard'a gidebilir veya farklı bir stil alabilir. Şimdilik aynı. */}
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md bg-gray-700"> {/* Aktif sayfa stili */}
                        <FiDollarSign className="mr-3 h-5 w-5" />
                        Finansal Durum
                    </Link>
                    <Link href="/dashboard/transactions" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                        <FiTrendingUp className="mr-3 h-5 w-5" />
                        Finans Hareketleri
                    </Link>
                </nav>
                <div className="px-2 py-4 mt-auto border-t border-gray-700">
                    <p className="px-4 text-xs text-gray-400 truncate mb-2">{userInfo.email}</p>
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-700 hover:text-white rounded-md">
                        <FiLogOut className="mr-3 h-5 w-5" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Ana İçerik Alanı */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
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

                {/* Asıl Sayfa İçeriği - FinancialStatusPage'den gelen içerik */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {/* FinancialStatusPage'in dış div'indeki padding (p-4 md:p-6) kaldırıldı, main'in p-6'sı kullanılıyor. space-y-6 kalsın. */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6"> {/* Bu mb-6, aşağıdaki space-y-6 ile birleşebilir, ama şimdilik kalsın */}
                            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Finansal Durum</h1>
                            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                <div>
                                    <label htmlFor="fs-year-select" className="sr-only">Yıl</label>
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
                                    <label htmlFor="fs-month-select" className="sr-only">Ay</label>
                                    <select
                                        id="fs-month-select"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        disabled={isSummaryLoading}
                                    >
                                        {monthOptions.map(month => (
                                            <option key={month} value={month}>
                                                {new Date(selectedYear, month - 1).toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* <FiFilter className="h-5 w-5 text-gray-500 ml-2" /> İkon filtre butonu için düşünülebilir */}
                            </div>
                        </div>

                        {isSummaryLoading && (
                            <div className="flex justify-center items-center py-10">
                                <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                                <span className="ml-3 text-gray-600">Finansal Özet Yükleniyor...</span>
                            </div>
                        )}

                        {summaryError && !isSummaryLoading && (
                            <div className="flex flex-col items-center text-red-600 bg-red-100 p-4 rounded-md">
                                <FiAlertTriangle className="h-8 w-8 mb-2" />
                                <p className="font-semibold">Bir hata oluştu:</p>
                                <p>{summaryError}</p>
                            </div>
                        )}

                        {!isSummaryLoading && !summaryError && summaryData && (
                            <>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                            <FiCalendar className="mr-2 text-blue-500" />
                                            {summaryData.periodName} Özeti
                                        </h2>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Toplam Harcama</p>
                                            <p className="text-2xl font-bold text-red-600 flex items-center justify-end">
                                                <FiDollarSign className="mr-1"/>
                                                {summaryData.grandTotal?.toLocaleString(locale, { style: 'currency', currency: 'TRY' }) || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <CategoryTotalsDisplay
                                    categoryTotals={summaryData.overallCategoryTotals}
                                    locale={locale}
                                />

                                <SpendingChart
                                    categoryTotals={summaryData.overallCategoryTotals}
                                    periodName={summaryData.periodName}
                                    locale={locale}
                                />
                            </>
                        )}
                        {!isSummaryLoading && !summaryError && !summaryData && (
                            <div className="text-center py-10 text-gray-500">
                                Seçili dönem için gösterilecek finansal veri bulunamadı.
                            </div>
                        )}
                    </div>
                </main>
                <Footer locale={locale}  variant="dashboard"/>
            </div>
        </div>
    );
}