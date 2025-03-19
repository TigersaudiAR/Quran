// public/index.html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#4CAF50" />
    <meta
      name="description"
      content="تطبيق تعليمي شامل للقرآن الكريم يساعد على تعلم وحفظ القرآن بطرق مبتكرة"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
    <title>تطبيق القرآن الكريم التعليمي</title>
  </head>
  <body>
    <noscript>يجب تفعيل JavaScript لتشغيل هذا التطبيق.</noscript>
    <div id="root"></div>
  </body>
</html>

// public/_redirects
/* /index.html 200

// public/manifest.json
{
  "short_name": "القرآن التعليمي",
  "name": "تطبيق القرآن الكريم التعليمي",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#4CAF50",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "dir": "rtl",
  "lang": "ar"
}

// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

// src/reportWebVitals.js
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

// src/utils/api.js
/**
 * وحدة التعامل مع واجهة برمجة التطبيقات للقرآن الكريم
 */

const API_BASE_URL = 'https://api.alquran.cloud/v1';
const AUDIO_CDN = 'https://cdn.islamic.network/quran/audio';

/**
 * جلب قائمة السور
 * @param {string} language لغة أسماء السور، افتراضيًا 'ar'
 * @returns {Promise} وعد بالبيانات
 */
export const fetchSurahs = async (language = 'ar') => {
  try {
    const response = await fetch(`${API_BASE_URL}/surah?language=${language}`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في جلب قائمة السور');
    }
    
    return data.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة السور:', error);
    throw error;
  }
};

/**
 * جلب سورة محددة
 * @param {number} surahNumber رقم السورة
 * @param {string} edition نسخة النص، افتراضيًا 'ar.asad'
 * @returns {Promise} وعد بالبيانات
 */
export const fetchSurah = async (surahNumber, edition = 'ar.asad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/${edition}`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في جلب السورة');
    }
    
    return data.data;
  } catch (error) {
    console.error(`خطأ في جلب السورة ${surahNumber}:`, error);
    throw error;
  }
};

/**
 * جلب صفحة محددة من القرآن
 * @param {number} pageNumber رقم الصفحة
 * @param {string} edition نسخة النص، افتراضيًا 'ar.asad'
 * @returns {Promise} وعد بالبيانات
 */
export const fetchPage = async (pageNumber, edition = 'ar.asad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/${pageNumber}/${edition}`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في جلب الصفحة');
    }
    
    return data.data;
  } catch (error) {
    console.error(`خطأ في جلب الصفحة ${pageNumber}:`, error);
    throw error;
  }
};

/**
 * جلب آية محددة
 * @param {number} surahNumber رقم السورة
 * @param {number} ayahNumber رقم الآية
 * @param {string} edition نسخة النص، افتراضيًا 'ar.asad'
 * @returns {Promise} وعد بالبيانات
 */
export const fetchAyah = async (surahNumber, ayahNumber, edition = 'ar.asad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${edition}`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في جلب الآية');
    }
    
    return data.data;
  } catch (error) {
    console.error(`خطأ في جلب الآية ${surahNumber}:${ayahNumber}:`, error);
    throw error;
  }
};

/**
 * جلب تفسير آية محددة
 * @param {number} surahNumber رقم السورة
 * @param {number} ayahNumber رقم الآية
 * @param {string} tafsirId معرف التفسير، افتراضيًا 'ar.muyassar'
 * @returns {Promise} وعد بالبيانات
 */
export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId = 'ar.muyassar') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${tafsirId}`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في جلب التفسير');
    }
    
    return data.data;
  } catch (error) {
    console.error(`خطأ في جلب تفسير الآية ${surahNumber}:${ayahNumber}:`, error);
    throw error;
  }
};

/**
 * جلب قائمة التراجم المتوفرة
 * @returns {Promise} وعد بالبيانات
 */
export const fetchTranslations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/edition/type/translation`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في جلب قائمة التراجم');
    }
    
    return data.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة التراجم:', error);
    throw error;
  }
};

/**
 * جلب قائمة القراء المتوفرين
 * @returns {Promise} وعد بالبيانات
 */
export const fetchReciters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/edition/format/audio`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في جلب قائمة القراء');
    }
    
    // تصفية للحصول على القراء فقط
    const reciters = data.data.filter(item => item.format === 'audio');
    return reciters;
  } catch (error) {
    console.error('خطأ في جلب قائمة القراء:', error);
    throw error;
  }
};

/**
 * البحث في القرآن الكريم
 * @param {string} query نص البحث
 * @param {string} language لغة البحث، افتراضيًا 'ar'
 * @returns {Promise} وعد بالبيانات
 */
export const searchQuran = async (query, language = 'ar') => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/${encodeURIComponent(query)}/all/${language}`);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'حدث خطأ في البحث');
    }
    
    return data.data.matches;
  } catch (error) {
    console.error(`خطأ في البحث عن "${query}":`, error);
    throw error;
  }
};

/**
 * الحصول على رابط الصوت للآية
 * @param {string} reciter معرف القارئ، مثل 'ar.alafasy'
 * @param {number} surah رقم السورة
 * @param {number} ayah رقم الآية
 * @returns {string} رابط ملف الصوت
 */
export const getAyahAudioUrl = (reciter, surah, ayah) => {
  // استخراج اسم القارئ من المعرف (مثال: 'ar.alafasy' -> 'alafasy')
  const reciterName = reciter.split('.')[1] || reciter;
  return `${AUDIO_CDN}/128/${reciterName}/${surah}/${ayah}.mp3`;
};

/**
 * الحصول على رابط صوت السورة كاملة
 * @param {string} reciter معرف القارئ، مثل 'ar.alafasy'
 * @param {number} surah رقم السورة
 * @returns {string} رابط ملف الصوت
 */
export const getSurahAudioUrl = (reciter, surah) => {
  // استخراج اسم القارئ من المعرف (مثال: 'ar.alafasy' -> 'alafasy')
  const reciterName = reciter.split('.')[1] || reciter;
  return `${AUDIO_CDN}/128/${reciterName}/${surah}.mp3`;
};

// src/utils/formatters.js
/**
 * وحدة تنسيق البيانات
 */

/**
 * تنسيق الوقت بالدقائق والثواني
 * @param {number} seconds الوقت بالثواني
 * @returns {string} النص المنسق (مثال: "05:30")
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

/**
 * تنسيق التاريخ بالعربية
 * @param {string|Date} date التاريخ
 * @param {object} options خيارات التنسيق
 * @returns {string} التاريخ المنسق
 */
export const formatDate = (date, options = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  weekday: 'long'
}) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('ar-SA', options);
};

/**
 * تنسيق رقم الآية بالصيغة "السورة:الآية"
 * @param {number} surah رقم السورة
 * @param {number} ayah رقم الآية
 * @returns {string} النص المنسق (مثال: "2:255")
 */
export const formatAyahNumber = (surah, ayah) => {
  return `${surah}:${ayah}`;
};

/**
 * تنسيق حجم الملف
 * @param {number} bytes حجم الملف بالبايت
 * @returns {string} الحجم المنسق (مثال: "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

// .env.development
REACT_APP_API_BASE_URL=https://api.alquran.cloud/v1
REACT_APP_AUDIO_CDN=https://cdn.islamic.network/quran/audio
REACT_APP_DEBUG=true

// .env.production
REACT_APP_API_BASE_URL=https://api.alquran.cloud/v1
REACT_APP_AUDIO_CDN=https://cdn.islamic.network/quran/audio
REACT_APP_DEBUG=false