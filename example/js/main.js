

console.clear();
var CPE = new CanvasPixelEditor({parent: 'div.container', id:"output"});

var customRender = function() {
	console.log(this)
	var selector = this.selectors;
	
	this.$toolbox.append('<div class="column"></div>')
    $(this.id + " .column:nth(0)")
      .append("<h1> Color </h1>")
      .append("<div id='" + selector.COLORSELECTOR + "'></div>")
      .append("<div id='" + selector.COLORPICKER + "'></div>")
      .append("<h1> Opacity</h1>")
      .append("<input id='" + selector.opacity.slider + "' type='range' value='100'>")
      .append("<div  id='" + selector.opacity.text + "'>100%</div>")
      .append("<h1> Tools </h1>")
      .append("<div class='tool' id='" + selector.eyedropper + "' >Grab Color</div>")
      .append("<div class='tool' id='" + selector.paintbucket + "' >Fill</div>")
      .append("<h1> Output </h1>")
      .append("<div id='" + selector.generate + "' class='tool'>Create Image</div>")
      .append("<ol id='" + selector.generatedlist + "'></ol>");

    this.$toolbox.append('<div class="column"></div>')
    $(this.id + " .column:nth(1)")
      .append("<h1>Configuration</h1>")
      .append("<h1>Dimensions </h1>")
      .append("<div id='" + selector.dimensions + "'></div>");

    
    
} 
CPE.toolbox(customRender);
CPE.start(10, 10, 40);

console.log(CPE);