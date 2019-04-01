
var cnv;
var BACKGROUND_COLOR = [245, 247, 232];

function setup() {
  	cnv = createCanvas(windowWidth, windowHeight);
  	repositionCanvas();
  	angleMode(RADIANS);

  	setupGrid();
  	setupNode();

  	n_divide(rootNode);
  	n_divide(rootNode);
  	n_divide(rootNode);
  	n_divide(rootNode);

  	drawFrame();
}


function repositionCanvas()
{
	var x = windowWidth - width;
	var y = windowHeight - height;
	cnv.position(x, y);
}


function windowResized() {
  	resizeCanvas(windowWidth, windowHeight);
  	repositionCanvas();
  	drawFrame();
}

function drawFrame()
{
	background(BACKGROUND_COLOR);
	drawGridLines();

  	n_drawPixels(rootNode);
  	n_printSingle(rootNode);
  	n_drawTree(rootNode);
}

function draw()
{
}