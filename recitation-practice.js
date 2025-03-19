// components/RecitationPractice.js
import React, { useState, useEffect, useRef } from 'react';
import { useQuran } from '../context/QuranContext';
import { useNavigate } from 'react-router-dom';
import './RecitationPractice.css';

const RecitationPractice = () => {
  const navigate = useNavigate();
  const { getQuranData } = useQuran();
  const [surahList, setSurahList] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [ayahCount, setAyahCount] = useState(0);
  const [ayahText, setAyahText] = useState('');
  const [recitationMode, setRecitationMode] = useState('practice'); // 'practice' or 'test'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showAyahText, setShowAyahText] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [recitationHistory, setRecitationHistory] = useState([]);
  const [practiceSettings, setPracticeSettings] = useState({
    showTajweed: true,
    showTranslation: false,
    autoPlayReference: true,
    delayBetweenVerses: 3,
  });
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=ar');
        const data = await response.json();
        setSurahList(data.chapters);
        setIsLoading(false);
        
        // Load first surah
        handleSurahChange({ target: { value: '1' } });
      } catch (error) {
        console.error('Error fetching surah list:', error);
        setIsLoading(false);
      }
    };
    
    fetchSurahs();
    
    // Load recitation history from local storage
    const history = localStorage.getItem('recitationHistory');
    if (history) {
      setRecitationHistory(JSON.parse(history));
    }
    
    return () => {
      // Clean up audio recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  useEffect(() => {
    loadAyah();
  }, [selectedSurah, selectedAyah]);
  
  const handleSurahChange = async (event) => {
    const surahId = parseInt(event.target.value);
    setSelectedSurah(surahId);
    setSelectedAyah(1);
    
    try {
      const response = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}`);
      const data = await response.json();
      setAyahCount(data.chapter.verses_count);
    } catch (error) {
      console.error('Error fetching surah details:', error);
    }
  };
  
  const loadAyah = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurah}&verse_key=${selectedSurah}:${selectedAyah}`);
      const data = await response.json();
      
      if (data.verses && data.verses.length > 0) {
        setAyahText(data.verses[0].text_uthmani);
      }
      
      // Play reference audio if setting is enabled
      if (practiceSettings.autoPlayReference) {
        playReferenceAudio();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading ayah:', error);
      setIsLoading(false);
    }
  };
  
  const playReferenceAudio = () => {
    if (audioRef.current) {
      const reciter = 'mishari_rashid_alafasy'; // Default reciter
      const audioUrl = `https://verses.quran.com/${reciter}/${selectedSurah}/${selectedAyah}.mp3`;
      
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        console.error('Error playing reference audio:', err);
      });
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Simulate recitation evaluation
        evaluateRecitation();
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('لا يمكن الوصول إلى الميكروفون. يرجى التحقق من إعدادات الجهاز.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  const evaluateRecitation = () => {
    // In a real application, this would send the audio to a backend for analysis
    // Here we'll simulate the evaluation with random scores
    
    // Tajweed categories to evaluate
    const tajweedCategories = [
      { name: 'مخارج الحروف', score: Math.floor(Math.random() * 21) + 80 },
      { name: 'صفات الحروف', score: Math.floor(Math.random() * 21) + 80 },
      { name: 'أحكام المد', score: Math.floor(Math.random() * 21) + 80 },
      { name: 'أحكام النون الساكنة والتنوين', score: Math.floor(Math.random() * 21) + 80 },
      { name: 'القلقلة', score: Math.floor(Math.random() * 21) + 80 },
    ];
    
    // Calculate overall score
    const overallScore = tajweedCategories.reduce((acc, cat) => acc + cat.score, 0) / tajweedCategories.length;
    setScore(Math.round(overallScore));
    
    // Generate feedback
    let feedbackText = '';
    if (overallScore >= 90) {
      feedbackText = 'ممتاز! تلاوتك صحيحة وفصيحة. استمر في الممارسة.';
    } else if (overallScore >= 80) {
      feedbackText = 'جيد جداً! هناك بعض النقاط البسيطة للتحسين.';
    } else if (overallScore >= 70) {
      feedbackText = 'جيد. هناك عدة نقاط تحتاج إلى تحسين.';
    } else {
      feedbackText = 'تحتاج إلى مزيد من الممارسة. ركز على قواعد التجويد الأساسية.';
    }
    
    setFeedback({
      text: feedbackText,
      categories: tajweedCategories
    });
    
    // Save to history
    const historyItem = {
      date: new Date().toISOString(),
      surah: selectedSurah,
      ayah: selectedAyah,
      score: Math.round(overallScore),
    };
    
    const updatedHistory = [historyItem, ...recitationHistory.slice(0, 49)]; // Keep last 50 entries
    setRecitationHistory(updatedHistory);
    localStorage.setItem('recitationHistory', JSON.stringify(updatedHistory));
  };
  
  const goToPrevAyah = () => {
    if (selectedAyah > 1) {
      setSelectedAyah(selectedAyah - 1);
      resetRecitation();
    }
  };
  
  const goToNextAyah = () => {
    if (selectedAyah < ayahCount) {
      setSelectedAyah(selectedAyah + 1);
      resetRecitation();
    }
  };
  
  const resetRecitation = () => {
    setRecordedAudio(null);
    setFeedback(null);
    setScore(0);
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
  };
  
  const toggleRecitationMode = () => {
    setRecitationMode(prev => prev === 'practice' ? 'test' : 'practice');
    resetRecitation();
  };
  
  const toggleSetting = (setting) => {
    setPracticeSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  if (isLoading && !surahList.length) {
    return (
      <div className="recitation-loading">
        <div className="loader"></div>
        <p>جاري تحميل...</p>
      </div>
    );
  }
  
  return (
    <div className="recitation-practice-container">
      <div className="recitation-header">
        <h2>تدريب القراءة والتسميع</h2>
        <div className="mode-selector">
          <button 
            className={`mode-btn ${recitationMode === 'practice' ? 'active' : ''}`}
            onClick={() => setRecitationMode('practice')}
          >
            وضع التدريب
          </button>
          <button 
            className={`mode-btn ${recitationMode === 'test' ? 'active' : ''}`}
            onClick={() => setRecitationMode('test')}
          >
            وضع الاختبار
          </button>
        </div>
      </div>
      
      <div className="recitation-settings">
        <div className="surah-selector">
          <label>السورة:</label>
          <select value={selectedSurah} onChange={handleSurahChange}>
            {surahList.map(surah => (
              <option key={surah.id} value={surah.id}>
                {surah.name_arabic} ({surah.id})
              </option>
            ))}
          </select>
        </div>
        
        <div className="ayah-selector">
          <label>الآية:</label>
          <div className="ayah-navigation">
            <button onClick={goToPrevAyah} disabled={selectedAyah <= 1}>
              <i className="fas fa-chevron-right"></i>
            </button>
            <input 
              type="number" 
              min="1" 
              max={ayahCount} 
              value={selectedAyah}
              onChange={(e) => setSelectedAyah(parseInt(e.target.value))}
            />
            <button onClick={goToNextAyah} disabled={selectedAyah >= ayahCount}>
              <i className="fas fa-chevron-left"></i>
            </button>
          </div>
          <span>من {ayahCount}</span>
        </div>
        
        <div className="practice-controls">
          <button onClick={() => toggleSetting('showTajweed')} className={practiceSettings.showTajweed ? 'active' : ''}>
            <i className="fas fa-text-height"></i> إظهار علامات التجويد
          </button>
          <button onClick={() => toggleSetting('showTranslation')} className={practiceSettings.showTranslation ? 'active' : ''}>
            <i className="fas fa-language"></i> إظهار الترجمة
          </button>
          <button onClick={() => toggleSetting('autoPlayReference')} className={practiceSettings.autoPlayReference ? 'active' : ''}>
            <i className="fas fa-volume-up"></i> تشغيل المرجع تلقائياً
          </button>
          <button onClick={() => setShowAyahText(!showAyahText)}>
            <i className={`fas ${showAyahText ? 'fa-eye-slash' : 'fa-eye'}`}></i> 
            {showAyahText ? 'إخفاء النص' : 'إظهار النص'}
          </button>
        </div>
      </div>
      
      <div className="recitation-content">
        {showAyahText && (
          <div className="ayah-display">
            <p className="ayah-text" dangerouslySetInnerHTML={{ __html: ayahText }}></p>
            <div className="ayah-details">
              <span>سورة {surahList.find(s => s.id === selectedSurah)?.name_arabic || ''}</span>
              <span>الآية {selectedAyah}</span>
            </div>
          </div>
        )}
        
        <div className="recitation-controls">
          {!isRecording && !recordedAudio && (
            <button onClick={startRecording} className="start-recording-btn">
              <i className="fas fa-microphone"></i> ابدأ التسجيل
            </button>
          )}
          
          {isRecording && (
            <button onClick={stopRecording} className="stop-recording-btn">
              <i className="fas fa-stop-circle"></i> إيقاف التسجيل
            </button>
          )}
          
          {recordedAudio && (
            <div className="recording-playback">
              <audio src={recordedAudio} controls></audio>
              <button onClick={resetRecitation} className="retry-btn">
                <i className="fas fa-redo"></i> إعادة المحاولة
              </button>
            </div>
          )}
          
          <button onClick={playReferenceAudio} className="reference-btn">
            <i className="fas fa-volume-up"></i> استماع للقراءة المرجعية
          </button>
        </div>
        
        {feedback && (
          <div className="recitation-feedback">
            <div className="score-display">
              <div className="score-circle">
                <span>{score}</span>
              </div>
              <h3>التقييم النهائي</h3>
            </div>
            
            <p className="feedback-text">{feedback.text}</p>
            
            <div className="tajweed-scores">
              <h4>تفاصيل التقييم:</h4>
              <div className="tajweed-categories">
                {feedback.categories.map((category, index) => (
                  <div key={index} className="tajweed-category">
                    <span className="category-name">{category.name}</span>
                    <div className="score-bar-container">
                      <div 
                        className="score-bar" 
                        style={{width: `${category.score}%`, backgroundColor: getScoreColor(category.score)}}
                      ></div>
                    </div>
                    <span className="category-score">{category.score}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            {goToNextAyah && (
              <button onClick={goToNextAyah} className="next-ayah-btn">
                الانتقال للآية التالية <i className="fas fa-arrow-left"></i>
              </button>
            )}
          </div>
        )}
      </div>
      
      {recitationHistory.length > 0 && (
        <div className="recitation-history">
          <h3>سجل التلاوات السابقة</h3>
          <div className="history-list">
            {recitationHistory.slice(0, 5).map((item, index) => {
              const surahName = surahList.find(s => s.id === item.surah)?.name_arabic || `سورة ${item.surah}`;
              return (
                <div key={index} className="history-item">
                  <div className="history-score" style={{backgroundColor: getScoreColor(item.score)}}>
                    {item.score}
                  </div>
                  <div className="history-details">
                    <span>{surahName} - الآية {item.ayah}</span>
                    <span className="history-date">{new Date(item.date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSurah(item.surah);
                      setSelectedAyah(item.ayah);
                      resetRecitation();
                    }}
                    className="history-load-btn"
                  >
                    <i className="fas fa-redo"></i>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <audio ref={audioRef} className="hidden-audio"></audio>
    </div>
  );
};

// Helper function to get color based on score
const getScoreColor = (score) => {
  if (score >= 90) return '#4CAF50'; // Green
  if (score >= 70) return '#FFC107'; // Amber
  if (score >= 50) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

export default RecitationPractice;