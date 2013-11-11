var PixelEditor = function(options) {

/* PRIVATE API */

  /* SUB CLASSES */
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
    this.fill = function() {
      this.context.globalAlpha = this.opacity;
      this.context.fillStyle = this.currentColor;;
      this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
      return this;
     };
    this.currentColor = "#f00";
    this.dimensions = {
      height: this.canvas.height/pixelSize,
      width: this.canvas.width/pixelSize
     };
    this.paint = function(x, y) {
      this.context.globalAlpha = this.opacity;
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
          dimensions.pixel = this.app.edit.pixel;

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
      
      return {"data": data, "dimensions":dimensions};
     };
    this.image = function() {
          var dataURL = this.app.canvas.toDataURL();
          return dataURL;

    };
    this.data = function() {};
   };
   //toolbox is the div containing all of the interactive things. it's full of things 
  var ToolBox = function(parentApp, parentEl ) {
    this.app = parentApp;
    this.parent = parentEl;
    this.selectors = {
      "toolbox" : "toolbox",
      "COLORSELECTOR" : "colorselector",     // jQuery color picker plugin
      "COLORPICKER" : "colorpickerholder", // jQuery color picker plugin
      "opacity" : {
        "slider": "opacity-slider",
        "output": "opacity-text"
      },
      "eyedropper" : "pixeleditor-eyedropper",
      "paintbucket" : "pixeleditor-fill",
      "dimensions" : "pixeleditor-dimensions",
      "generate" : "pixeleditor-generate",
      "generatedlist" : "pixeleditor-generated-states",
      "renew" : "pixeleditor-new"
     }
    this.base = function() {
      var toolDiv = document.createElement("div");
      toolDiv.setAttribute("class", "toolbox");
      this.parent.appendChild(toolDiv);
      this.$toolbox = $(".toolbox");
      this.id = ".toolbox";
     };
    this.reset = function() {
      !!this.$toolbox ?  this.$toolbox.html("") : this.base();
     };
    this.render = function(custom) {
      try {
        this.reset();
        custom.apply(this);
      }
      catch (e) { 
        throw new Error("Toolbox Render failed because " + e.message);
      } 
     };

    this.base();

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
  this.renderCanvas = function(parentEl, options) {
    // the parent element that the canvas will be attached to
    var parent = document.querySelectorAll(parentEl),
        canv = document.createElement("canvas");

    if (parent.length === 0) throw new Error("Specified Parent Element Not found in DOM.");
    // 'defaults'
    if (typeof options !== "object") {
      var options = {
        index: 0,
        width: 500,
        height: 500,
        id: "canvas_" + (document.getElementsByTagName('canvas').length + 1)
      };
    }

    this.parent = parent.item(options.index);
    // add the canvas
    canv.setAttribute("id", options.id);
    canv.setAttribute("class", "pixel-editor");
    canv.setAttribute("width", options.width);
    canv.setAttribute("height", options.height);
    parent.item(options.index).appendChild(canv);
    
    this.canvas = document.getElementById(options.id);
    this.$canvas = $("canvas#" + options.id);

    this._toolbox = new ToolBox(this, parent.item(options.index) );
   };
  this.toolbox = function(custom) {

    this._toolbox.render( custom );
    return this;
   };
  this.toggleFloat = function(state) {
    if (state) {
      $( "#" + this.getId() ).css({"float":"left"});
      $(this.toolboxId).css({"float":"right"});
    }
    else {
      $( "#" + this.getId() ).css({"float":"none"});
      $(this.toolboxId).css({"float":"none"});
    }
   };
  this.color = function(hex) {
    //sets the color to paint with
    var hex = hex.substring(0,1) !== "#" ? "#" + hex : hex;
    this.edit.currentColor = hex;
    // show the color on the "swatch"
    $('#colorselector').css('backgroundColor', hex);
    //update the colorpicker
    $('#colorpickerholder').ColorPickerSetColor(hex);
   };
  this.start = function(dimensions, customRender) {
    // The initializer of the app. 
    if (!dimensions) {
      throw new Error("No Dimensions Object inputed.");
    }
    
    var canvas = document.getElementById( this.getId() );
    if (!canvas) { throw new Error("Canvas was not found."); return; }
    // fix from stack overflow for firefox for mouse captures
    canvas.style.position = "relative";
    var pixelSize = !dimensions.pixel ? pixelSize = 20 : dimensions.pixel;
    this.setSize({
      "width": dimensions.width * pixelSize,
      "height": dimensions.height * pixelSize
    });
    // edit to make usage a better mental model. 
    // ie Canvas.edit.fill("#ff0")
    this.edit = new CanvasEditor(this, canvas, pixelSize);
    // same with 'make'
    // app.make.image
    this.make = new CanvasToData(this);

    if (!!customRender) {
      this.toolbox(customRender)
    }

    // events
    this.events(true);


    //add colorpicker
    var that = this;

    if ( !this.colorPickerInstantiated ) {

      $('#colorpickerholder').ColorPicker({
          flat: true,
          color: '#ff0000',
          onSubmit: function(hsb, hex, rgb) {
              that.color('#' + hex);
              $('#colorpickerholder').hide();
          }
      });
      // create, then hide the colorpicker modal
      $('#colorpickerholder').hide();
      this.colorPickerInstantiated = true;
    }

    // display dimensions to user
    $("#"+this._toolbox.selectors.dimensions).html( this.edit.dimensions.width + "<span>&#10005;</span>" + this.edit.dimensions.height + " @ " + this.edit.pixel );
    return this;
   };
  this.event = {};
  this.event.painting = function(enabled) {
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
  this.event.colorpicker = function(enabled) {

    if (enabled === true) {
      $('#colorselector').click(function() {

        $('div.colorpicker_submit').click( function() {
          $('#colorpickerholder').hide();
        });

        var display = $('#colorpickerholder').css("display");
        if (display === "none") {
          $('#colorpickerholder').show();
        }
        else if (display !== "none") {
          $('#colorpickerholder').hide();
        }
       });
    } else $('#colorselector').unbind("click");
   };
  this.event.opacity = function(enabled) {

    var that = this;
    var slider = "#" + this._toolbox.selectors.opacity.slider;
    var output = "#" + this._toolbox.selectors.opacity.text;

    if (enabled === true) {

      $(slider).change( function(e) {
        that.edit.opacity = this.value/100;
        $(output).text(this.value + "%");
       });

    }
    else $(slider).unbind("click");
   };
  this.event.fill = function(enabled) {

    var that = this;
    var paintfill = "#" + this._toolbox.selectors.paintbucket;

    if (enabled === true) {

      $(paintfill).click( function(e) {
        that.edit.fill();
      });

    }
    else $(paintfill).unbind("click");
   
   };
  this.event.eyedropper = function(enabled) {
    console.log(this);
    var that = this;
    var selector = ("#"+this.getId() );
    var $eyedropper = $( '#' + this._toolbox.selectors.eyedropper );

    if (enabled === true) {

      $eyedropper.click( function() {
      
      if ( !$eyedropper.hasClass('tool-active') ) {
        //interface changes
        $eyedropper.toggleClass('tool');
        $eyedropper.toggleClass('tool-active');
        $(selector).toggleClass('color-grabber');
        console.log(that);
        that.event.painting.call(that, false);
        $(selector).click( function(e) {
          
          var mouse = getMouse(e, that.canvas);
          var color = that.edit.getColorAt(mouse.x, mouse.y);
          //set the color to the one the eyedropper tool picked up.
          that.color(color);
          $eyedropper.toggleClass('tool');
          $eyedropper.toggleClass('tool-active');
          //unbind eyedropper click event and add painting event again
          $(selector).unbind("click");
          $(selector).toggleClass('color-grabber');
          that.event.painting.call(that, true);
        });
      }

     });

    }
    else $eyedropper.unbind("click");
   
   };
  this.event.makeImageState = function(enabled) {
    var that = this;
    var outputButton = "#" + this._toolbox.selectors.generate;
    var outputList = "#" + this._toolbox.selectors.generatedlist;

    if (enabled === true) {

      $(outputButton).click( function(e) {
        that.imagesGenerated = that.imagesGenerated === undefined ? 0 : that.imagesGenerated+1;
        var state = "<li><a target='_blank' href='" + that.make.image() + "' > State " + that.imagesGenerated + "</a></li>";
        $(outputList).append(state);
      });

    } else $(outputButton).unbind("click");
   };
  this.event.renew = function(enabled) {

    var getData = function() {
            var height = $('#pixeleditor-input-height').val();
            var width = $('#pixeleditor-input-width').val();
            var pixel = $('#pixeleditor-input-pixel').val();
            return {"width":width, "height":height, "pixel": pixel};
    };
    var that = this;
    var wrapper = "<div class='pixeleditor-modal'><h1>New Dimensions</h1></div>"
    var inputWidth = '<label for="pixeleditor-input-width">Width:</label><input type="text" id="pixeleditor-input-width" name="pixeleditor-input-width" /><br />';
    var inputHeight = '<label for="pixeleditor-input-height">Height:</label><input type="text" id="pixeleditor-input-height" name="pixeleditor-input-height" /><br />';
    var inputPixels = '<label for="pixeleditor-input-pixel">Pixels</label><input type="text" id="pixeleditor-input-pixel" name="pixeleditor-input-pixel" /><br /><hr>';

    var confirm = "<div class='tool confirm'>Okay</div><div class='tool cancel'>Nevermind</div><div class='clearfix'></div>"

    if (enabled === true) {
      var renew = "#" + this._toolbox.selectors.renew;

      $(renew).click(function(){
        if ($(".pixeleditor-modal").length === 0) {

          $(renew).after(wrapper);
          $(".pixeleditor-modal")
            .append(inputWidth)
            .append(inputHeight)
            .append(inputPixels)
            .append(confirm);

            //show the current dimensions
            $('#pixeleditor-input-height').val(that.edit.dimensions.height);
            $('#pixeleditor-input-width').val(that.edit.dimensions.width);
            $('#pixeleditor-input-pixel').val(that.edit.pixel);

            $('.pixeleditor-modal .cancel').click(function(){
              $(".pixeleditor-modal").remove();
            });
            $('.pixeleditor-modal .confirm').click(function(){
              var height = $('#pixeleditor-input-height').val();
              var width = $('#pixeleditor-input-width').val();
              var pixel = $('#pixeleditor-input-pixel').val();
              if (height.length === 0 ) { $('#pixeleditor-input-height').addClass('error').focus(); return; }
              if (width.length === 0  ) { $('#pixeleditor-input-width').addClass('error').focus(); return; }
              if (pixel.length === 0  ) { $('#pixeleditor-input-pixel').addClass('error').focus(); return; }
              
              var data = getData();
              $(".pixeleditor-modal").remove();
              that.start(data);
              


            })
        }
      });
    }
   };
  this.events = function(enabled) {
    var event = this.event;
    // pass in a true or false to enabled or disable all events
    event.painting.call(this, enabled);
    event.colorpicker.call(this, enabled);
    event.opacity.call(this, enabled);
    event.fill.call(this, enabled);
    event.eyedropper.call(this, enabled);
    event.makeImageState.call(this, enabled);
    event.renew.call(this, enabled);
   };
  this.save = function() {};
  this.reset = function(skipdialogue) {
    if (skipdialogue || window.confirm("Are you sure you? The current image you are working on will be lost.") ) this.edit.clear();

   };
  this.resize = function() {}
  this.newImage = function() {
    this.reset();
  }


// If parameters exist, the canvas is appended to another element upon instantiation.
  if (options !== undefined) {
    this.renderCanvas(options.parent, options);
    this.options = options;
    }
  else {
    this.renderCanvas('body');
  }

};


