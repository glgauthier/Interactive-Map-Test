// overlays modal-esque information box on top of the page to show all available info

// https://raventools.com/blog/create-a-modal-dialog-using-css-and-javascript/

function overlayOn(currentLayer){
    if(!overlayFlag){
        overlay(currentLayer);
    }
}
function overlayOff(currentLayer){
    if(overlayFlag){
        overlay(currentLayer);
    }
}

//TODO: make this function more flexible:
//  -to be customized in the getData() file (appearence, content, etc)
//  -be prettier?
//  -check boxesfor what appears in general info?
//  -to work with any layer (not just islands)?
//  -translate fields

// this function is called from the zoomToFeature() function
function overlay(currentLayer) {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    
    // toggle the state of the function flag, this affects hilighting 
    overlayFlag ^= true;

    // if the info box is being turned off don't do any additional work
    if(!currentLayer){return;}
    
    // make life a little easier
    var properties = currentLayer.feature.properties;

    document.getElementById('inner').innerHTML=
        '<div id ="topBar">'+'<a class = "Xbutton" id = "Xbutton" onclick = "overlay()">X</a>'+
        '<h2><center>' + (properties.Nome_Isola ? properties.Nome_Isola : 'Island Information') + '</center></h2></div>'
        +' <br />';
    
    // add in info on the base geoJSON layers
    makeHTMLinfo(properties,"inner","JSON");
   
    // add in info on all overlays with information shown on selected isle
    addOverlayInfo("inner",properties.Numero);
    
    // add in the bottom bar
    $(document.getElementById("inner")).append('<div id="inner2" class="bottomBar">');
    // populate it with the venipedia and cartography links
    $(document.getElementById("inner2")).append('<a href="" id="venipedia"  target="_blank">'+ '<div id="venipediaImage"></div></a>' + '<a href="" id="cartography" target="_blank">'+ '<div id="cartographyImage"></div></a>');
    
    // generate correct venipedia link for associated island
    var link = "http://www.venipedia.org/wiki/index.php?title=Island_of_" + encodeURIComponent(properties.Nome_Isola.replace(/ /g, "_")); 
    document.getElementById("venipedia").href = link;
    
    // now generate the cartography app link
    link = 'http://cartography.veniceprojectcenter.org/index.html?map=debarbari&layer=island&feature=' +
        encodeURIComponent('Island of '+properties.Nome_Isola);
    document.getElementById("cartography").href = link;
    
    // function for getting rid of overlay when you click on the screen
    // update later to remove only when clicking outside of 'overlay' div
    $(document).ready(function() {
        $('#overlay').on('dblclick', function(e) { 
            overlayOff(currentLayer);
        });
    });
};

function makeHTMLinfo(props,id,type)
{
    switch(type){
        case("JSON"): // for geoJSONS that we've made from GIS Layers (info stored in properties)
            $(document.getElementById(id)).append(printObject(props));
            break;
        case("OVERLAY"): // for any layers that are auto-created from venipedia (info stored in properties.data)
            $(document.getElementById(id)).append(printObject(props.data));
            break; 
        default:
            $(document.getElementById(id)).append('Error - Must Specify Type <br />');
            break;
    }
}

function printObject(props,depth)
{
    depth = depth || 0;
    var output = '';

    if(!props){
        return  props + '<br />';
    }
    
    if(props.constructor === Array){
        output += "["
        if(props.length>0){
            output+=props[0];
            for(var i = 1;i<props.length;i++){
                output += ', '+props[i];
            }
        }
        output += ']<br />';
    }
    else if(typeof props === 'object'){
        //output+= tabs(depth) + '<b>'+property + '</b>: ';
        for(property in props){
            output += tabs(depth) + '<b>' + dictionary(property) + ':</b> '+printObject(props[property],depth+1);
        }
    }
    else{
        output += props + '<br />';
    }
    
    return output;
}

function tabs(int_num){
    if((!int_num)||int_num===0){
        return '';
    }
    
    var output = '';
    for(var i=0;i<int_num;i++){
        output += '&emsp;';
    }
    return output;
}

/* !!!!!!!! photograph stuff !!!!!!!!
* if we use http://instafeedjs.com/ all we need to do is sign up for an API key from 
* instagram and then showing a feed of pictures tagged by location/hashtag is super easy,
* so that could be an easy way to add photos later on if we want to use it
*/

function addOverlayInfo(id,num){
    
    for(key in featureCollections){
        if(featureCollections[key].groupOptions && featureCollections[key].groupOptions.moreInfo){
            var targets = $.map(featureCollections[key]._layers, function(e){return e.feature.properties}).filter(function(target){
                return $.inArray(num,target.islands)!=-1;
            });
            if(targets.length>0){
                var outer = document.getElementById(id);
                // append a new div element to the more info window
                $(outer).append(
                     $('<div>')
                        //specify the class of the div
                        .addClass("moreInfo")
                        //tag that div by the key
                        .attr("id", key.replace(/ /g, "_"))
                        // fill in moreInfo stuff into the new div
                        .append(featureCollections[key].groupOptions.moreInfo(targets,key))
                );
            }
        }
    }
}

