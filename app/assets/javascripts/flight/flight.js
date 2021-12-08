function buildFlightTracker() {

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
  var duration = 2000; //time in secs for marker to move from A to B 

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


  marker.bindPopup();

  marker.on('click', function(e){
    var popup = e.target.getPopup();

    var { lat, lng } = marker.getLatLng();
    var time = Date.now();
    var sunPos = SunCalc.getPosition(time, lat, lng)

    var sunDegrees = radians_to_degrees(sunPos.altitude).toFixed(1) * 10;
    var weather = getWeatherAtCoords({ lat, lng }).current.weather[0].description;

    var sunAngleTimes = getSunAngleWindow(time, lat, lng)

    var posWeather = getWeatherAtCoords(marker.getLatLng());
    var posTimezone = posWeather.timezone;
    var currentSunPos = SunCalc.getPosition(time, lat, lng).altitude;
    var noonSunPos = SunCalc.getPosition(times.solarNoon, lat, lng).altitude;

    var flyStartLocal = new Date(times.flyStart).toLocaleTimeString("en-us", { timeZone: posTimezone });
    var flyStartMtn = new Date(times.flyStart).toLocaleTimeString("en-us", { timeZone: 'America/Denver' });
    var flyEndLocal = new Date(times.flyEnd).toLocaleTimeString("en-us", { timeZone: posTimezone });
    var flyEndMtn = new Date(times.flyEnd).toLocaleTimeString("en-us", { timeZone: 'America/Denver' });

    // debugger
    var content = 
    `Current Sun Angle: ${currentSunPos.toFixed(2)} degrees` +
    `<br>Max Sun Angle: ${noonSunPos.toFixed(2)}` +
    `<br>30 deg Start: ${flyStartLocal}` +
    `<br>30 deg End: ${flyEndLocal}` +
    `<br> Weather: ${weather}<br> <button class='plane_zoomin' id='${marker._leaflet_id}'>Zoom</button>`


    popup.setContent(content);

    $('.plane_zoomin').on('click', function (e) {
      map.setView(marker.getLatLng(), 10)
    });
  });

  

  ////////////////////////////////////////////////////////////////////////////////
  // LatLng Maker (Dev Only)

  for (let step = 0; step < 30; step++) {
    setTimeout(function timer() {
      var current_coords = latlngs[step]
      var next_coords;
      if (step % 3 == 0) {
        next_coords = [current_coords[0] + 0.05, current_coords[1] + 0.03]
      } else {
        next_coords = [current_coords[0] + 0.03, current_coords[1] + 0.05]
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