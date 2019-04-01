
var cnv;

function setup() {
  	cnv = createCanvas(windowWidth, windowHeight);
  	repositionCanvas();
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
}

function draw()
{
	background(175, 198, 192);
}