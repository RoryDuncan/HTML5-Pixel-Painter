var CanvasPixelEditor = function(options) {

/* PRIVATE */

  var CanvasEditor = function(canvas, pixelSize) {

    this.canvas = canvas;
    this.pixel = pixelSize;
    this.context = canvas.getContext('2d');
    this.clear = function() {
      this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
     };
    this.fill = function(color) {
      var color = !color ? "#fff" : color; 
      this.context.fillStyle = color;
      this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
      return this;
    };
    this.currentColor = "#448fab";
    this.dimensions = {
      height: this.canvas.height/pixelSize,
      width: this.canvas.width/pixelSize
    }
    this.paint = function(x, y) {
      var pixel = this.pixelAt(x, y);
      this.context.fillStyle = this.currentColor;

      this.context.fillRect(pixel.x, pixel.y, this.pixel, this.pixel );

    }
    this.pixelAt = function(_x, _y) {
      var x = ~~(_x / this.pixel),
          y = ~~(_y / this.pixel),
          xStart = x*this.pixel,
          yStart = y*this.pixel,
          xEnd = xStart + this.pixel,
          yEnd = yStart + this.pixel;
        return {x: xStart, y: yStart};
     };
  };

  var getCanvasById = function(Id) {
    if (Id === undefined || Id === void 0 || Id === null) {
      return null;
    }
    if (document.getElementById(Id) === null) {
      return undefined;
    }
    else return document.getElementById(Id);
  };

/* Page variables and mouse function from http://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas*/

  var getMouse = function(e, canvas) {

    stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    htmlTop = html.offsetTop;
    htmlLeft = html.offsetLeft;
    var element = canvas, offsetX = 0, offsetY = 0, mx, my;

    // Compute the total offset. It's possible to cache this if you want
    if (element.offsetParent !== undefined) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar (like the stumbleupon bar)
    // This part is not strictly necessary, it depends on your styling
    offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
    offsetY += stylePaddingTop + styleBorderTop + htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    // We return a simple javascript object with x and y defined
    return {x: mx, y: my};
  };

/* PUBLIC */
  this.canvas = null;
  this.get = function() {
    return this.canvas;
   };
  this.getId = function() {
    return this.canvas.attributes.id.value.toString();
   };
  this.setById = function(Id) {
    // may need checks
    this.canvas = getCanvasById(Id);
    return this;
   };
  this.getSize = function() {
    var coords = {};
    coords.width = this.canvas.width;
    coords.height = this.canvas.height;
    return coords;
    
   };
  this.setSize = function(options) {
    if (!options) throw new Error("Options object not passed into setSize() method. What are you even doing, crazy.");
    var o = {},
        c = this.getSize();
    // Combine the two hashes: the new options passed in, and fill holes with the old settings.
    o.width = options.width === undefined ? c.width : options.width;
    o.height = options.height === undefined ? c.height : options.height;
    // then change the canvas's properties
    this.canvas.width = o.width;
    this.canvas.height = o.height;
    return this;

   };
  this.addCanvasToDOM = function(parentEl, options) {
    // the parent element that will be
    var parent = document.querySelectorAll(parentEl),
        canv = document.createElement("canvas")
        toolDiv = document.createElement("div");

    this.parent = parent;

    if (parent.length === 0) { throw new Error("Specified Parent Element Not found in DOM.");}

    if (typeof options !== "object") {
      var options = {
        index: 0,
        width: 500,
        height: 500,
        id: "canvas_" + (document.getElementsByTagName('canvas').length + 1)
      };
    }

    // add the canvas
    canv.setAttribute("id", options.id);
    canv.setAttribute("width", options.width);
    canv.setAttribute("height", options.height);
    parent.item(options.index).appendChild(canv);
    
    this.canvas = document.getElementById(options.id);

    //add the "tools" div, to put things like the colorpicker
    toolDiv.setAttribute("class", "toolbox");
    this.parent.item(0).appendChild(toolDiv);
    
    colorpicker = document.createElement("input");
    colorpicker.setAttribute("id", "colorpickerholder");
    
    toolDiv.appendChild(colorpicker);

    this.colorPicker =  "#colorpickerholder";
    $(this.colorPicker).val("#448fab");


    return this;
   };
  this.start = function(width, height, pixelSize) {

    var canvas = document.getElementById( this.getId() );
    if (!canvas) {throw new Error("Canvas was not found."); return;}
    // fix from stack overflow for firefox for mouse captures
    canvas.style.position = "relative";
    var pixelSize = !pixelSize ? pixelSize = defaultPixelSize : pixelSize;
    this.setSize({
      width: width*pixelSize,
      height: height*pixelSize
    });
    // edit to make usage a different experience. 
    this.edit = new CanvasEditor(canvas, pixelSize);
    this.edit._app = this;
    this._addEvents();

    //add colorpicker

    //$(this.colorPicker).ColorPicker({eventName :'click', flat:false, livePreview: true});
    var that = this;
    $(this.colorPicker).ColorPicker({
        onSubmit: function(hsb, hex, rgb, el, parent) {
            var newColor = "#" +hex;
            $(el).val(hex);
            $(el).css({"color": newColor})
            $(el).ColorPickerHide();
            that.edit.currentColor = newColor;
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor(this.value);
        }
    })
    .on('keyup', function(){
        $(this).ColorPickerSetColor(this.value);
    });



    return this;
   };
  this._addEvents = function() {
    // events are called in a different scope
    var that = this; 
    this.canvas.addEventListener("click", function(e) {

      var mouse = getMouse(e, that.canvas);
      that.edit.paint(mouse.x, mouse.y)
    });
   };
  this._removeEvents = function() {
    this.canvas.removeEventListener("click");
   };
  this.end = function() {};
  this.save = function() {};
  this.reset = function() {};


// allows the canvas to be appended to another element upon instantiation.
  if (options !== undefined) {
    this.addCanvasToDOM(options.parent, options);
    this.options = options;
    }
  else {
    this.addCanvasToDOM('body');
  }

};


