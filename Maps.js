var Map;

function initMap() {
Map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: -34.397, lng: 150.644},
  zoom: 8
});
}

function loadScript() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyBCdNVOM-Zie0oZjy4Dg-4ImIXFAHvfNx0&sensor=false&callback=initMap";
    document.body.appendChild(script);
}

window.onload = loadScript;