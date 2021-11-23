
function buildMap() {
  var endDate = new Date();
  endDate.setUTCMinutes(0, 0, 0);

  map = L.map('map', {
      zoom: 4,
      fullscreenControl: true,
      timeDimension: true,
      timeDimensionControl: true,
      timeDimensionOptions: {
        timeInterval: endDate.toISOString() + "/PT48H",
        period: "PT4H",
        currentTime: endDate
      },

      timeDimensionControlOptions: {
        autoPlay: false,
        playerOptions: {
          buffer: 10,
          transitionTime: 250,
          loop: true,
        }
      },
      center: [38.0, -90.50],
    });

  // var centerMarker = new L.Marker(map.getCenter()).addTo(map);
    
  // map.on('move', function (e) {
  //   centerMarker.setLatLng(map.getCenter());
  // });


  map.on('moveend', function () {
    buildSolar(); //refresh suncalc
  });



};


function addDrawControls() {
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  var drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems
    }
  });
  map.addControl(drawControl);

  map.on('draw:created', function (e) {
    var layer = e.layer;
    drawnItems.clearLayers()
    layer.addTo(drawnItems)

    let center;
    switch (e.layerType){
      case 'polygon':
        center = layer.getCenter()
        break;
      case 'circle':
        center = layer.getLatLng()
        break;
      case 'rectangle':
        center = layer.getCenter()
        break;
    }
    map.setView(center, 7);
    buildAreaDetail(layer, center);
  });
};

function buildAreaDetail(layer, center) {
  // debugger
  $('#polygon').append(center.lat);
  debugger
};


function buildLayerMenu() {
  $.each(g_overlays, function(key, val) {
    $('#menu').append(`<li class="overlay_option" id=${key}>${key}</li>`)
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
  var baseStreetUrl = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  
  var baseOverlay = L.tileLayer(baseStreetUrl, {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Google, © 2008-' + (new Date()).getFullYear() + ', Sanborn',
    minZoom: 0,
    maxZoom: 25,
    tms: false,
    zIndex: 0
  });
  
  g_overlays['basemap'] = baseOverlay

  baseOverlay.addTo(map);
};





