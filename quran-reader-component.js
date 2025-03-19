// components/QuranReader.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuran } from '../context/QuranContext';
import { useLanguage } from '../context/LanguageContext';
import AudioPlayer from './AudioPlayer';
import './QuranReader.css';

const QuranReader = () => {
  const { translations, getQuranData, currentSurah, setCurrentSurah, currentAyah, setCurrentAyah } = useQuran();
  const { language, translations: langTranslations } = useLanguage();
  const navigate = useNavigate();
  const [quranData, setQuranData] = useState(null);
  const [surahList, setSurahList] = useState([]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [activeTranslation, setActiveTranslation] = useState('ar-jowhara');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentReciter, setCurrentReciter] = useState('mishari_rashid_alafasy');
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [ayahOptions, setAyahOptions] = useState(false);
  const [fontSizeArabic, setFontSizeArabic] = useState(28);
  const [fontSizeTranslation, setFontSizeTranslation] = useState(18);
  const [viewMode, setViewMode] = useState('page'); // 'page' or 'surah'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(604);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  const reciters = [
    { id: 'mishari_rashid_alafasy', name: 'مشاري راشد العفاسي' },
    { id: 'abdul_basit_murattal', name: 'عبد الباسط عبد الصمد' },
    { id: 'mahmoud_khalil_al-husary', name: 'محمود خليل الحصري' },
    { id: 'abu_bakr_al-shatri', name: 'أبو بكر الشاطري' },
    { id: 'saad_al-ghamdi', name: 'سعد الغامدي' },
  ];

  useEffect(() => {
    const fetchQuranData = async () => {
      setIsLoading(true);
      try {
        // Fetch Surah list
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=ar');
        const data = await response.json();
        setSurahList(data.chapters);

        // Fetch initial Quran data (Surah 1 by default)
        loadSurah(currentSurah || 1);
      } catch (error) {
        console.error('خطأ في جلب بيانات القرآن:', error);
      }
    };

    fetchQuranData();
  }, [currentSurah]);

  const loadSurah = async (surahId) => {
    setIsLoading(true);
    try {
      // Fetch Surah text
      const textResponse = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`);
      const textData = await textResponse.json();

      // Fetch Surah translation
      const translationResponse = await fetch(`https://api.quran.com/api/v4/quran/translations/131?chapter_number=${surahId}`);
      const translationData = await translationResponse.json();

      // Combine text and translation
      const combinedData = textData.verses.map((verse, index) => ({
        id: verse.id,
        verse_key: verse.verse_key,
        text_uthmani: verse.text_uthmani,
        translation: translationData.verses[index]?.text || '',
        verse_number: parseInt(verse.verse_key.split(':')[1])
      }));

      setQuranData(combinedData);
      setCurrentSurah(surahId);
      setCurrentAyah(1);
      setIsLoading(false);
    } catch (error) {
      console.error('خطأ في جلب السورة:', error);
      setIsLoading(false);
    }
  };

  const handleSurahChange = (event) => {
    const surahId = parseInt(event.target.value);
    loadSurah(surahId);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // In a real app, we would load the page data here
      // For demonstration, we'll just simulate the change
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleAyahClick = (ayah) => {
    setSelectedAyah(ayah);
    setAyahOptions(true);
  };

  const handleAyahAction = (action, ayah) => {
    setAyahOptions(false);
    
    switch(action) {
      case 'tafseer':
        navigate(`/tafseer/${currentSurah}/${ayah.verse_number}`);
        break;
      case 'listen':
        playAyahAudio(ayah);
        break;
      case 'bookmark':
        bookmarkAyah(ayah);
        break;
      case 'copy':
        copyAyahText(ayah);
        break;
      case 'share':
        shareAyah(ayah);
        break;
      default:
        break;
    }
  };

  const playAyahAudio = (ayah) => {
    setCurrentAyah(ayah.verse_number);
    setAudioPlaying(true);
  };

  const bookmarkAyah = (ayah) => {
    // Logic to bookmark ayah
    alert(`تم إضافة الآية ${ayah.verse_key} إلى المفضلة`);
  };

  const copyAyahText = (ayah) => {
    navigator.clipboard.writeText(`${ayah.text_uthmani} (${ayah.verse_key})`);
    alert('تم نسخ الآية');
  };

  const shareAyah = (ayah) => {
    if (navigator.share) {
      navigator.share({
        title: `الآية ${ayah.verse_key} من القرآن الكريم`,
        text: `${ayah.text_uthmani} (${ayah.verse_key})`,
        url: window.location.href,
      });
    } else {
      alert('المشاركة غير متاحة في هذا المتصفح');
    }
  };

  const changeFontSize = (type, increase) => {
    if (type === 'arabic') {
      setFontSizeArabic(prev => increase ? prev + 2 : Math.max(16, prev - 2));
    } else {
      setFontSizeTranslation(prev => increase ? prev + 2 : Math.max(12, prev - 2));
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'page' ? 'surah' : 'page');
  };

  if (isLoading) {
    return (
      <div className="quran-loading">
        <div className="loader"></div>
        <p>جاري تحميل المصحف...</p>
      </div>
    );
  }

  return (
    <div className="quran-reader-container" ref={containerRef}>
      <div className="quran-controls">
        <div className="quran-selector">
          <select value={currentSurah} onChange={handleSurahChange}>
            {surahList.map(surah => (
              <option key={surah.id} value={surah.id}>
                {surah.name_arabic} - {surah.translated_name.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="view-controls">
          <button onClick={toggleViewMode}>
            {viewMode === 'page' ? 'عرض السورة' : 'عرض الصفحات'}
          </button>
          
          {viewMode === 'page' && (
            <div className="page-controls">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
                السابق
              </button>
              <span>صفحة {currentPage} من {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                التالي
              </button>
            </div>
          )}
        </div>
        
        <div className="display-controls">
          <button onClick={() => setShowTranslation(!showTranslation)}>
            {showTranslation ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
          </button>
          
          <div className="font-controls">
            <div>
              <span>النص العربي: </span>
              <button onClick={() => changeFontSize('arabic', false)}>-</button>
              <span>{fontSizeArabic}</span>
              <button onClick={() => changeFontSize('arabic', true)}>+</button>
            </div>
            
            <div>
              <span>الترجمة: </span>
              <button onClick={() => changeFontSize('translation', false)}>-</button>
              <span>{fontSizeTranslation}</span>
              <button onClick={() => changeFontSize('translation', true)}>+</button>
            </div>
          </div>
        </div>
        
        <div className="reciter-selector">
          <select value={currentReciter} onChange={(e) => setCurrentReciter(e.target.value)}>
            {reciters.map(reciter => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className={`quran-content ${viewMode}`}>
        {quranData && quranData.map(ayah => (
          <div 
            key={ayah.id} 
            className={`ayah-container ${selectedAyah?.id === ayah.id ? 'selected' : ''} ${currentAyah === ayah.verse_number && audioPlaying ? 'playing' : ''}`}
            onClick={() => handleAyahClick(ayah)}
          >
            <div className="ayah-text" style={{fontSize: `${fontSizeArabic}px`}}>
              {ayah.text_uthmani}
              <span className="ayah-number">{ayah.verse_number}</span>
            </div>
            
            {showTranslation && (
              <div className="ayah-translation" style={{fontSize: `${fontSizeTranslation}px`}}>
                {ayah.translation}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {ayahOptions && selectedAyah && (
        <div className="ayah-options-modal">
          <div className="ayah-options-content">
            <button onClick={() => handleAyahAction('tafseer', selectedAyah)}>
              <i className="fas fa-book"></i> تفسير
            </button>
            <button onClick={() => handleAyahAction('listen', selectedAyah)}>
              <i className="fas fa-play"></i> استماع
            </button>
            <button onClick={() => handleAyahAction('bookmark', selectedAyah)}>
              <i className="fas fa-bookmark"></i> حفظ
            </button>
            <button onClick={() => handleAyahAction('copy', selectedAyah)}>
              <i className="fas fa-copy"></i> نسخ
            </button>
            <button onClick={() => handleAyahAction('share', selectedAyah)}>
              <i className="fas fa-share"></i> مشاركة
            </button>
            <button onClick={() => setAyahOptions(false)} className="cancel-btn">
              إغلاق
            </button>
          </div>
        </div>
      )}
      
      {audioPlaying && (
        <AudioPlayer 
          surahId={currentSurah} 
          ayahId={currentAyah}
          reciter={currentReciter}
          onClose={() => setAudioPlaying(false)}
          onAyahChange={(ayahId) => setCurrentAyah(ayahId)}
        />
      )}
    </div>
  );
};

export default QuranReader;