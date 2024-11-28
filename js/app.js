let map;
let markers = [];

function initMap() {
    // Initialize the map centered at a default location
    const defaultLocation = { lat: 39.8283, lng: -98.5795 }; // Center of the US
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 5,
    });

    // Try to get the user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                map.setZoom(12);

                // Search for Subaru dealers near the user's location
                findDealers(userLocation);
            },
            () => {
                alert("Geolocation failed. Default location will be used.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function findDealers(location) {
    const service = new google.maps.places.PlacesService(map);
    console.log(location);
    
    const request = {
        location: location,
        radius: 16093,  //10 miles, converted to meters
        keyword: "car dealer",
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            const dealersList = document.getElementById("dealers-list");
            dealersList.innerHTML = "";

            results.forEach((place, index) => {
                if (place.geometry && place.geometry.location) {
                    const marker = createMarker(place);
                    markers.push(marker);
                    addDealerToList(place, index, marker);
                }
            });
        } else {
            alert("No car dealers found nearby.");
        }
    });
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
    });

    const infowindow = new google.maps.InfoWindow({
        content: `<div><strong>${place.name}</strong><br>${place.vicinity}</div>`,
    });

    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });

    return marker;
}

function addDealerToList(place, index, marker) {
    const dealersList = document.getElementById("dealers-list");
    const listItem = document.createElement("li");
    listItem.textContent = place.name;
    listItem.addEventListener("click", () => {
        map.setCenter(marker.getPosition());
        map.setZoom(15);
        google.maps.event.trigger(marker, "click");
    });
    dealersList.appendChild(listItem);
}

function clearMarkers() {
    markers.forEach((marker) => marker.setMap(null));
    markers = [];
}
