// app/(dashboard)/financial-status/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiBarChart2, FiDollarSign, FiFilter, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import CategoryTotalsDisplay from './components/CategoryTotalsCard'; // Yeni bileşen
import SpendingChart from './components/SpendingChart';          // Yeni bileşen

// Tipler (Backend DTO'ları ile uyumlu)
interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

interface PeriodSummaryResponseDto {
    year: number;
    month: number;
    periodName: string;
    sources: any[]; // Bu sayfada direkt kullanılmayacak ama DTO'nun bir parçası
    overallCategoryTotals: CategorySummaryDto[];
    grandTotal: number;
}

type Locale = 'tr' | 'en'; // Projenizdeki locale tipiniz

const FinancialStatusPage = () => {
    const router = useRouter();
    const [summaryData, setSummaryData] = useState<PeriodSummaryResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

    const locale: Locale = 'tr'; // Veya i18n'den alın

    const yearOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYear - i), [currentYear]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    const fetchFinancialSummary = useCallback(async (year: number, month: number) => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setError("Kimlik doğrulaması gerekli. Lütfen giriş yapın.");
            setIsLoading(false);
            router.push('/login');
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        // Bu endpoint, PeriodSummaryResponseDto döndüren backend endpoint'iniz olmalı
        const finalApiUrl = `${API_URL}/api/v1/summaries/expenses/${year}/${month}`;

        try {
            const response = await fetch(finalApiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                setError("Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.removeItem('accessToken');
                router.push('/login');
                return;
            }
            if (!response.ok) {
                throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
            }
            const data: PeriodSummaryResponseDto = await response.json();
            setSummaryData(data);
        } catch (err: any) {
            console.error("Finansal özet çekilirken hata:", err);
            setError(err.message || "Veriler yüklenirken bir hata oluştu.");
            setSummaryData(null);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchFinancialSummary(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchFinancialSummary]);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Finansal Durum</h1>
                {/* Yıl ve Ay Filtreleri */}
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <div>
                        <label htmlFor="fs-year-select" className="sr-only">Yıl</label>
                        <select
                            id="fs-year-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={isLoading}
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
                            disabled={isLoading}
                        >
                            {monthOptions.map(month => (
                                <option key={month} value={month}>
                                    {new Date(selectedYear, month - 1).toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                    <span className="ml-3 text-gray-600">Yükleniyor...</span>
                </div>
            )}

            {error && !isLoading && (
                <div className="flex flex-col items-center text-red-600 bg-red-100 p-4 rounded-md">
                    <FiAlertTriangle className="h-8 w-8 mb-2" />
                    <p className="font-semibold">Bir hata oluştu:</p>
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && summaryData && (
                <>
                    {/* Dönem Bilgisi ve Genel Toplam Kartı */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
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

                    {/* Kategori Bazında Toplamlar */}
                    <CategoryTotalsDisplay
                        categoryTotals={summaryData.overallCategoryTotals}
                        locale={locale}
                    />

                    {/* Harcama Grafiği */}
                    <SpendingChart
                        categoryTotals={summaryData.overallCategoryTotals}
                        periodName={summaryData.periodName}
                        locale={locale}
                    />
                </>
            )}
            {!isLoading && !error && !summaryData && (
                <div className="text-center py-10 text-gray-500">
                    Seçili dönem için gösterilecek finansal veri bulunamadı.
                </div>
            )}
        </div>
    );
};

export default FinancialStatusPage;