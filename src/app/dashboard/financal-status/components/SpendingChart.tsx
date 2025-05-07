// app/(dashboard)/financial-status/components/SpendingChart.tsx
import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement, // Pasta grafik için eklendi
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';
import { FiBarChart2, FiPieChart } from 'react-icons/fi'; // FiPieChart ikonu eklendi

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement, // Kaydedildi
    Title,
    Tooltip,
    Legend
);

interface CategorySummaryDto {
    categoryName: string;
    totalAmount: number;
}

interface SpendingChartProps {
    categoryTotals: CategorySummaryDto[];
    periodName: string;
    locale: 'tr' | 'en';
}

type ChartType = 'bar' | 'pie';

const SpendingChart: React.FC<SpendingChartProps> = ({ categoryTotals, periodName, locale }) => {
    const [chartType, setChartType] = useState<ChartType>('bar'); // Varsayılan çubuk grafik

    if (!categoryTotals || categoryTotals.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FiBarChart2 className="mr-2 text-gray-400"/> Harcama Grafiği
                </h3>
                <p className="text-gray-500">Gösterilecek harcama verisi bulunmamaktadır.</p>
            </div>
        );
    }

    // Harcamaları büyükten küçüğe sırala ve ilk X tanesini al
    const sortedTotals = [...categoryTotals]
        .filter(ct => ct.totalAmount > 0)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10); // İlk 10 kategori

    const labels = sortedTotals.map(item => item.categoryName);
    const amounts = sortedTotals.map(item => item.totalAmount);

    // Pasta grafik için daha çeşitli renkler tanımlayalım
    const pieColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(210, 99, 132, 0.7)'
    ];

    const barData: ChartData<'bar'> = {
        labels: labels,
        datasets: [
            {
                label: `${periodName} Harcamaları`,
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const pieData: ChartData<'pie'> = {
        labels: labels,
        datasets: [
            {
                label: 'Harcama Dağılımı',
                data: amounts,
                backgroundColor: pieColors.slice(0, amounts.length),
                borderColor: pieColors.map(color => color.replace('0.7', '1')), // Kenarlık için opak renkler
                borderWidth: 1,
            },
        ],
    };

    const commonTooltipCallback = (context: any) => {
        let label = context.label || ''; // Pie chart'ta context.dataset.label yok, context.label kullanılır
        if (label) {
            label += ': ';
        }
        const value = chartType === 'bar' ? context.parsed.y : context.parsed;
        if (value !== null && value !== undefined) {
            label += new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
                style: 'currency',
                currency: 'TRY',
            }).format(value);
        }
        // Pasta grafikte yüzdeyi de ekleyelim
        if (chartType === 'pie' && context.chart.data.datasets[0].data) {
            const total = (context.chart.data.datasets[0].data as number[]).reduce((acc, val) => acc + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            label += ` (${percentage}%)`;
        }
        return label;
    };


    const barOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `${periodName} Kategori Harcamaları (Çubuk)`, font: { size: 16 } },
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

    const pieOptions: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `${periodName} Kategori Harcamaları (Pasta)`, font: { size: 16 } },
            tooltip: { callbacks: { label: commonTooltipCallback } }
        },
        // Pasta grafik için scales'e gerek yok
    };


    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 flex items-center mb-2 sm:mb-0">
                    {chartType === 'bar' ? <FiBarChart2 className="mr-2 text-blue-500"/> : <FiPieChart className="mr-2 text-purple-500"/>}
                    Harcama Grafiği
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setChartType('bar')}
                        disabled={chartType === 'bar'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors
                                    ${chartType === 'bar'
                            ? 'bg-blue-500 text-white cursor-default'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'}`}
                    >
                        <FiBarChart2 className="mr-1.5 h-4 w-4" /> Çubuk
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        disabled={chartType === 'pie'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors
                                    ${chartType === 'pie'
                            ? 'bg-purple-500 text-white cursor-default'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400'}`}
                    >
                        <FiPieChart className="mr-1.5 h-4 w-4" /> Pasta
                    </button>
                </div>
            </div>

            <div style={{ height: '400px' }}>
                {chartType === 'bar' && <Bar options={barOptions} data={barData} />}
                {chartType === 'pie' && <Pie options={pieOptions} data={pieData} />}
            </div>
        </div>
    );
};

export default SpendingChart;