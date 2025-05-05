// lib/i18n.ts

import trData from '@/locales/tr.json';
import enData from '@/locales/en.json';

// Genel bir çeviri nesnesi tipi tanımlayalım
// Bu tip, anahtarlarının string, değerlerinin ise herhangi bir şey
// (string, nesne, dizi vb.) olabileceğini söyler.
type TranslationData = Record<string, any>;

// translations nesnesinin tipini belirtin
const translations: Record<string, TranslationData> = {
    tr: trData, // Type assertion'a gerek yok, TranslationData daha genel
    en: enData,
};

/**
 * Verilen locale (dil kodu) için çeviri nesnesini döndürür.
 * Eğer locale bulunamazsa varsayılan olarak Türkçe ('tr') döndürür.
 * @param {string} locale 'tr' veya 'en' gibi dil kodu.
 * @returns {TranslationData} İlgili dilin çeviri nesnesi.
 */
export const getTranslations = (locale: string): TranslationData => {
    // Dönüş tipi TranslationData olarak belirtildi
    return translations[locale] || translations.tr;
};

// İsteğe bağlı: Daha güvenli erişim için yardımcı fonksiyon
/**
 * Çeviri nesnesinden belirli bir anahtara güvenli erişim sağlar.
 * Anahtar bulunamazsa fallback değerini döndürür.
 * Örn: t('hero.title', 'Varsayılan Başlık')
 * @param translations Çeviri nesnesi (getTranslations'dan dönen)
 * @param key Erişilecek anahtar (örn: 'hero.title', 'nav.login')
 * @param fallback Anahtar bulunamazsa döndürülecek değer (isteğe bağlı)
 * @returns {any} Anahtarın değeri veya fallback.
 */
export const t = (translations: TranslationData, key: string, fallback: any = ''): any => {
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
        result = result?.[k]; // Optional chaining ile güvenli erişim
        if (result === undefined) {
            console.warn(`Translation key not found: ${key}`); // Uyarı logu
            return fallback;
        }
    }
    return result ?? fallback; // Nullish coalescing ile null/undefined için fallback
};