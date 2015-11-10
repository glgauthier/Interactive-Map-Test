//Take a JSON object from the CK console and return a valid GeoJSON object with the same information.
function CKtoGeoJSON(CKjson){
    
    //Create an empty GeoJSON object to be filled with data and returned
    var geoJson={
        type: "Feature",
        geometry: {},
        properties:{}
    };
    
    //If the CKobject is already a valid GeoJSON object, simply use it.
    if(isValidGeoJson(CKjson)==true){
        geoJson = CKjson;
    }
    //if the CK object has a shape or geometry field, use this as the geometry of the GeoJSON object
    else if(CKjson.shape || CKjson.geometry){
        geoJson.geometry = CKjson.shape||CKjson.geometry;
        //All fields not in shape/geometry go into the properties of the GeoJSON object
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
    //If there is no shape but there is data, look through data for Lat/Long fields.
    else if(CKjson.data){
        geoJson.geometry["type"]="Point";
        geoJson.geometry["coordinates"] = findLonLat(CKjson.data);
        //Then add all fields to properties
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
    //If there is no shape and no data, look through the object for Lat/Long fields.
    else{
        geoJson.geometry["type"]="Point";
        geoJson.geometry["coordinates"] = findLonLat(CKjson.data);
        //Then add all fields to properties
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
        
    //add list of all islands associated with this oject to the properties
    geoJson.properties.islands = [];
    //search through properties of the newly created GeoJSON object to find Islands.
    geoJson.properties.islands.concat(findIslands(geoJson.properties));
    
    console.log(geoJson);
    return geoJson;
}
    
function findIslands(obj){
    var output = [];
    
    if(!obj){
        return output;
    }
    
    for(property in obj){
        if(Object.prototype.hasOwnProperty.call(obj, property)){
            if(typeof obj[property] === 'object'){
                output = mergeArrays(output,findIslands(obj[property]));
            }
            else if(stringContains((property.toString()).toUpperCase(),"ISLAND")||
                   stringContains((property.toString()).toUpperCase(),"ISOLA")){
                if (obj[property].constructor === Array){
                    for(var i=0;i<obj[property].length;i++){
                        if(isInt(obj[property])&&(output.indexOf(obj[property])<0)){
                            output.push(obj[property]);
                        }
                    }
                }
                else{
                    if(isInt(obj[property]) && (output.indexOf(obj[property])<0)){
                        output.push(obj[property]);
                    }
                }
            }
        }
    }
    return output;
}

function findLonLat(obj){
    var lon = null,lat = null;
    
    if(!obj){
        return output;
    }
    
    for(property in obj){
        if(Object.prototype.hasOwnProperty.call(obj, property)){
            if(typeof obj[property] === 'object'){
                var LonLat = findLonLat(obj[property]);
                if(!lon && LonLat[0]){
                    lon=LonLat[0];
                }
                if(!lat && LonLat[1]){
                    lat=LonLat[1];
                }
            }
            else{
                if(stringContains((property.toString()).toUpperCase(),"LATITUDE")){
                    lat = obj[property];
                }
                else if(stringContains((property.toString()).toUpperCase(),"LONGTITUDE")||stringContains((property.toString()).toUpperCase(),"LONGITUDE")){
                    lon = obj[property];
                }
            }
        }
    }
    return [lon,lat];
}
    
function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

function mergeArrays(a1,a2){
    return a1.concat(a2).filter(function (item) {
                return a1.indexOf(item) < 0;
            });
}

function stringContains(outerString,innerString){
    return outerString.indexOf(innerString) > -1;
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