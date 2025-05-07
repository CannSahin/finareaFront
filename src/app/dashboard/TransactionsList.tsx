'use client';

import React, { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader, FiAlertTriangle, FiDollarSign, FiCalendar, FiArchive, FiGrid } from 'react-icons/fi';

// --- Tipler (Backend DTO'larına göre güncellendi) ---
type Locale = 'tr' | 'en';

interface CategorySummaryDto { // Backend'den gelen
    categoryName: string; // categoryNameTr veya categoryNameEn olabilir, backend'den tek bir isim gelmeli
    totalAmount: number; // BigDecimal backend'den number olarak gelir
}

interface SourceSummaryDto { // Backend'den gelen
    sourceName: string;
    categorySummaries: CategorySummaryDto[];
}

interface PeriodSummaryResponseDto { // Backend'den gelen
    year: number;
    month: number;
    periodName: string;
    sources: SourceSummaryDto[];
    overallCategoryTotals: CategorySummaryDto[];
    grandTotal: number; // BigDecimal backend'den number olarak gelir
}
// --- Tipler Sonu ---


// --- Sabit Kategoriler (Filtreleme için hala kullanılabilir) ---
const ALL_CATEGORIES_ID = 0;
interface CategoryFilterItem { // Filtre için ayrı tip
    id: number;
    nameTr: string;
    nameEn: string;
}
const categoriesForFilter: CategoryFilterItem[] = [
    { id: ALL_CATEGORIES_ID, nameTr: 'Tüm Kategoriler', nameEn: 'All Categories' },
    { id: 1, nameTr: 'Market / Gıda', nameEn: 'Groceries / Food' },
    { id: 2, nameTr: 'Yeme İçme / Restoran', nameEn: 'Dining / Restaurant' },
    // ... diğer kategori filtre seçenekleriniz
];
// --- Sabit Kategoriler Sonu ---


// --- Yardımcı Fonksiyonlar ---
const formatCurrency = (amount: number | undefined | null, currency: string = 'TRY'): string => {
    if (amount === undefined || amount === null) {
        return '-';
    }
    try {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (e) {
        console.error("Para formatlama hatası:", amount, currency, e);
        return `${amount.toFixed(2)} ${currency}`;
    }
};
// --- Yardımcı Fonksiyonlar Sonu ---


interface TransactionsListProps {
    locale: Locale;
}

export default function TransactionsList({ locale }: TransactionsListProps): JSX.Element {
    const router = useRouter();
    const [summaryData, setSummaryData] = useState<PeriodSummaryResponseDto | null>(null); // <<< DEĞİŞTİ
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    // const [selectedCategoryId, setSelectedCategoryId] = useState<number>(ALL_CATEGORIES_ID); // Bu filtre artık direkt API'ye gitmiyor, frontend'de kullanılabilir

    const yearOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYear - i), [currentYear]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    const fetchSummaryData = useCallback(async (year: number, month: number) => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError("Kimlik doğrulaması gerekli. Lütfen giriş yapın.");
            setIsLoading(false);
            router.push('/login');
            return;
        }

        const params = new URLSearchParams(); // Kategori ID query'den kaldırıldı, summary DTO'sunda var
        // Backend controller'ında categoryId query parametresi varsa ona göre ayarlanmalı

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        // Backend controller'ınızdaki doğru path'i kullanın
        // Önceki örneklerde /api/v1/summaries/expenses/{year}/{month} vardı
        const finalApiUrl = `${API_URL}/api/v1/summaries/expenses/${year}/${month}?${params.toString()}`;

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
                localStorage.removeItem('userEmail');
                router.push('/login');
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                let errorMsg = `API Hatası: ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.json();
                    errorMsg = errorBody.message || errorMsg;
                } catch (e) { /* ignore */ }
                throw new Error(errorMsg);
            }

            const data: PeriodSummaryResponseDto = await response.json(); // <<< DEĞİŞTİ
            setSummaryData(data); // <<< DEĞİŞTİ

        } catch (err: any) {
            console.error("Özet verisi çekilirken hata:", err);
            setError(err.message || "Özet verisi yüklenirken bir hata oluştu.");
            setSummaryData(null); // <<< DEĞİŞTİ
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchSummaryData(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchSummaryData]);

    const allCategoryNamesInPeriod = useMemo(() => {
        // summaryData null veya undefined ise boş dizi dön, hata verme
        if (!summaryData || !summaryData.sources) return [];
        const categorySet = new Set<string>();
        summaryData.sources.forEach(source => {
            source.categorySummaries.forEach(catSum => {
                categorySet.add(catSum.categoryName);
            });
        });
        return Array.from(categorySet).sort();
    }, [summaryData]);

    const getCategoryNameForFilter = (cat: CategoryFilterItem): string => {
        return locale === 'en' ? cat.nameEn : cat.nameTr;
    };


    // --- Render Bölümü ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-3 text-gray-600">Veriler yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center py-10 text-red-600 bg-red-50 p-4 rounded border border-red-200">
                <FiAlertTriangle className="h-8 w-8 mb-2" />
                <span className="text-lg font-semibold">Bir Hata Oluştu</span>
                <span>{error}</span>
            </div>
        );
    }

    if (!summaryData || !summaryData.sources || summaryData.sources.length === 0) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                {/* Filtreleme Alanı (veri olmasa da gösterilebilir) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                    <div>
                        <label htmlFor="tx-year-select" className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                        <select
                            id="tx-year-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="tx-month-select" className="block text-sm font-medium text-gray-700 mb-1">Ay</label>
                        <select
                            id="tx-month-select"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            {monthOptions.map(month => (
                                <option key={month} value={month}>
                                    {new Date(selectedYear, month - 1).toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="text-center py-10 text-gray-500">
                    Seçili dönem için gösterilecek veri bulunamadı.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            {/* Filtreleme Alanı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                <div>
                    <label htmlFor="tx-year-select" className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                    <select
                        id="tx-year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="tx-month-select" className="block text-sm font-medium text-gray-700 mb-1">Ay</label>
                    <select
                        id="tx-month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        {monthOptions.map(month => (
                            <option key={month} value={month}>
                                {new Date(selectedYear, month - 1).toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Özet Bilgiler */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
                    <FiCalendar className="mr-2" /> Dönem Özeti: {summaryData.periodName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded shadow">
                        <p className="text-sm text-gray-500">Toplam Kaynak Sayısı</p>
                        <p className="text-2xl font-bold text-blue-600 flex items-center">
                            <FiArchive className="mr-2" /> {summaryData.sources.length}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded shadow">
                        <p className="text-sm text-gray-500">Toplam Kategori Sayısı (Dönemde)</p>
                        <p className="text-2xl font-bold text-blue-600 flex items-center">
                            <FiGrid className="mr-2" /> {allCategoryNamesInPeriod.length}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded shadow">
                        <p className="text-sm text-gray-500">Dönem Toplam Harcaması</p>
                        <p className="text-2xl font-bold text-red-600 flex items-center">
                            <FiDollarSign className="mr-2" /> {formatCurrency(summaryData.grandTotal)}
                        </p>
                    </div>
                </div>
            </div>


            {/* Excel Benzeri Tablo */}
            <h3 className="text-lg font-medium text-gray-800 mb-3">Harcama Detayları (Kaynak Bazında)</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead className="bg-gray-100">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">
                            Kaynak (Belge Türü)
                        </th>
                        {allCategoryNamesInPeriod.map(catName => (
                            <th key={catName} scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">
                                {catName}
                            </th>
                        ))}
                        <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-200">
                            Kaynak Toplamı
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {summaryData.sources.map((source, sourceIdx) => {
                        const sourceTotal = source.categorySummaries.reduce((sum, cs) => sum + cs.totalAmount, 0);
                        return (
                            <tr key={source.sourceName + sourceIdx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 border-r">
                                    {source.sourceName}
                                </td>
                                {allCategoryNamesInPeriod.map(catName => {
                                    const catSummary = source.categorySummaries.find(cs => cs.categoryName === catName);
                                    return (
                                        <td key={catName} className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 border-r">
                                            {catSummary ? formatCurrency(catSummary.totalAmount) : formatCurrency(0)}
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-800 bg-gray-100">
                                    {formatCurrency(sourceTotal)}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                    {/* Kategori Bazında Genel Toplamlar Satırı */}
                    <tfoot className="bg-gray-200 border-t-2 border-gray-400">
                    <tr>
                        <td className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-r">
                            KATEGORİ TOPLAMLARI
                        </td>
                        {allCategoryNamesInPeriod.map(catName => {
                            const overallCat = summaryData.overallCategoryTotals.find(oct => oct.categoryName === catName);
                            return (
                                <td key={catName} className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-700 border-r">
                                    {overallCat ? formatCurrency(overallCat.totalAmount) : formatCurrency(0)}
                                </td>
                            );
                        })}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-extrabold text-red-700 bg-gray-300">
                            {formatCurrency(summaryData.grandTotal)}
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>

            {/* Opsiyonel: Kategori Bazında Genel Toplamları Ayrı Bir Kartta Gösterme */}
            <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-medium text-indigo-700 mb-3">Kategori Bazında Genel Harcama Toplamları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {summaryData.overallCategoryTotals.sort((a,b) => b.totalAmount - a.totalAmount).map(catTotal => ( // En çok harcanandan en aza
                        <div key={catTotal.categoryName} className="p-3 bg-white rounded shadow">
                            <p className="text-sm font-semibold text-indigo-600 truncate" title={catTotal.categoryName}>
                                {catTotal.categoryName}
                            </p>
                            <p className="text-lg font-bold text-gray-800">
                                {formatCurrency(catTotal.totalAmount)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}