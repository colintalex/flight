// ////////////////////////////////////////////////////////////////////////////////
// MAP
let testTimeLayer;
let map;
$(document).ready(function(){
  buildMap();
  addBaseMaps();
  buildFlightTracker();
  addWeather();
});
