// Requires leaflet.RotateMarker lib

L.interpolatePosition = function (p1, p2, duration, t) {
  var k = t / duration;
  k = (k > 0) ? k : 0;
  k = (k > 1) ? 1 : k;
  return L.latLng(p1.lat + k * (p2.lat - p1.lat),
    p1.lng + k * (p2.lng - p1.lng));
};

L.getAngle = function (A, B) {
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

L.Marker.MovingPlaneMarker = L.Marker.extend({

  //state constants
  statics: {
    notStartedState: 0,
    endedState: 1,
    pausedState: 2,
    runState: 3
  },

  options: {
    autostart: false,
    loop: false,
    tempLine: false,
    tempLineColor: 'orange',
    tempLineOpacity: '30%',
    rotationAngle: 0,
    rotationOrigin: 'center',
    tempLine: true,
    tempLineColor: 'orange'
  },

  initialize: function (latlngs, durations, options) {
    L.Marker.prototype.initialize.call(this, latlngs[0], options);

    this._latlngs = latlngs.map(function (e, index) {
      return L.latLng(e);
    });

    if (durations instanceof Array) {
      this._durations = durations;
    } else {
      this._durations = this._createDurations(this._latlngs, durations);
    }

    this._currentDuration = 0;
    this._currentIndex = 0;

    this._state = L.Marker.MovingPlaneMarker.notStartedState;
    this._startTime = 0;
    this._startTimeStamp = 0;  // timestamp given by requestAnimFrame
    this._pauseStartTime = 0;
    this._animId = 0;
    this._animRequested = false;
    this._currentLine = [];
    this._stations = {};
    this._showFlightPath = false;
    this._flightPath = L.polyline([this._latlngs]);

    if(this.options.tempLine){
      this._tempLine = L.polyline([], {
        color: this.options.tempLineColor,
        opacity: this.options.tempLineOpacity
      });
    };
  },

  hidePath: function(map) {
    this.showFlightPath = false;
    map.removeLayer(this._flightPath);
    map.removeLayer(this._tempLine);
  },

  showPath: function(map) {
    this.showFlightPath = true;
    map.addLayer(this._flightPath);
    map.addLayer(this._tempLine);
  },

  isRunning: function () {
    return this._state === L.Marker.MovingPlaneMarker.runState;
  },

  isEnded: function () {
    return this._state === L.Marker.MovingPlaneMarker.endedState;
  },

  isStarted: function () {
    return this._state !== L.Marker.MovingPlaneMarker.notStartedState;
  },

  isPaused: function () {
    return this._state === L.Marker.MovingPlaneMarker.pausedState;
  },

  start: function () {
    if (this.isRunning()) {
      return;
    }

    if (this.isPaused()) {
      this.resume();
    } else {
      this._loadLine(0);
      this._startAnimation();
      this.fire('start');
    }
  },

  resume: function () {
    if (!this.isPaused()) {
      return;
    }
    // update the current line
    this._currentLine[0] = this.getLatLng();
    this._currentDuration -= (this._pauseStartTime - this._startTime);
    this._startAnimation();
  },

  pause: function () {
    if (!this.isRunning()) {
      return;
    }

    this._pauseStartTime = Date.now();
    this._state = L.Marker.MovingPlaneMarker.pausedState;
    this._stopAnimation();
    this._updatePosition();
  },

  stop: function (elapsedTime) {
    if (this.isEnded()) {
      return;
    }

    this._stopAnimation();

    if (typeof (elapsedTime) === 'undefined') {
      // user call
      elapsedTime = 0;
      this._updatePosition();
    }

    this._state = L.Marker.MovingPlaneMarker.endedState;
    this.fire('end', { elapsedTime: elapsedTime });
  },

  addLatLng: function (latlng, duration) {
    this._latlngs.push(L.latLng(latlng));
    this._durations.push(duration);
  },

  flyTo: function (latlng, duration) {
    this._stopAnimation();
    var currentPos = this.getLatLng();
    var nextPos = L.latLng(latlng);

    var heading = L.getAngle([currentPos.lat, currentPos.lng], [nextPos.lat, nextPos.lng])
    this.setRotationAngle(heading)

    this._flightPath.addLatLng(currentPos);
    this._latlngs = [this.getLatLng(), nextPos];
    this._durations = [duration];
    this._state = L.Marker.MovingPlaneMarker.notStartedState;
    this.start();
    this.options.loop = false;
  },

  addStation: function (pointIndex, duration) {
    if (pointIndex > this._latlngs.length - 2 || pointIndex < 1) {
      return;
    }
    this._stations[pointIndex] = duration;
  },

  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);

    if (this._showFlightPath){
      this.showPath(map)
    }

    if (this.options.autostart && (!this.isStarted())) {
      this.start();
      return;
    }

    if (this.isRunning()) {
      this._resumeAnimation();
    }
  },

  onRemove: function (map) {
    L.Marker.prototype.onRemove.call(this, map);
    this._stopAnimation();
  },

  _createDurations: function (latlngs, duration) {
    var lastIndex = latlngs.length - 1;
    var distances = [];
    var totalDistance = 0;
    var distance = 0;

    // compute array of distances between points
    for (var i = 0; i < lastIndex; i++) {
      distance = latlngs[i + 1].distanceTo(latlngs[i]);
      distances.push(distance);
      totalDistance += distance;
    }

    var ratioDuration = duration / totalDistance;

    var durations = [];
    for (i = 0; i < distances.length; i++) {
      durations.push(distances[i] * ratioDuration);
    }

    return durations;
  },

  _startAnimation: function () {
    this._state = L.Marker.MovingPlaneMarker.runState;
    this._animId = L.Util.requestAnimFrame(function (timestamp) {
      this._startTime = Date.now();
      this._startTimeStamp = timestamp;
      this._animate(timestamp);
    }, this, true);
    this._animRequested = true;
  },

  _resumeAnimation: function () {
    if (!this._animRequested) {
      this._animRequested = true;
      this._animId = L.Util.requestAnimFrame(function (timestamp) {
        this._animate(timestamp);
      }, this, true);
    }
  },

  _stopAnimation: function () {
    if (this._animRequested) {
      L.Util.cancelAnimFrame(this._animId);
      this._animRequested = false;
    }
  },

  _updatePosition: function () {
    var elapsedTime = Date.now() - this._startTime;
    this._animate(this._startTimeStamp + elapsedTime, true);
  },

  _loadLine: function (index) {
    this._currentIndex = index;
    this._currentDuration = this._durations[index];
    this._currentLine = this._latlngs.slice(index, index + 2);
  },

  /**
   * Load the line where the marker is
   * @param  {Number} timestamp
   * @return {Number} elapsed time on the current line or null if
   * we reached the end or marker is at a station
   */
  _updateLine: function (timestamp) {
    // time elapsed since the last latlng
    var elapsedTime = timestamp - this._startTimeStamp;

    // not enough time to update the line
    if (elapsedTime <= this._currentDuration) {
      return elapsedTime;
    }

    var lineIndex = this._currentIndex;
    var lineDuration = this._currentDuration;
    var stationDuration;

    while (elapsedTime > lineDuration) {
      // substract time of the current line
      elapsedTime -= lineDuration;
      stationDuration = this._stations[lineIndex + 1];

      // test if there is a station at the end of the line
      if (stationDuration !== undefined) {
        if (elapsedTime < stationDuration) {
          this.setLatLng(this._latlngs[lineIndex + 1]);
          return null;
        }
        elapsedTime -= stationDuration;
      }

      lineIndex++;

      // test if we have reached the end of the polyline
      if (lineIndex >= this._latlngs.length - 1) {

        if (this.options.loop) {
          lineIndex = 0;
          this.fire('loop', { elapsedTime: elapsedTime });
        } else {
          // place the marker at the end, else it would be at
          // the last position
          this.setLatLng(this._latlngs[this._latlngs.length - 1]);
          this.stop(elapsedTime);
          return null;
        }
      }
      lineDuration = this._durations[lineIndex];
    }

    this._loadLine(lineIndex);
    this._startTimeStamp = timestamp - elapsedTime;
    this._startTime = Date.now() - elapsedTime;
    return elapsedTime;
  },

  _animate: function (timestamp, noRequestAnim) {
    this._animRequested = false;
    // find the next line and compute the new elapsedTime
    var elapsedTime = this._updateLine(timestamp);
    if (this.isEnded()) {
      // no need to animate
      return;
    }

    if (elapsedTime != null) {
      // compute the position
      var p = L.interpolatePosition(this._currentLine[0],
        this._currentLine[1],
        this._currentDuration,
        elapsedTime);
      this.setLatLng(p);

      if (this.options.tempLine) {
        this._tempLine.setLatLngs([this._currentLine[0], p]);
      }
    }

    if (!noRequestAnim) {
      this._animId = L.Util.requestAnimFrame(this._animate, this, false);
      this._animRequested = true;
    }
  }
});

L.Marker.movingPlaneMarker = function (latlngs, duration, options) {
  return new L.Marker.MovingPlaneMarker(latlngs, duration, options);
};