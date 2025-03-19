// context/QuranContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// إنشاء سياق القرآن
const QuranContext = createContext();

// مزود السياق للقرآن الكريم
export const QuranProvider = ({ children }) => {
  const [surahs, setSurahs] = useState([]);
  const [currentSurah, setCurrentSurah] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [quranData, setQuranData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [selectedTranslation, setSelectedTranslation] = useState('ar.muyassar'); // الترجمة الافتراضية: الميسر
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy'); // القارئ الافتراضي: مشاري العفاسي
  const [availableTranslations, setAvailableTranslations] = useState([]);
  const [availableReciters, setAvailableReciters] = useState([]);

  // استدعاء قائمة السور عند تحميل المكون
  useEffect(() => {
    fetchSurahs();
    fetchAvailableTranslations();
    fetchAvailableReciters();
    
    // استرجاع العلامات المرجعية والقراءة الأخيرة من التخزين المحلي
    const savedBookmarks = localStorage.getItem('quran-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    const savedLastRead = localStorage.getItem('quran-last-read');
    if (savedLastRead) {
      setLastRead(JSON.parse(savedLastRead));
      // تعيين السورة والآية الحالية إلى آخر قراءة
      const { surah, ayah } = JSON.parse(savedLastRead);
      setCurrentSurah(surah);
      setCurrentAyah(ayah);
    }
  }, []);

  // جلب قائمة السور
  const fetchSurahs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await response.json();
      
      if (data.code === 200 && data.status === 'OK') {
        setSurahs(data.data);
      } else {
        setError('حدث خطأ في جلب قائمة السور');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('خطأ في جلب قائمة السور:', error);
      setError('حدث خطأ في الاتصال بخادم القرآن');
      setIsLoading(false);
    }
  };

  // جلب الترجمات المتاحة
  const fetchAvailableTranslations = async () => {
    try {
      const response = await fetch('https://api.alquran.cloud/v1/edition/type/translation');
      const data = await response.json();
      
      if (data.code === 200 && data.status === 'OK') {
        setAvailableTranslations(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب قائمة الترجمات:', error);
    }
  };

  // جلب القراء المتاحين
  const fetchAvailableReciters = async () => {
    try {
      const response = await fetch('https://api.alquran.cloud/v1/edition/format/audio');
      const data = await response.json();
      
      if (data.code === 200 && data.status === 'OK') {
        // تصفية لجلب القراء فقط
        const reciters = data.data.filter(item => item.format === 'audio');
        setAvailableReciters(reciters);
      }
    } catch (error) {
      console.error('خطأ في جلب قائمة القراء:', error);
    }
  };

  // جلب آيات سورة معينة
  const fetchSurah = async (surahNumber, translationId = selectedTranslation) => {
    try {
      setIsLoading(true);
      // جلب النص العربي
      const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.asad`);
      const arabicData = await arabicResponse.json();
      
      // جلب الترجمة
      const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${translationId}`);
      const translationData = await translationResponse.json();
      
      if (arabicData.code === 200 && translationData.code === 200) {
        // دمج النص العربي مع الترجمة
        const combinedData = arabicData.data.ayahs.map((ayah, index) => {
          return {
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            text: ayah.text,
            translation: translationData.data.ayahs[index].text,
            page: ayah.page,
            juz: ayah.juz,
            sajda: ayah.sajda
          };
        });
        
        setQuranData({
          surah: arabicData.data.number,
          name: arabicData.data.name,
          englishName: arabicData.data.englishName,
          englishNameTranslation: arabicData.data.englishNameTranslation,
          revelationType: arabicData.data.revelationType,
          numberOfAyahs: arabicData.data.numberOfAyahs,
          ayahs: combinedData
        });
        
        // تحديث آخر قراءة
        updateLastRead(surahNumber, 1);
      } else {
        setError('حدث خطأ في جلب السورة');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('خطأ في جلب السورة:', error);
      setError('حدث خطأ في الاتصال بخادم القرآن');
      setIsLoading(false);
    }
  };

  // جلب صفحة معينة من القرآن
  const fetchPage = async (pageNumber, translationId = selectedTranslation) => {
    try {
      setIsLoading(true);
      // جلب النص العربي
      const arabicResponse = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/ar.asad`);
      const arabicData = await arabicResponse.json();
      
      // جلب الترجمة
      const translationResponse = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/${translationId}`);
      const translationData = await translationResponse.json();
      
      if (arabicData.code === 200 && translationData.code === 200) {
        // دمج النص العربي مع الترجمة
        const combinedData = arabicData.data.ayahs.map((ayah, index) => {
          return {
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            surah: ayah.surah.number,
            surahName: ayah.surah.name,
            text: ayah.text,
            translation: translationData.data.ayahs[index].text,
            page: ayah.page,
            juz: ayah.juz,
            hizbQuarter: ayah.hizbQuarter,
            sajda: ayah.sajda
          };
        });
        
        setQuranData({
          page: pageNumber,
          ayahs: combinedData
        });
        
        // تحديث آخر قراءة (نستخدم أول آية في الصفحة)
        if (combinedData.length > 0) {
          updateLastRead(combinedData[0].surah, combinedData[0].numberInSurah);
        }
      } else {
        setError('حدث خطأ في جلب الصفحة');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('خطأ في جلب الصفحة:', error);
      setError('حدث خطأ في الاتصال بخادم القرآن');
      setIsLoading(false);
    }
  };

  // جلب تفسير آية معينة
  const fetchTafseer = async (surahNumber, ayahNumber, tafsirId = 'ar.muyassar') => {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${tafsirId}`);
      const data = await response.json();
      
      if (data.code === 200) {
        return data.data.text;
      } else {
        throw new Error('حدث خطأ في جلب التفسير');
      }
    } catch (error) {
      console.error('خطأ في جلب التفسير:', error);
      throw error;
    }
  };

  // إضافة إشارة مرجعية
  const addBookmark = (surah, ayah, note = '') => {
    const newBookmark = {
      id: Date.now(),
      surah,
      ayah,
      date: new Date().toISOString(),
      note
    };
    
    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    
    // حفظ في التخزين المحلي
    localStorage.setItem('quran-bookmarks', JSON.stringify(updatedBookmarks));
    
    return newBookmark;
  };

  // حذف إشارة مرجعية
  const removeBookmark = (bookmarkId) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    
    // تحديث التخزين المحلي
    localStorage.setItem('quran-bookmarks', JSON.stringify(updatedBookmarks));
  };

  // تحديث آخر قراءة
  const updateLastRead = (surah, ayah) => {
    const lastReadData = { surah, ayah, timestamp: Date.now() };
    setLastRead(lastReadData);
    
    // حفظ في التخزين المحلي
    localStorage.setItem('quran-last-read', JSON.stringify(lastReadData));
  };

  // الحصول على رابط صوت الآية
  const getAyahAudioUrl = (surah, ayah, reciterId = selectedReciter) => {
    return `https://cdn.islamic.network/quran/audio/128/${reciterId.split('.')[1]}/${getAyahNumber(surah, ayah)}.mp3`;
  };

  // الحصول على رقم الآية المطلق (من بين كل آيات القرآن)
  const getAyahNumber = (surah, ayah) => {
    let ayahNumber = 0;
    
    // حساب عدد الآيات السابقة
    for (let i = 1; i < surah; i++) {
      const surahInfo = surahs.find(s => s.number === i);
      if (surahInfo) {
        ayahNumber += surahInfo.numberOfAyahs;
      }
    }
    
    // إضافة رقم الآية في السورة
    ayahNumber += ayah;
    
    return ayahNumber;
  };

  // تبديل ترجمة
  const changeTranslation = (translationId) => {
    setSelectedTranslation(translationId);
    
    // إعادة تحميل البيانات بالترجمة الجديدة
    if (quranData) {
      if (quranData.surah) {
        fetchSurah(quranData.surah, translationId);
      } else if (quranData.page) {
        fetchPage(quranData.page, translationId);
      }
    }
  };

  // تبديل القارئ
  const changeReciter = (reciterId) => {
    setSelectedReciter(reciterId);
  };

  // تصدير السياق والوظائف
  const value = {
    surahs,
    currentSurah,
    setCurrentSurah,
    currentAyah,
    setCurrentAyah,
    quranData,
    isLoading,
    error,
    bookmarks,
    lastRead,
    selectedTranslation,
    selectedReciter,
    availableTranslations,
    availableReciters,
    fetchSurah,
    fetchPage,
    fetchTafseer,
    addBookmark,
    removeBookmark,
    updateLastRead,
    getAyahAudioUrl,
    changeTranslation,
    changeReciter
  };

  return (
    <QuranContext.Provider value={value}>
      {children}
    </QuranContext.Provider>
  );
};

// دالة مساعدة لاستخدام سياق القرآن
export const useQuran = () => {
  const context = useContext(QuranContext);
  if (context === undefined) {
    throw new Error('useQuran يجب أن يستخدم داخل QuranProvider');
  }
  return context;
};