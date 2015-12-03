// ~~~~~~~~ Functions for Retrievings Data ~~~~~~~~~~~~~~~~~~~~~

//Add a data set to be displayed on the map!
//options = { tag: string, filter: boolean function(obj),moreInfo: string(HTML) function(feature)};
//customArgs = SEE http://leafletjs.com/reference.html#geojson-options
function getGroup(URL,options,customArgs){
    //$.getJSON(URL,partial(getGroupCallback,tag,customArgs,URL));
    $.getJSON(URL,function(msg){getGroupCallback(options,customArgs,URL,msg);});
}

//Add an Island Base Layer to the map!
//options = { searchInclude: string[], searchExclude: string[]};
function getIslands(path,options){
    $.getJSON(path,function(msg){
        var layer = msg;

        for(var i=0,iLen=layer.features.length;i<iLen;i++){
            var feature = layer.features[i];
            feature.visible = true;
            islandsCollection[feature.properties.Numero] = feature;
        }
        islands_layer.addData(layer);
        if(!filter.object){
            filter.setObject(layer.features[0].properties);
            filter.minimize(filter.minimized);
        }
        if(!colorControl.object){
            colorControl.setObject(layer.features[0].properties);
            colorControl.minimize(filter.minimized);
        }
        
        if(options){
            if(options.searchInclude){
                searchControl.includeKeys(options.searchInclude);
            }
            if(options.searchExclude){
                searchControl.searchExclude(options.searchExclude);
            }
        }
        
        searchControl.refresh();
        recolorIsles();
    });
}

//***********************************************************************************************
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getIslands('IslesLagoon_single.geojson',{searchInclude: ['Nome_Isola','Numero']});
getIslands('IslesLagoon_multi.geojson'),{searchInclude: ['Nome_Isola','Numero']};

// ~~~~~~~~~~ layers with maps/working points ~~~~~~~~~~~~~
//var getReq = $.getJSON("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",getGroupCallback);
getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",{tag: "Bridges",moreInfo:function(properties){
    return properties.data.Nome_Ponte+'</br>'
},summary: {
    html: function(obj){
        return '<b>Summary:</b> </br>' + 
        'Count: ' + obj + '</br>';
    },
    initial: 0,
    summarize: function(obj){
        obj++;
        return obj;
    }
}},{style: standOut, onEachFeature:setupHighlight});

getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canals.json",{tag: "Canals",moreInfo:function(properties){
    return properties.data.Nome_Rio+'</br>'
},summary: {
    html: function(obj){
        return '<b>Summary:</b> </br>' + 
        'Count: ' + obj + '</br>';
    },
    initial: 0,
    summarize: function(obj){
        obj++;
        return obj;
    }
}},{onEachFeature:function(feature,layer){
    setupHighlight(feature,layer);
    layer.bindPopup(
        '<b><center>' + feature.properties.data.Nome_Rio + '</center></b>'
    );
}});

//getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canal%20Segments.json","Canal Segments",{style: style2});
getGroup("https://cityknowledge.firebaseio.com/groups/belltowers%20MAPS%2015.json",{tag:"Bell Towers",moreInfo:function(properties){
    return properties.data.NAME+'</br>'
},summary: {
    html: function(obj){
        return '<b>Summary:</b> </br>' + 
        'Count: ' + obj + '</br>';
    },
    initial: 0,
    summarize: function(obj){
        obj++;
        return obj;
    }
}},{onEachFeature:setupHighlight,pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: churchIcon}).bindPopup(
    "<b>" + feature.properties.data.NAME + "</b></br>" +
    "Code: " + feature.properties.data.CODE + "</br>" +
    "Date Recorded: " + feature.properties.birth_certificate.dor + "</br>"
    );
}});

getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOTELS08_PT_15.json",{tag: "HotelsMap"},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: hotelIcon}).bindPopup("I am a hotel");
}});

getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOLES_PT_15.json",{tag: "Sewer Outlets"},{onEachFeature:setupHighlight,pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: sewerIcon}).bindPopup("outlet");
}});

// ~~~~~~~~ layers with just lat/long ~~~~~~~~~~~~~~~~~~~~~
//getGroup("https://cityknowledge.firebaseio.com/groups/Hostels,%20Hotels.json","Hotels",{pointToLayer: function(feature,latlng){
//    return new L.marker(latlng, {icon: churchIcon});
//}});
//getGroup("https://cityknowledge.firebaseio.com/groups/Bed%20&%20Bfast,%20Apartments.json","Bed and Breakfasts");

// ~~~~~~~~ historical data (still just lat/long) ~~~~~~~~~
//getGroup("https://cityknowledge.firebaseio.com/groups/Demolished%20Churches.json");
getGroup("https://cityknowledge.firebaseio.com/groups/Convents%20Data.json",{moreInfo:function(properties){
    return 'About: ' + properties.data["Historic Background"] + '</br>' +
        'Current Use: ' + properties.data["Curret Use"] + '</br>' +
        'Founded in' + properties.data["Year Founded"] + '</br>'
},summary: {
    html: function(obj){
        return '<b>Summary:</b> </br>' + 
        'Count: ' + obj + '</br>';
    },
    initial: 0,
    summarize: function(obj){
        obj++;
        return obj;
    }
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: conventIcon}).bindPopup("I am a convent");
}});

getGroup("https://cityknowledge.firebaseio.com/groups/Minor_Lagoon_Islands_2015.json",{tag:"Wiki Data",moreInfo: function(properties){
    return '<b>About: </b>'+ properties.data.Blurb+'</br>' +
        '<a href="" id="bib" target="_blank" class="button">View Bibliography</a></br>' +
        '<table border="1" style="width:100%">'+
        '<tr>'+
            '<td>'+ 'Handicap Accessible' + '</td>' +
            '<td>'+ properties.data.Handicap_Accessibility + '</td>' +
        '</tr>' + '<tr>'+
            '<td>'+ 'Inhabited?' + '</td>' +
            '<td>'+ properties.data.Inhabited + '</td>' +
        '</tr>' + '<tr>'+
            '<td>'+ 'Type' + '</td>' +
            '<td>'+ properties.data.Type + '</td>' +
        '</tr>' + '<tr>'+
            '<td>'+ 'Usage' + '</td>' +
            '<td>'+ properties.data.Usage + '</td>' +
        '</tr>' +
        '</table>'
},summary: {
    html: function(obj){
        return '<b>Summary:</b> </br>' + 
        'Count: ' + obj + '</br>';
    },
    initial: 0,
    summarize: function(obj){
        obj++;
        return obj;
    }
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: vpcicon});
}});

// the above layer probably matches up with the images in
//https://cityknowledge.firebaseio.com/groups/convent%20floor%20plans.json"

getGroup("https://ckdata.firebaseio.com/groups/MERGE%20Stores%202012.json",{filter:function(obj){
    if(obj["2015"]) return true;
    
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: storeIcon}).bindPopup(
    //"<img style=\"width:100%\" src=\"" + feature.properties['2015'].picture_url + "\"/><br/>" + 
        "<b>" + feature.properties['2015'].name + "</b>" +
        "<br/> Address: " + feature.properties['2015'].address_number + 
        " " + feature.properties['2015'].address_street +  
        "<br/> Nace+ Code: " + feature.properties['2015'].nace_plus_code +
        "<br/> Good Sold: " + feature.properties['2015'].nace_plus_descr +
        "<br/> Store Type: " + feature.properties['2015'].shop_type
    );
}});