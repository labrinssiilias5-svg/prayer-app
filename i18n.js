// i18n.js - ترجمات الواجهة (عربي/فرانسي/إنجليزي)
(function (global) {
  'use strict';
  var T = {
    ar: {
      appTitle: '🕌 مواقيت الصلاة', cityLabel: 'المدينة', gps: '📍 موقعي الحالي (GPS)',
      nextPrayer: 'الصلاة القادمة', fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر',
      maghrib: 'المغرب', isha: 'العشاء', qibla: 'اتجاه القبلة',
      sound: 'تشغيل صوت الأذان', notif: 'إشعار قبل وقت الصلاة',
      testAdhan: '▶ تشغيل الأذان (تجربة)', addFile: '📁 أضف ملف أذان شخصي',
      tabs: { prayer: 'الصلاة', tasbih: 'المسبحة', names: 'الأسماء', adhkar: 'الأذكار' },
      tasbihTitle: 'المسبحة', count: 'العدد', reset: 'إعادة', target: 'الهدف',
      namesTitle: 'أسماء الله الحسنى', adhkarTitle: 'أذكار الصباح والمساء',
      morning: 'أذكار الصباح', evening: 'أذكار المساء', theme: 'الثيم', lang: 'اللغة',
      installHint: 'من قائمة المتصفح (⋮) اختر "إضافة إلى الشاشة الرئيسية" للتثبيت بدون متصفح'
    },
    fr: {
      appTitle: '🕌 Heures de prière', cityLabel: 'Ville', gps: '📍 Ma position (GPS)',
      nextPrayer: 'Prochaine prière', fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr',
      maghrib: 'Maghrib', isha: 'Isha', qibla: 'Direction de la Qibla',
      sound: 'Activer l’adhan', notif: 'Notification avant la prière',
      testAdhan: '▶ Écouter l’adhan', addFile: '📁 Ajouter un fichier adhan',
      tabs: { prayer: 'Prière', tasbih: 'Tasbih', names: 'Noms', adhkar: 'Dhikr' },
      tasbihTitle: 'Tasbih', count: 'Compte', reset: 'Réinitialiser', target: 'Objectif',
      namesTitle: 'Les 99 Noms d’Allah', adhkarTitle: 'Dhikr matin et soir',
      morning: 'Dhikr du matin', evening: 'Dhikr du soir', theme: 'Thème', lang: 'Langue',
      installHint: 'Dans le menu du navigateur (⋮) choisissez "Ajouter à l’écran d’accueil" pour installer sans navigateur'
    },
    en: {
      appTitle: '🕌 Prayer Times', cityLabel: 'City', gps: '📍 My Location (GPS)',
      nextPrayer: 'Next Prayer', fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr',
      maghrib: 'Maghrib', isha: 'Isha', qibla: 'Qibla Direction',
      sound: 'Play Adhan sound', notif: 'Notify before prayer',
      testAdhan: '▶ Play Adhan', addFile: '📁 Add custom adhan file',
      tabs: { prayer: 'Prayer', tasbih: 'Tasbih', names: 'Names', adhkar: 'Adhkar' },
      tasbihTitle: 'Tasbih', count: 'Count', reset: 'Reset', target: 'Target',
      namesTitle: '99 Names of Allah', adhkarTitle: 'Morning & Evening Adhkar',
      morning: 'Morning Adhkar', evening: 'Evening Adhkar', theme: 'Theme', lang: 'Language',
      installHint: 'From the browser menu (⋮) choose "Add to Home screen" to install without browser'
    }
  };
  global.I18N = T;
})(typeof window !== 'undefined' ? window : this);
