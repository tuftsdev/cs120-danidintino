var script=document.createElement("script");script.src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAzn1PevLXcR81ojiu1QLL1JEflG4z3bxc&callback=initMap",script.async=!0;let map,carPositions=[{title:"mXfkjrFw",lat:42.3453,lng:-71.0464},{title:"nZXB8ZHz",lat:42.3662,lng:-71.0621},{title:"Tkwu74WC",lat:42.3603,lng:-71.0547},{title:"5KWpnAJN",lat:42.3472,lng:-71.0802},{title:"uf5ZrXYw",lat:42.3663,lng:-71.0544},{title:"VMerzMH8",lat:42.3542,lng:-71.0704}];function initMap(){map=new google.maps.Map(document.getElementById("map"),{center:{lat:42.352271,lng:-71.055242},zoom:13}),carPositions.forEach((t=>{new google.maps.Marker({position:{lat:t.lat,lng:t.lng},icon:"car.png",title:t.title,map:map})}))}document.head.appendChild(script),window.initMap=initMap;