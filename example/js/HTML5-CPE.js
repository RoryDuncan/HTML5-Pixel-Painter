var CanvasPixelEditor = function(options) {

/* PRIVATE API */
  /* CLASSES */

  // CanvasEditor is a sub-class of CanvasPixelEditor
  // it is instantiated at CanvasPixelEditor.start() and attached to CanvasPixelEditor.edit
  var CanvasEditor = function(parentApp, canvas, pixelSize) {
    this.app = parentApp;
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
     };
    this.paint = function(x, y) {
      var pixel = this.getPixel(x, y);
      this.context.fillStyle = this.currentColor;

      this.context.fillRect(pixel.x, pixel.y, this.pixel, this.pixel );

     };
    this.getColorAt = function(x, y) {
      // this method doesn't need to deal with whole pixels,
      // so getPixel is unneeded
      var colorData = this.context.getImageData(x,y,1,1);
      //change into hex
      colorData = colorData.data;
      var r = colorData[0],
          g = colorData[1],
          b = colorData[2],
          a = colorData[3];
      //convert to hex strings
      r = r.toString(16);
      g = g.toString(16);
      b = b.toString(16);
      //adjust for single digit hexes 
      r = r.length !== 2 ? r + "0" : r ;
      g = g.length !== 2 ? g + "0" : g ;
      b = b.length !== 2 ? b + "0" : b ;
      colorData = r + g + b;
      colorData = "#" + colorData;
      return colorData;
     };
    this.getPixel = function(_x, _y) {
      var x = ~~(_x / this.pixel),
          y = ~~(_y / this.pixel),
          xStart = x*this.pixel,
          yStart = y*this.pixel,
          xEnd = xStart + this.pixel,
          yEnd = yStart + this.pixel;
        return {x: xStart, y: yStart};
     };
   };
  // CanvasToData handles saving as image or data, etc
  var CanvasToData = function(parentApp) {
    this.app = parentApp;

    this.array = function() {
      var actualWidth = this.app.canvas.width,
          actualHeight = this.app.canvas.height,
          dimensions = this.app.edit.dimensions,
          pixels = dimensions.width * dimensions.height,
          data = [];

      // SPecific Iterator (_i) so that there is no extra/shortage,
      // but keeps tracks of rows and columns seperately
      for ( var _i = 1, row = 0, column = 0, _ii = pixels;  _i < _ii;  _i++, column++) {
        var x, y;
        if (column % dimensions.width === 0) {
          row++;
          column = 0;
        }
        // get the specified color at the current positions
        data[_i] = this.app.edit.getColorAt(column * dimensions.width, row * dimensions.height);
      }
      
      return {"data":data, "dimensions":dimensions};
     };
    this.image = function() {};
    this.data = function() {};

  };

  /* HELPERS */

  var getCanvasById = function(Id) {
    if (Id === undefined || Id === void 0 || Id === null) {
      return null;
    }
    if (document.getElementById(Id) === null) {
      return undefined;
    }
    else return document.getElementById(Id);
   };

  var getMouse = function(e, canvas) {
    /* Page variables and mouse function from http://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas*/
    // unsure if "var" intentionally left out.
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

/* PUBLIC API */
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
  this.addToDOM = function(parentEl, options) {
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
    
    // ideally the following would be in a template,
    // but for the sake of modularity it isn't
    var dimensions = document.createElement("div");
    var colorChange = document.createElement("div");
    var colorPicker = document.createElement("div");
    var opacitySlider = document.createElement("input");
    var eyedropper = document.createElement("div");
    var colorFill = document.createElement("div");
    dimensions.setAttribute("id", "p_dimensions");
    colorChange.setAttribute("id", "colorselector");
    colorPicker.setAttribute("id", "colorpickerholder");
    eyedropper.setAttribute("id", "p_eyedropper");
    colorFill.setAttribute("id", "p_fill");
    eyedropper.setAttribute("class", "tool");
    colorFill.setAttribute("class", "tool");

    
    $(this.toolboxId).append("<h1>Dimensions </h1>");
    toolDiv.appendChild(dimensions);
    $(this.toolboxId).append("<h1> Color </h1>");
    toolDiv.appendChild(colorChange);
    toolDiv.appendChild(colorPicker);
    $(this.toolboxId).append("<p> Opacity </p>");
    $(this.toolboxId).append("<h1> Tools </h1>");
    toolDiv.appendChild(eyedropper);

    $('#p_eyedropper').text("eyedrop")

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
    $('#p_dimensions').html(  + this.edit.dimensions.width 
                            + "<span>&#10005;</span>" 
                            + this.edit.dimensions.height 
                            + " @ " + this.edit.pixel);
    };
  this.color = function(hex) {
    //sets the color to paint with
    var hex = hex.substring(0,1) !== "#" ? "#" + hex : hex;
    this.edit.currentColor = hex;
    // show the color on the "swatch"
    $('#colorselector').css('backgroundColor', hex);
    //update the colorpicker
    $(this.colorPicker).ColorPickerSetColor(hex);
   };
  this.start = function(width, height, pixelSize) {
    // basic initializer of the painter

    var canvas = document.getElementById(this.getId() );
    if (!canvas) { throw new Error("Canvas was not found."); return; }
    // fix from stack overflow for firefox for mouse captures
    canvas.style.position = "relative";
    var pixelSize = !pixelSize ? pixelSize = defaultPixelSize : pixelSize;
    this.setSize({
      width: width*pixelSize,
      height: height*pixelSize
    });
    // edit to make usage a better mental model. 
    // ie Canvas.edit.fill("#ff0")
    this.edit = new CanvasEditor(this, canvas, pixelSize);
    // same with 'make'
    // app.make.image
    this.make = new CanvasToData(this);
    console.log( this.make.array() );

    // events
    this.painting(true);
    this._events();


    //add colorpicker
    var that = this;
    $(this.colorPicker).ColorPicker({
        flat: true,
        color: '#ff0000',
        onSubmit: function(hsb, hex, rgb) {
            that.color('#' + hex);
            $('#colorpickerholder').hide();
        }
    });
    // create, then hide the colorpicker modal
    $(this.colorPicker).hide();

    // fix toolbox positioning
    this.toolbox(); 
    return this;
   };
  this.painting = function(enabled) {
    // because painting is the main functionality,
    // it has a different abstraction than the other events 
    var that = this, // events lose scope, so use "that" when you need "this"
        selector = ("#"+that.getId());
    var paintEvent = function(e) {
      e.preventDefault();
      var mouse = getMouse(e, that.canvas);
      that.edit.paint(mouse.x, mouse.y);
    };
    if (enabled === true) {

      $( selector).on("click", paintEvent);
    }
    else {
      $(selector).unbind("click");
    }
   };
  this._events = function() {
    var that = this,
        selector = ("#"+that.getId());
    //color selector
    $('#colorselector').click(function() {

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

    //eyedropper tool
    $('#p_eyedropper').click( function() {
      if ( !$('#p_eyedropper').hasClass('tool-active') ) {
        //interface changes
        $("#p_eyedropper").toggleClass('tool');
        $("#p_eyedropper").toggleClass('tool-active');
        $(selector).toggleClass('stealing-colors');
        that.painting(false);
        
        $(selector).click( function(e) {
          
          var mouse = getMouse(e, that.canvas);
          var color = that.edit.getColorAt(mouse.x, mouse.y);
          //set the color to the one the eyedropper tool picked up.
          that.color(color);
          $("#p_eyedropper").toggleClass('tool');
          $("#p_eyedropper").toggleClass('tool-active');
          //unbind eyedropper click event and add painting event again
          $(selector).unbind("click");
          $(selector).toggleClass('stealing-colors');
          that.painting(true);
        });
    }

      
    });

   };
  this._removeEvents = function() {
    // todo
   };
  this.end = function() {};
  this.save = function() {};
  this.reset = function() {};


// If parameters exist, the canvas is appended to another element upon instantiation.
  if (options !== undefined) {
    this.addToDOM(options.parent, options);
    this.options = options;
    }
  else {
    this.addToDOM('body');
  }

};


