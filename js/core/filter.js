var FilterControl = L.Control.extend({
    //div
    //modifyDiv
    //object
    //fieldSelect
    //functionSelect
    //textInput
    
    initialize: function (object, position, modifyDiv) {
        // ...
        if(position){
            L.Util.setOptions(this, {position: position});
        }
        
        this.object = object;
        
        this.modifyDiv = modifyDiv;
    },
    
    minimized: false,
    
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        this.div = L.DomUtil.create('div', 'info legend');
        //div.innerHTML = '<select><option>1</option><option>2</option><option>3</option></select>';
        
        //this.setObject(["a",1,"b"]);
        this.setObject(this.object);
        
        if(this.modifyDiv){
            this.modifyDiv(this.div);
        }
        return this.div;
    },
    
    setObject : function(object){
        var that = this;
        this.div.innerHTML = '';
        this.object = object;
        applyStyle(this.div,Filter_style(this.div));
        
        this.div.onclick = function(e){
            if(that.minimized){
                that.minimize(false);
            }
            if(e.stopPropagation){
                e.stopPropagation();
            }
            return false;
        }
        this.div.ondblclick = function(e){
            that.minimize(!that.minimized);
            if(e.stopPropagation){
                e.stopPropagation();
            }
            return false;
        }
        
        var labelDiv = document.createElement("DIV");
        var label = document.createTextNode("Filter By: ");
        applyStyle(labelDiv,FilterElement_style(labelDiv));
        labelDiv.style.float = 'left';
        labelDiv.appendChild(label);
        this.div.appendChild(labelDiv);
        
        this.fieldSelect = createDropdown(object);
        //this.fieldSelect.multiple = true;
        this.div.appendChild(this.fieldSelect);
        this.functionSelect = createDropdown(["=","<",">","contains"]);
        this.div.appendChild(this.functionSelect);
        
        this.textInput = document.createElement("INPUT");
        applyStyle(this.textInput,FilterElement_style(this.textInput));
        this.textInput.setAttribute("type", "text");
        this.textInput.onkeypress = function(e){
            var key = e.which || e.keyCode;
            if (key == 27) {  // 27 is the ESC key
                that.onClear(e);
            }
            else if (key == 13) {  // 13 is the Enter key
                if(that.textInput && that.textInput.value != ''){
                   that.onApply(e);
                }
                else{
                    that.onClear(e);
                }
            }
        };
        this.div.appendChild(this.textInput);
        
        var applyButton = document.createElement("INPUT");
        applyStyle(applyButton,FilterElement_style(applyButton));
        applyButton.setAttribute("type", "button");
        applyButton.setAttribute("value","Apply");
        applyButton.onclick = this.onApply;

        this.div.appendChild(applyButton);
        
        var clearButton = document.createElement("INPUT");
        applyStyle(clearButton,FilterElement_style(clearButton));
        clearButton.setAttribute("type", "button");
        clearButton.setAttribute("value","Clear");
        clearButton.onclick = this.onClear;
        this.div.appendChild(clearButton);
    },
    
    minimize : function(bool){
        this.minimized = bool;
        if(bool){
            this.div.innerHTML = '';
            applyStyle(this.div,Filter_style(this.div));

            var labelDiv = document.createElement("DIV");
            var label = document.createTextNode("Filter By: ");
            applyStyle(labelDiv,FilterElement_style(labelDiv));
            labelDiv.style.float = 'left';
            labelDiv.appendChild(label);
            this.div.appendChild(labelDiv);
        }
        else{
            this.setObject(this.object);
        }
    },
    
    testObject : function(object){
        
    },
    
    selectedFields : function(){
        var items = [];
        if(!this.fieldSelect){
            return items;
        }
        
        if(this.fieldSelect.multiple){
            for(var i=0,iLen=this.fieldSelect.options.length;i<iLen;i++){
                if(this.fieldSelect.options[i].selected){
                    items.push(this.fieldSelect.options[i].value||this.fieldSelect.option[si].text);
                }
            }
        }
        else{
            var i= this.fieldSelect.selectedIndex;
            if(i<0){
                return items;
            }
            items.push(this.fieldSelect.options[i].value||this.fieldSelect.options[i].text);
        }
        return items;
    },
    
    selectedFunctions : function(){
        var items = [];
        if(!this.functionSelect){
            return items;
        }
        
        if(this.functionSelect.multiple){
            for(var i=0,iLen=this.functionSelect.options.length;i<iLen;i++){
                if(this.functionSelect.options[i].selected){
                    items.push(this.functionSelect.options[i].value||this.functionSelect.options[i].text);
                }
            }
        }
        else{
            var i= this.functionSelect.selectedIndex;
            if(i<0){
                return items;
            }
            items.push(this.functionSelect.options[i].value||this.functionSelect.options[i].text);
        }
        return items;
    },
    
    inputText : function(){
        return textInput.value;
    },
    
    onApply : function(e){
        
    },
    onClear : function(e){
        
    }
});

function createDropdown(object,options){
    var dropdown = document.createElement("SELECT");
    if(options){
        for(property in options){
            if(options.hasOwnProperty(property)){
                dropdown[property] = options[property];
            }
        }
    }
    
    applyStyle(dropdown,FilterElement_style(option));
    
    if(!object){
        return dropdown;
    }
    
    if(object.constructor === Array){
        if(object.length>0){
            for(var i = 0;i<object.length;i++){
                var option = document.createElement("OPTION");
                option.text = object[i];
                option.value = object[i];
                dropdown.add(option);
            }
        }
    }
    else if(typeof object === 'object'){
        for(property in object){
            var option = document.createElement("OPTION");
            option.text = property;
            option.value = property;
            dropdown.add(option);
        }
    }
    else{
        var option = document.createElement("OPTION");
        option.text = property;
        option.value = property;
        dropdown.add(option);
    }
    
    dropdown.onmousedown = dropdown.ondblclick = L.DomEvent.stopPropagation;
    return dropdown;
}

function applyStyle(feature,style){
    for(property in style){
        feature.style[property] = style[property];
    }
}

var filter = new FilterControl(singleLayer.features[0].properties,'topleft',function(div){
    div.style.clear = 'none';
});
filter.onApply = function(e){
    alert("apply "+filter.selectedFields());
}
filter.onClear = function(e){
    alert("clear "+filter.selectedFunctions());
}
map.addControl(filter);