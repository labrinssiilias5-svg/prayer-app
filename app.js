// app.js - منطق التطبيق: حساب المواقيت، الإشعارات، الصوت، البوصلة
(function () {
  'use strict';
  var NAMES = { fajr:'الفجر', sunrise:'الشروق', dhuhr:'الظهر', asr:'العصر', maghrib:'المغرب', isha:'العشاء' };
  var ICONS = { fajr:'🌅', dhuhr:'☀️', asr:'🌇', maghrib:'🌆', isha:'🌃' };
  var ORDER = ['fajr','dhuhr','asr','maghrib','isha'];
  // hook لنصوص مترجمة (تستعملها ui.js)
  window.__renderPrayerNames = function (t) {
    NAMES.fajr = t('fajr'); NAMES.dhuhr = t('dhuhr'); NAMES.asr = t('asr');
    NAMES.maghrib = t('maghrib'); NAMES.isha = t('isha');
  };
  var $ = function (id) { return document.getElementById(id); };
  var timers = [];

  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2500);
  }
  function parseHM(s) { var p = s.split(':'); return +p[0] * 60 + (+p[1]); }

  function render() {
    var citySel = $('city');
    var idx = citySel.selectedIndex >= 0 ? citySel.selectedIndex : 0;
    var city = Cities.list[idx] || Cities.list[0];
    var now = new Date();
    $('cityName').textContent = city.name;
    $('hijriDate').textContent = PrayerCalc.toHijri(now);
    var tz = Cities.tzOffsetFor(city.lat, city.lng, now);
    var method = 'MWL';
    var times = PrayerCalc.getTimes(now, { lat: city.lat, lng: city.lng }, tz, method);

    var list = $('prayerList'); list.innerHTML = '';
    var mins = now.getHours() * 60 + now.getMinutes();
    var nextName = null, nextM = Infinity;
    ORDER.forEach(function (k) {
      if (k === 'sunrise') return;
      var row = document.createElement('div');
      row.className = 'row';
      // آمن: نستعمل textContent بدل innerHTML (مانعا XSS)
      var ic = document.createElement('span');
      ic.className = 'ic';
      ic.textContent = (ICONS[k] || '🕌');
      var nm = document.createElement('span');
      nm.textContent = (NAMES[k] || k);
      var nwrap = document.createElement('span');
      nwrap.className = 'n';
      nwrap.appendChild(ic); nwrap.appendChild(nm);
      var tm = document.createElement('span');
      tm.className = 't';
      tm.textContent = times[k];
      row.appendChild(nwrap); row.appendChild(tm);
      list.appendChild(row);
      var m = parseHM(times[k]);
      if (m >= mins && m < nextM) { nextM = m; nextName = k; }
    });
    if (!nextName) nextName = 'fajr';

    $('nextName').textContent = NAMES[nextName] || nextName;
    $('nextTime').textContent = times[nextName];

    // بوصلة القبلة
    var q = PrayerCalc.qiblaDirection(city.lat, city.lng);
    $('qibla').style.transform = 'rotate(' + q + 'deg)';
    $('qiblaTxt').textContent = 'اتجاه القبلة: ' + Math.round(q) + '°';

    scheduleAlarms(times);
  }

  // جدولة تنبيه قبل كل صلاة + فحص دوري احتياطي (يضمن التشغيل حتى لو تلغى timers)
  function scheduleAlarms(times) {
    timers.forEach(clearTimeout); timers = [];
    var now = new Date();
    var mins = now.getHours() * 60 + now.getMinutes();
    ORDER.forEach(function (k) {
      if (k === 'sunrise') return;
      var m = parseHM(times[k]);
      var delta = (m - mins) * 60000 - 60000; // قبل الدقيقة
      if (delta > 0) {
        var id = setTimeout(function () { fireAlarm(NAMES[k] || k); }, delta);
        timers.push(id);
      }
    });
  }

  // فحص دوري كل دقيقة: إذا دخلنا وقت صلاة جديدة لم تُطلق بعد → شغّل الأذان
  var lastFiredKey = '';
  function checkPrayerNow() {
    try {
      var citySel = $('city');
      var idx = citySel.selectedIndex >= 0 ? citySel.selectedIndex : 0;
      var city = Cities.list[idx] || Cities.list[0];
      var now = new Date();
      var tz = Cities.tzOffsetFor(city.lat, city.lng, now);
      var times = PrayerCalc.getTimes(now, { lat: city.lat, lng: city.lng }, tz, 'MWL');
      var curM = now.getHours() * 60 + now.getMinutes();
      // ابحث عن أقرب صلاة دخل وقتها الآن (خلال آخر دقيقة)
      ORDER.forEach(function (k) {
        if (k === 'sunrise') return;
        var m = parseHM(times[k]);
        var key = k + ':' + now.toDateString();
        if (curM >= m && curM <= m + 1) {
          if (lastFiredKey !== key) {
            lastFiredKey = key;
            fireAlarm(NAMES[k] || k);
          }
        }
      });
    } catch (e) {}
  }

  function fireAlarm(name) {
    toast('حان وقت ' + name);
    var userAdhan = localStorage.getItem('userAdhan');
    // تحقق أمني: نقبل غير data:audio أو blob: (مانعا حقن javascript:)
    var src = 'assets/audio/adhan_aqib_azeez.mp3';
    if (userAdhan && /^(data:audio\/|blob:)/.test(userAdhan)) {
      src = userAdhan;
    }
    if ($('sound').checked) {
      try {
        var a = new Audio(src);
        a.play().catch(function () { if (window.Adhan) Adhan.chime(); });
      } catch (e) { if (window.Adhan) Adhan.chime(); }
    }
    if ($('notif').checked && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('مواقيت الصلاة', { body: 'حان وقت ' + name }); } catch (e) {}
    }
  }

  function init() {
    // تسجيل Service Worker (PWA / offline)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
    // تعبئة قائمة المدن
    var sel = $('city');
    Cities.list.forEach(function (c, i) {
      var o = document.createElement('option');
      o.value = i; o.textContent = c.name;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      localStorage.setItem('lastCity', sel.selectedIndex);
      render();
    });
    // استرجاع آخر مدينة
    var lc = parseInt(localStorage.getItem('lastCity') || '0', 10);
    if (lc >= 0 && lc < Cities.list.length) sel.selectedIndex = lc;
    // زر GPS: يقرأ الموقع الحالي ويختار أقرب مدينة
    $('gpsBtn').addEventListener('click', function () {
      if (!('geolocation' in navigator)) { toast('GPS غير مدعوم في هذا المتصفح'); return; }
      toast('جارٍ تحديد الموقع...');
      navigator.geolocation.getCurrentPosition(function (pos) {
        var la = pos.coords.latitude, ln = pos.coords.longitude;
        // أقرب مدينة (مسافة إقليدية مبسطة)
        var best = 0, bd = 1e18;
        Cities.list.forEach(function (c, i) {
          var d = (c.lat - la) * (c.lat - la) + (c.lng - ln) * (c.lng - ln);
          if (d < bd) { bd = d; best = i; }
        });
        sel.selectedIndex = best;
        localStorage.setItem('lastCity', best);
        render();
        toast('تم تحديد: ' + Cities.list[best].name);
      }, function (err) {
        toast('تعذر تحديد الموقع (' + err.message + ')');
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
    $('notif').addEventListener('change', function () {
      if (this.checked && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });
    $('testAdhan').addEventListener('click', function () {
      try {
        var a = new Audio('assets/audio/adhan_aqib_azeez.mp3'); // الملف الحر CC BY-SA
        a.play().catch(function () { toast('تعذر التشغيل (تأكدي من الملف)'); });
      } catch (e) { if (window.Adhan) Adhan.play(); }
    });
    // رفع ملف أذان من المستخدم (يُحفظ محلياً فقط)
    $('adhanFile').addEventListener('change', function () {
      var f = this.files[0];
      if (!f) return;
      // تحقق أمني: نقبل غير ملفات الصوت
      if (!/^audio\//.test(f.type)) { toast('الملف ليس صوتياً ✋'); this.value=''; return; }
      var r = new FileReader();
      r.onload = function () {
        try {
          localStorage.setItem('userAdhan', r.result); // data URL محلي بلا إنترنت
          toast('تم حفظ ملف الأذان محلياً ✅');
        } catch (e) { toast('تعذر الحفظ (الحجم كبير)'); }
      };
      r.readAsDataURL(f);
    });
    // طلب إذن الإشعارات أوتوماتيكياً (للتنبيه حتى في background)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(function(){});
    }
    render();
    setInterval(render, 30000); // تحديث كل 30 ثانية
    setInterval(checkPrayerNow, 60000); // فحص دقيقة: تشغيل الأذان عند دخول الوقت
    checkPrayerNow();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else { try { init(); } catch (e) { console.error('APP_INIT_ERR:', e.message); } }
})();
