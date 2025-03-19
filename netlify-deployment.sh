// إعداد ملف netlify.toml مع تكوين CORS المناسب والتوجيهات
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
    [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "X-Requested-With, Content-Type, Accept"

// إضافة ملف _redirects إلى مجلد public لضمان عمل react-router بشكل صحيح
/* /index.html 200

// تكوين ملفات البيئة (ملف .env.production)
REACT_APP_API_BASE_URL=https://api.alquran.cloud/v1
REACT_APP_AUDIO_CDN=https://cdn.islamic.network/quran/audio

// تحديث package.json لإضافة سكريبت النشر
{
  "name": "quran-educational-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "deploy": "npm run build && netlify deploy --prod"
  },
  // ... باقي الملف
}

// خطوات النشر (أوامر تنفذ في Terminal)
# 1. تثبيت أداة Netlify CLI
npm install -g netlify-cli

# 2. تسجيل الدخول إلى حساب Netlify
netlify login

# 3. إنشاء مشروع جديد (يتم تنفيذه مرة واحدة فقط)
netlify init

# 4. بناء التطبيق ونشره
npm run deploy

// أو يمكن اتباع الطريقة الأسهل من خلال واجهة Netlify الرسومية:
1. بناء التطبيق: npm run build
2. زيارة موقع https://app.netlify.com
3. سحب وإفلات مجلد "build" مباشرة إلى واجهة Netlify