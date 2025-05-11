// app/dashboard/savings-advisor/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import {
    FiTarget,
    FiBarChart2,
    FiCpu,
    FiLoader,
    FiAlertTriangle,
    FiPlusSquare // FiPlusSquare import edildi
} from 'react-icons/fi';
import { Locale } from '@/app/page'; // Varsayılan locale tipiniz

// Backend DTO'larına karşılık gelen TypeScript interface'leri
interface SpendingCategoryDto {
    categoryName: string;
    amount: number; // Harcama tutarı
}

export enum AiProviderClient { // public olması için export eklendi
    GEMINI = 'GEMINI',
    OPENAI = 'OPENAI',
}

interface SavingsRequestDto {
    desiredSavingsAmount: number;
    currentSpending: SpendingCategoryDto[];
    provider: AiProviderClient;
}

interface SavingsRecommendationDto {
    categoryName: string;
    suggestedReduction: number;
    reason?: string;
}

interface SavingsResponseDto {
    summary: string;
    recommendations: SavingsRecommendationDto[];
}

interface SavingsAdvisorPageProps {
    locale: Locale;
}

export default function SavingsAdvisorPage({ locale }: SavingsAdvisorPageProps) {
    const [desiredSavingsAmount, setDesiredSavingsAmount] = useState<string>('');
    const [currentSpending, setCurrentSpending] = useState<SpendingCategoryDto[]>([
        { categoryName: 'Yeme-İçme / Restoran', amount: 0 },
        { categoryName: 'Market / Gıda', amount: 0 },
        { categoryName: 'Eğlence / Kültür', amount: 0 },
        { categoryName: 'Giyim / Aksesuar', amount: 0 },
        { categoryName: 'Faturalar / Abonelikler', amount: 0 },
    ]);
    const [selectedProvider, setSelectedProvider] = useState<AiProviderClient>(AiProviderClient.GEMINI);
    const [recommendationData, setRecommendationData] = useState<SavingsResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSpendingChange = (index: number, field: keyof SpendingCategoryDto, value: string | number) => {
        const updatedSpending = [...currentSpending];
        if (field === 'amount') {
            updatedSpending[index][field] = Number(value) || 0;
        } else {
            updatedSpending[index][field] = value as string;
        }
        setCurrentSpending(updatedSpending);
    };

    const addSpendingCategory = () => {
        setCurrentSpending([...currentSpending, { categoryName: '', amount: 0 }]);
    };

    const removeSpendingCategory = (index: number) => {
        const updatedSpending = currentSpending.filter((_, i) => i !== index);
        setCurrentSpending(updatedSpending);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setRecommendationData(null);

        const parsedSavingsAmount = parseFloat(desiredSavingsAmount);
        if (isNaN(parsedSavingsAmount) || parsedSavingsAmount <= 0) {
            setError('Lütfen geçerli bir tasarruf hedefi girin.');
            return;
        }

        const validSpending = currentSpending.filter(
            item => item.categoryName.trim() !== '' && item.amount > 0
        );

        if (validSpending.length === 0) {
            setError('Lütfen en az bir geçerli harcama kategorisi ve tutarı girin.');
            return;
        }

        const requestPayload: SavingsRequestDto = {
            desiredSavingsAmount: parsedSavingsAmount,
            currentSpending: validSpending,
            provider: selectedProvider,
        };

        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError("Kimlik doğrulaması gerekli. Lütfen tekrar giriş yapın.");
            setIsLoading(false);
            // router.push('/login'); // Eğer router import edilmişse ve gerekirse
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
                setError("Oturum süresi doldu veya geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userEmail');
                // router.push('/login'); // Eğer router import edilmişse ve gerekirse
                setIsLoading(false);
                return;
            }

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `API Hatası: ${response.status}`);
            }

            setRecommendationData(responseData as SavingsResponseDto);

        } catch (err: any) {
            console.error("Tasarruf önerisi alınırken hata:", err);
            setError(err.message || "Öneriler alınırken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
                <FiTarget className="text-3xl text-blue-600 mr-3" />
                <h1 className="text-3xl font-semibold text-gray-800">Tasarruf Danışmanı</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6 mb-10">
                <div>
                    <label htmlFor="desiredSavings" className="block text-sm font-medium text-gray-700 mb-1">
                        Aylık Hedeflenen Tasarruf Tutarı (₺)
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
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 pr-3 sm:text-sm border-gray-300 rounded-md py-2.5 shadow-sm"                             placeholder="Örn: 1500"
                            min="0"
                            step="any"
                            required
                        />
                    </div>
                </div>

                <fieldset className="space-y-4">
                    <legend className="text-lg font-medium text-gray-900 mb-2">Mevcut Aylık Harcamalarınız</legend>
                    {currentSpending.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-6">
                                <label htmlFor={`categoryName-${index}`} className="sr-only">Kategori Adı</label>
                                <input
                                    type="text"
                                    id={`categoryName-${index}`}
                                    value={item.categoryName}
                                    onChange={(e) => handleSpendingChange(index, 'categoryName', e.target.value)}
                                    placeholder="Harcama Kategorisi (Örn: Market)"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 shadow-sm"
                                />
                            </div>
                            <div className="sm:col-span-4">
                                <label htmlFor={`amount-${index}`} className="sr-only">Tutar</label>
                                <input
                                    type="number"
                                    id={`amount-${index}`}
                                    value={item.amount === 0 && currentSpending[index].categoryName === '' ? '' : item.amount}
                                    onChange={(e) => handleSpendingChange(index, 'amount', e.target.value)}
                                    placeholder="Tutar (₺)"
                                    min="0"
                                    step="any"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 shadow-sm"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end">
                                {currentSpending.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSpendingCategory(index)}
                                        className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                                        title="Bu kategoriyi kaldır"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSpendingCategory}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                        <FiPlusSquare className="mr-1.5 h-4 w-4"/> Kategori Ekle
                    </button>
                </fieldset>

                <div>
                    <label htmlFor="aiProvider" className="block text-sm font-medium text-gray-700 mb-1">
                        Kullanılacak AI Servisi
                    </label>
                    <select
                        id="aiProvider"
                        name="aiProvider"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as AiProviderClient)}
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    >
                        {Object.values(AiProviderClient).map((providerValue) => (
                            <option key={providerValue} value={providerValue}>
                                {providerValue}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <FiLoader className="animate-spin h-5 w-5 mr-3" />
                            Öneriler Hazırlanıyor...
                        </>
                    ) : (
                        <>
                            <FiCpu className="h-5 w-5 mr-3" />
                            Tasarruf Önerileri Al
                        </>
                    )}
                </button>
            </form>

            {error && !isLoading && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-6" role="alert">
                    <div className="flex">
                        <div className="py-1"><FiAlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
                        <div>
                            <p className="font-bold">Hata!</p>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {recommendationData && !isLoading && !error && (
                <div className="mt-10 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                        <FiBarChart2 className="text-green-600 mr-3" />
                        AI Destekli Tasarruf Önerileri
                    </h2>
                    <div className="prose prose-sm sm:prose-base max-w-none bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="font-semibold text-gray-700">Genel Değerlendirme:</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{recommendationData.summary}</p>
                    </div>

                    {recommendationData.recommendations && recommendationData.recommendations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Detaylı Öneriler:</h3>
                            <ul className="space-y-4">
                                {recommendationData.recommendations.map((rec, index) => (
                                    <li key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <p className="text-md font-semibold text-blue-700">{rec.categoryName}</p>
                                            <p className="text-md font-bold text-red-500 mt-1 sm:mt-0">
                                                Önerilen Azaltma: {rec.suggestedReduction.toLocaleString(locale, { style: 'currency', currency: 'TRY' })}
                                            </p>
                                        </div>
                                        {rec.reason && (
                                            <p className="mt-2 text-xs sm:text-sm text-gray-500 italic">Neden: {rec.reason}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {recommendationData.recommendations && recommendationData.recommendations.length === 0 && (
                        <p className="text-gray-600">Bu hedef için AI tarafından spesifik bir kesinti önerisi bulunamadı. Genel değerlendirmeyi inceleyebilirsiniz.</p>
                    )}
                </div>
            )}
        </div>
    );
}