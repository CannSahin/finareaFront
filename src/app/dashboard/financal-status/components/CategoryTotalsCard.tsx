import React from 'react';
import { FiTag } from 'react-icons/fi';

interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

// TFunction tipinin DashboardPage'deki ile aynı olduğundan emin olun
type TFunction = (fullKey: string, fallback?: any) => string;
type SupportedLocale = 'tr' | 'en'; // Bu tipin de DashboardPage'deki ile aynı olduğundan emin olun

interface CategoryTotalsDisplayProps {
    categoryTotals: CategorySummaryDto[];
    locale: SupportedLocale;
    t: TFunction;
}

const formatCurrencyForCard = (amount: number, locale: SupportedLocale) => {
    return amount.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const CategoryTotalsDisplay: React.FC<CategoryTotalsDisplayProps> = ({ categoryTotals, locale, t }) => {
    // Geliştirme sırasında t'nin tipini kontrol et (DashboardPage'de zaten yapılıyor ama burada da olabilir)
    if (process.env.NODE_ENV === 'development' && typeof t !== 'function') {
        console.error('[CategoryTotalsDisplay] CRITICAL ERROR: `t` prop is not a function. Received:', t);
        return <div className="bg-red-100 text-red-700 p-4 rounded-md">Error: Translation function (t) is not available in CategoryTotalsDisplay.</div>;
    }

    if (!categoryTotals || categoryTotals.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                {/* ANAHTAR GÜNCELLENDİ */}
                {t('dashboard.financialStatus.categoryTotals.noSpendingForPeriod', 'Bu dönem için kategori harcaması bulunmamaktadır.')}
            </div>
        );
    }

    const sortedTotals = [...categoryTotals].sort((a, b) => b.totalAmount - a.totalAmount);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {/* ANAHTAR GÜNCELLENDİ */}
                {t('dashboard.financialStatus.categoryTotals.title', 'Kategori Harcama Dağılımı')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedTotals.map((item) => (
                    <div key={item.categoryName} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="flex items-center text-blue-600 mb-1">
                            <FiTag className="mr-2 h-5 w-5" />
                            <h4 className="text-md font-semibold truncate" title={item.categoryName}>
                                {item.categoryName} {/* Kategori adı backend'den geldiği için çevrilmez */}
                            </h4>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                            {formatCurrencyForCard(item.totalAmount, locale)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryTotalsDisplay;