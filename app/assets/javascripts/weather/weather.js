function addWeather() {
  var radarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi?';
  var radarWMS = L.nonTiledLayer.wms(radarUrl, {
    layers: 'nexrad-n0q-m50m',
    format: 'image/png',
    transparent: true,
  });

  var cloudUrl = 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer';
  var cloudWMS = L.nonTiledLayer.wms(cloudUrl, {
    layers: '9',
    format: 'image/png',
    transparent: true,
  });


  g_overlays['radar'] = radarWMS
  g_overlays['cloud'] = cloudWMS

  // cloudWMS.addTo(map);
  // radarWMS.addTo(map);
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
      // debugger
      weather = data
    },
    error: function(resp){
      console.log(resp)
    }
  })
  return weather;
}