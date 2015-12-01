var loadingScreen = {
    opts: {
      lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
    },
    
    container: document.getElementById('loadingScreen'),
    
    target: document.getElementById('spinPanel'),
    
    spinner: {},
    
    queue: 0,
    
    visibile: function(set){
        if(set==undefined){
            return this.container.style.visibility == "visible";
        }
        else if(set == true || set == "visible"){
            this.container.style.visibility = "visible";
            this.spinner = new Spinner(this.opts).spin(this.target);
        }
        else{
            this.container.style.visibility = "hidden";
            this.spinner.stop();
        }
        return set;
    },
    
    show: function(){
        this.visibile(true);
    },
    hide: function(){
        this.visibile(false);
    },
    
    add: function(){
        if(!this.visibile()){
            this.show();
        }
        this.queue++;
    },
    remove: function(){
        this.queue--;
        if(this.queue==0){
            this.hide();
        }
        this.queue = this.queue<0 ? 0 : this.queue;
    }
}

var closeButton = document.createElement("INPUT");
closeButton.setAttribute("type", "button");
closeButton.value = "Im Impatient";
closeButton.onclick = function(){
    loadingScreen.hide();
}

loadingScreen.container.appendChild(closeButton);

loadingScreen.show();
loadingScreen.hide();