function addWeather() {
  var radarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi?';
  var radarWMS = L.tileLayer.wms(radarUrl, {
    layers: 'nexrad-n0q-900913',
    format: 'image/png',
    transparent: true,
  });

  var cloudWMS = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid={apiKey}', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    apiKey: 'd289e36e27a95791f32966b535cfc2da',
    opacity: 1,
  });

  var testWMS = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/CL/{z}/{x}/{y}?appid={API key}', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    apiKey: 'd289e36e27a95791f32966b535cfc2da',
    opacity: 1,
  });


  g_overlays['radar'] = radarWMS
  g_overlays['clouds'] = cloudWMS

  cloudWMS.addTo(map);
  radarWMS.addTo(map);


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

function getWeatherAtCoords(lat, lng){
  let weather;
  const key = 'd289e36e27a95791f32966b535cfc2da'
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=${key}`
  $.ajax({
    url: url,
    async: false,
    success: function(data) {
      weather = data
    },
    error: function(resp){
      console.log(resp)
    }
  })
  return weather;
}

// change6