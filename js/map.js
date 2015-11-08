var featureCollections={};

var overlayFlag = 0;

var map = L.map('map').setView([45.4375, 12.3358], 13);

//**********************************************************************************************
var defaultLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.run-bike-hike'
}).addTo(map);

var satelliteLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets-satellite'
});

var basicLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.outdoors'
});
//**********************************************************************************************

//		L.marker([45.4375, 12.33]).addTo(map)
//			.bindPopup("<b>Welcome to Venice!</b><br />I am a popup.").openPopup();
//
var popup = L.popup();

function onMapClick(e) {
    popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on('click', onMapClick);

//**********************************************************************************************
// Styling for making choropleth-like colorations of polygons
// Create grades using http://colorbrewer2.org/
function getColor(d) {
    return d > 3000 ? '#4d004b' :
           d > 2000 ? '#810f7c' :
           d > 1000 ? '#88419d' :
           d > 500  ? '#8c6bb1' :
           d > 200  ? '#8c96c6' :
           d > 100  ? '#9ebcda' :
           d > 50   ? '#bfd3e6' :
           d > 20   ? '#e0ecf4' :
           d > 10   ? '#f7fcfd' :
                      '#f7fcfd';
    
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.sum_pop_11),
        weight: 0,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// create a legend for the colors
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
 
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000, 2000, 3000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};
legend.addTo(map);
//**********************************************************************************************
// this section contains an alternate styling for polygons
function style2(feature) {
    return {
        fillColor: '#FEB24C',
        weight: 0,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 1.0
    };
}

// This section is used to track where the user's cursor is located and perform events based on 
// its location
function highlightFeature(e) {
    var layer = e.target;
    
    layer.setStyle({
        fillColor: '#7fcdbb',
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.3
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    // instead of updating info on one layer, an if statement can be used here to show info
    // on multiple layers. for more info, see the following:
    //http://gis.stackexchange.com/questions/68941/how-to-add-remove-legend-with-leaflet-layers-control
    populationInfo.update(layer.feature.properties);
    
}

function resetHighlight(e) {
        geojson.resetStyle(e.target);
        populationInfo.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    var currentLayer = e.target;
    overlay(currentLayer);
}

function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            dblclick: zoomToFeature
        });
}

//**********************************************************************************************
// add base geojson to map with islands data
var geojson = L.geoJson(islands, {
    style: style,
    onEachFeature: onEachFeature,
    
}).addTo(map);

//**********************************************************************************************
// set up an information box for population data
var populationInfo = L.control();

populationInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
populationInfo.update = function (props) {
    this._div.innerHTML = '<h4>Demographic Data</h4>' +  (props ?
        '<b>'+ props.Nome_Isola + '</b><br />' 
        + 'Island Number: ' + props.Insula_Num + '</b><br />'
        + 'Total Population: ' + props.sum_pop_11 + '</b><br />' 
        : 'Hover over an island <br /> Double click for more info' );
};

populationInfo.addTo(map);

//**********************************************************************************************
// add location functionality
// set this to true to auto-zoom on your location
map.locate({setView: false, maxZoom: 18});

// create a global var for the location layer - must be global so it can be toggled
var locationLayer = L.layerGroup().addTo(map); 

// function to excecute when the user's location is found
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    
    // Create a marker with a popup at the location 
    var locationMarker =  L.marker(e.latlng);
        //.bindPopup("You are within " + radius + " meters from this point").openPopup();

    // Create an additional circle showing the approximate radius
    var locationRadius = L.circle(e.latlng, radius, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5 
    });
    
    // add the marker and popup to the location layer
    locationLayer.addLayer(locationMarker);
    locationLayer.addLayer(locationRadius);
    locationMarker.bindPopup("<center><b>You are here!</b><br>Within " + radius + " meters </center>");//.openPopup();
    // make sure it stays on top of everything else
    //locationLayer.bringToFront();
}
map.on('locationfound', onLocationFound);

// function to excecute when the users location isn't found
function onLocationError(e) {
    //alert(e.message);
}
map.on('locationerror', onLocationError);

//**********************************************************************************************

// Displays question mark and vpc logo
var VPCinfo = L.control({position: "bottomleft"});
    
VPCinfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'VPCinfo'); // create a div with a class "info"
    this._div.innerHTML = '<div class="info" style="width:auto;">'+
        '<span ng-click="showAbout()"><img src="image/about.png"  style="cursor:pointer;padding-right:7px;"></span>'+
        '<a href="http://veniceprojectcenter.org" target="_blank"><img src="image/vpc25logo.png"></a>'+
        '</div>';
    return this._div;
};

VPCinfo.addTo(map);

//**********************************************************************************************

// define the base and overlay maps so that they can be toggled
var baseMaps = {
    "Default": defaultLayer,
    "Satellite": satelliteLayer,
    "Basic": basicLayer
};

var mapOverlays = {
    "Current Location": locationLayer
};

// add in layer control so that you can toggle the layers
var layerController = L.control.layers(baseMaps,mapOverlays).addTo(map);

//*******************************************************************************************

function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}

function getGroup(URL,tag){
    if(tag){
        initializeCollection(tag);
    }
    
    $.getJSON(URL,partial(getGroupCallback,tag));
    
}

// ~~~~~~~~~~ layers with maps/working points ~~~~~~~~~~~~~
//var getReq = $.getJSON("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",getGroupCallback);
getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json","Bridges");
//getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canals.json","Canals");
//getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canal%20Segments.json","Canal Segments");
//getGroup("https://cityknowledge.firebaseio.com/groups/belltowers%20MAPS%2015.json","Bell Towers");
//getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOTELS08_PT_15.json","Hotels");
//getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOLES_PT_15.json","Sewer Outlets");

// ~~~~~~~~ layers with just lat/long ~~~~~~~~~~~~~~~~~~~~~
// getGroup("https://cityknowledge.firebaseio.com/groups/Hostels,%20Hotels.json","Hotels");
//getGroup("https://cityknowledge.firebaseio.com/groups/Bed%20&%20Bfast,%20Apartments.json","Bed and Breakfasts");
//getGroup("https://cityknowledge.firebaseio.com/groups/store%20locations.json","Stores"); //2014 data

// ~~~~~~~~ historical data (still just lat/long) ~~~~~~~~~
// getGroup("https://cityknowledge.firebaseio.com/groups/Demolished%20Churches.json","Demolished Churches");
// getGroup("https://cityknowledge.firebaseio.com/groups/Island%20Church%20Data.json","Island Churches");

// getGroup("https://cityknowledge.firebaseio.com/groups/Convents%20Data.json","Convents");
// the above layer probably matches up with the images in
// https://cityknowledge.firebaseio.com/groups/convent%20floor%20plans.json

// ~~~~~~~~ useful datasets not tagged by location ~~~~~~~~
// https://cityknowledge.firebaseio.com/groups/SUBGROUP%20Boat%20Traffic%20Counts%20by%20Station.json
// https://cityknowledge.firebaseio.com/groups/SUBGROUP%20Latest%20Traffic%20Counts%20By%20Station.json


function getGroupCallback(tag,msg) {
    jsonList = msg;
    console.log(jsonList.members);
    
    if(tag){
        initializeCollection(tag);
    }
    
    for(var obj in jsonList.members){
        var URL = "https://cityknowledge.firebaseio.com/data/" + obj + ".json";
        console.log(URL);
        $.getJSON(URL,partial(getEntryCallback,tag));
    }
    
}

// callback function for pulling JSON file, run code related to it in HERE ONLY
function getEntryCallback(tag,msg) {
    var jsonObj = msg;
    console.log(jsonObj);
    tag = tag || jsonObj.birth_certificate.type || "Feature"+(featureCollections.length+1);
    
    initializeCollection(tag);
    featureCollections[tag].addData(CKtoGeoJSON(jsonObj),{style: style2});
    
}

function initializeCollection(tag){
    if(!featureCollections.hasOwnProperty(tag)){
        featureCollections[tag]=L.geoJson().addTo(map);
        layerController.addOverlay(featureCollections[tag],tag);
        console.log(mapOverlays);
    }
}

function CKtoGeoJSON(CKjson){
    // add functionality for reading in json files that have lat/long instead of shapes
    var geoJson={
        type: "Feature",
        geometry: {},
        properties:{}
    };
    
    if(isValidGeoJson(CKjson)==true){
        geoJson = CKjson;
    }
    else{
        geoJson.geometry = CKjson.shape||CKjson.geometry;
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
    console.log(geoJson);
    //console.log(BridgeLayer);
    return geoJson;
}

function isValidGeoJson(jsonObj){
    if(jsonObj.type){
        if(jsonObj.type=="FeatureCollection"){
            if(jsonObj.hasOwnProperty("features")){
                for(var i=0;i<jsonObj.features.length;i++){
                    if(!isValidGeoJson(jsonObj.features[i])){
                        return false;
                    }
                }
                return true;
            }
        }
        else if(jsonObj.type == "Feature"){
            if(jsonObj.hasOwnProperty("geometry")&&jsonObj.hasOwnProperty("properties")){
                if(!isValidGeoJsonGeometry(jsonObj.geometry)){
                    return false;
                }
                return true;
            }
        }
        else{
            return isValidGeoJsonGeometry(jsonObj)
        }
    }
    return false;
}
    
function isValidGeoJsonGeometry(jsonObj){
    if(jsonObj.type){
        
        if(jsonObj.type == "GeometryCollection"){
            if(jsonObj.hasOwnProperty("geometries")){
                for(var i=0;i<jsonObj.geometries.length;i++){
                    if(!isValidGeoJsonGeometry(jsonObj.geometries[i])){
                        return false;
                    }
                }
                return true;
            }
        }
        else if(jsonObj.type == "Point"){
            if(jsonObj.hasOwnProperty("coordinates")){
                return isValidGeoJsonPosition(jsonObj.coordinates);
            }
        }
        else if(jsonObj.type == "MultiPoint"){
            if(jsonObj.hasOwnProperty("coordinates")){
                return isValidGeoJsonCoordinates(jsonObj.coordinates);
            }
        }
        else if(jsonObj.type == "LineString"){
            if(jsonObj.hasOwnProperty("coordinates")){
                if(!isValidGeoJsonCoordinates(jsonObj.coordinates)){
                    return false;
                }
                return jsonObj.coordinates.length>1;
            }
        }
        else if(jsonObj.type == "MultiLineString"){
            if(jsonObj.hasOwnProperty("coordinates")){
                for(var i=0;i<jsonObj.coordinates.length;i++){
                    if(!isValidGeoJsonCoordinates(jsonObj.coordinates)){
                        return false;
                    }
                    if(jsonObj.coordinates.length<2){
                        return false;
                    }
                }
                return true;
            }
        }
        else if(jsonObj.type == "Polygon"){
            if(jsonObj.hasOwnProperty("coordinates")){
                if(!isValidGeoJsonLinearRing(jsonObj.coordinates)){
                    return false;
                }
                return true;
            }
        }
        else if(jsonObj.type == "MultiPolygon"){
            if(jsonObj.hasOwnProperty("coordinates")){
                for(var i=0;i<jsonObj.coordinates.length;i++){
                    if(!isValidGeoJsonLinearRing(jsonObj.coordinates)){
                        return false;
                    }
                }
                return true;
            }
        }
    }
    return false;
}

function isValidGeoJsonLinearRing(jsonObj){
    if(!isValidGeoJsonCoordinates(jsonObj)){
        return false;
    }
    if(jsonObj.length<4){
        return false;
    }
    if(jsonObj[0]==jsonObj[jsonObj.length-1]){
        return true;
    }
    return false;
}

function isValidGeoJsonCoordinates(jsonObj){
    for(var i=0;i<jsonObj.length;i++){
        if(!isValidGeoJsonPosition(jsonObj[i])){
            return false;
        }
    }
    return true;
}

function isValidGeoJsonPosition(jsonObj){
    return jsonObj.length<1;
}


//**********************************************************************************************



