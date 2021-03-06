var GetRequests = [];
var Map;
var Geocoder;
var GoogleMapsAPIKey = 'AIzaSyBCdNVOM-Zie0oZjy4Dg-4ImIXFAHvfNx0';
// var HomeLatLng = { x: 12.9833 , y: 77.5833 }
var HomeLatLng = { x: 42.3601 , y: -71.0589 };
var LatLngBounds = null;

var FlickrAPIKey = "aa96bab0f0a1653c3e89a569a1a48970";
var PhotoMarkers = [];

function triggerSubmit(event) {
	if (event.keyCode == 13)
   		document.getElementById('submit_address').click()
}

function createPhotosAreaMarker(options) {
	var photoAreaMarker = new google.maps.Circle(options);
	photoAreaMarker.photoCount = 1;
	return photoAreaMarker;
}

function clearPhotoAreaMarkers() {
	while(PhotoMarkers.length) {
		var photoMarker = PhotoMarkers.pop();
		photoMarker.setMap(null);
		photoMarker = null;
	}
}

function markPhotos(photos) {
	for(var j=0; j<photos.length; j++) {
		var photoLat = photos[j].latitude;
		var photoLng = photos[j].longitude;
		var photoLocation = new google.maps.LatLng(photoLat, photoLng);
		var photoMarkerOptions = {
			center: photoLocation,
			radius: 200,
			map: Map,
			fillColor: '#F39800',
			strokeColor: '#F39800',
			fillOpacity: 0.9
		}

		var found = false;
		for(var k=0; k<PhotoMarkers.length; k++) {
			var marker = PhotoMarkers[k];
			var geometry = google.maps.geometry.spherical;
			var distance = geometry.computeDistanceBetween(
				marker.getCenter(), photoLocation);

			if (distance <= marker.getRadius()) {
				marker.photoCount += 1;
				var color = '#F39800';

				if(marker.photoCount < 200) {
					color = '#F39800';
				} else if(marker.photoCount < 500) {
					color = '#22AC38';
				} else if(marker.photoCount < 1000) {
					color = '#00A0E9';
				} else if(marker.photoCount < 2000) {
					color = '#006887';
				} else if(marker.photoCount < 5000) {
					color = '#BE0081';
				} else if(marker.photoCount < 10000) {
					color = '#601986';
				} else {
					color = '#E60012';
				}				

				photoMarkerOptions.fillColor = color;
				photoMarkerOptions.strokeColor = color;
				marker.setOptions(photoMarkerOptions);
				found = true;
				break;
			}
		}
		
		if(found)
			continue;

		var photoMarker = createPhotosAreaMarker(photoMarkerOptions);
		PhotoMarkers.push(photoMarker);
		LatLngBounds.extend(photoLocation);
	}
}

function gatherData(address) {
	var geocoderRequest = {'address': address};
  	Geocoder.geocode(geocoderRequest, function(geocoderResults, geocoderStatus) {
	    if (geocoderStatus === google.maps.GeocoderStatus.OK) {
	    	var firstResult = geocoderResults[0];
			Map.setCenter(firstResult.geometry.location);
			var latitude = firstResult.geometry.location.lat();
			var longitude = firstResult.geometry.location.lng();
			LatLngBounds = null;
			LatLngBounds = new google.maps.LatLngBounds();
			


			var flickrUrl = "https://api.flickr.com/services/rest/?\
							&method=flickr.photos.search\
							&api_key=" + FlickrAPIKey
							+ "&has_geo=1&extras=geo&lat=" + latitude 
							+ "&lon=" + longitude + "&accuracy=11\
							&radius=5&format=json\
							&per_page=500&nojsoncallback=?" 
			GetRequests.push($.get(flickrUrl, function(response, status){
				var pages = response.photos.pages;
				markPhotos(response.photos.photo);
				
	    		for(var i=2; i<=response.photos.pages; i++) {
	    			flickrUrl = "https://api.flickr.com/services/rest/?\
							&method=flickr.photos.search\
							&api_key=" + FlickrAPIKey
							+ "&has_geo=1&extras=geo&lat=" + latitude 
							+ "&lon=" + longitude + "&accuracy=11\
							&radius=5&format=json\
							&per_page=500&page=" + i + "&nojsoncallback=?"
	    			GetRequests.push($.get(flickrUrl, function(response, status){
	    				pages -= 1;
	    				// console.log(pages);
	    				if(pages === 1) {
	    					$("#wait-img").hide();
	    					//Map.fitBounds(LatLngBounds);
	    				}
	    				
						markPhotos(response.photos.photo);
					}));
	    		}
	    	}));
	    }
	    else {
	    	clearPhotoAreaMarkers();
	    }
  	});
}

function initialize() {
	$("#address_input").val('Andora');
	gatherData($("#address_input").val());
	$("#wait-img").show();

	var searchButton = document.getElementById('submit_address');
	searchButton.onclick = function() {
		$("#wait-img").show();
		while(GetRequests.length) {
			var getRequest = GetRequests.pop();
			getRequest.abort();
		}

		clearPhotoAreaMarkers();
		var addressInput = document.getElementById('address_input');
		gatherData(addressInput.value);
	}
}

function initMap() {
    var centerLatLng = new google.maps.LatLng(HomeLatLng.x, HomeLatLng.y);
	Map = new google.maps.Map(document.getElementById('map'), {
		minZoom: 3,
		zoom: 13,
		center: centerLatLng
	});

	Geocoder = new google.maps.Geocoder();

	initialize();
}

function loadScript() {
	$("#wait-img").hide();
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://maps.googleapis.com/maps/api/js?key=" 
    				+ GoogleMapsAPIKey + "&sensor=false\
    				&libraries=geometry&callback=initMap";
    document.body.appendChild(script);
}

window.onload = loadScript;