// ui.js - الميزات الإضافية: التبويبات، المسبحة، الأسماء، الأذكار، الثيم، اللغة، الحفظ
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var LANG = localStorage.getItem('lang') || 'ar';
  var THEME = localStorage.getItem('theme') || 'light';

  function t(key) {
    var dict = (I18N[LANG] || I18N.ar);
    var p = key.split('.');
    var o = dict;
    for (var i = 0; i < p.length; i++) { o = o[p[i]]; if (o === undefined) return key; }
    return o;
  }
  function applyTheme() {
    document.body.setAttribute('data-theme', THEME);
    localStorage.setItem('theme', THEME);
  }
  function setLang(l) {
    LANG = l; localStorage.setItem('lang', l);
    document.documentElement.lang = l;
    document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
    renderTexts();
  }
  function renderTexts() {
    $('appTitle').textContent = t('appTitle');
    $('cityLabel').textContent = t('cityLabel');
    $('gpsBtn').textContent = t('gps');
    $('nextLabel').textContent = t('nextPrayer');
    $('soundLbl').textContent = t('sound');
    $('notifLbl').textContent = t('notif');
    $('testAdhan').textContent = t('testAdhan');
    $('addFileLbl').textContent = t('addFile');
    $('tabBtn-prayer').textContent = t('tabs.prayer');
    $('tabBtn-tasbih').textContent = t('tabs.tasbih');
    $('tabBtn-names').textContent = t('tabs.names');
    $('tabBtn-adhkar').textContent = t('tabs.adhkar');
    $('tasbihTitle').textContent = t('tasbihTitle');
    $('tasbihCount').textContent = t('count') + ': 0';
    $('tasbihReset').textContent = t('reset');
    $('namesTitle').textContent = t('namesTitle');
    $('adhkarTitle').textContent = t('adhkarTitle');
    $('morningH').textContent = t('morning');
    $('eveningH').textContent = t('evening');
    $('themeLbl').textContent = t('theme');
    $('langLbl').textContent = t('lang');
    // prayer names for list
    if (window.__renderPrayerNames) window.__renderPrayerNames(t);
  }

  // تبويبات
  function showTab(name) {
    ['prayer','tasbih','names','adhkar'].forEach(function (n) {
      $('tab-' + n).style.display = (n === name) ? 'block' : 'none';
      $('tabBtn-' + n).classList.toggle('active', n === name);
    });
    localStorage.setItem('lastTab', name);
  }

  // المسبحة
  var tasbih = 0;
  function tasbihTap() { tasbih++; $('tasbihCount').textContent = t('count') + ': ' + tasbih; }

  // أسماء الله الحسنى
  function renderNames() {
    var c = $('namesGrid'); c.innerHTML = '';
    (ReligiousData.names99 || []).forEach(function (n, i) {
      var d = document.createElement('div');
      d.className = 'name-cell';
      d.textContent = (i + 1) + '. ' + n;
      c.appendChild(d);
    });
  }
  // الأذكار
  function renderAdhkar() {
    var m = $('morningList'); m.innerHTML = '';
    (ReligiousData.adhkar.morning || []).forEach(function (x) {
      var d = document.createElement('div'); d.className = 'dhikr'; d.textContent = x; m.appendChild(d);
    });
    var e = $('eveningList'); e.innerHTML = '';
    (ReligiousData.adhkar.evening || []).forEach(function (x) {
      var d = document.createElement('div'); d.className = 'dhikr'; d.textContent = x; e.appendChild(d);
    });
  }

  function init() {
    applyTheme();
    setLang(LANG);
    renderNames();
    renderAdhkar();
    // tab buttons
    ['prayer','tasbih','names','adhkar'].forEach(function (n) {
      $('tabBtn-' + n).addEventListener('click', function () { showTab(n); });
    });
    $('tasbihBtn').addEventListener('click', tasbihTap);
    $('tasbihReset').addEventListener('click', function () { tasbih = 0; $('tasbihCount').textContent = t('count') + ': 0'; });
    // theme toggle
    $('themeToggle').addEventListener('click', function () {
      THEME = (THEME === 'light') ? 'dark' : 'light'; applyTheme();
    });
    // lang select
    $('langSel').addEventListener('change', function () { setLang(this.value); });
    $('langSel').value = LANG;
    // restore last tab
    showTab(localStorage.getItem('lastTab') || 'prayer');
  }

  window.UI = { init: init, t: t, renderTexts: renderTexts };
})();
