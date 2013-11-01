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
    this.currentColor = "#f00";
    this.dimensions = {
      height: this.canvas.height/pixelSize,
      width: this.canvas.width/pixelSize
    }
    this.paint = function(x, y) {
      var pixel = this.pixelAt(x, y);
      this.context.fillStyle = this.currentColor;

      this.context.fillRect(pixel.x, pixel.y, this.pixel, this.pixel );

    };
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
        canv = document.createElement("canvas"),
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
    toolDiv.setAttribute("id", "toolbox");
    this.parent.item(0).appendChild(toolDiv);
    this.toolboxId = "#toolbox";
    

    var dimensions = document.createElement("div");
    var colorChange = document.createElement("div");
    var colorPicker = document.createElement("div");
    dimensions.setAttribute("id", "dimensions");
    colorChange.setAttribute("id", "colorselector");
    colorPicker.setAttribute("id", "colorpickerholder");

    $(this.toolboxId).html("<h2> Tools </h2>");
    $(this.toolboxId).append("<h3>Dimensions </h3>");
    toolDiv.appendChild(dimensions);
    $(this.toolboxId).append("<h3> Color </h3>");
    toolDiv.appendChild(colorChange);
    toolDiv.appendChild(colorPicker);

    this.colorPicker =  "#colorpickerholder";
    

    return this;
   };
  this.toolbox = function() {
    //toolbox is the div in which interface icons can be used.

    //adjust to position absolute exactly next to canvas.
    var canvas = "#"+this.getId(),
        pos = $(canvas).offset(),
        width = this.canvas.width;

    $(this.toolboxId).css({
      "position":"absolute",
      "left": pos.left + width + 10,
      "top": pos.top
    });
    // add in the dynamic content (dimensions of the image)
    $('#dimensions').html(  + this.edit.dimensions.width + "<span>&#10005;</span>" + this.edit.dimensions.height + "::" + this.edit.pixel);

   };
  this.color = function(hex){
    this.edit.currentColor = hex;
   }
  this.start = function(width, height, pixelSize) {

    var canvas = document.getElementById(this.getId() );
    if (!canvas) { throw new Error("Canvas was not found."); return; }
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
        flat: true,
        color: '#000',
        onSubmit: function(hsb, hex, rgb) {
            $('#colorselector').css('backgroundColor', '#' + hex);
            that.color('#' + hex);
            $('#colorpickerholder').hide();
        }
    });
     $(this.colorPicker).hide();

    // fix toolbox positioning
    this.toolbox(); 
    return this;
   };
  this._addEvents = function() {
    // events are called in a different scope
    var that = this; 
    this.canvas.addEventListener("click", function(e) {

      var mouse = getMouse(e, that.canvas);
      that.edit.paint(mouse.x, mouse.y)
    });
    $('#colorselector').click(function(){

      $('div.colorpicker_submit').click(function(){
        $('#colorpickerholder').hide();
      });

      var display = $('#colorpickerholder').css("display");
      if (display === "none") {
        $('#colorpickerholder').show();
      }
      else if (display === "block") {
        $('#colorpickerholder').hide();
      }
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


