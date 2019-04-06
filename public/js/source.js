
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

  n_recalculateTorques(rootNode);

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

  strokeWeight(0);
  fill(0);
  text(((mouseX - GRID_X_OFFSET) + ", " + (mouseY - GRID_Y_OFFSET)), mouseX, mouseY);

  //n_drawPixels(rootNode);
  n_drawTree(rootNode);
}
var p1 = null;
var p2 = null;

function draw()
{

  drawFrame();
  renderNodeInspector(selectedNode);

  /**             // Point comparison utility
  stroke(RED);
  strokeWeight(8);
  if(p1 != null)
  {
    point(p1[X], p1[Y]);
  }
  if(p2 != null)
  {
    point(p2[X], p2[Y]);
  }
  if(p1 != null && p2 != null)
  {
    noStroke();
    fill(0);
    text(calculateAngle(p1, p2), p1[X] + 5, p2[X] + 5);
  }
  **/
}


function mousePressed()
{
  /**     // Point comparison utility
  if(p1 == null)
  {
    p1 = [mouseX, mouseY];
  }
  else if(p2 == null)
  {
    p2 = [mouseX, mouseY];
  }
  else
  {
    p1 = null;
    p2 = null;
  }
  **/
  var mousePosInWorldSpace = convertScreenToWorldCoordinates([mouseX, mouseY]);
  var selection = n_findNodeNearPoint(rootNode, mousePosInWorldSpace, NODE_SIZE);
  if(selection != null)
  {
    selectedNode = selection;
  }
}