// ////////////////////////////////////////////////////////////////////////////////
// MAP
let testTimeLayer;
let testTimeLayer2;
let map;

var g_overlays = {}
var g_flights = {}
$(function(){
  buildMap();
  addBaseMaps();
  addWeather();
  buildFlightTracker();
  buildSolar();
  addEarthShadow();
  buildLayerMenu();
  addDrawControls();
});

