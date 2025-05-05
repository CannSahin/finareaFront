// app/dashboard/page.tsx
'use client'; // useRouter ve useEffect için client component

import React, { useEffect, useState, JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Menü linkleri için
import Image from 'next/image'; // Logo için
import { FiLogOut, FiMenu, FiX, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import Footer from "@/components/layout/Footer";
import {Locale} from "@/app/page"; // İkonlar

// Kullanıcı bilgilerini (opsiyonel) göstermek için
interface UserInfo {
    email: string | null;
    // İleride eklenebilir: name, surname vb.
}

export default function DashboardPage(): JSX.Element {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo>({ email: null });
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Mobil menü için
    const [locale, setLocale] = useState<Locale>('tr');
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Token yoksa login sayfasına yönlendir
            router.push('/login');
        } else {
            // Token varsa, kullanıcı bilgisini (örneğin email) token'dan veya
            // ayrı bir API çağrısı ile alabilirsiniz. Şimdilik basit tutuyoruz.
            // JWT token'ı decode etmek için bir kütüphane (örn: jwt-decode) gerekebilir.
            // const decodedToken = jwtDecode(token); // Örnek
            // setUserInfo({ email: decodedToken.sub }); // 'sub' genellikle email içerir
            // VEYA localStorage'dan al (login'de kaydedildiyse):
            const userEmail = localStorage.getItem('userEmail'); // Login'de kaydedildiğini varsayalım
            setUserInfo({ email: userEmail || 'User' });
        }
    }, [router]); // router dependency listesine eklendi

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail'); // Kaydedildiyse email'i de sil
        router.push('/login');
    };

    // Eğer token kontrolü sırasında yönlendirme yapılıyorsa,
    // boş bir fragment döndürerek sayfa içeriğinin render edilmesini engelle
    if (!localStorage.getItem('accessToken')) {
        return <></>; // Veya bir loading indicator
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (Mobil için Gizli/Açılır, Desktop için Sabit) */}
            <aside className={`absolute inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                    <Link href="/dashboard" className="flex items-center">
                        <Image src="/images/logoo.png" alt="FinArea Logo" width={100} height={30} />
                    </Link>
                    {/* Mobil Kapatma Butonu */}
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                {/* Menü Linkleri */}
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <Link href="/dashboard/transactions" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                        <FiTrendingUp className="mr-3 h-5 w-5" /> {/* Finans Hareketleri */}
                        Finans Hareketleri
                    </Link>
                    <Link href="/dashboard/financial-status" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                        <FiDollarSign className="mr-3 h-5 w-5" /> {/* Finansal Durum */}
                        Finansal Durum
                    </Link>
                    {/* İleride eklenecek diğer menü öğeleri */}
                    {/*
                    <Link href="/dashboard/budget" className="...">Bütçe</Link>
                    <Link href="/dashboard/reports" className="...">Raporlar</Link>
                    <Link href="/dashboard/settings" className="...">Ayarlar</Link>
                    */}
                </nav>

                {/* Sidebar Footer (Logout vb.) */}
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
                {/* Top Bar (Mobil Menü Butonu) */}
                <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
                    {/* Mobil Açma Butonu */}
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                        <FiMenu className="h-6 w-6" />
                    </button>
                    {/* İsteğe bağlı: Mobil için sağ üst logout butonu */}
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                        <FiLogOut className="h-6 w-6" />
                    </button>
                </header>

                {/* Asıl Sayfa İçeriği */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="container mx-auto">
                        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Kontrol Paneli</h1>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-medium text-gray-700 mb-2">Hoş Geldiniz, {userInfo.email || 'Kullanıcı'}!</h2>
                            <p className="text-gray-600">
                                Finansal durumunuza hoş geldiniz. Soldaki menüyü kullanarak finans hareketlerinizi
                                inceleyebilir veya genel durumunuza göz atabilirsiniz.
                            </p>
                            {/* Buraya özet kartlar, grafikler veya diğer dashboard widget'ları eklenebilir */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                                    <h3 className="font-semibold text-blue-800">Finans Hareketleri</h3>
                                    <p className="text-sm text-blue-600 mt-1">Son işlemlerinizi ve kategorileri görün.</p>
                                    <Link href="/dashboard/transactions" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-900">Detaylar →</Link>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                                    <h3 className="font-semibold text-green-800">Finansal Durum</h3>
                                    <p className="text-sm text-green-600 mt-1">Genel bakış, varlıklar ve borçlar.</p>
                                    <Link href="/dashboard/financial-status" className="mt-3 inline-block text-sm font-medium text-green-700 hover:text-green-900">Detaylar →</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer locale={locale} />
            </div>
        </div>
    );
}