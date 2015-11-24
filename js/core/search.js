var searchLayers = L.layerGroup([islands_layer]);
//var searchLayers = islands_layer;

var searchControl= L.control.search({
    zoom: 15,
    layer: searchLayers,
    propertyName: 'Nome_Isola',
    circleLocation: false,
    filterData: function(text, records) {
        var jsons = searchControl.fuse.search(text),
            ret = {}, key;

        for(var i in jsons) {
            key = jsons[i].Nome_Isola;
            ret[ key ]= records[key];
        }

        //console.log(jsons,ret);
        return ret;
    }
})
.on('search_locationfound', function(e) {
    map.fitBounds(e.layer.getBounds());
});
    
searchControl.fuse = {};
searchControl.keys = [];

searchControl.refresh = function(){

    var islands_features = [];

    islands_layer.eachLayer(function(layer){
        islands_features.push(layer.feature.properties);
    });

    searchControl.keys = getKeys(islands_features[0]);
    searchControl.fuse = new Fuse(islands_features, {
        keys: searchControl.keys
    });
}

//***************************************************************************************

function getKeys(object){
    var results = [];
    //console.log(object);
    for(key in object){
        if(object[key]!=undefined){
            if(typeof object[key] == 'object'){
                results.concat(getKeys(object[key]).map(function(value){
                    return key +"."+value;
                }).filter(function(value){
                    return results.indexOf(value) == -1;
                }));
            }
            else if(results.indexOf(key)==-1){
                results.push(key);
            }
        }
    }
    return results;
}

searchControl.refresh();

searchControl.addTo(map);
searchControl._container.style.clear = 'none';