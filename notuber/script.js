var script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyAzn1PevLXcR81ojiu1QLL1JEflG4z3bxc&callback=initMap";
script.async = !0;
let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 42.352271, lng: -71.055242 },
    zoom: 10,
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(createCurrentPositionMaker);
  }
}

function createCurrentPositionMaker(myposition) {
  const myMarker = new google.maps.Marker({
    position: { lat:  myposition.coords.latitude, lng: myposition.coords.longitude },
    map: map,
  });
  
  getVehicleLocations(myposition, myMarker)
}



function haversine_distance_in_miles(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }
  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  d /= 1.60934;

  return d;
}

function getVehicleLocations(position, myMarker) {
  request = new XMLHttpRequest() 
  request.open("POST", "https://jordan-marsh.herokuapp.com/rides", true) 
  request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  let closeCars = []
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      let minCar = null
      let minDistance = Number.MAX_SAFE_INTEGER

      closeCars = JSON.parse(request.responseText)
      
      closeCars.forEach((car) => {
        new google.maps.Marker({
          position: { lat: car.lat, lng: car.lng },
          icon: "car.png",
          map: map,
          markerID: car.id,
        })
        
        const distance = haversine_distance_in_miles(position.coords.latitude, position.coords.longitude, car.lat, car.lng)
        if (distance <= minDistance) {
          minDistance = distance
          minCar = car
        }
      })

      const infoWindowContent = 
      "<p>The closest vehicle to your position is ID " 
      + minCar.id + " at (" + minCar.lat + ", " + minCar.lng 
      + ") with a distance of " + minDistance.toFixed(2) + "mi.</p>"
    
      const infowindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        ariaLabel: "Closest vehicle",
      });

      myMarker.addListener("click", () => {
        infowindow.open({
          anchor: myMarker,
          map,
        });
      });

      new google.maps.Polyline(
        {
          path: [{lat: position.coords.latitude, lng: position.coords.longitude }, minCar], 
          map: map
        }
      );
    }
};
  var params = "username=8SeyrexS&lat=" + position.coords.latitude + "&lng=" + position.coords.longitude
  request.send(params)
}
document.head.appendChild(script), (window.initMap = initMap);
