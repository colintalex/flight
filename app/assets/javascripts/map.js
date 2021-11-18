
function buildMap() {
  var endDate = new Date();
  endDate.setUTCMinutes(0, 0, 0);

  map = L.map('map', {
      zoom: 4,
      fullscreenControl: true,
      timeDimension: true,
      timeDimensionControl: true,
      timeDimensionOptions: {
        timeInterval: "PT4H/" + endDate.toISOString(),
        period: "PT4M",
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
};

function addBaseMaps() {
  var baseStreetUrl = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  
  L.tileLayer(baseStreetUrl, {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Google, © 2008-' + (new Date()).getFullYear() + ', Sanborn',
    minZoom: 0,
    maxZoom: 25,
    tms: false,
    zIndex: 0
  }).addTo(map);
};



function addWeather() {
  var satelliteWeatherUrl = "https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer?"
  var meteorUrl = "https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer?"

  var satWMS = L.tileLayer.wms(satelliteWeatherUrl, {
    layers: '1',
    format: 'image/png',
    transparent: true,
    opacity: 0.8,
    attribution: 'nowCOAST',
  });
  var radarWMS = L.tileLayer.wms(meteorUrl, {
    layers: '1',
    format: 'image/png',
    transparent: true,
    opacity: 0.8,
    attribution: 'nowCOAST',
  });

  testTimeLayer = L.timeDimension.layer.wms(satWMS, {
    version: '1.3.0'
  });
  testTimeLayer2 = L.timeDimension.layer.wms(radarWMS, {
    version: '1.3.0'
  });

  testTimeLayer.addTo(map);
  testTimeLayer2  .addTo(map);

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
}


function buildFlightTracker(){

  //Initial Position
  var latlngs = [
    [38.80191266823473, -104.69899901104442]
  ];
  var start_coords = latlngs[0]
  var polyline = L.polyline(latlngs).addTo(map);
  
  var decorator = L.polylineDecorator(polyline, {
      patterns: [
        // defines a pattern of 10px-wide dashes, repeated every 20px on the line
        { offset: 0, repeat: 60, symbol: new L.Symbol.arrowHead({ pixelSize: 10 }) }
      ]
    }).addTo(map);
  
  // ////////////////////////////////////////////////////////////////////////////////
  // PLANE MARKER
    var angle = 0;
    var duration = 2000; //time in secs for marker to move from A to B. 
  
    var planeIcon = L.icon({
      iconUrl: "/assets/plane.svg",
      iconSize: [24, 24], // size of the icon
      iconAnchor: [12, 12],
      className: 'plane'
    });
  
    var marker = L.Marker.movingMarker([start_coords, [38.8231, -104.8001]], [duration], {
                    icon: planeIcon,
                    rotationAngle: 0,
                    rotationOrigin: 'center',
                    tempLine: true,
                    tempLineColor: 'orange'
                  }).addTo(map);
  
  
  ////////////////////////////////////////////////////////////////////////////////
  // LatLng Maker (Dev Only)
  
  for(let step = 0; step < 10; step++){
    setTimeout(function timer() {
      var current_coords = latlngs[step]
      var next_coords;
      if(step % 3 == 0){
        next_coords = [current_coords[0] + 0.003, current_coords[1] + 0.002]
      }else{
        next_coords = [current_coords[0] + 0.002, current_coords[1] + 0.003]
      }
  
      latlngs.push(next_coords)
      angle = getAngle(current_coords, next_coords)
      marker.setRotationAngle(angle)
      marker.moveTo(next_coords, duration);
  
      polyline.addLatLng(current_coords)
      decorator.redraw()
    }, step * duration);
  };
}