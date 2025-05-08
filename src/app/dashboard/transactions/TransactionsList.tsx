'use client';

import React, { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader, FiAlertTriangle, FiCalendar, FiArchive, FiGrid, FiPlusSquare, FiUploadCloud } from 'react-icons/fi';
import ManualTransactionModal from './ManualTransactionModal'; // Modal importu

// --- Tipler (Mevcut Tipleriniz) ---
type Locale = 'tr' | 'en';

interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

interface SourceSummaryDto {
    sourceName: string;
    categorySummaries: CategorySummaryDto[];
}

interface PeriodSummaryResponseDto {
    year: number;
    month: number;
    periodName: string;
    sources: SourceSummaryDto[];
    overallCategoryTotals: CategorySummaryDto[];
    grandTotal: number;
}

// Modal için gerekli DTO'yu ve kategori tipini burada (veya modal dosyasında) tanımlayalım
interface CategoryForModal { // Bu tip TransactionsList içinde kullanılacak
    id: number; // Backend Category ID'si
    name: string; // Locale'e göre gösterilecek isim
}

interface ManualTransactionRequestDtoForModal { // Bu tip TransactionsList içinde kullanılacak
    year: number;
    month: number;
    categoryId: number;
    description: string;
    amount: number;
}
// --- Tipler Sonu ---

// --- Yardımcı Fonksiyonlar (Mevcut) ---
const formatCurrency = (amount: number | undefined | null, currency: string = 'TRY'): string => {
    if (amount === undefined || amount === null) return '-';
    try {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(amount);
    } catch (e) {
        return `${(amount || 0).toFixed(2)} ${currency}`;
    }
};
// --- Yardımcı Fonksiyonlar Sonu ---

interface TransactionsListProps {
    locale: Locale;
}

// KATEGORİLERİ BURADA SABİT OLARAK TANIMLAYALIM (VEYA BACKEND'DEN ÇEKİP CACHE'LEYEBİLİRSİNİZ)
// Backend'den gelen kategori ID'leri ile eşleşmeli
// Bu örnekte, bu kategorilerin ID'lerinin 1, 2, 3 vs. olduğunu varsayıyoruz.
// GERÇEK KATEGORİ ID'LERİNİZ VE İSİMLERİNİZLE GÜNCELLEYİN
const FALLBACK_CATEGORIES_TR: CategoryForModal[] = [
    { id: 1, name: 'Market / Gıda', type: 'EXPENSE' },
    { id: 2, name: 'Yeme İçme / Restoran', type: 'EXPENSE' },
    { id: 3, name: 'Ulaşım', type: 'EXPENSE' },
    { id: 4, name: 'Giyim / Aksesuar', type: 'EXPENSE' },
    { id: 5, name: 'Eğlence / Kültür', type: 'EXPENSE' },
    { id: 6, name: 'Fatura / Abonelik', type: 'EXPENSE' },
    { id: 7, name: 'Sağlık / Güzellik', type: 'EXPENSE' },
    { id: 8, name: 'Eğitim / Kırtasiye', type: 'EXPENSE' },
    { id: 9, name: 'Teknoloji / Elektronik', type: 'EXPENSE' },
    { id: 10, name: 'Ev / Dekorasyon', type: 'EXPENSE' },
    { id: 11, name: 'Seyahat / Konaklama', type: 'EXPENSE' },
    { id: 12, name: 'Spor', type: 'EXPENSE' },
    { id: 98, name: 'Diğer / Belirsiz', type: 'EXPENSE' },
    // Gelir Kategorileri
    { id: 101, name: 'Maaş', type: 'INCOME' },
    { id: 102, name: 'Diğer Gelir', type: 'INCOME' },
];

const FALLBACK_CATEGORIES_EN: CategoryForModal[] = [
    { id: 1, name: 'Groceries / Food', type: 'EXPENSE' },
    { id: 2, name: 'Dining / Restaurant', type: 'EXPENSE' },
    { id: 3, name: 'Transportation', type: 'EXPENSE' },
    { id: 4, name: 'Clothing / Accessories', type: 'EXPENSE' },
    { id: 5, name: 'Entertainment / Culture', type: 'EXPENSE' },
    { id: 6, name: 'Bills / Subscriptions', type: 'EXPENSE' },
    { id: 7, name: 'Health / Beauty', type: 'EXPENSE' },
    { id: 8, name: 'Education / Stationery', type: 'EXPENSE' },
    { id: 9, name: 'Technology / Electronics', type: 'EXPENSE' },
    { id: 10, name: 'Home / Decoration', type: 'EXPENSE' },
    { id: 11, name: 'Travel / Accommodation', type: 'EXPENSE' },
    { id: 12, name: 'Sports', type: 'EXPENSE' },
    { id: 98, name: 'Other / Uncategorized', type: 'EXPENSE' },
    // Income Categories
    { id: 101, name: 'Salary', type: 'INCOME' },
    { id: 102, name: 'Other Income', type: 'INCOME' },
];


export default function TransactionsList({ locale }: TransactionsListProps): JSX.Element {
    const router = useRouter();
    const [summaryData, setSummaryData] = useState<PeriodSummaryResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

    const yearOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYear - i), [currentYear]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    // ---- Modal State ----
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ---- Modal State Sonu ----

    // Modal'a gönderilecek kategori listesi
    const categoriesForModal: CategoryForModal[] = useMemo(() => {
        // İdealde backend'den çekilen güncel kategori listesi kullanılır.
        // Şimdilik sabit listeyi kullanalım veya summaryData'dan türetelim.
        // Eğer summaryData.overallCategoryTotals varsa ve ID'leri varsa oradan alınabilir.
        // Bu örnekte sabit listeyi kullanıyoruz:
        return locale === 'tr' ? FALLBACK_CATEGORIES_TR : FALLBACK_CATEGORIES_EN;
    }, [locale]);


    const fetchSummaryData = useCallback(async (year: number, month: number, showSpinner: boolean = true) => {
        if (showSpinner) setIsLoading(true);
        setError(null); // Her fetch öncesi hatayı sıfırla
        setSubmissionStatus(null); // Her fetch öncesi submit durumunu sıfırla
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError("Kimlik doğrulaması gerekli. Lütfen giriş yapın.");
            if (showSpinner) setIsLoading(false);
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
                setError("Oturum süresi dolmuş veya geçersiz.");
                localStorage.removeItem('accessToken'); localStorage.removeItem('userEmail');
                router.push('/login'); if (showSpinner) setIsLoading(false); return;
            }
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: `API Hatası: ${response.status}` }));
                throw new Error(errorBody.message);
            }
            const data: PeriodSummaryResponseDto = await response.json();
            setSummaryData(data);
        } catch (err: any) {
            setError(err.message || "Özet verisi yüklenirken bir hata oluştu.");
            setSummaryData(null);
        } finally {
            if (showSpinner) setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchSummaryData(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchSummaryData]);

    const allCategoryNamesInPeriod = useMemo(() => {
        if (!summaryData?.sources) return [];
        const categorySet = new Set<string>();
        summaryData.sources.forEach(source => {
            source.categorySummaries.forEach(catSum => categorySet.add(catSum.categoryName));
        });
        return Array.from(categorySet).sort();
    }, [summaryData]);

    const handleOpenModal = () => {
        setSubmissionStatus(null); // Modalı açarken eski mesajları temizle
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleModalSubmit = async (data: ManualTransactionRequestDtoForModal) => {
        setSubmissionStatus(null);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            throw new Error(locale === 'tr' ? "Kimlik doğrulama gerekli." : "Authentication required.");
        }

        const MANUAL_TRANSACTION_API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/transactions/manual`;

        try {
            const response = await fetch(MANUAL_TRANSACTION_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.status === 401) {
                router.push('/login');
                throw new Error(locale === 'tr' ? "Oturum süresi dolmuş." : "Session expired.");
            }

            const responseBody = await response.json().catch(() => null); // Her zaman JSON parse etmeye çalış

            if (!response.ok) {
                const errorMessage = responseBody?.message || (locale === 'tr' ? 'İşlem kaydedilemedi.' : 'Failed to save transaction.');
                throw new Error(errorMessage);
            }

            // Backend'den TransactionResponseDto dönüyorsa:
            // const savedTransaction: TransactionResponseDto = responseBody;
            // console.log("Kaydedilen işlem:", savedTransaction);

            setSubmissionStatus({ type: 'success', message: locale === 'tr' ? 'Hareket başarıyla eklendi!' : 'Transaction added successfully!' });
            handleCloseModal();
            // Veriyi yeniden çek, bu sefer ana yükleyiciyi göstermeden
            await fetchSummaryData(selectedYear, selectedMonth, false);

        } catch (error: any) {
            console.error('Manuel hareket ekleme hatası:', error);
            setSubmissionStatus({ type: 'error', message: error.message || (locale === 'tr' ? 'Hareket eklenirken bir hata oluştu.' : 'Error adding transaction.') });
            // Modal'ın kendi içindeki hatayı göstermesi için hatayı fırlatıyoruz
            throw error;
        }
    };


    const handleUploadStatement = () => {
        console.log("Ekstre Yükle tıklandı");
        // İlgili işlevsellik buraya eklenecek
    };

    // if (isLoading && !summaryData) { // Sadece ilk yüklemede tam ekran yükleyici
    //     return (
    //         <div className="flex justify-center items-center py-10 min-h-[300px]">
    //             <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
    //             <span className="ml-3 text-gray-600">{locale === 'tr' ? 'Veriler yükleniyor...' : 'Loading data...'}</span>
    //         </div>
    //     );
    // }

    // if (error && !summaryData && !isLoading) { // Sadece ilk yüklemede gösterilecek genel hata
    //     return (
    //         <div className="flex flex-col justify-center items-center py-10 text-red-600 bg-red-50 p-4 rounded border border-red-200 min-h-[300px]">
    //            <FiAlertTriangle className="h-8 w-8 mb-2" />
    //            <span className="text-lg font-semibold">{locale === 'tr' ? 'Bir Hata Oluştu' : 'An Error Occurred'}</span>
    //            <span>{error}</span>
    //        </div>
    //     );
    // }

    const renderFilters = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <div>
                <label htmlFor="tx-year-select" className="block text-sm font-medium text-gray-700 mb-1">{locale === 'tr' ? 'Yıl' : 'Year'}</label>
                <select
                    id="tx-year-select"
                    value={selectedYear}
                    onChange={(e) => { setSelectedYear(parseInt(e.target.value, 10)); setError(null); setSubmissionStatus(null); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={isLoading}
                >
                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="tx-month-select" className="block text-sm font-medium text-gray-700 mb-1">{locale === 'tr' ? 'Ay' : 'Month'}</label>
                <select
                    id="tx-month-select"
                    value={selectedMonth}
                    onChange={(e) => { setSelectedMonth(parseInt(e.target.value, 10)); setError(null); setSubmissionStatus(null); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
    );

    // Tam sayfa yükleyici ve hata gösterimi için daha iyi bir mantık
    if (isLoading && !summaryData) { // Sadece ilk yüklemede
        return (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow min-h-[400px] flex flex-col">
                {renderFilters()}
                <div className="flex-grow flex justify-center items-center py-10">
                    <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                    <span className="ml-3 text-gray-600">{locale === 'tr' ? 'Veriler yükleniyor...' : 'Loading data...'}</span>
                </div>
            </div>
        );
    }


    return (
        <>
            <ManualTransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                availableCategories={categoriesForModal}
                initialYear={selectedYear}
                initialMonth={selectedMonth}
                locale={locale}
            />

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                {renderFilters()}

                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
                        <button
                            onClick={handleOpenModal}
                            disabled={isLoading && !!summaryData} // Sadece veri güncellenirken disable
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
                        >
                            <FiPlusSquare className="mr-2 h-5 w-5" />
                            {locale === 'tr' ? 'Manuel Hareket Ekle' : 'Add Manual Transaction'}
                        </button>
                        <button
                            onClick={handleUploadStatement}
                            disabled={isLoading && !!summaryData} // Sadece veri güncellenirken disable
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
                        >
                            <FiUploadCloud className="mr-2 h-5 w-5" />
                            {locale === 'tr' ? 'Ekstre Yükle' : 'Upload Statement'}
                        </button>
                    </div>
                    {/* Anlık Yükleme / Hata / Başarı Durumu */}
                    <div className="h-6"> {/* Yükseklik sabitliği için */}
                        {(isLoading && !!summaryData) && <div className="flex items-center text-sm text-gray-500"><FiLoader className="animate-spin mr-2 h-4 w-4" /> {locale === 'tr' ? 'Veriler güncelleniyor...' : 'Updating data...'}</div>}
                        {error && <div className="text-sm text-red-500"><FiAlertTriangle className="inline mr-1 mb-0.5"/> {error}</div>}
                        {submissionStatus?.type === 'success' && <div className="text-sm text-green-600">{submissionStatus.message}</div>}
                        {submissionStatus?.type === 'error' && !isModalOpen && <div className="text-sm text-red-600">{submissionStatus.message}</div>} {/* Modal kapalıyken submit hatasını göster */}
                    </div>
                </div>


                {(!summaryData || !summaryData.sources || summaryData.sources.length === 0) && !(isLoading && !summaryData) && (
                    <div className="text-center py-10 text-gray-500">
                        {error ? error : (locale === 'tr' ? 'Seçili dönem için gösterilecek veri bulunamadı.' : 'No data found for the selected period.')}
                    </div>
                )}

                {summaryData && summaryData.sources && summaryData.sources.length > 0 && (
                    <>
                        {/* Özet Bilgiler */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h2 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
                                <FiCalendar className="mr-2" /> {locale === 'tr' ? 'Dönem Özeti' : 'Period Summary'}: {summaryData.periodName}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* ... Özet kartları ... */}
                                <div className="p-3 bg-white rounded shadow">
                                    <p className="text-sm text-gray-500">{locale === 'tr' ? 'Toplam Kaynak Sayısı':'Total Sources'}</p>
                                    <p className="text-2xl font-bold text-blue-600 flex items-center">
                                        <FiArchive className="mr-2" /> {summaryData.sources.length}
                                    </p>
                                </div>
                                <div className="p-3 bg-white rounded shadow">
                                    <p className="text-sm text-gray-500">{locale === 'tr' ? 'Toplam Kategori Sayısı (Dönemde)':'Total Categories (Period)'}</p>
                                    <p className="text-2xl font-bold text-blue-600 flex items-center">
                                        <FiGrid className="mr-2" /> {allCategoryNamesInPeriod.length}
                                    </p>
                                </div>
                                <div className="p-3 bg-white rounded shadow">
                                    <p className="text-sm text-gray-500">{locale === 'tr' ? 'Dönem Toplam Harcaması':'Total Spending (Period)'}</p>
                                    <p className="text-2xl font-bold text-red-600 flex items-center">
                                        {formatCurrency(summaryData.grandTotal)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Excel Benzeri Tablo */}
                        <h3 className="text-lg font-medium text-gray-800 mb-3">{locale === 'tr' ? 'Harcama Detayları (Kaynak Bazında)' : 'Spending Details (By Source)'}</h3>
                        <div className="overflow-x-auto">
                            {/* ... Mevcut tablo yapınız ... */}
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">
                                        {locale === 'tr' ? 'Kaynak (Belge Türü)' : 'Source (Document Type)'}
                                    </th>
                                    {allCategoryNamesInPeriod.map(catName => (
                                        <th key={catName} scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">
                                            {catName}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-200">
                                        {locale === 'tr' ? 'Kaynak Toplamı' : 'Source Total'}
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
                                <tfoot className="bg-gray-200 border-t-2 border-gray-400">
                                <tr>
                                    <td className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-r">
                                        {locale === 'tr' ? 'KATEGORİ TOPLAMLARI' : 'CATEGORY TOTALS'}
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
                    </>
                )}
            </div>
        </>
    );
}