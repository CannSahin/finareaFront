// lib/i18n.js

import trData from '@/locales/tr.json'; // '@' projenizin kökünü gösteren alias (next.config.mjs'de ayarlanır)
import enData from '@/locales/en.json'; // Veya '../locales/en.json' gibi göreceli yol

const translations = {
    tr: trData,
    en: enData,
};

/**
 * Verilen locale (dil kodu) için çeviri nesnesini döndürür.
 * Eğer locale bulunamazsa varsayılan olarak Türkçe ('tr') döndürür.
 * @param {string} locale 'tr' veya 'en' gibi dil kodu.
 * @returns {object} İlgili dilin çeviri nesnesi.
 */
export const getTranslations = (locale) => {
    return translations[locale] || translations.tr; // Bulunamazsa TR'ye fallback
};