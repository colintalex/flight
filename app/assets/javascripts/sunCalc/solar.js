function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
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