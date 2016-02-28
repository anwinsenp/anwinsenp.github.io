var Map;
var Geocoder;
var GoogleMapsAPIKey = 'AIzaSyBCdNVOM-Zie0oZjy4Dg-4ImIXFAHvfNx0'
var FlickrAPIKey = "aa96bab0f0a1653c3e89a569a1a48970"
// var HomeLatLng = { x: 12.9833 , y: 77.5833 }
var HomeLatLng = { x: 42.3601 , y: -71.0589 }

function triggerSubmit(event) {
	if (event.keyCode == 13)
   		document.getElementById('submit_address').click()
}

function markPhotos(photos) {
	for(var j=0; j<photos.length; j++) {
		var photoLat = photos[j].latitude;
		var photoLng = photos[j].longitude;
		var circle = new google.maps.Circle({
			center: new google.maps.LatLng(photoLat, photoLng),
			radius: 100,
			map: Map
		});
	}
}

function gatherData(address) {
	var geocoderRequest = {'address': address};
  	Geocoder.geocode(geocoderRequest, function(geocoderResults, geocoderStatus) {
	    if (geocoderStatus === google.maps.GeocoderStatus.OK) {
	    	var firstResult = geocoderResults[0];
			Map.fitBounds(firstResult.geometry.viewport);
			var latitude = firstResult.geometry.location.lat();
			var longitude = firstResult.geometry.location.lng();
			
			var flickrUrl = "https://api.flickr.com/services/rest/?\
							&method=flickr.photos.search\
							&api_key=" + FlickrAPIKey
							+ "&has_geo=1&extras=geo&lat=" + latitude 
							+ "&lon=" + longitude + "&accuracy=11\
							&radius=5&format=json\
							&per_page=500&nojsoncallback=?" 
			console.log('flickrUrl: ', flickrUrl)
			$.get(flickrUrl, function(response, status){
				console.log(response);
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
	    			$.get(flickrUrl, function(response, status){
						pages -= 1;
						console.log(pages);
						// markPhotos(response.photos.photo);
					});
	    		}
	    		// imageData = response.photos.photo;
	    		// console.log(response.data.photos.photo);    		
	    		// clearOverlays();
	    		//myMap.setZoom(12);
	    		// plotImages(imageData);
	    	});
	    }
	    else {
	    	// clearOverlays();
	     //  document.getElementById("result").innerHTML = "No images found!!!";
	    }
  	});
}

function initialize() {
	var searchButton = document.getElementById('submit_address');
	searchButton.onclick = function() {
		var addressInput = document.getElementById('address_input');
		gatherData(addressInput.value);
	}
}

function initMap() {
    var centerLatLng = new google.maps.LatLng(HomeLatLng.x, HomeLatLng.y);
	Map = new google.maps.Map(document.getElementById('map'), {
		minZoom: 3,
		zoom: 3,
		center: centerLatLng
	});

	Geocoder = new google.maps.Geocoder();

	initialize();
}

function loadScript() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://maps.googleapis.com/maps/api/js?key=" 
    				+ GoogleMapsAPIKey + "&sensor=false\
    				&callback=initMap";
    document.body.appendChild(script);
}

window.onload = loadScript;