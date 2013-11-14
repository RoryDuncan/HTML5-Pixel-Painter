


var PixelEditor = new PixelEditor({parent: 'div.container', id:"output"});

//render will be called in the scope of CanvasPixelEditor._toolbox
var toolboxView = function() {

	var selector = this.selectors;
	this.$toolbox.append('<h1>toolbox</h1>')
	this.$toolbox.append('<div class="column"></div>')
    $(this.id + " .column:nth(0)")
      .append("<h1> Color </h1>")
      .append("<div id='" + selector.COLORSELECTOR + "'></div>")
      .append("<div id='" + selector.COLORPICKER + "'></div>")
      .append("<h1> Opacity</h1>")
      .append("<input id='" + selector.opacity.slider + "' type='range' value='100'>")
      .append("<div  id='" + selector.opacity.text + "'>100%</div>");

    this.$toolbox.append('<div class="column"></div>')
    $(this.id + " .column:nth(1)")
      .append("<h1> Tools </h1>")
      .append("<div class='tool' id='" + selector.eyedropper + "' >Grab Color</div>")
      .append("<div class='tool' id='" + selector.paintbucket + "' >Fill</div>")
      .append("<h1> Output </h1>")
      .append("<div id='" + selector.generate + "' class='tool'>Create Image</div>")
      .append("<div id='" + selector.generatedlist + "-clear' class='tool'>Clear List</div>")
      .append("<ol id='" + selector.generatedlist + "'></ol>");

    this.$toolbox.append('<div class="column"></div>')
    $(this.id + " .column:nth(2)")
      .append("<h1>Configuration</h1>")
      .append("<div class='tool' id='" + selector.renew + "'>New Image</div>")
      .append("<div class='tool' onclick='PixelEditor.reset()' >Reset</div>")
      .append("<h1>Dimensions </h1>")
      .append("<div id='" + selector.dimensions + "' ></div>");

} 

PixelEditor.start({width:10, height:10, pixel:40}, toolboxView);



