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
    // console.log(data[key][1])
    const lat = data[key][1];
    const lng = data[key][2];
    const heading = data[key][3]
    const altitude = data[key][4]
    const ground_speed = data[key][5]
    
    var plane = buildPlane([lat,lng]);
    plane.identifier = key
    plane.model = data[key][8];
    plane.tail_num = data[key][9];
    plane.altitude = data[key][4];
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
    var data = getLocationInfo(lat, lng)

    var content =
      `<br>TailNum: ${plane.tail_num}` +
      `<br>Model: ${plane.model}` +
      `<br>Altitude: ${plane.altitude}` +
      `Current Sun Angle: ${data.currentSunPos}` +
      `<br>Max Sun Angle: ${data.noonSunPos}` +
      `<br>30 deg: ${data.flyStartLocal} to ${data.flyEndLocal}` +
      `<br>MST: ${data.flyStartMtn} to ${data.flyEndMtn}` +
      `<br> <button class='plane_zoomin' id='${plane._leaflet_id}'>Zoom</button>` +
      `<br> <button class='plane_history_on' id='${plane.identifier}'>History</button>` +
      `<br> <button class='plane_history_off' id='${plane.identifier}'>History</button>` +
      `<br>` 

    popup.setContent(content);

    $.getJSON('./history.json', function (data) {
      console.log(data)
      var pos = data.trail.reverse().concat(plane._flightPath.getLatLngs()[0])
      plane._flightPath.setLatLngs([])
      plane._flightPath.setLatLngs(pos)
      plane.showPath(map)
    })

    $('.plane_zoomin').on('click', function (e) {
      map.setView(plane.getLatLng(), 10)
    });

    $('.plane_history_off').on('click', function (e) {
      plane.hidePath(map)
    });

    $('.plane_history_on').on('click', function (e) {
      var identifer = e.target.id


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

      var angle = getAngle([lat, lng], [newLat, newLng])
      plane.setRotationAngle(angle)
      plane.moveTo([newLat, newLng], 3000)
    }, i * 3000);
  }
}