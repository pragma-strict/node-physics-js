
/*

I think I didn't push the function that updates the reference angle properly so you don't get switching between negative and positive. I kind of need that back. 

Roadmap:
- Add drag for rotational motion (see commend in Node.tick())
- Reintroduce rotation to nodes and store target angles relative to the node rotation rather than relative to global. 
- Map displayed vector lengths non-linearly so large values don't go off the screen but small values are still visible
- Make nodes store the relative target angles of each edge
- Make nodes attempt to return edges to target positions by applying forces to incident nodes
- Move some of the node information currently stored in edges onto the nodes

- Move ticking and associated logic into draw() instead of handling it in drawFrame()
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

Can you simulate a lava lamp?

*/

let ID_PARENT = 'p5-canvas-container';
let ID_INSPECTOR = 'p5-node-inspector';

let canvas;

let isPlaying = false;
let simulationMode = "ms"; // base, ms, fem
let tickDeltaTime = 1/40;

let graph;
let LEBTreeRoot;
let inspector;

function setup() {
    initializeP5Canvas();
    updateCanvas();
    angleMode(RADIANS);

    let dims = createVector(width/2, height/2);
    switch(simulationMode){
        case "base":
        graph = new Graph(dims);
        break;
        case "ms":
        graph = new MassSpringGraph(dims);
        break;
        case "fem":
        graph = new FEMGraph(dims);
        break;
    }

    inspector = new NodeInspectorUI(ID_INSPECTOR);

    setupGrid();

    LEBTreeRoot = new LEBTree(graph);
}


function initializeP5Canvas(){
    //let parentStyle = window.getComputedStyle(document.getElementById(ID_PARENT));
    canvas = createCanvas(windowWidth, windowHeight);
    let originalMainElement = canvas.parent();
    canvas.parent(ID_PARENT);
    originalMainElement.remove();
}


function updateCanvas()
{
    resizeCanvas(innerWidth, innerHeight);
    let x = windowWidth - width;
    let y = windowHeight - height;
    canvas.position(x, y);
    // button_updatePosition(restartButton, width - (width / 10), height/ 16);
}


function windowResized() {
	updateCanvas();
}


function drawFrame()
{
    background(BG_COL);
    drawGridLines(graph.origin);

    strokeWeight(0);
    fill(0);
    textAlign(LEFT);

    // Render the play/pause status
    let displayStatus = "Paused";
    if(isPlaying){
        displayStatus = "Ticking";
    }
    text(displayStatus, 15, height - 25);
}


// Ticks all the physics things
function tickPhysics()
{
    graph.tick(tickDeltaTime);
}


function draw()
{
    if(isPlaying){
        tickPhysics();
    }
    drawFrame();
    graph.render();
    LEBTreeRoot.render(0);
    inspector.updateDOM();
}


function mouseMoved(){
    graph.mouseMoved(createVector(mouseX, mouseY));
}


function mousePressed()
{
    graph.mousePressed(createVector(mouseX, mouseY));
    inspector.setNode(graph.selectedNode);
    return false;
}


function mouseReleased(){
    graph.mouseReleased(createVector(mouseX, mouseY));
    return false;
}


function mouseDragged(){
    graph.mouseDragged(createVector(mouseX, mouseY));
    return false;
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
        drawFrame();
        graph.render();
    }
    if(key == 'd')
    {
        graph.trackSelected();
    }
    if(key == 'a')
    {
        graph.createKeyPressed(graph.screenToWorldSpace(createVector(mouseX, mouseY)));
        inspector.setNode(graph.selectedNode);
    }
    if(key == 's' && simulationMode == "fem"){
        graph.makeElementFromSelected();
    }
    if(key == 'r' && simulationMode == "fem"){
        graph.cycleNodeConstraintType();
    }
    if(key == 's' && simulationMode == "ms"){
        graph.deleteNode(graph.nodes[0]);
    }
}