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
    else if(CKjson.shape || CKjson.geometry){
        geoJson.geometry = CKjson.shape||CKjson.geometry;
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
    else if(CKjson.data){
        var lat, lon;
        for(property in CKjson.data){
            if(Object.prototype.hasOwnProperty.call(CKjson.data, property)){
                if(stringContains((property.toString()).toUpperCase(),"LATITUDE")){
                    lat = CKjson.data[property];
                }
                else if(stringContains((property.toString()).toUpperCase(),"LONGTITUDE")||stringContains((property.toString()).toUpperCase(),"LONGITUDE")){
                    lon = CKjson.data[property];
                }
                geoJson.properties[property] = CKjson.data[property];
            }
            geoJson.geometry["type"]="Point";
            geoJson.geometry["coordinates"] = [lon,lat];
        }
    
    }
    else{
        var lat, lon;
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(stringContains((property.toString()).toUpperCase(),"LATITUDE")){
                    lat = CKjson[property];
                }
                else if(stringContains((property.toString()).toUpperCase(),"LONGITUDE")){
                    lon = CKjson[property];
                }
                geoJson.properties[property] = CKjson[property];
            }
            geoJson.geometry["type"]="Point";
            geoJson.geometry["coordinates"] = [lon,lat];
        }
    }
    
    
    console.log(geoJson);
    return geoJson;
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