//******* Necessary - Used by core application to style layers. Must exist but can be modified ********//
function Island_style(feature) {
    return {
        fillColor: getColor(feature.properties.islands_sum_pop_11),
        weight: 0,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.7
    };
}

function Highlight_style(feature) {
    return {
        fillColor: getColor(feature.properties.islands_sum_pop_11),
        weight: 0,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.7
    };
}

//******** OPTIONAL - Used for custom styles **********//

// Styling for making choropleth-like colorations of polygons
// Create grades using http://colorbrewer2.org/
function getColor(d) {
    if(d){
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
    return 'rgba(255, 0, 0, 0.64)';
}

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