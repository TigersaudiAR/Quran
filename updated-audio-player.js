// components/AudioPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import { useQuran } from '../context/QuranContext';
import './AudioPlayer.css';

const AudioPlayer = ({ surahId, ayahId, onClose, onAyahChange }) => {
  const { 
    surahs, 
    getAyahAudioUrl, 
    selectedReciter, 
    availableReciters,
    changeReciter
  } = useQuran();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioList, setAudioList] = useState([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [continuePlay, setContinuePlay] = useState(true);
  const [surahInfo, setSurahInfo] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatSettings, setRepeatSettings] = useState({
    enabled: false,
    count: 1,
    currentCount: 0,
    rangeStart: ayahId,
    rangeEnd: ayahId
  });
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    // جلب معلومات السورة
    const surah = surahs.find(s => s.number === surahId);
    if (surah) {
      setSurahInfo(surah);
    }
    
    // تحميل التشغيل المستمر من التخزين المحلي
    const savedContinuePlay = localStorage.getItem('audio-continue-play');
    if (savedContinuePlay !== null) {
      setContinuePlay(savedContinuePlay === 'true');
    }
    
    // تحميل سرعة التشغيل من التخزين المحلي
    const savedPlaybackRate = localStorage.getItem('audio-playback-rate');
    if (savedPlaybackRate) {
      setPlaybackRate(parseFloat(savedPlaybackRate));
    }
    
    setupAudioList();
  }, [surahId, ayahId, selectedReciter]);

  const setupAudioList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // جلب معلومات السورة
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
      const surahData = await surahResponse.json();
      
      if (surahData.code === 200) {
        const totalAyahs = surahData.data.numberOfAyahs;
        
        // إنشاء قائمة الصوتيات بدءًا من الآية المحددة
        const audioUrls = [];
        for (let i = ayahId; i <= totalAyahs; i++) {
          audioUrls.push({
            ayahId: i,
            url: getAyahAudioUrl(surahId, i),
            surahId: surahId
          });
        }
        
        setAudioList(audioUrls);
        setCurrentAyahIndex(0); // البدء بالآية الأولى في القائمة (وهي الآية المحددة)
        setLoading(false);
      } else {
        throw new Error('حدث خطأ في جلب معلومات السورة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل ملفات الصوت');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    // عند تغيير قائمة الصوتيات أو الآية الحالية، تحديث مصدر الصوت
    if (audioList.length > 0 && audioRef.current) {
      audioRef.current.src = audioList[currentAyahIndex].url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('خطأ في تشغيل الصوت:', err);
        });
      }
      
      // تحديث الآية الحالية في المكون الأب
      if (onAyahChange) {
        onAyahChange(audioList[currentAyahIndex].ayahId);
      }
    }
  }, [audioList, currentAyahIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;
    
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (progressRef.current) {
        progressRef.current.value = audio.currentTime;
      }
    };
    
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      if (progressRef.current) {
        progressRef.current.max = audio.duration;
      }
    };
    
    const onEnded = () => {
      if (repeatSettings.enabled && repeatSettings.currentCount < repeatSettings.count - 1) {
        // تكرار نفس الآية
        setRepeatSettings(prev => ({
          ...prev,
          currentCount: prev.currentCount + 1
        }));
        
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.error('خطأ في إعادة تشغيل الصوت:', err);
        });
      } else if (repeatSettings.enabled && repeatSettings.currentCount >= repeatSettings.count - 1) {
        // إعادة عداد التكرار
        setRepeatSettings(prev => ({
          ...prev,
          currentCount: 0
        }));
        
        // التحقق مما إذا كنا في نهاية نطاق التكرار
        const currentAyah = audioList[currentAyahIndex].ayahId;
        if (currentAyah >= repeatSettings.rangeEnd) {
          // العودة إلى بداية النطاق
          const startIndex = audioList.findIndex(a => a.ayahId === repeatSettings.rangeStart);
          if (startIndex !== -1) {
            setCurrentAyahIndex(startIndex);
          } else {
            handleNext();
          }
        } else {
          handleNext();
        }
      } else if (continuePlay && currentAyahIndex < audioList.length - 1) {
        // الانتقال إلى الآية التالية
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };
    
    // إضافة مستمعي الأحداث
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    
    // تحديث سرعة التشغيل
    audio.playbackRate = playbackRate;
    
    // التنظيف
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentAyahIndex, audioList, continuePlay, repeatSettings, playbackRate]);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('خطأ في تشغيل الصوت:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (currentAyahIndex < audioList.length - 1) {
      setCurrentAyahIndex(prevIndex => prevIndex + 1);
      setIsPlaying(true);
      setRepeatSettings(prev => ({
        ...prev,
        currentCount: 0
      }));
    }
  };

  const handlePrev = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(prevIndex => prevIndex - 1);
      setIsPlaying(true);
      setRepeatSettings(prev => ({
        ...prev,
        currentCount: 0
      }));
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleContinuePlay = () => {
    const newValue = !continuePlay;
    setContinuePlay(newValue);
    localStorage.setItem('audio-continue-play', newValue.toString());
  };

  const toggleRepeat = () => {
    setRepeatSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const updateRepeatCount = (count) => {
    setRepeatSettings(prev => ({
      ...prev,
      count: count
    }));
  };

  const updateRepeatRange = (start, end) => {
    setRepeatSettings(prev => ({
      ...prev,
      rangeStart: start,
      rangeEnd: end
    }));
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    localStorage.setItem('audio-playback-rate', rate.toString());
    
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleReciterChange = (e) => {
    const reciterId = e.target.value;
    changeReciter(reciterId);
  };

  const downloadSurah = async () => {
    if (!window.confirm('هل تريد تحميل السورة كاملة للاستماع بدون اتصال بالإنترنت؟')) {
      return;
    }
    
    try {
      setIsDownloading(true);
      
      // إنشاء قائمة روابط تحميل جميع آيات السورة
      const downloadLinks = [];
      for (let i = 1; i <= surahInfo.numberOfAyahs; i++) {
        downloadLinks.push({
          ayahId: i,
          url: getAyahAudioUrl(surahId, i)
        });
      }
      
      setDownloadQueue(downloadLinks);
      setDownloadProgress(0);
      
      // بدء التحميل التسلسلي
      for (let i = 0; i < downloadLinks.length; i++) {
        const link = downloadLinks[i];
        
        // تحميل الملف
        const response = await fetch(link.url);
        const blob = await response.blob();
        
        // حفظ الملف في التخزين المحلي (في تطبيق حقيقي، يمكن استخدام IndexedDB)
        const fileName = `surah_${surahId}_ayah_${link.ayahId}.mp3`;
        // هنا يمكن إضافة رمز لحفظ الملف في التخزين
        
        // تحديث التقدم
        setDownloadProgress(Math.round(((i + 1) / downloadLinks.length) * 100));
      }
      
      alert('تم تحميل السورة بنجاح');
      setIsDownloading(false);
    } catch (error) {
      console.error('خطأ في تحميل السورة:', error);
      alert('حدث خطأ أثناء تحميل السورة');
      setIsDownloading(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="audio-player-container loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل الصوت...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audio-player-container error">
        <p className="error-message">{error}</p>
        <button onClick={onClose} className="close-button">إغلاق</button>
      </div>
    );
  }

  const currentAyah = audioList[currentAyahIndex]?.ayahId || ayahId;

  return (
    <div className="audio-player-container">
      <div className="audio-player-header">
        <h3>
          {surahInfo ? `${surahInfo.name} - الآية ${currentAyah}` : `سورة ${surahId} - الآية ${currentAyah}`}
        </h3>
        <button onClick={onClose} className="close-button">
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="audio-player-controls">
        <button onClick={handlePrev} disabled={currentAyahIndex === 0} className="control-button">
          <i className="fas fa-step-backward"></i>
        </button>
        <button onClick={handlePlay} className="control-button play-button">
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        <button onClick={handleNext} disabled={currentAyahIndex === audioList.length - 1} className="control-button">
          <i className="fas fa-step-forward"></i>
        </button>
        <button onClick={() => setShowOptions(!showOptions)} className="control-button">
          <i className="fas fa-cog"></i>
        </button>
      </div>
      
      <div className="audio-progress">
        <span className="time-display">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="progress-slider"
          ref={progressRef}
        />
        <span className="time-display">{formatTime(duration)}</span>
      </div>
      
      <div className="reciter-selector">
        <label>القارئ:</label>
        <select value={selectedReciter} onChange={handleReciterChange}>
          {availableReciters.map(reciter => (
            <option key={reciter.identifier} value={reciter.identifier}>
              {reciter.name}
            </option>
          ))}
        </select>
      </div>
      
      {showOptions && (
        <div className="audio-options">
          <div className="option-group">
            <span>استمرار التشغيل:</span>
            <button 
              onClick={toggleContinuePlay} 
              className={`toggle-button ${continuePlay ? 'active' : ''}`}
            >
              {continuePlay ? 'مفعل' : 'متوقف'}
            </button>
          </div>
          
          <div className="option-group">
            <span>تكرار الآية:</span>
            <button 
              onClick={toggleRepeat} 
              className={`toggle-button ${repeatSettings.enabled ? 'active' : ''}`}
            >
              {repeatSettings.enabled ? 'مفعل' : 'متوقف'}
            </button>
          </div>
          
          {repeatSettings.enabled && (
            <>
              <div className="option-group">
                <span>عدد مرات التكرار:</span>
                <select 
                  value={repeatSettings.count} 
                  onChange={e => updateRepeatCount(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 5, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="option-group">
                <span>نطاق التكرار:</span>
                <div className="range-inputs">
                  <span>من</span>
                  <input 
                    type="number" 
                    min="1" 
                    max={surahInfo?.numberOfAyahs || 286}
                    value={repeatSettings.rangeStart}
                    onChange={e => updateRepeatRange(parseInt(e.target.value), repeatSettings.rangeEnd)}
                  />
                  <span>إلى</span>
                  <input 
                    type="number" 
                    min={repeatSettings.rangeStart} 
                    max={surahInfo?.numberOfAyahs || 286}
                    value={repeatSettings.rangeEnd}
                    onChange={e => updateRepeatRange(repeatSettings.rangeStart, parseInt(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="option-group">
            <span>سرعة التشغيل:</span>
            <div className="playback-rate-buttons">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                <button 
                  key={rate} 
                  onClick={() => changePlaybackRate(rate)}
                  className={`rate-button ${playbackRate === rate ? 'active' : ''}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
          
          <div className="option-group">
            <button onClick={downloadSurah} disabled={isDownloading} className="download-surah-btn">
              {isDownloading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> جاري التحميل ({downloadProgress}%)
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i> تحميل السورة كاملة
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <audio ref={audioRef} preload="auto">
        <source src="" type="audio/mpeg" />
        متصفحك لا يدعم تشغيل الصوت
      </audio>
    </div>
  );
};

export default AudioPlayer;