// app/dashboard/savings-advisor/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useCallback, useMemo } from 'react';
import {
    FiTarget,
    FiBarChart2,
    FiCpu,
    FiLoader,
    FiAlertTriangle,
    FiPlusSquare,
    FiCalendar,    // Added
    FiRefreshCw    // Added
} from 'react-icons/fi';
import { Locale } from '@/app/page'; // Assuming your Locale type is here

// --- DTO Interfaces ---

// Spending category structure for the form and AI request
interface SpendingCategoryDto {
    categoryName: string;
    amount: number;
}

// AI provider options
export enum AiProviderClient {
    GEMINI = 'GEMINI',
    OPENAI = 'OPENAI',
}

// Request structure for the AI savings endpoint
interface SavingsRequestDto {
    desiredSavingsAmount: number;
    currentSpending: SpendingCategoryDto[];
    provider: AiProviderClient;
}

// Recommendation structure within the AI response
interface SavingsRecommendationDto {
    categoryName: string;
    suggestedReduction: number;
    reason?: string;
}

// Response structure from the AI savings endpoint
interface SavingsResponseDto {
    summary: string;
    recommendations: SavingsRecommendationDto[];
}

// DTO for fetching category net totals from the backend
interface CategoryTotalDto {
    categoryNameTr: string;
    categoryNameEn: string;
    categoryId: number;
    netAmount: number; // Backend BigDecimal maps to number in TS
}

// --- Component Props ---

interface SavingsAdvisorPageProps {
    locale: Locale;
}

// --- Component ---

export default function SavingsAdvisorPage({ locale }: SavingsAdvisorPageProps) {
    // --- State ---

    // Form Inputs & Selections
    const [desiredSavingsAmount, setDesiredSavingsAmount] = useState<string>('');
    const [currentSpending, setCurrentSpending] = useState<SpendingCategoryDto[]>([]); // Populated by fetch or manually added
    const [selectedProvider, setSelectedProvider] = useState<AiProviderClient>(AiProviderClient.GEMINI);

    // Year/Month Selection
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    const yearOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => currentYear - i), [currentYear]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    // Loading & Error States
    const [isFetchingCategories, setIsFetchingCategories] = useState<boolean>(true); // Start true for initial fetch
    const [fetchCategoriesError, setFetchCategoriesError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false); // For AI request loading
    const [error, setError] = useState<string | null>(null); // For AI request errors

    // AI Response Data
    const [recommendationData, setRecommendationData] = useState<SavingsResponseDto | null>(null);

    // --- Helper Functions ---

    // Format currency (optional, but good practice if needed elsewhere)
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: 'TRY', // Assuming TRY
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // --- Data Fetching ---

    const fetchCategoryTotals = useCallback(async (year: number, month: number) => {
        setIsFetchingCategories(true);
        setFetchCategoriesError(null);
        setRecommendationData(null); // Clear previous AI results
        setError(null);             // Clear previous AI errors
        setCurrentSpending([]);     // Clear spending before fetching new

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setFetchCategoriesError(locale === 'tr' ? "Kimlik doğrulaması gerekli. Lütfen giriş yapın." : "Authentication required. Please log in.");
            setIsFetchingCategories(false);
            // Optionally redirect: router.push('/login');
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const url = `${API_URL}/api/v1/summaries/category-net-totals/${year}/${month}`;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userEmail');
                setFetchCategoriesError(locale === 'tr' ? "Oturum süresi doldu veya geçersiz. Lütfen tekrar giriş yapın." : "Session expired or invalid. Please log in again.");
                setIsFetchingCategories(false);
                // Optionally redirect: router.push('/login');
                return;
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
                throw new Error(errorBody.message || (locale === 'tr' ? 'Kategori harcamaları alınamadı.' : 'Failed to fetch category spending.'));
            }

            const data: CategoryTotalDto[] = await response.json();

            // Map fetched data to SpendingCategoryDto, filtering for expenses (netAmount > 0)
            // IMPORTANT: This assumes positive netAmount means an expense category suitable for savings analysis.
            // Adjust this filter if your backend logic for netAmount is different (e.g., negative means expense).
            const spendingData = data
                .filter(item => item.netAmount > 0)
                .map(item => ({
                    categoryName: locale === 'tr' ? item.categoryNameTr : item.categoryNameEn,
                    amount: item.netAmount // Use the positive net amount
                }));

            if (spendingData.length === 0 && data.length > 0) {
                // Data fetched, but no positive net amounts found for the period
                setFetchCategoriesError(locale === 'tr' ? 'Seçili dönem için azaltılabilecek harcama kategorisi bulunamadı. Manuel ekleme yapabilirsiniz.' : 'No spending categories found for potential reduction in the selected period. You can add manually.');
                setCurrentSpending([{ categoryName: '', amount: 0 }]); // Provide one empty row
            } else if (spendingData.length === 0 && data.length === 0) {
                // No data at all for the period
                setFetchCategoriesError(locale === 'tr' ? 'Seçili dönem için veri bulunamadı. Manuel ekleme yapabilirsiniz.' : 'No data found for the selected period. You can add manually.');
                setCurrentSpending([{ categoryName: '', amount: 0 }]); // Provide one empty row
            }
            else {
                // Spending data found
                setCurrentSpending(spendingData);
            }

        } catch (err: any) {
            console.error("Kategori toplamları alınırken hata:", err);
            setFetchCategoriesError(err.message || (locale === 'tr' ? 'Harcamalar alınırken bir hata oluştu.' : 'Error fetching spending data.'));
            setCurrentSpending([{ categoryName: '', amount: 0 }]); // Provide empty row on error
        } finally {
            setIsFetchingCategories(false);
        }
    }, [locale]); // Dependency: locale

    // Trigger fetch on initial load and when year/month changes
    useEffect(() => {
        fetchCategoryTotals(selectedYear, selectedMonth);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear, selectedMonth, fetchCategoryTotals]); // fetchCategoryTotals is stable

    // --- Form Handlers ---

    const handleSpendingChange = (index: number, field: keyof SpendingCategoryDto, value: string | number) => {
        const updatedSpending = [...currentSpending];
        if (field === 'amount') {
            // Allow empty string temporarily, convert to 0 on blur/submit if needed, or handle NaN
            const numValue = Number(value);
            updatedSpending[index][field] = isNaN(numValue) ? 0 : numValue;
        } else {
            updatedSpending[index][field] = value as string;
        }
        setCurrentSpending(updatedSpending);
    };

    const addSpendingCategory = () => {
        // Add a new blank category row
        setCurrentSpending([...currentSpending, { categoryName: '', amount: 0 }]);
    };

    const removeSpendingCategory = (index: number) => {
        const updatedSpending = currentSpending.filter((_, i) => i !== index);
        setCurrentSpending(updatedSpending);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);             // Clear previous AI errors
        setRecommendationData(null); // Clear previous AI results

        const parsedSavingsAmount = parseFloat(desiredSavingsAmount);
        if (isNaN(parsedSavingsAmount) || parsedSavingsAmount <= 0) {
            setError(locale === 'tr' ? 'Lütfen geçerli bir pozitif tasarruf hedefi girin.' : 'Please enter a valid positive savings target.');
            return;
        }

        // Filter out rows where category name is empty OR amount is zero or invalid
        const validSpending = currentSpending.filter(
            item => item.categoryName.trim() !== '' && item.amount > 0
        );

        if (validSpending.length === 0) {
            setError(locale === 'tr' ? 'Lütfen en az bir geçerli harcama kategorisi ve pozitif tutarı girin veya seçili dönemde harcama olduğundan emin olun.' : 'Please enter at least one valid spending category with a positive amount, or ensure there was spending in the selected period.');
            return;
        }

        const requestPayload: SavingsRequestDto = {
            desiredSavingsAmount: parsedSavingsAmount,
            currentSpending: validSpending,
            provider: selectedProvider,
        };

        setIsLoading(true); // Start AI request loading
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError(locale === 'tr' ? "Kimlik doğrulaması gerekli. Lütfen tekrar giriş yapın." : "Authentication required. Please log in again.");
            setIsLoading(false);
            // Optionally redirect: router.push('/login');
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        try {
            const response = await fetch(`${API_URL}/api/v1/savings/recommendations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
            });

            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userEmail');
                setError(locale === 'tr' ? "Oturum süresi doldu veya geçersiz. Lütfen tekrar giriş yapın." : "Session expired or invalid. Please log in again.");
                // Optionally redirect: router.push('/login');
                setIsLoading(false);
                return;
            }

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || (locale === 'tr' ? `API Hatası: ${response.status}` : `API Error: ${response.status}`));
            }

            setRecommendationData(responseData as SavingsResponseDto);

        } catch (err: any) {
            console.error("Tasarruf önerisi alınırken hata:", err);
            setError(err.message || (locale === 'tr' ? "Öneriler alınırken bir hata oluştu." : "An error occurred while getting recommendations."));
        } finally {
            setIsLoading(false); // End AI request loading
        }
    };

    // --- Render ---

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
                <FiTarget className="text-3xl text-blue-600 mr-3" />
                <h1 className="text-3xl font-semibold text-gray-800">{locale === 'tr' ? 'Tasarruf Danışmanı' : 'Savings Advisor'}</h1>
            </div>

            {/* --- Year/Month Filters --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 relative shadow-sm">
                {/* Loading Overlay for Filters */}
                {isFetchingCategories && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                        <FiRefreshCw className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                        <span className="text-gray-600">{locale === 'tr' ? 'Dönem Harcamaları Yükleniyor...' : 'Loading Period Expenses...'}</span>
                    </div>
                )}
                <div>
                    <label htmlFor="sa-year-select" className="block text-sm font-medium text-gray-700 mb-1">{locale === 'tr' ? 'Yıl' : 'Year'}</label>
                    <select
                        id="sa-year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isFetchingCategories || isLoading} // Disable during category fetch or AI processing
                    >
                        {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="sa-month-select" className="block text-sm font-medium text-gray-700 mb-1">{locale === 'tr' ? 'Ay' : 'Month'}</label>
                    <select
                        id="sa-month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isFetchingCategories || isLoading} // Disable during category fetch or AI processing
                    >
                        {monthOptions.map(month => (
                            <option key={month} value={month}>
                                {new Date(selectedYear, month - 1).toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Display Fetch Error Specific to Categories */}
                {fetchCategoriesError && !isFetchingCategories && (
                    <div className="sm:col-span-2 mt-2 text-sm text-orange-700 flex items-center px-1">
                        <FiAlertTriangle className="inline mr-1.5 h-4 w-4 flex-shrink-0"/> {fetchCategoriesError}
                    </div>
                )}
            </div>
            {/* --- End Year/Month Filters --- */}


            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6 mb-10">
                {/* --- Desired Savings Amount --- */}
                <div>
                    <label htmlFor="desiredSavings" className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'tr' ? 'Aylık Hedeflenen Tasarruf Tutarı (₺)' : 'Desired Monthly Savings Target (₺)'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₺</span>
                        </div>
                        <input
                            type="number"
                            id="desiredSavings"
                            name="desiredSavings"
                            value={desiredSavingsAmount}
                            onChange={(e) => setDesiredSavingsAmount(e.target.value)}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 pr-3 sm:text-sm border-gray-300 rounded-md py-2.5 shadow-sm"
                            placeholder={locale === 'tr' ? "Örn: 1500" : "E.g., 1500"}
                            min="0.01" // Target should be positive
                            step="any"
                            required
                            disabled={isFetchingCategories || isLoading} // Disable while loading anything
                        />
                    </div>
                </div>

                {/* --- Current Spending Section --- */}
                <fieldset className="space-y-4 border-t border-gray-200 pt-6" disabled={isFetchingCategories || isLoading}>
                    <legend className="text-lg font-medium text-gray-900 mb-3">
                        {locale === 'tr' ? 'Dönem Harcamaları (Düzenleyebilirsiniz)' : 'Period Spending (Editable)'}
                    </legend>

                    {/* Loading state for categories */}
                    {isFetchingCategories && (
                        <div className="text-center py-4 text-gray-500">
                            <FiLoader className="animate-spin h-5 w-5 mx-auto mb-2 text-blue-500" />
                            {locale === 'tr' ? 'Harcamalar yükleniyor...' : 'Loading expenses...'}
                        </div>
                    )}

                    {/* Render spending rows when not loading */}
                    {!isFetchingCategories && currentSpending.map((item, index) => (
                        <div key={`spending-${index}`} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            {/* Category Name Input */}
                            <div className="sm:col-span-6">
                                <label htmlFor={`categoryName-${index}`} className="sr-only">{locale === 'tr' ? 'Kategori Adı' : 'Category Name'}</label>
                                <input
                                    type="text"
                                    id={`categoryName-${index}`}
                                    value={item.categoryName}
                                    onChange={(e) => handleSpendingChange(index, 'categoryName', e.target.value)}
                                    placeholder={locale === 'tr' ? 'Harcama Kategorisi (Örn: Market)' : 'Spending Category (e.g., Groceries)'}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 shadow-sm disabled:bg-gray-100"
                                    required // Category name is required if amount > 0
                                />
                            </div>
                            {/* Amount Input */}
                            <div className="sm:col-span-4">
                                <label htmlFor={`amount-${index}`} className="sr-only">{locale === 'tr' ? 'Tutar' : 'Amount'}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₺</span>
                                    </div>
                                    <input
                                        type="number"
                                        id={`amount-${index}`}
                                        value={item.amount} // Use number directly
                                        onChange={(e) => handleSpendingChange(index, 'amount', e.target.value)}
                                        placeholder={locale === 'tr' ? 'Tutar (₺)' : 'Amount (₺)'}
                                        min="0.01" // Require a positive amount for valid spending
                                        step="any"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 pl-8 pr-3 shadow-sm disabled:bg-gray-100"
                                        required // Amount is required
                                    />
                                </div>
                            </div>
                            {/* Remove Button */}
                            <div className="sm:col-span-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => removeSpendingCategory(index)}
                                    className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    title={locale === 'tr' ? 'Bu kategoriyi kaldır' : 'Remove this category'}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Category Button - visible when not loading categories */}
                    {!isFetchingCategories && (
                        <button
                            type="button"
                            onClick={addSpendingCategory}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={isFetchingCategories || isLoading} // Disable while loading anything
                        >
                            <FiPlusSquare className="mr-1.5 h-4 w-4"/> {locale === 'tr' ? 'Kategori Ekle' : 'Add Category'}
                        </button>
                    )}
                </fieldset>

                {/* --- AI Provider Selection --- */}
                <div>
                    <label htmlFor="aiProvider" className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'tr' ? 'Kullanılacak AI Servisi' : 'AI Service to Use'}
                    </label>
                    <select
                        id="aiProvider"
                        name="aiProvider"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as AiProviderClient)}
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm disabled:bg-gray-100"
                        disabled={isFetchingCategories || isLoading} // Disable while loading anything
                    >
                        {Object.values(AiProviderClient).map((providerValue) => (
                            <option key={providerValue} value={providerValue}>
                                {providerValue} {/* Consider mapping to more user-friendly names if needed */}
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Submit Button --- */}
                <button
                    type="submit"
                    disabled={isLoading || isFetchingCategories || currentSpending.filter(item => item.categoryName.trim() !== '' && item.amount > 0).length === 0} // Disable if AI is working, categories loading, or no valid spending rows exist
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <FiLoader className="animate-spin h-5 w-5 mr-3" />
                            {locale === 'tr' ? 'Öneriler Hazırlanıyor...' : 'Generating Recommendations...'}
                        </>
                    ) : (
                        <>
                            <FiCpu className="h-5 w-5 mr-3" />
                            {locale === 'tr' ? 'Tasarruf Önerileri Al' : 'Get Savings Recommendations'}
                        </>
                    )}
                </button>
            </form>

            {/* --- AI Submission Error Display --- */}
            {error && !isLoading && ( // Show only non-loading AI errors
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-6" role="alert">
                    <div className="flex">
                        <div className="py-1"><FiAlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
                        <div>
                            <p className="font-bold">{locale === 'tr' ? 'Hata!' : 'Error!'}</p>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Recommendation Display --- */}
            {recommendationData && !isLoading && !error && (
                <div className="mt-10 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-green-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                        <FiBarChart2 className="text-green-600 mr-3" />
                        {locale === 'tr' ? 'AI Destekli Tasarruf Önerileri' : 'AI-Powered Savings Recommendations'}
                    </h2>
                    {/* Summary */}
                    <div className="prose prose-sm sm:prose-base max-w-none bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-700 !mt-0 !mb-2">{locale === 'tr' ? 'Genel Değerlendirme:' : 'Overall Summary:'}</h3>
                        <p className="text-gray-600 whitespace-pre-wrap !mt-0">{recommendationData.summary}</p>
                    </div>

                    {/* Detailed Recommendations */}
                    {recommendationData.recommendations && recommendationData.recommendations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">{locale === 'tr' ? 'Detaylı Öneriler:' : 'Detailed Suggestions:'}</h3>
                            <ul className="space-y-4">
                                {recommendationData.recommendations.map((rec, index) => (
                                    <li key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <p className="text-md font-semibold text-blue-700">{rec.categoryName}</p>
                                            <p className="text-md font-bold text-red-500 mt-1 sm:mt-0">
                                                {locale === 'tr' ? 'Önerilen Azaltma:' : 'Suggested Reduction:'} {formatCurrency(rec.suggestedReduction)}
                                            </p>
                                        </div>
                                        {rec.reason && (
                                            <p className="mt-2 text-xs sm:text-sm text-gray-500 italic">{locale === 'tr' ? 'Neden:' : 'Reason:'} {rec.reason}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* No specific recommendations */}
                    {recommendationData.recommendations && recommendationData.recommendations.length === 0 && (
                        <p className="text-gray-600 text-sm p-4 bg-blue-50 border border-blue-200 rounded-md">
                            {locale === 'tr' ? 'Bu hedef için AI tarafından spesifik bir kesinti önerisi bulunamadı, ancak genel değerlendirme size yol gösterebilir.' : 'No specific reduction suggestions were found by the AI for this target, but the overall summary may provide guidance.'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}