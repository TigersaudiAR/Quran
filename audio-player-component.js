// components/AudioPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import { useQuran } from '../context/QuranContext';
import './AudioPlayer.css';

const AudioPlayer = ({ surahId, ayahId, reciter, onClose, onAyahChange }) => {
  const { getQuranData } = useQuran();
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
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const fetchSurahInfo = async () => {
      try {
        const response = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}`);
        const data = await response.json();
        setSurahInfo(data.chapter);
      } catch (err) {
        console.error('Error fetching surah info:', err);
      }
    };

    fetchSurahInfo();
  }, [surahId]);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get total number of ayahs in the surah
        const surahResponse = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}`);
        const surahData = await surahResponse.json();
        const totalAyahs = surahData.chapter.verses_count;
        
        // Create audio URLs array for all ayahs starting from the selected one
        const audioUrls = [];
        for (let i = ayahId; i <= totalAyahs; i++) {
          const audioUrl = `https://verses.quran.com/${reciter}/${surahId}/${i}.mp3`;
          audioUrls.push({
            ayahId: i,
            url: audioUrl,
            surahId: surahId
          });
        }
        
        setAudioList(audioUrls);
        setCurrentAyahIndex(0); // Start with the first audio in our list (which is the selected ayah)
        setLoading(false);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل الملفات الصوتية');
        setLoading(false);
        console.error(err);
      }
    };

    fetchAudioFiles();
  }, [surahId, ayahId, reciter]);

  useEffect(() => {
    // When audio list or current ayah index changes, update the audio source
    if (audioList.length > 0 && audioRef.current) {
      audioRef.current.src = audioList[currentAyahIndex].url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
      }
      
      // Update the current ayah in the parent component
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
        // Repeat the same ayah
        setRepeatSettings(prev => ({
          ...prev,
          currentCount: prev.currentCount + 1
        }));
        
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.error('Error replaying audio:', err);
        });
      } else if (repeatSettings.enabled && repeatSettings.currentCount >= repeatSettings.count - 1) {
        // Reset repeat counter
        setRepeatSettings(prev => ({
          ...prev,
          currentCount: 0
        }));
        
        // Check if we're at the end of the repeat range
        const currentAyah = audioList[currentAyahIndex].ayahId;
        if (currentAyah >= repeatSettings.rangeEnd) {
          // Go back to the beginning of the range
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
        // Move to the next ayah
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    
    // Update playback rate
    audio.playbackRate = playbackRate;
    
    // Cleanup
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
          console.error('Error playing audio:', err);
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
    setContinuePlay(!continuePlay);
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
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
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
          {surahInfo ? `${surahInfo.name_arabic} - الآية ${currentAyah}` : `سورة ${surahId} - الآية ${currentAyah}`}
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
                    max={surahInfo?.verses_count || 286}
                    value={repeatSettings.rangeStart}
                    onChange={e => updateRepeatRange(parseInt(e.target.value), repeatSettings.rangeEnd)}
                  />
                  <span>إلى</span>
                  <input 
                    type="number" 
                    min={repeatSettings.rangeStart} 
                    max={surahInfo?.verses_count || 286}
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