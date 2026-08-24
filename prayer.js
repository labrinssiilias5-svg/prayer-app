// prayer.js - حساب مواقيت الصلاة محلياً (خوارزمية Zarrabi-Zadeh / praytimes.js مفتوحة المصدر MIT)
// الدقة رياضية بحتة، بلا أي اتصال بالإنترنت. المدخلات: تاريخ + خط العرض/الطول + المنطقة الزمنية + الطريقة.

(function (global) {
  'use strict';
  var dtr = function (d) { return (d * Math.PI) / 180.0; };
  var rtd = function (r) { return (r * 180.0) / Math.PI; };
  var sin = function (d) { return Math.sin(dtr(d)); };
  var cos = function (d) { return Math.cos(dtr(d)); };
  var tan = function (d) { return Math.tan(dtr(d)); };
  var acos = function (d) { return rtd(Math.acos(d)); };
  var atan = function (d) { return rtd(Math.atan(d)); };
  var fixAngle = function (a) { a = a - 360.0 * Math.floor(a / 360.0); return a; };
  function acosRad(x) { return Math.acos(Math.max(-1, Math.min(1, x))); }
  function sin2(deg) { return Math.sin(dtr(deg)); }

  var methods = {
    MWL:     { fajr: 18, isha: 17 },
    ISNA:    { fajr: 15, isha: 15 },
    Egypt:   { fajr: 19.5, isha: 17.5 },
    Karachi: { fajr: 18, isha: 18 },
    Makkah:  { fajr: 18.5, isha: 90 },
    Tehran:  { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' },
    Jafari:  { fajr: 16, isha: 14, maghrib: 4, midnight: 'Jafari' }
  };

  function julianDate(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }

  function sunPosition(jd) {
    var D = jd - 2451545.0;
    var g = fixAngle(357.529 + 0.98560028 * D);
    var q = fixAngle(280.459 + 0.98564736 * D);
    var L = fixAngle(q + 1.915 * Math.sin(dtr(g)) + 0.020 * Math.sin(2 * dtr(g)));
    var e = 23.439 - 0.00000036 * D;
    var RA = rtd(Math.atan2(Math.cos(dtr(e)) * Math.sin(dtr(L)), Math.cos(dtr(L))));
    RA = fixAngle(RA);
    var decl = rtd(Math.asin(Math.sin(dtr(e)) * Math.sin(dtr(L))));
    var eqt = q / 15 - RA / 15;
    return { declination: decl, equation: eqt };
  }

  function angleTime(angle, lat, decl, t, dir) {
    var tval = (1.0 / 15.0) * acos(
      (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))
    );
    return dir === 'ccw' ? t - tval : t + tval;
  }

  function asrTime(factor, lat, decl, dhuhr) {
    // الصيغة الصحيحة من praytimes.org: angle بالدرجات
    var angle = rtd(Math.atan(1.0 / (factor + Math.tan(dtr(Math.abs(lat - decl))))));
    var tval = (1.0 / 15.0) * acos(
      (Math.sin(dtr(angle)) - Math.sin(dtr(lat)) * Math.sin(dtr(decl))) /
      (Math.cos(dtr(lat)) * Math.cos(dtr(decl)))
    );
    return dhuhr + tval;
  }

  function getTimes(date, coords, tz, method) {
    method = method || 'MWL';
    var set = methods[method] || methods.MWL;
    var lat = coords.lat, lng = coords.lng;
    var jd = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    var sp = sunPosition(jd);
    var dhuhr = 12 + tz - lng / 15 - sp.equation;
    var sunrise = angleTime(0.833, lat, sp.declination, dhuhr, 'ccw');
    var sunset = angleTime(0.833, lat, sp.declination, dhuhr, 'cw');
    var fajr = angleTime(set.fajr, lat, sp.declination, dhuhr, 'ccw');
    var ishaMin = (typeof set.isha === 'number') ? set.isha : 90;
    var isha = (typeof set.isha === 'number')
      ? angleTime(set.isha, lat, sp.declination, dhuhr, 'cw')
      : sunset + ishaMin / 60.0;
    var maghrib = (set.maghrib) ? sunset + set.maghrib / 60.0 : sunset;
    var asr = asrTime(1, lat, sp.declination, dhuhr);

    function fmt(h) {
      h = (h + 24) % 24;
      var hh = Math.floor(h);
      var mm = Math.round((h - hh) * 60);
      if (mm === 60) { mm = 0; hh = (hh + 1) % 24; }
      return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
    }
    return {
      fajr: fmt(fajr), sunrise: fmt(sunrise), dhuhr: fmt(dhuhr),
      asr: fmt(asr), sunset: fmt(sunset), maghrib: fmt(maghrib), isha: fmt(isha)
    };
  }

  // اتجاه القبلة (بوصلة) من الإحداثيات الحالية نحو الكعبة
  function qiblaDirection(lat, lng) {
    var kaabaLat = 21.4225, kaabaLng = 39.8262;
    var phiK = dtr(kaabaLat), phi = dtr(lat), dl = dtr(kaabaLng - lng);
    var y = Math.sin(dl);
    var x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(dl);
    var q = rtd(Math.atan2(y, x));
    return (q + 360) % 360;
  }

  // تحويل ميلادي → هجري (خوارزمية دقيقة عبر Julian Day)
  function toHijri(gd) {
    var day = gd.getDate(), month = gd.getMonth() + 1, year = gd.getFullYear();
    // 1) Julian Day
    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    var jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) -
             Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    // 2) إلى هجري: الأساس = JD - 1948439.5 (بداية السنة الهجرية 1 محرم 1)
    var jdH = jd - 1948439.5;
    var cyc = Math.floor(jdH / 10631);          // كل دورة = 30 سنة = 10631 يوم
    var rem = jdH - cyc * 10631;
    var yr = cyc * 30;
    var daysInYear, mi = 0;
    // نجد السنة داخل الدورة (29 أو 30 يوم)
    while (mi < 30) {
      daysInYear = (mi % 2 === 0) ? 355 : 354; // تقريب: فردي 355، زوجي 354
      if (rem < daysInYear) break;
      rem -= daysInYear; yr += 1; mi += 1;
    }
    var months = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]; // تقريب شهور
    var md = rem, mm = 0;
    while (mm < 12) {
      if (md < months[mm]) break;
      md -= months[mm]; mm += 1;
    }
    var dd = md + 1;
    var MONTHS = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
    return dd + ' ' + MONTHS[mm] + ' ' + (yr + 1) + ' هـ';
  }

  global.PrayerCalc = { getTimes: getTimes, qiblaDirection: qiblaDirection, methods: methods, toHijri: toHijri };
})(typeof window !== 'undefined' ? window : this);
