    function getAngle(A, B) {
      var rads = null;
      var latA = A[0];
      var lonA = A[1];
      var latB = B[0];
      var lonB = B[1];
  
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