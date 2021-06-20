
/*
TODO:
- I'm in the middle of moving the graph origin vector to the Graph class instead of the pixel_grid file. 
  Pixel_grid functions should now be passed the origin after it is accessed from the Graph.
  There are bugs because the move is not complete. Then the Graph should handle repositioning its own origin when the
  mouse is dragged as well as dragging specific nodes. When nodes are draggable I can continue working with the angles - 
  I just needed some more UI capability to be able to test stuff properly.

Roadmap:
- Implement angular tension or whatever
- Implement collisions between nodes and edges
- Add the ability to click and drag the points around so that you can watch them bounce back
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

var restartButton = null;
var addButton = null;

let graph;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  repositionCanvas();
  
  restartButton = button_create(width - (width / 10), height/16, width/14, height/14, "Restart Sim");
  addButton = button_create(width - (width / 10), height/16 + height/12, width/14, height/14, "Add Cell");
  angleMode(RADIANS);
  
  graph = new Graph(createVector(width/2, height/2));

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
  drawGridLines(graph.origin);
  button_draw(restartButton);

  strokeWeight(0);
  fill(0);
  text(((mouseX - graph.origin.x) + ", " + (mouseY - graph.origin.y)), mouseX, mouseY);

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
  graph.tick(1/5);
}


function draw()
{
  drawFrame();
  renderNodeInspector(graph.selected);
  graph.render();
}


function mouseMoved(){
  graph.mouseMoved(createVector(mouseX, mouseY));
}


function mousePressed()
{
  graph.mousePressed(createVector(mouseX, mouseY));
}


function mouseReleased(){
  graph.mouseReleased();
}


function mouseDragged(){
  graph.mouseDragged(createVector(mouseX - pmouseX, mouseY - pmouseY));
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
    graph.trackSelected();
  }
  if(key == 'a')
  {
    graph.addNode(createVector(mouseX, mouseY));
  }
}