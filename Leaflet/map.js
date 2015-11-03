var map = L.map('map').setView([45.4375, 12.3358], 13);

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
			maxZoom: 18,
	 	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(map);

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

//// http://palewi.re/posts/2012/03/26/leaflet-recipe-hover-events-features-and-polygons/
//        // Create an empty layer where we will load the polygons
//        var featureLayer = new L.GeoJSON();
//        // Set a default style for out the polygons will appear
//        var defaultStyle = {
//            color: "#2262CC",
//            weight: 2,
//            opacity: 0.6,
//            fillOpacity: 0.1,
//            fillColor: "#2262CC"
//        };


//        // Define what happens to each polygon just before it is loaded on to
//        // the map. This is Leaflet's special way of goofing around with your
//        // data, setting styles and regulating user interactions.
//        var onEachFeature = function(feature, layer) {
//            // All we're doing for now is loading the default style. 
//            // But stay tuned.
//            layer.setStyle(defaultStyle);
//        };

//        // Add the GeoJSON to the layer. `islands` is defined in the external
//        // GeoJSON file that I've loaded in the <head> of this HTML document.
//        var featureLayer = L.geoJson(islands, {
//            // And link up the function to run when loading each feature
//            onEachFeature: onEachFeature
//        });
     // // Finally, add the layer to the map.
        // map.addLayer(featureLayer);

// http://leafletjs.com/examples/choropleth.html
function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.POP_SEZ),
        weight: 0,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.2
    };
}

var geojson;
geojson = L.geoJson(islands, {style: style}).addTo(map);
       
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(islands, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Demographic Data</h4>' +  (props ?
        '<b>' + props.Nome_Isola + '</b><br />' 
        + 'Population: ' + props.POP_SEZ + ' people' + '</b><br />' 
        + 'Island Number: ' + props.Insula_Num + '</b><br />' 
        + '2011 section: ' + props.SEZ2011 + '</b><br />' 
        : 'Hover over an island');
};

info.addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
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

