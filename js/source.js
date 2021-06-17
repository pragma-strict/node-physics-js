
/*

Roadmap:
- Implement angular tension or whatever
- Implement collisions between nodes and edges
- Make some UI to change the properties of nodes and edges
- Draw weak edges thinner
- Do a thorough debug and optimize pass
- Implement gravity?
- Implement basic "plants" which generate some nodes and grow their edges

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

  let displayStatus = "Paused";
  textAlign(LEFT);
  if(isPlaying)
  {
    displayStatus = "Ticking";
    tickPhysics();
  }
  text(displayStatus, 15, height - 25);
}


// Ticks all the physics things
function tickPhysics()
{
  graph.tick(1/10);
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
  
  // Draw bounds
  stroke(0);
  strokeWeight(2);
  line(-width/2 + gridOrigin.x, 0 + gridOrigin.y, width/2 + gridOrigin.x, 0 + gridOrigin.y);
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