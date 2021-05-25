
/*

TODO:
- Node should be an actual class and there should be a separate class to handle the graph. Right now node.js does both. 
- The physics node should probably outsource all of its physics to physics.js by just calling the basic generic functions provided there.
- Generally, the "plant tree" thing should be decoupled from the idea of a node. 

Notes on coordinate spaces:
Everything is calculated and handled in "World space".
World space is a coordinate plane of the same size as screen space (1:1 pixels) but translated by some x offset and y offset.
World space coordinates are translated back into screen space only when everything is drawn.

*/

var cnv;

var X = 0;  // X and Y are used in place of 0 and 1 when accessing the indexes of coordinate pair arrays for clarity.
var Y = 1;

var isPlaying = true;
var mouseIsPressed = false;

var selectedNode = null;
var restartButton = null;
var addButton = null;

let graph = new Graph();

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  repositionCanvas();
  
  restartButton = button_create(width - (width / 10), height/16, width/14, height/14, "Restart Sim");
  addButton = button_create(width - (width / 10), height/16 + height/12, width/14, height/14, "Add Cell");
  angleMode(RADIANS);
  
  setupGrid();
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
  button_updatePosition(restartButton, width - (width / 10), height/ 16);
  button_updatePosition(addButton, width - (width / 10), height/16 + height/12);
	drawFrame();
}


function drawFrame()
{
  background(BG_COL);
  drawGridPixelFromWorldCoordinates(convertScreenToWorldCoordinates([mouseX, mouseY]), BG_COL_SHADE_1); // draw hovered pixel
  drawGridLines();
  button_draw(restartButton);
  button_draw(addButton);

  strokeWeight(0);
  fill(0);
  text(((mouseX - GRID_X_OFFSET) + ", " + (mouseY - GRID_Y_OFFSET)), mouseX, mouseY);

  if(isPlaying)
  {
    tickPhysics();
  }
  // n_drawTree(rootNode);
}


// Ticks all the physics things
function tickPhysics()
{
  graph.tick();
  // n_recalculateTorques(rootNode);
  // n_applyTorques(rootNode);
  // n_updatePositions(rootNode);
}

function draw()
{
  drawFrame();
  // renderNodeInspector(selectedNode);
  stroke(RED);
  strokeWeight(10);

  // Mouse dragging logic
  if(!button_checkMouseOver(restartButton) && mouseIsPressed)
  {
    var dx = mouseX - pmouseX; // change in x
    var dy = mouseY - pmouseY; // change in y
    GRID_X_OFFSET += dx;
    GRID_Y_OFFSET += dy;
  }

  graph.render(createVector(GRID_X_OFFSET, GRID_Y_OFFSET));
}


function mousePressed()
{
  mouseIsPressed = true;  // log mouse press

  if(button_checkMouseOver(restartButton))  // button - restart sim
  {
    // setupNewSimulation();
  }
  else if(button_checkMouseOver(addButton)) // button - add node
  {
    // n_add(rootNode);
  }


  var mousePosInWorldSpace = convertScreenToWorldCoordinates(createVector(mouseX, mouseY));
  var selection = n_findNodeNearPoint(rootNode, mousePosInWorldSpace, NODE_SIZE);
  if(selection != null)
  {
    selectedNode = selection;
    // renderNodeInspector(selectedNode);
  }

  if(mouseButton === RIGHT){
    graph.addNode(mousePosInWorldSpace);
  }
}


function mouseReleased()
{
  mouseIsPressed = false;
}


function keyPressed()
{
  if(key == ' ')
  {
    isPlaying = !isPlaying;
  }
  if(key == 'e')
  {
    tickPhysics();
  }
  if(key == 'd')
  {
    console.log(GRID_X_OFFSET);
    console.log(mouseX - previousMouseX);
  }
  if(key == 'a')
  {
    // n_add(rootNode);
  }
}