function radians_to_degrees(radians) {
  var pi = Math.PI;
  var deg = radians * (180 / pi);

  if (deg < 0){
    return 'DARK'
  }else{
    return `${deg.toFixed(2)} deg`;
  }
}


function buildSolar() {
  $('#sun').empty();
  var { lat, lng } = map.getCenter();
  var time = Date.now();
  var sunPos = SunCalc.getPosition(time, lat, lng)
  $('#sun').append(`Current Position: Lat-${lat.toFixed(3)}, Long: ${lng.toFixed(3)} <br>`)
  $('#sun').append(`Sun-Altitude: ${radians_to_degrees(sunPos.altitude)}`)
};

function addEarthShadow() {
  var earthShadow = L.terminator({
    fillOpacity: 0.3,
  });
  g_overlays['shadow'] = earthShadow
  earthShadow.addTo(map);
  setInterval(function () { updateTerminator(earthShadow) }, 500);
  function updateTerminator(earthShadow) {
    earthShadow.setTime();
  }
};

function getLocationInfo(lat, lng){
  var data = {};
  var time = Date.now();
  var times = SunCalc.getTimes(time, lat, lng);
  data.times = times;

  data.currentSunPos = SunCalc.getPosition(time, lat, lng).altitude;
  data.noonSunPos = SunCalc.getPosition(times.solarNoon, lat, lng).altitude;

  var weather = getWeatherAtCoords(lat, lng);
  data.posWeather = weather;
  data.posTimezone = weather.timezone;

  data.flyStartLocal = timeZoneTime(times.flyStart, weather.timezone);
  data.flyEndLocal = timeZoneTime(times.flyEnd, weather.timezone);
  data.flyStartMtn = timeZoneTime(times.flyEnd);
  data.flyEndMtn = timeZoneTime(times.flyEnd)

  return data;
}

function timeZoneTime(time, tZone='America/Denver') {
  var newTime = new Date(time).toLocaleTimeString("en-us", { timeZone: tZone });
  if (newTime == 'Invalid Date')
    newTime = 'n/a';

  return newTime;
}