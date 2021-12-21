function getAngle(latlng_1, latlng_2) {
  var rads = null;
  var latA = latlng_1[0];
  var lonA = latlng_1[1];
  var latB = latlng_2[0];
  var lonB = latlng_2[1];

  if (lonA == lonB && latA > latB) {
    rads = Math.PI;
  }
  else if (lonA == lonB && latA < latB) {
    rads = 0;
  }
  else if (lonA > lonB && latA == latB) {
    rads = -(Math.PI / 2);
  }
  else if (lonA < lonB && latA == latB) {
    rads = Math.PI / 2;
  }
  else {
    var x1 = latA * Math.pow(10, 12);
    var x2 = latB * Math.pow(10, 12);
    var y1 = lonA * Math.pow(10, 12);
    var y2 = lonB * Math.pow(10, 12);
    rads = Math.atan2(y2 - y1, x2 - x1)
  }
  var pi = Math.PI;
  var angle = rads * (180 / pi);
  return angle.toFixed(0);
}