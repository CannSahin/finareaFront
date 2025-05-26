import React, { useState, useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
    Title, Tooltip, Legend, ChartOptions, ChartData
} from 'chart.js';
import { FiBarChart2, FiPieChart } from 'react-icons/fi';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
);

interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

// TFunction tipinin DashboardPage'deki ile aynı olduğundan emin olun
type TFunction = (fullKey: string, fallback?: any) => string;
type SupportedLocale = 'tr' | 'en'; // Bu tipin de DashboardPage'deki ile aynı olduğundan emin olun

interface SpendingChartProps {
    categoryTotals: CategorySummaryDto[];
    periodName: string; // Bu backend'den gelir, genellikle çevrilmez veya DashboardPage'de çevrilir
    locale: SupportedLocale;
    t: TFunction;
}

type ChartType = 'bar' | 'pie';

const SpendingChart: React.FC<SpendingChartProps> = ({ categoryTotals, periodName, locale, t }) => {
    const [chartType, setChartType] = useState<ChartType>('bar');

    if (process.env.NODE_ENV === 'development' && typeof t !== 'function') {
        console.error('[SpendingChart] CRITICAL ERROR: `t` prop is not a function. Received:', t);
        return <div className="bg-red-100 text-red-700 p-4 rounded-md mt-6">Error: Translation function (t) is not available in SpendingChart.</div>;
    }

    if (!categoryTotals || categoryTotals.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FiBarChart2 className="mr-2 text-gray-400"/>
                    {/* ANAHTAR GÜNCELLENDİ */}
                    {t('dashboard.financialStatus.spendingChart.title', 'Harcama Grafiği')}
                </h3>
                <p className="text-gray-500">
                    {/* ANAHTAR GÜNCELLENDİ */}
                    {t('dashboard.financialStatus.spendingChart.noData', 'Gösterilecek harcama verisi bulunmamaktadır.')}
                </p>
            </div>
        );
    }

    const sortedTotals = [...categoryTotals]
        .filter(ct => ct.totalAmount > 0)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10); // En çok harcama yapılan ilk 10 kategori

    const labels = sortedTotals.map(item => item.categoryName); // Backend'den gelir, çevrilmez
    const amounts = sortedTotals.map(item => item.totalAmount);

    const pieColors = [
        'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(40, 159, 64, 0.7)',
        'rgba(210, 99, 132, 0.7)'
    ];

    const chartDataAndOptions = useMemo(() => {
        const barDataConfig: ChartData<'bar'> = {
            labels: labels,
            datasets: [
                {
                    // ANAHTAR GÜNCELLENDİ
                    label: `${periodName} ${t('dashboard.financialStatus.spendingChart.spendingLabelSuffix', 'Harcamaları')}`,
                    data: amounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };

        const pieDataConfig: ChartData<'pie'> = {
            labels: labels,
            datasets: [
                {
                    // ANAHTAR GÜNCELLENDİ
                    label: t('dashboard.financialStatus.spendingChart.distributionLabel', 'Harcama Dağılımı'),
                    data: amounts,
                    backgroundColor: pieColors.slice(0, amounts.length),
                    borderColor: pieColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1,
                },
            ],
        };

        const commonTooltipCallback = (context: any) => {
            let label = context.label || '';
            if (label) { label += ': '; }
            const value = chartType === 'bar' ? context.parsed.y : context.parsed;
            if (value !== null && value !== undefined) {
                label += new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
                    style: 'currency', currency: 'TRY',
                }).format(value);
            }
            if (chartType === 'pie' && context.chart.data.datasets[0].data) {
                const total = (context.chart.data.datasets[0].data as number[]).reduce((acc, val) => acc + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                label += ` (${percentage}%)`;
            }
            return label;
        };

        const barOptionsConfig: ChartOptions<'bar'> = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' as const },
                title: {
                    display: true,
                    // ANAHTAR GÜNCELLENDİ
                    text: `${periodName} ${t('dashboard.financialStatus.spendingChart.barChartTitleSuffix', 'Kategori Harcamaları (Çubuk)')}`,
                    font: { size: 16 }
                },
                tooltip: { callbacks: { label: commonTooltipCallback } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            if (typeof value === 'number') {
                                return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
                                    style: 'currency', currency: 'TRY', notation: 'compact'
                                }).format(value);
                            }
                            return value;
                        }
                    }
                },
                x: { ticks: { maxRotation: 45, minRotation: 0 } }
            },
        };

        const pieOptionsConfig: ChartOptions<'pie'> = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' as const },
                title: {
                    display: true,
                    // ANAHTAR GÜNCELLENDİ
                    text: `${periodName} ${t('dashboard.financialStatus.spendingChart.pieChartTitleSuffix', 'Kategori Harcamaları (Pasta)')}`,
                    font: { size: 16 }
                },
                tooltip: { callbacks: { label: commonTooltipCallback } }
            },
        };
        return { barDataConfig, pieDataConfig, barOptionsConfig, pieOptionsConfig };
    }, [labels, amounts, periodName, t, locale, chartType]); // Bağımlılıklara t, locale, chartType eklendi

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 flex items-center mb-2 sm:mb-0">
                    {chartType === 'bar' ? <FiBarChart2 className="mr-2 text-blue-500"/> : <FiPieChart className="mr-2 text-purple-500"/>}
                    {/* ANAHTAR GÜNCELLENDİ */}
                    {t('dashboard.financialStatus.spendingChart.title', 'Harcama Grafiği')}
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setChartType('bar')}
                        disabled={chartType === 'bar'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${chartType === 'bar' ? 'bg-blue-500 text-white cursor-default' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'}`}
                    >
                        <FiBarChart2 className="mr-1.5 h-4 w-4" />
                        {/* ANAHTAR GÜNCELLENDİ */}
                        {t('dashboard.financialStatus.spendingChart.barChartLabel', 'Çubuk')}
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        disabled={chartType === 'pie'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${chartType === 'pie' ? 'bg-purple-500 text-white cursor-default' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400'}`}
                    >
                        <FiPieChart className="mr-1.5 h-4 w-4" />
                        {/* ANAHTAR GÜNCELLENDİ */}
                        {t('dashboard.financialStatus.spendingChart.pieChartLabel', 'Pasta')}
                    </button>
                </div>
            </div>
            <div style={{ height: '400px' }}> {/* Chart.js'in düzgün çalışması için explicit yükseklik */}
                {chartType === 'bar' && <Bar options={chartDataAndOptions.barOptionsConfig} data={chartDataAndOptions.barDataConfig} />}
                {chartType === 'pie' && <Pie options={chartDataAndOptions.pieOptionsConfig} data={chartDataAndOptions.pieDataConfig} />}
            </div>
        </div>
    );
};

export default SpendingChart;