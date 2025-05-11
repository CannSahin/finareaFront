'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface FileUploadResponseDto {
    message: string;
    sourceName: string;
    transactionCount: number;
}

// Backend'deki AiProvider enum'una karşılık gelecek
export enum AiProviderClient {
    GEMINI = 'GEMINI',
    OPENAI = 'OPENAI',
    // Gelecekte eklenecekler...
}

interface StatementUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (data: FileUploadResponseDto) => void;
}

const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onUploadSuccess,
                                                                   }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sourcePrefix, setSourcePrefix] = useState<string>(''); // Yeni state
    const [selectedProvider, setSelectedProvider] = useState<AiProviderClient>(AiProviderClient.GEMINI); // Yeni state, varsayılan GEMINI
    const [isLoading, setIsLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setUploadStatus(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile) {
            setUploadStatus({ message: 'Lütfen bir dosya seçin.', type: 'error' });
            return;
        }

        setIsLoading(true);
        setUploadStatus({ message: 'Yükleniyor ve işleniyor, lütfen bekleyin...', type: 'info' });

        const formData = new FormData();
        formData.append('statementFile', selectedFile); // Backend'deki @RequestParam("file") ile eşleşmeli
        if (sourcePrefix.trim() !== '') {
            formData.append('sourcePrefix', sourcePrefix.trim()); // Backend'deki @RequestParam("sourcePrefix") ile eşleşmeli
        }
        formData.append('provider', selectedProvider); // Backend'deki @RequestParam("provider") ile eşleşmeli

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setUploadStatus({ message: 'Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.', type: 'error' });
            setIsLoading(false);
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        try {
            const response = await fetch(`${API_URL}/api/v1/statements/upload`, { // URL'den query param'larını kaldırdık, FormData'ya eklendi
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type' FormData için tarayıcı tarafından otomatik ayarlanır
                },
                body: formData,
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = `Sunucu hatası: ${response.status} (${response.statusText || 'Bilinmeyen Durum'})`;
                if (responseText) {
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorData.error || responseText;
                    } catch (e) {
                        errorMessage = responseText.substring(0, 300) + (responseText.length > 300 ? "..." : "");
                    }
                }
                throw new Error(errorMessage);
            }

            let result: FileUploadResponseDto;
            try {
                result = JSON.parse(responseText);
            } catch (e: any) {
                console.error("Başarılı yanıtta JSON ayrıştırma hatası:", e, "Yanıt metni:", responseText);
                throw new Error(`Başarılı yanıt alındı (HTTP ${response.status}) ancak yanıt içeriği JSON formatında değil. Alınan yanıtın başı: ${responseText.substring(0,150)}`);
            }

            setUploadStatus({
                message: `${result.message} Kaynak: ${result.sourceName}, ${result.transactionCount} işlem bulundu.`,
                type: 'success',
            });
            onUploadSuccess(result);

            // Formu sıfırla
            setSelectedFile(null);
            setSourcePrefix('');
            setSelectedProvider(AiProviderClient.GEMINI); // Varsayılana dön
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error: any) {
            console.error('Yükleme sırasında detaylı hata:', error);
            const displayMessage = (typeof error.message === 'string' && error.message.trim() !== "")
                ? error.message
                : 'Beklenmedik bir hata oluştu. Lütfen sunucu loglarını kontrol edin.';
            setUploadStatus({ message: `Yükleme başarısız: ${displayMessage}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setSourcePrefix('');
            setSelectedProvider(AiProviderClient.GEMINI);
            setUploadStatus(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-lg transform transition-all sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Ekstre Yükle</h2>
                    <button
                        onClick={() => { if (!isLoading) onClose(); }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Kapat"
                        disabled={isLoading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                    Lütfen taranacak ekstreyi (.pdf) seçin. AI tarafından taranıp kategorilere ayrılacaktır.
                </p>
                <form onSubmit={handleSubmit}>
                    {/* Dosya Seçimi */}
                    <div className="mb-4">
                        <label htmlFor="statementFile" className="block text-sm font-medium text-gray-700 mb-1">
                            Ekstre Dosyası (.pdf)
                        </label>
                        <input
                            id="statementFile"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf" // Sadece PDF kabul edilecek şekilde güncellendi
                            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Kaynak Adı Öneki */}
                    <div className="mb-4">
                        <label htmlFor="sourcePrefix" className="block text-sm font-medium text-gray-700 mb-1">
                            Kaynak Adı Öneki (İsteğe Bağlı)
                        </label>
                        <input
                            id="sourcePrefix"
                            type="text"
                            value={sourcePrefix}
                            onChange={(e) => setSourcePrefix(e.target.value)}
                            placeholder="Örn: Garanti Bonus Kredi Kartı"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            disabled={isLoading}
                        />
                        <p className="mt-1 text-xs text-gray-500">Bu önek, yüklenen dosya adının başına eklenecektir.</p>
                    </div>

                    {/* AI Sağlayıcısı Seçimi */}
                    <div className="mb-6">
                        <label htmlFor="aiProvider" className="block text-sm font-medium text-gray-700 mb-1">
                            Kullanılacak AI Servisi
                        </label>
                        <select
                            id="aiProvider"
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value as AiProviderClient)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            disabled={isLoading}
                        >
                            {Object.values(AiProviderClient).map((providerValue) => (
                                <option key={providerValue} value={providerValue}>
                                    {providerValue}
                                </option>
                            ))}
                        </select>
                    </div>


                    {uploadStatus && (
                        <div
                            className={`p-3 rounded-md text-sm mb-4 break-words ${
                                uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    uploadStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                                        'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                            role="alert"
                        >
                            {uploadStatus.message}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        disabled={isLoading || !selectedFile}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Yükleniyor...
                            </span>
                        ) : 'Yükle ve Tara'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StatementUploadModal;