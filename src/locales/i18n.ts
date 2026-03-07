import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en/translation.json';
import zh from './zh/translation.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            zh: { translation: zh },
        },
        lng: (() => {
            try {
                const storage = localStorage.getItem('settings-storage');
                if (storage) {
                    const parsed = JSON.parse(storage);
                    return parsed.state?.language || 'zh';
                }
            } catch (e) {
                console.error('Failed to parse settings-storage', e);
            }
            return 'zh';
        })(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
