var audio = document.getElementById("audio");
audio.loop = true;
var enableElement = document.createElement("DIV");

enableElement.style.height = '50px';
enableElement.style.width = '50px';
enableElement.style.background = 'rgba(255, 255, 255, 0)';
enableElement.style.boxShadow = '0 0 0px';
enableElement.style.margin = '5px';

enableElement.onclick = function(){
    
    var prevOnAdd = pirateLayer.onAdd;
    pirateLayer.onAdd = function(map){
        if(prevOnAdd){
            prevOnAdd.call(pirateLayer,map);
        }
        audio.load();
        audio.play();
    }
    
    var prevOnRemove = pirateLayer.onRemove;
    pirateLayer.onRemove = function(map){
        if(prevOnRemove){
            prevOnRemove.call(pirateLayer,map);
        }
        audio.pause();
    }
    
    layerController.addBaseLayer(pirateLayer,"PIRATE!");
    enableElement.onclick = function(){};
}

document.getElementById("help").appendChild(enableElement);