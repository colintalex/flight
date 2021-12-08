
function buildMap() {
  var currentTime = new Date();
  currentTime.setUTCDate(1, 0, 0, 0, 0);


  map = L.map('map', {
      zoom: 5,
      minZoom: 5,
      maxBounds: [[67.208, -49.404], [-4.379, -160.234]],
      fullscreenControl: true,
      center: [39.25, -99.50],
    });

  map.on('moveend', function () {
    buildSolar(); //refresh suncalc
  });
};


function addDrawControls() {
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  var drawControl = new L.Control.Draw({
    draw: {
      polygon: false,
      rectangle: false,
      ployline: false
    },
    edit: {
      featureGroup: drawnItems
    },
    position: 'bottomright'
  });
  map.addControl(drawControl);

  map.on('draw:created', function (e) {
    var layer = e.layer;
    drawnItems.clearLayers()
    layer.addTo(drawnItems)

    var center;
    switch (e.layerType){
      case 'polygon':
        center = layer.getCenter();
        break;
      case 'circle':
        center = layer.getLatLng();
        break;
      case 'rectangle':
        center = layer.getCenter();
        break;
      case 'marker':
        center = layer.getLatLng();
        break;
    };
    map.setView(center, 7);
    buildAreaDetail(layer, center);
  });
};

function buildAreaDetail(layer, center) {
  // get timezone for area center
        // with active flights time may be determined by starting airport?
  
  var time = Date.now();
  var sunPos = SunCalc.getPosition(time, center.lat, center.lng);
  var posWeather = getWeatherAtCoords(center);
  var times = SunCalc.getTimes(new Date(), center.lat, center.lng);
  var setTimeHere = times.sunset.toLocaleTimeString();
  var setTimeThere = new Date(times.sunset - times.sunset.setMinutes(posWeather.timezone_offset));
  // debugger
  $('#polygon').empty();
  $('#polygon').append(`` +
    `Sun Angle: ${sunPos.altitude.toFixed(3)} ` +
    `<br>Weather: ${posWeather.current.weather[0].description}` +
    `<br>Sunset Time:` +
    `<br>Localtime:${setTimeThere.toLocaleTimeString()}` +
    `<br>Where you are:${setTimeHere}` +
    `<br>Sunset Countdown: <br>${times.sunsetStart.getHours()} hours, ${times.sunsetStart.getMinutes()} minutes to sunset.`
    );
};


function buildLayerMenu() {
  $.each(g_overlays, function(key, val) {
    $('#menu').append(`<li><input type='checkbox' class="overlay_option" id=${key} checked>${key}</input></li>`)
  })

  $('.overlay_option').on('click', function(e){
    var targetLayer = g_overlays[e.target.id];

    if (map.hasLayer(targetLayer)) {
      map.removeLayer(targetLayer);
    }else {
      map.addLayer(targetLayer);
    };
    
  })
};

function addBaseMaps() {
  var baseStreetUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
  
  var baseOverlay = L.tileLayer(baseStreetUrl, {
    // subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Google, © 2008-' + (new Date()).getFullYear() + ', Sanborn',
    minZoom: 0,
    maxZoom: 25,
    tms: false,
    zIndex: 0
  });
  
  g_overlays['basemap'] = baseOverlay

  baseOverlay.addTo(map);
};





