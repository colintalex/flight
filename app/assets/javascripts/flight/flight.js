var duration = 20000; //time in secs for marker to move from A to B..

function buildFlightTracker() {

  $.getJSON('./feed_dump.json', function (data) {
    createFleet(data)
  })

  // var polyline = L.polyline(flightPath).addTo(map);
  // var decorator = L.polylineDecorator(polyline, {
  //   patterns: [{ 
  //     offset: 0,
  //     repeat: 60,
  //     symbol: new L.Symbol.arrowHead({ pixelSize: 10 }) 
  //   }]
  // }).addTo(map);

  // ///////////////////////////////////////////////////////////////////////////
  // PLANE MARKER

  // get list of planes from db, save globally
  // get flight data from stream (FR24)
  // get active planes (list of aircraft in stream)
  // update positions for each active craft
  

}

function buildPlane(initial_coords) {

  var planeIcon = L.icon({
    iconUrl: "/assets/plane.svg",
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12],
    className: 'plane',
    showFlightPath: false
  });

  return L.Marker.movingPlaneMarker([initial_coords, initial_coords], [duration], {
            icon: planeIcon
          });
}

function createFleet(data) {
  var planeLayer = L.layerGroup()

  for (const key in data){
    if (key == 'full_count' || key == 'version'){
      continue;
    }
    var planeData = data[key]
    const lat = planeData[1];
    const lng = planeData[2];
    const heading = planeData[3]
    const altitude = planeData[4]
    const ground_speed = planeData[5]
    
    var plane = buildPlane([lat,lng]);
    plane.identifier = key
    plane.model = planeData[8];
    plane.tail_num = planeData[9];
    plane.altitude = planeData[4];
    plane.setRotationAngle(heading);
    bindPlanePopup(plane)
    
    plane.addTo(planeLayer)
    g_flights[key] = plane
  }

  planeLayer.addTo(map);
  g_overlays['flight'] = planeLayer
}

function bindPlanePopup(plane) {
  plane.bindPopup();

  plane.on('popupopen', function (e) {
    var popup = e.target.getPopup();
    var { lat, lng } = this.getLatLng();
    var data = getLocationInfo(lat, lng);

    var content =
      `<br>TailNum: ${this.tail_num}` +
      `<br>Model: ${this.model}` +
      `<br>Altitude: ${this.altitude}` +
      `<br>Current Sun Angle: ${data.currentSunPos}` +
      `<br>Max Sun Angle: ${data.noonSunPos}` +
      `<br>30 deg: ${data.flyStartLocal} to ${data.flyEndLocal}` +
      `<br>MST: ${data.flyStartMtn} to ${data.flyEndMtn}` +
      `<br> <button class='plane_zoomin' id='${plane._leaflet_id}'>Zoom</button>` +
      `<br> <button class='plane_history_on' id='${plane.identifier}'>History</button>` +
      `<br> <button class='plane_history_off' id='${plane.identifier}'>History</button>` +
      `<br>` 

      popup.setContent(content);


    $.getJSON('./history.json', function (data) {
      var currentPath = plane._flightPath.getLatLngs()[0];
      var trail = data.trail.reverse().concat(currentPath);
      if (currentPath.length < trail.length)
        plane._flightPath.setLatLngs(trail);


      plane.showPath(map)
    })

    $('.plane_zoomin').on('click', function (e) {
      map.setView(plane.getLatLng(), 10)
    });

    $('.plane_history_off').on('click', function (e) {
      plane.hidePath(map)
    });

  });

  plane.on('popupclose', function(e){
    this.hidePath(map);
  });

  for (var i = 0; i < 25; i++){
    setTimeout(function timer() {
      var {lat, lng} = plane.getLatLng();
      var newLat, newLng;
      newLat = lat + 0.05 + Math.random()
      newLng = lng - 0.05 + Math.random()

      plane.flyTo([newLat, newLng], 3000)
    }, i * 3000);
  }
}