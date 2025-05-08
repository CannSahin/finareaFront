'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

// DTO'ları direkt burada tanımlayalım, ayrı dosyaya gerek kalmasın
// TransactionsList'e yeni tip eklememek için
interface CategoryForModal {
    id: number;
    name: string;
}

interface ManualTransactionRequestDtoForModal {
    year: number;
    month: number;
    categoryId: number;
    description: string;
    amount: number;
}

interface ManualTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ManualTransactionRequestDtoForModal) => Promise<void>; // Promise<void> olarak güncellendi
    availableCategories: CategoryForModal[]; // Sabit veya dinamik olarak TransactionsList'ten gelecek
    initialYear: number;
    initialMonth: number;
    locale: 'tr' | 'en';
}

const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
                                                                           isOpen,
                                                                           onClose,
                                                                           onSubmit,
                                                                           availableCategories,
                                                                           initialYear,
                                                                           initialMonth,
                                                                           locale,
                                                                       }) => {
    const [categoryId, setCategoryId] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setCategoryId(availableCategories.length > 0 ? availableCategories[0].id.toString() : '');
            setDescription('');
            setAmount('');
            setFormError(null);
            setIsSubmitting(false); // Modal kapandığında submit durumunu sıfırla
        } else if (availableCategories.length > 0 && !categoryId) {
            // Modal açıldığında ve categoryId boşsa, ilk kategoriyi seç
            setCategoryId(availableCategories[0].id.toString());
        }
    }, [isOpen, availableCategories, categoryId]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        if (!categoryId || !description.trim() || !amount) {
            setFormError(locale === 'tr' ? 'Tüm alanlar zorunludur.' : 'All fields are required.');
            return;
        }

        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setFormError(locale === 'tr' ? 'Tutar geçerli bir pozitif sayı olmalıdır.' : 'Amount must be a valid positive number.');
            return;
        }

        const dataToSubmit: ManualTransactionRequestDtoForModal = {
            year: initialYear,
            month: initialMonth,
            categoryId: parseInt(categoryId, 10),
            description: description.trim(),
            amount: numericAmount,
        };

        setIsSubmitting(true);
        try {
            await onSubmit(dataToSubmit);
            // onClose(); // Başarılı submit sonrası modalı TransactionsList içinden kapatacağız
        } catch (error: any) {
            setFormError(error.message || (locale === 'tr' ? 'Bir hata oluştu.' : 'An error occurred.'));
            // Sadece hata durumunda submit butonunu tekrar aktif et
            // Başarı durumunda TransactionsList modalı kapatıp, isSubmitting'i dolaylı olarak false yapacak (useEffect ile)
            setIsSubmitting(false);
        }
        // Formu sıfırlama veya modal kapatma burada yapılmayacak, TransactionsList'ten yönetilecek
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {locale === 'tr' ? 'Manuel Hareket Ekle' : 'Add Manual Transaction'}
                    </h2>
                    <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="modal-category" className="block text-sm font-medium text-gray-700">
                            {locale === 'tr' ? 'Kategori' : 'Category'} <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="modal-category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={isSubmitting || availableCategories.length === 0}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="" disabled>
                                {locale === 'tr' ? 'Kategori Seçin' : 'Select Category'}
                            </option>
                            {availableCategories.map((cat) => (
                                <option key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {availableCategories.length === 0 && <p className="text-xs text-red-500 mt-1">{locale === 'tr' ? 'Kategori bulunamadı.' : 'No categories found.'}</p>}
                    </div>

                    <div>
                        <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700">
                            {locale === 'tr' ? 'Açıklama' : 'Description'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="modal-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={255}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="modal-amount" className="block text-sm font-medium text-gray-700">
                            {locale === 'tr' ? 'Tutar (Pozitif Girin)' : 'Amount (Enter Positive)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="modal-amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                            placeholder={locale === 'tr' ? 'Örn: 150,75' : 'E.g.: 150.75'}
                            disabled={isSubmitting}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    {formError && (
                        <p className="text-sm text-red-600">{formError}</p>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                            {locale === 'tr' ? 'İptal' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || availableCategories.length === 0}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <FiLoader className="animate-spin mr-2 h-4 w-4" />
                            ) : (
                                <FiSave className="mr-2 h-4 w-4" />
                            )}
                            {isSubmitting ? (locale === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (locale === 'tr' ? 'Kaydet' : 'Save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualTransactionModal;