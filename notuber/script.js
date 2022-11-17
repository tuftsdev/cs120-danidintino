
var script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyAzn1PevLXcR81ojiu1QLL1JEflG4z3bxc&callback=initMap&libraries=places";
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

function getNearbyBusinesses(myposition, type) {
  var request = {
    location: { lat:  myposition.coords.latitude, lng: myposition.coords.longitude },
    radius: 1609.34, // 1 mi in meters
    types: [type]
  }

  var service = new google.maps.places.PlacesService(map)
  
  service.nearbySearch(request, callback)

  function callback(results, status) {
    if(status == google.maps.places.PlacesServiceStatus.OK) {
      results.forEach((result) => {
        var placeLoc = result.geometry.location;

        var marker = new google.maps.Marker({
          map: map,
          position: placeLoc
        })

        const infoWindowContent = 
        "<p>Name: " + result.name + "</p>" +
        "<p>Location: " + result.vicinity + "</p>" 
      
        const infowindow = new google.maps.InfoWindow({
          content: infoWindowContent,
          ariaLabel: "Business",
        });
      
        marker.addListener("click", () => {
          infowindow.open({
            anchor: marker,
            map,
          });
        });
      })
    }
  }
}


function createCurrentPositionMaker(myposition) {
  const myMarker = new google.maps.Marker({
    position: { lat:  myposition.coords.latitude, lng: myposition.coords.longitude },
    map: map,
  });

  getNearbyBusinesses(myposition, 'restaurant')
  getNearbyBusinesses(myposition, 'bar')
  getNearbyBusinesses(myposition, 'cafe')
  
  
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

function createInfoWindowForNearestVehicle(myPosition, myMarker, minCar, minDistance) {
  const infoWindowContent = 
  "<p>The closest vehicle to your position is ID " 
  + minCar._id + " at (" + minCar.lat + ", " + minCar.lng 
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
      path: [{lat: myPosition.coords.latitude, lng: myPosition.coords.longitude }, minCar], 
      map: map
    }
  );
}

function createVehicleMarkerInfoWindow(carMarker, car, myPosition) {
  const distance = haversine_distance_in_miles(myPosition.coords.latitude, myPosition.coords.longitude, car.lat, car.lng)
  const infoWindowContent = 
  "<p>The distance from this vehicle " 
  + car._id + " at (" + car.lat + ", " + car.lng 
  + ") to your location is " + distance.toFixed(2) + "mi.</p>"

  const infowindow = new google.maps.InfoWindow({
    content: infoWindowContent,
    ariaLabel: "Vehicle " + car._id,
  });

  carMarker.addListener("click", () => {
    infowindow.open({
      anchor: carMarker,
      map,
    });
  });
}

function getVehicleLocations(myPosition, myMarker) {
  request = new XMLHttpRequest() 
  request.open("POST", "https://still-oasis-01063.herokuapp.com/rides", true) 
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  let closeCars = []
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      let minCar = null
      let minDistance = Number.MAX_SAFE_INTEGER
      closeCars = JSON.parse(request.responseText)
      
      closeCars.forEach((car) => {
        const carMarker = new google.maps.Marker({
          position: { lat: car.lat, lng: car.lng },
          icon: "car.png",
          map: map,
          markerID: car._id,
        })

        createVehicleMarkerInfoWindow(carMarker, car, myPosition)
        
        const distance = haversine_distance_in_miles(myPosition.coords.latitude, myPosition.coords.longitude, car.lat, car.lng)
        if (distance <= minDistance) {
          minDistance = distance
          minCar = car
        }
      })
      if (minCar != null) {
        createInfoWindowForNearestVehicle(myPosition, myMarker, minCar, minDistance)
      }
    }
};
  var params = "username=whocares&lat=" + myPosition.coords.latitude + "&lng=" + myPosition.coords.longitude
  request.send(params)
}
document.head.appendChild(script)
window.initMap = initMap
