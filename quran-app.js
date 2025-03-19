// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import QuranReader from './components/QuranReader';
import AudioPlayer from './components/AudioPlayer';
import Tafseer from './components/Tafseer';
import Tajweed from './components/Tajweed';
import VirtualClasses from './components/VirtualClasses';
import StudyCircles from './components/StudyCircles';
import LearningResources from './components/LearningResources';
import AskScholars from './components/AskScholars';
import LanguageSelector from './components/LanguageSelector';
import RecitationPractice from './components/RecitationPractice';
import UserProfile from './components/UserProfile';
import Dashboard from './components/Dashboard';
import { QuranProvider } from './context/QuranContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading assets
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>جاري تحميل تطبيق القرآن الكريم</h2>
      </div>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <QuranProvider>
            <Router>
              <div className="app-container">
                <header className="app-header">
                  <div className="logo">
                    <Link to="/">
                      <img src="/logo.png" alt="القرآن الكريم" />
                      <h1>تطبيق القرآن الكريم التعليمي</h1>
                    </Link>
                  </div>
                  <nav className="main-nav">
                    <ul>
                      <li><Link to="/">الرئيسية</Link></li>
                      <li><Link to="/quran">القرآن الكريم</Link></li>
                      <li><Link to="/tajweed">تعلم التجويد</Link></li>
                      <li><Link to="/virtual-classes">الفصول الافتراضية</Link></li>
                      <li><Link to="/study-circles">حلقات التحفيظ</Link></li>
                      <li><Link to="/resources">موارد التعليم</Link></li>
                      <li><Link to="/ask-scholars">اسأل أهل العلم</Link></li>
                    </ul>
                  </nav>
                  <div className="user-controls">
                    <LanguageSelector />
                    <Link to="/profile" className="profile-link">
                      <i className="fas fa-user"></i>
                    </Link>
                  </div>
                </header>

                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/quran" element={<QuranReader />} />
                    <Route path="/tafseer/:surahId/:ayahId" element={<Tafseer />} />
                    <Route path="/tajweed" element={<Tajweed />} />
                    <Route path="/recitation-practice" element={<RecitationPractice />} />
                    <Route path="/virtual-classes" element={<VirtualClasses />} />
                    <Route path="/study-circles" element={<StudyCircles />} />
                    <Route path="/resources" element={<LearningResources />} />
                    <Route path="/ask-scholars" element={<AskScholars />} />
                    <Route path="/profile" element={<UserProfile />} />
                  </Routes>
                </main>

                <footer className="app-footer">
                  <div className="footer-content">
                    <div className="footer-section">
                      <h3>عن التطبيق</h3>
                      <p>تطبيق تعليمي شامل للقرآن الكريم يساعد على تعلم وحفظ القرآن بطرق مبتكرة</p>
                    </div>
                    <div className="footer-section">
                      <h3>روابط مهمة</h3>
                      <ul>
                        <li><Link to="/about">عن التطبيق</Link></li>
                        <li><Link to="/privacy">سياسة الخصوصية</Link></li>
                        <li><Link to="/terms">شروط الاستخدام</Link></li>
                        <li><Link to="/contact">اتصل بنا</Link></li>
                      </ul>
                    </div>
                    <div className="footer-section">
                      <h3>تواصل معنا</h3>
                      <div className="social-links">
                        <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
                        <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                        <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                        <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
                      </div>
                    </div>
                  </div>
                  <div className="copyright">
                    <p>© {new Date().getFullYear()} تطبيق القرآن الكريم التعليمي. جميع الحقوق محفوظة.</p>
                  </div>
                </footer>
              </div>
            </Router>
          </QuranProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;