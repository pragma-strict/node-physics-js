
/*

TODO:
- Node should be an actual class and there should be a separate class to handle the graph. Right now node.js does both. 
- The physics node should probably outsource all of its physics to physics.js by just calling the basic generic functions provided there.
- Generally, the "plant tree" thing should be decoupled from the idea of a node. 
- Implement connections between nodes
- Implement collisions so that nodes can collide with the connectors between other nodes. A "ground" can then be formed as a connection between two massive nodes.

Notes on coordinate spaces:
Everything is calculated and handled in "World space".
World space is a coordinate plane of the same size as screen space (1:1 pixels) but translated by some x offset and y offset.
World space coordinates are translated back into screen space only when everything is drawn.

*/

var cnv;

var isPlaying = true;
var mouseIsPressed = false;

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
	drawFrame();
}


function drawFrame()
{
  background(BG_COL);
  drawGridPixelFromWorldCoordinates(convertScreenToWorldCoordinates([mouseX, mouseY]), BG_COL_SHADE_1); // draw hovered pixel
  drawGridLines();
  button_draw(restartButton);

  strokeWeight(0);
  fill(0);
  text(((mouseX - gridOrigin.x) + ", " + (mouseY - gridOrigin.y)), mouseX, mouseY);

  if(isPlaying)
  {
    tickPhysics();
  }
}


// Ticks all the physics things
function tickPhysics()
{
  graph.tick(1/getFrameRate());
}

function draw()
{
  drawFrame();
  renderNodeInspector(graph.selected);

  // Mouse dragging logic
  if(!button_checkMouseOver(restartButton) && mouseIsPressed)
  {
    var dx = mouseX - pmouseX; // change in x
    var dy = mouseY - pmouseY; // change in y
    gridOrigin.x += dx;
    gridOrigin.y += dy;
  }

  graph.render(gridOrigin);
}


function mousePressed()
{
  mouseIsPressed = true;  // log mouse press

  if(button_checkMouseOver(restartButton))  // button - restart sim
  {
    this.graph = new Graph();
  }


  var mousePosInWorldSpace = convertScreenToWorldCoordinates(createVector(mouseX, mouseY));
  graph.updateSelected(mousePosInWorldSpace);
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
    //
  }
  if(key == 'a')
  {
    let mousePosInWorldSpace = convertScreenToWorldCoordinates(createVector(mouseX, mouseY));
    graph.addNode(mousePosInWorldSpace);
  }
}