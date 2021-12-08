function radiansToDegrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}


function buildSolar() {
  $('#sun').empty();
  var { lat, lng } = map.getCenter();
  var time = Date.now();
  var sunPos = SunCalc.getPosition(time, lat, lng)
  
  $('#sun').append(`Current Position: Lat-${lat.toFixed(3)}, Long: ${lng.toFixed(3)} <br>`)
  $('#sun').append(`Sun-Altitude: ${radiansToDegrees(sunPos.altitude)}`)
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

function getSunAngleWindow(time, lat, lng) {
  var results = new Array
  var mins = (1000 * 60)
  var hours = mins * 60
  var day = hours * 24
  var nextTime = time + day

  for (i = time; i < nextTime; i+= mins) {
    var sunPos = SunCalc.getPosition(i, lat, lng)
    sunPos = radiansToDegrees(sunPos.altitude)
    if (sunPos >= 30)
      results.push({ i, sunPos })
  }

  var noonTime = SunCalc.getTimes(time, lat, lng).solarNoon
  var noonAngle = radiansToDegrees(SunCalc.getPosition(noonTime, lat, lng).altitude)

  var startTime;
  var startAngle;
  var endTime;
  var endAngle;

  if (results.length < 1){
    startTime = 'n/a';
    startAngle = 'n/a';
    endTime = 'n/a';
    endAngle = 'n/a';
  }else{
    startTime = new Date(results[0].i).toLocaleTimeString()
    startAngle = results[0].sunPos
    endTime = new Date(results[results.length - 1].i).toLocaleTimeString()
    endAngle = results[results.length - 1].sunPos
  }
  var window = {
    noonTime,
    noonAngle,
    startTime,
    startAngle,
    endTime,
    endAngle
  };

  return window;
};