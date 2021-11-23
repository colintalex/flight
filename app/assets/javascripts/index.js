// ////////////////////////////////////////////////////////////////////////////////
// MAP
let testTimeLayer;
let testTimeLayer2;
let map;

var g_overlays = {}
var g_overlays = {}
$(document).ready(function(){
  buildMap();
  addBaseMaps();
  addWeather();
  buildFlightTracker();
  buildSolarCalc();
  addEarthShadow();
  buildLayerMenu();
  addDrawControls();
});

