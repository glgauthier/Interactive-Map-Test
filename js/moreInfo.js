// overlays info box
// https://raventools.com/blog/create-a-modal-dialog-using-css-and-javascript/ and
// http://netdna.webdesignerdepot.com/uploads7/creating-a-modal-window-with-html5-and-css3/demo.html#close
// this function is called from the zoomToFeature() function
function overlay(currentLayer) {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    
    // toggle the state of the function flag, this affects hilighting 
    overlayFlag ^= true;

//    currentLayer.setStyle({
//        fillColor: '#FEB24C',
//        weight: 0,
//        opacity: 1,
//        color: 'white',
//        dashArray: '3',
//        fillOpacity: 1.0
//    });
    
    // make life a little easier
    var properties = currentLayer.feature.properties;
    // print out whatever info you want to the 'inner' div of the 'overlay' div of index.html
    
    // currently have an issue with the scroll bar appearing on the outer div containing the map
    // instead of the info window
    document.getElementById("inner").innerHTML= '<b><center>Island Information</center></b><br />'+ 
        (properties ?
        '<b>' + 'Name: ' + properties.Nome_Isola + '</b><br />' 
        + 'Codice: ' + properties.Codice + '</b><br />'
        + 'Island Number: ' + properties.Insula_Num + '</b><br />'
        + '2011 Census Tract Number: ' + properties.Numero + '</b><br />'
        + 'Total Population: ' + properties.sum_pop_11 + '</b><br />' 
        + '<b><br />Overlays: </b>' + layerController._layers
        :''); 
   
    // test for appending additional info
    var textnode = document.createTextNode("Water");  
    $(document.getElementById("inner")).append('<br /> <br /><a href="http://www.venipedia.org/wiki/index.php?title=Islands"  target="_blank" onMouseOver="return changeImage()" onMouseOut= "return changeImageBack()"> <img name="jsbutton" src="image/venipedia.png" width="80" height="70" border="0" alt="javascript button" align="left"></a>'  
         + '<a href="http://cartography.veniceprojectcenter.org/" target="_blank" class="button">View on a historical map</a>');
    
    // function for getting rid of overlay when you click on the screen
    // update later to remove only when clicking outside of 'overlay' div
    $(document).ready(function() {
        $('#overlay').on('dblclick', function(e) { 
            overlay();
        });
    });
    
    var myimgobj = document.images["jsbutton"];
    
};

//supporting functions for venipedia button
//http://www.javascript-coder.com/button/javascript-button-p1.phtml
function changeImage()
{
    document.images["jsbutton"].src= "image/venipedia2.png";
    return true;
}

function changeImageBack()
{
    document.images["jsbutton"].src = "image/venipedia.png";
    return true;
}