// app/(dashboard)/financial-status/components/SpendingChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';
import {FiBarChart2, FiTrendingUp} from 'react-icons/fi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
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

const SpendingChart: React.FC<SpendingChartProps> = ({ categoryTotals, periodName, locale }) => {
    if (!categoryTotals || categoryTotals.length === 0) {
        return null; // Veri yoksa grafiği gösterme
    }

    // Harcamaları büyükten küçüğe sırala ve ilk X tanesini al (opsiyonel)
    const sortedTotals = [...categoryTotals]
        .filter(ct => ct.totalAmount > 0) // Sadece pozitif harcamaları göster
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10); // Örneğin ilk 10 kategoriyi göster

    const data: ChartData<'bar'> = {
        labels: sortedTotals.map(item => item.categoryName),
        datasets: [
            {
                label: `Harcamalar (${periodName})`,
                data: sortedTotals.map(item => item.totalAmount),
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Mavi tonu
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false, // Yüksekliği ayarlamak için
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${periodName} Harcama Grafiği`,
                font: {
                    size: 16,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
                                style: 'currency',
                                currency: 'TRY', // Varsayılan
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        if (typeof value === 'number') {
                            return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
                                style: 'currency',
                                currency: 'TRY',
                                notation: 'compact' // Örneğin 1.5K, 2M gibi
                            }).format(value);
                        }
                        return value;
                    }
                }
            },
            x: {
                ticks: {
                    maxRotation: 45, // Kategori isimleri uzunsa eğ
                    minRotation: 0,
                }
            }
        },
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FiBarChart2 className="mr-2 text-green-500"/> Harcama Grafiği
            </h3>
            <div style={{ height: '400px' }}> {/* Grafiğin yüksekliğini ayarla */}
                <Bar options={options} data={data} />
            </div>
        </div>
    );
};

export default SpendingChart;