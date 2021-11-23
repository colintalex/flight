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
  buildSolar();
  addEarthShadow();
  buildLayerMenu();
  addDrawControls();
});

