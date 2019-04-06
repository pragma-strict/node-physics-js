
/*
Notes on coordinate spaces:
Everything is calculated and handled in "World space".
World space is a coordinate plane of the same size as screen space (1:1 pixels) but translated by some x offset and y offset.
World space coordinates are translated back into screen space only when everything is drawn.

*/

var cnv;

var X = 0;  // X and Y are used in place of 0 and 1 when accessing the indexes of coordinate pair arrays for clarity.
var Y = 1;

var selectedNode = null;

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
  background(BG_COL);
  drawGridPixelFromWorldCoordinates(convertScreenToWorldCoordinates([mouseX, mouseY]), BG_COL_SHADE_1); // draw hovered pixel
  drawGridLines();

  if(selectedNode != null)  // draw selected node
  {
    drawGridPixelFromWorldCoordinates(selectedNode.pos, BG_COL_SHADE_1);
  }
  strokeWeight(0);
  fill(0);
  text(((mouseX - GRID_X_OFFSET) + ", " + (mouseY - GRID_Y_OFFSET)), mouseX, mouseY);

  //n_drawPixels(rootNode);
  n_drawTree(rootNode);
}

function draw()
{

  drawFrame();
  renderNodeInspector(selectedNode);
}

function mousePressed()
{
  var selection = n_findNodeWithinGridPixel(roundCoordinatesToTile(convertScreenToWorldCoordinates([mouseX, mouseY])), rootNode); 
  if(selection != null)
  {
    selectedNode = selection;
  }
}