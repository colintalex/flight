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
  var data = {}
  var time = Date.now();
  data.sunPos = SunCalc.getPosition(time, lat, lng).altitude
  var times = SunCalc.getTimes(time, lat, lng);
  data.times = times;

  var weather = getWeatherAtCoords(lat, lng);
  data.posWeather = weather;
  data.posTimezone = weather;
  data.currentSunPos = SunCalc.getPosition(time, lat, lng).altitude;
  data.noonSunPos = SunCalc.getPosition(times.solarNoon, lat, lng).altitude;

  var flyStartLocal = new Date(times.flyStart).toLocaleTimeString("en-us", { timeZone: weather.posTimezone });
  var flyStartMtn = new Date(times.flyStart).toLocaleTimeString("en-us", { timeZone: 'America/Denver' });
  var flyEndLocal = new Date(times.flyEnd).toLocaleTimeString("en-us", { timeZone: weather.posTimezone });
  var flyEndMtn = new Date(times.flyEnd).toLocaleTimeString("en-us", { timeZone: 'America/Denver' });


  data.flyStartLocal = flyStartLocal == 'Invalid Date' ? 'n/a' : flyStartLocal;
  data.flyEndLocal = flyEndLocal == 'Invalid Date' ? 'n/a' : flyEndLocal;
  data.flyStartMtn = flyStartMtn == 'Invalid Date' ? 'n/a' : flyStartMtn;
  data.flyEndMtn = flyEndMtn == 'Invalid Date' ? 'n/a' : flyEndMtn;

  return data;
} 