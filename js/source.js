
/*

I think I didn't push the function that updates the reference angle properly so you don't get switching between negative and positive. I kind of need that back. 

Roadmap:
- Finish implementing HTML node inspector
- For some reason the canvas is larger than the window
- Make nodes reference edges so that actual traversals can take place
- Make nodes store the relative target angles of each edge
- Make nodes attempt to return edges to target positions by applying forces to incident nodes
- Move some of the node information currently stored in edges onto the nodes
- I think the nodes themselves don't need any notion of rotation. Equal forces will be applied to all edges that are out
  of alignment.

- See bug in the way that angular damping is calculated. Would independently calculating drag help?
- Basically the angular stuff needs a good solid plan and then the plan needs to wipe clean everything that's there.
- Extend the node inspector apply to angles so its properties can be debugged
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

let ID_PARENT = 'p5-canvas-container';
let ID_INSPECTOR = 'p5-node-inspector';

var cnv;

var isPlaying = true;

// var restartButton = null;
// var addButton = null;

let graph;
let inspector;

function setup() {
  initializeP5Canvas();
  // restartButton = button_create(width - (width / 10), height/16, width/14, height/14, "Restart Sim");
  // addButton = button_create(width - (width / 10), height/16 + height/12, width/14, height/14, "Add Cell");
  updateCanvas();
  angleMode(RADIANS);
  
  graph = new Graph(createVector(width/2, height/2));

  inspector = new NodeInspectorUI(ID_INSPECTOR);

  setupGrid();
}


function initializeP5Canvas(){
  //let parentStyle = window.getComputedStyle(document.getElementById(ID_PARENT));
  canvas = createCanvas(innerWidth, innerHeight);
  let originalMainElement = canvas.parent();
  canvas.parent(ID_PARENT);
  originalMainElement.remove();
}


function updateCanvas()
{
  resizeCanvas(innerWidth, innerHeight);
  // var x = windowWidth - width;
	// var y = windowHeight - height;
	// cnv.position(250, 250);
  // button_updatePosition(restartButton, width - (width / 10), height/ 16);
}


function windowResized() {
	updateCanvas();
}


function drawFrame()
{
  background(BG_COL);
  drawGridLines(graph.origin);
  // button_draw(restartButton);

  strokeWeight(0);
  // fill(0);
  // text(((mouseX - graph.origin.x) + ", " + (mouseY - graph.origin.y)), mouseX, mouseY);

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
    graph.addNode(graph.screenToWorldSpace(createVector(mouseX, mouseY)));
  }
}