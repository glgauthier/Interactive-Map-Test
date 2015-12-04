// ~~~~~~~~ Functions for Retrievings Data ~~~~~~~~~~~~~~~~~~~~~

//Add a data set to be displayed on the map!
//groupOptions = { tag: string, filter: boolean function(obj),moreInfo: string(HTML) function(feature)};
//customArgs = SEE http://leafletjs.com/reference.html#geojson-options
function getGroup(URL,groupOptions,customArgs){
    //$.getJSON(URL,partial(getGroupCallback,tag,customArgs,URL));
    $.getJSON(URL,function(msg){getGroupCallback(groupOptions,customArgs,URL,msg);});
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
        
        var params = getUrlParameters();
        
        if(!params.layerTag || params.layerTag == 'islands'){
            for(key in params){
                if(params.hasOwnProperty(key)&&key!='layerTag'){
                    var layer = findIslandLayer(key,params[key]);
                    if(layer){
                        map.fitBounds(layer.getBounds());
                        return;
                    }
                }
            }
        }
        
        searchControl.refresh();
        recolorIsles();
    });
}

//***********************************************************************************************
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getIslands('IslesLagoon_single.geojson',{searchInclude: ['Nome_Isola','Numero','Codice']});
getIslands('IslesLagoon_multi.geojson'),{searchInclude: ['Nome_Isola','Numero','Codice']};

// ~~~~~~~~~~ layers with maps/working points ~~~~~~~~~~~~~
//var getReq = $.getJSON("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",getGroupCallback);
getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",{tag: "Bridges",moreInfo:function(targets,tag){
    var output = '';
    var count = 0;
    targets.forEach(function(target){
        output += '<a target="_blank" href=http://www.venipedia.org/wiki/index.php?title='+ encodeURIComponent(target.data.Nome_Ponte.replace(/ /g, "_")) + '>' + target.data.Nome_Ponte+'</a></br>';
        count++;
    });
    output = '<center><b>'+ dictionary(tag) +'</b> ('+count+' Total)</br></center>' + output;
    return output;
}},{style: standOut, onEachFeature:setupHighlight});

getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canals.json",{tag: "Canals",moreInfo:function(targets,tag){
    var output = '';
    var count = 0;
    targets.forEach(function(target){
        output += '<a target="_blank" href=http://www.venipedia.org/wiki/index.php?title='+ encodeURIComponent(target.data.Nome_Rio.replace(/ /g, "_")) + '>' + target.data.Nome_Rio+'</a></br>';
        count++;
    });
    output = '<center><b>'+ dictionary(tag) +'</b> ('+count+' Total)</br></center>' + output;
    return output;
}},{onEachFeature:function(feature,layer){
    setupHighlight(feature,layer);
    layer.bindPopup(
        '<b><center>' + feature.properties.data.Nome_Rio + '</center></b>'
    );
}});

//getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canal%20Segments.json","Canal Segments",{style: style2});
getGroup("https://cityknowledge.firebaseio.com/groups/belltowers%20MAPS%2015.json",{tag:"Bell Towers",moreInfo:function(targets,tag){
    var output = '';
    var count = 0;
    targets.forEach(function(target){
        output += target.data.NAME+'</br>'
        count++;
    });
    output = '<center><b>'+ dictionary(tag) +'</b> ('+count+' Total)</br></center>' + output;
    return output;
}},{onEachFeature:setupHighlight,pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: churchIcon}).bindPopup(
    "<b>" + feature.properties.data.NAME + "</b></br>" +
    "Code: " + feature.properties.data.CODE + "</br>" +
    "Date Recorded: " + feature.properties.birth_certificate.dor + "</br>"
    );
}});

getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOTELS08_PT_15.json",{tag: "HotelsMap",moreInfo:function(targets,tag){
    var output = '';
    var count = 0;
    targets.forEach(function(target){
        count++;
    });
    output = '<center><b>'+ dictionary(tag) +'</b> ('+count+' Total)</br></center>' + output;
    return output;
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: hotelIcon}).bindPopup("I am a hotel");
}});

getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOLES_PT_15.json",{tag: "Sewer Outlets",moreInfo:function(targets,tag){
    var output = '';
    var count = 0;
    targets.forEach(function(target){
        count++;
    });
    output = '<center><b>'+ dictionary(tag) +'</b> ('+count+' Total)</br></center>' + output;
    return output;
}},{onEachFeature:setupHighlight,pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: sewerIcon}).bindPopup("outlet");
}});

// ~~~~~~~~ layers with just lat/long ~~~~~~~~~~~~~~~~~~~~~
//getGroup("https://cityknowledge.firebaseio.com/groups/Hostels,%20Hotels.json","Hotels",{pointToLayer: function(feature,latlng){
//    return new L.marker(latlng, {icon: churchIcon});
//}});
//getGroup("https://cityknowledge.firebaseio.com/groups/Bed%20&%20Bfast,%20Apartments.json","Bed and Breakfasts");

// ~~~~~~~~ historical data (still just lat/long) ~~~~~~~~~
//getGroup("https://cityknowledge.firebaseio.com/groups/Demolished%20Churches.json");
getGroup("https://cityknowledge.firebaseio.com/groups/Convents%20Data.json",{moreInfo:function(targets,tag){
    var count=0;
    var output = '';
    targets.forEach(function(target){
        output += 'About: ' + target.data["Historic Background"] + '</br>' +
            'Current Use: ' + target.data["Curret Use"] + '</br>' +
            'Founded in' + target.data["Year Founded"] + '</br>';
        count++;
    });
    output = '<center><b>'+ dictionary(tag) +'</b> ('+count+' Total)</br></center>' + output;
    return output;
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: conventIcon}).bindPopup("I am a convent");
}});

getGroup("https://cityknowledge.firebaseio.com/groups/Minor_Lagoon_Islands_2015.json",{tag:"Wiki Data",moreInfo: function(targets,tag){
    var output = '';
    targets.forEach(function(target){
        output+='<b>About: </b>'+ target.data.Blurb+'</br>' +
        '<a href="" id="bib" target="_blank" class="button">View Bibliography</a></br>' +
        '<table border="1" style="width:100%">'+
        '<tr>'+
            '<td>'+ 'Handicap Accessible' + '</td>' +
            '<td>'+ target.data.Handicap_Accessibility + '</td>' +
        '</tr>' + '<tr>'+
            '<td>'+ 'Inhabited?' + '</td>' +
            '<td>'+ target.data.Inhabited + '</td>' +
        '</tr>' + '<tr>'+
            '<td>'+ 'Usage' + '</td>' +
            '<td>'+ target.data.Usage + '</td>' +
        '</tr>' +
        '</table>'
    });
    output = '<center><b>'+ dictionary(tag) +'</b></br></center>' + output;
    return output;
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: vpcicon});
}});

// the above layer probably matches up with the images in
//https://cityknowledge.firebaseio.com/groups/convent%20floor%20plans.json"

getGroup("https://ckdata.firebaseio.com/groups/MERGE%20Stores%202012.json",{tag:'Stores',filter:function(obj){
    if(obj["2015"]) return true;
    
},moreInfo: function(targets,tag){
// **************************************
// !!!!!!!! THIS IS A TEST ONLY !!!!!!!! - I'm going to be modifying it 
// further as I explore making a table-generation function, setting up titles, and overall styling
// **************************************
    var output = '';
    var count = 0;
    output ='<table border="1" style="width:100%">' +
                    '<tr>' +
                        '<th>Name</th>' +
                        '<th>Address</th>' +
                        '<th>Good Sold</th>' +
                    '</tr>';
    targets.forEach(function(target){
        output +=
        '<tr>'+
            '<td>'+ (target["2015"].name ? target["2015"].name : 'N/A') + '</td>' +
            '<td>'+ target["2015"].address_number 
                 +' '+ target['2015'].address_street + '</td>' +
            '<td>'+ (target["2015"].nace_plus_descr=='undefined' ? 'N/A': target["2015"].nace_plus_descr) + '</td>' +
        '</tr>' ;        
            
//                'Name: ' + (target["2015"].name ? target["2015"].name : 'N/A') + '</br>' +
//                 'Location: ' + target["2015"].address_number 
//                 +' '+ target['2015'].address_street + 
//                 '</br>Good sold: ' + (target["2015"].nace_plus_descr ? target["2015"].nace_plus_descr : 'N/A')
//                + '</br>'+'</br>';
        count++;
    });
    output = '<center><b>'+ dictionary(tag) +'</b> ('+count+' Total)</br></center>' + output;
    return output;
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