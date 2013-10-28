var CanvasPixelEditor = function(appendToEl, options) {

  /* PRIVATE */

  var CanvasEditor = function() {};

  var getCanvasById = function(Id) {
    if (Id === undefined || Id === void 0 || Id === null) {
      return null;
    }
    if (document.getElementById(Id) === null) {
      return undefined;
    }
    else return document.getElementById(Id);
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
        canv=document.createElement("canvas");
        

    if (parent.length === 0) { throw new Error("Specified Parent Element Not found in DOM.");}

    if (typeof options !== "object") {
      var options = {
        index: 0,
        width: 500,
        height: 500,
        id: "canvas_" + (document.getElementsByTagName('canvas').length + 1)
      };
    }
    
    canv.setAttribute("id", options.id);
    canv.setAttribute("width", options.width);
    canv.setAttribute("height", options.height);
    parent.item(options.index).appendChild(canv);
    this.canvas = document.getElementById(options.id);

    return this;
   };
  this.start = function() {
    this._core_ = new CanvasEditor();

    return this;
   };
  this.end = function() {};
  this.save = function() {};
  this.clear = function() {};


  // allow injection of canvas with instantiation.
  if (appendToEl !== undefined) {
    if (options !== undefined) {
      this.addCanvasToDOM(appendToEl, options);
    }
    else this.addCanvasToDOM(appendToEl);
  }

};


window.CanvasPixelEditor = new CanvasPixelEditor('div.container', {id:"pixel-maker", width: 500, height: 500});

console.log(CanvasPixelEditor);