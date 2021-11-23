function addWeather() {

  var osmLayer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  });
  g_overlays['osm'] = osmLayer;

  var wmsUrl = "https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer"
  var radarWMS = L.nonTiledLayer.wms(wmsUrl, {
    layers: '1',
    format: 'image/png',
    transparent: true,
    opacity: 0.8,
    attribution: 'nowCOAST'
  });

  var testTimeLayer = L.timeDimension.layer.wms(radarWMS, {
    updateTimeDimension: false,
    wmsVersion: '1.3.0'
  });
  g_overlays['radar'] = testTimeLayer
  testTimeLayer.addTo(map);

  var theLegend = L.control({
    position: 'topright'
  });

  theLegend.onAdd = function (map) {
    var src = "https://nowcoast.noaa.gov/images/legends/radar.png";
    var div = L.DomUtil.create('div', 'info legend');
    div.style.width = '270px';
    div.style.height = '50px';
    div.innerHTML += '<b>Legend</b><br><img src="' + src + '" alt="legend">';
    return div;
  };
  theLegend.addTo(map);

};

function getWeatherAtCoords(coords){
  let weather;
  var { lat, lng } = coords;
  const key = 'd289e36e27a95791f32966b535cfc2da'
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=${key}`
  $.ajax({
    url: url,
    async: false,
    success: function(data) {
      weather = data.current.weather[0].description
    },
    error: function(resp){
      console.log(resp)
    }
  })
  return weather;
}