
/* 
    Maintains and manages nodes, edges, and the origin of the world. 
    Maybe one day will implement a cool data structure to hold nodes & edges.

    TODO:
    - Maybe implement a better traversal to use when ticking nodes
*/
class Graph{
    constructor(originVector)
    {
        this.origin = originVector;
        this.nodes = new Array();   // Nodes & edge refs are stored here AND in the nodes & edges themselves
        this.edges = new Array();

        this.isDraggingGraph = false;
        this.mouseDownPos = null;   // World space position of mouse click relative to origin
        
        this.selectedNode = null;   // Node that is selected
        this.hoveredNode = null;    // Node that the mouse is over
        this.dragNode = null;   // Node being held / dragged
        this.dragNodeOrigin = null;  // Position of dragged node before it was grabbed
        this.trackingNode = null;   // Node that the graph repositions itself to track
        
        this.selectionRadius = 25;
    }

    
    // Add a node to the graph at a given world position unless position is already a node, then join to selected
    addNode(pos){
        let nodeNearPos = this.getNodeNearPosition(pos, this.selectionRadius);
        
        // If adding a node near existing node, connect it to selected node
        if(nodeNearPos){
            if(nodeNearPos != this.selectedNode){
                this.addEdge(nodeNearPos, this.selectedNode);
            }
            this.selectedNode = nodeNearPos;
        }
        else{
            let newNode = new Node(pos, 10);
            this.nodes.push(newNode);
            if(this.selectedNode){
                this.addEdge(this.selectedNode, newNode);
            }
            this.selectedNode = newNode;
        }
    }


    // Add an edge between nodes at the given indices
    addEdgeFromIndices(indexA, indexB){
        this.addEdge(this.nodes[indexA], this.nodes[indexB]);
    }


    // 
    addEdge(a, b){
        if(this.nodes.includes(a) && this.nodes.includes(b)){   // This check is not efficient
            let defaultEdgeRigidity = 75;
            let newEdge = new Edge(a, b, defaultEdgeRigidity);
            this.edges.push(newEdge);
        }
    }


    // Do physics operations every frame
    tick(deltaTime){
        // Tick nodes
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].tick(deltaTime);
        }

        // Tick edges
        for(let i = 0; i < this.edges.length; i++){
            this.edges[i].tick(deltaTime);
        }

        // Perform inter-node collision
        for(let i = 0; i < this.nodes.length; i++){
            for(let j = 0; j < this.nodes.length; j++){
                if(i != j){
                    let n1 = this.nodes[i];
                    let n2 = this.nodes[j];
                    let distance = n1.position.dist(n2.position);
                    if(distance <= (n1.radius + n2.radius)){
                        let vectorBetween = p5.Vector.sub(n2.position, n1.position);
                        n1.velocity.reflect(vectorBetween);
                        n2.velocity.reflect(vectorBetween);
                    }
                } 
            }
        }
    }


    // Draw the graph to the screen
    render(){
        noStroke();

        if(this.trackingNode){
            this.origin.x = width/2 - this.trackingNode.position.x;
            this.origin.y = height/2 - this.trackingNode.position.y;
        }

        // Render nodes
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].render(this.origin, 0);
        }

        // Re-render pre-selected (hovered) node
        if(this.hoveredNode){
            this.hoveredNode.render(this.origin, ORANGE);
        }
        
        // Re-render selected node and neighbors with highlights
        if(this.selectedNode){
            this.selectedNode.render(this.origin, color(230, 0, 38));
        }

        // Render edges
        for(let i = 0; i < this.edges.length; i++){
            this.edges[i].render(this.origin);
        }
    }


    // Naive implementation
    getNodeNearPosition(position, maxDistance){
        for(let i = 0; i < this.nodes.length; i++){
            if(this.nodes[i].position.dist(position) <= maxDistance){
                return this.nodes[i];
            }
        }
        return 0;
    }


    // Naively returns the index of the given node or -1 if node is not in the graph
    getIndexOf(node){
        for(let i = 0; i < this.nodes.length; i++){
            if(node === this.nodes[i]){
                return i;
            }
        }
        return -1;
    }


    // Return all nodes sharing an edge with the node at the given index
    getNeighbors(index){
        let neighbors = new Array();
        for(let i = 0; i < this.edges.length; i++){
            if(this.edges[i][0] === index){
                neighbors.push(this.nodes[this.edges[i][1]]);
            }
            else if(this.edges[i][1] === index){
                neighbors.push(this.nodes[this.edges[i][0]]);
            }
        }
        return neighbors;
    }


    screenToWorldSpace(screenPos){
        return createVector(screenPos.x - this.origin.x, screenPos.y - this.origin.y);
    }


    worldToScreenSpace(worldPos){
        return createVector(worldPos.x + this.origin.x, worldPos.y + this.origin.y);
    }


    trackSelected(){
        if(this.selectedNode){
            this.trackingNode = this.selectedNode;
        }
    }


    stopTracking(){
        this.trackingNode = null;
    }


    // Update the selected node given a worldspace position (does not convert mouse->world space)
    updateSelectedNode(positionInWorldSpace){
        this.selectedNode = this.getNodeNearPosition(positionInWorldSpace, this.selectionRadius);
    }
    
    
    mouseMoved(position){
        let positionInWorldSpace = this.screenToWorldSpace(position);
        this.hoveredNode = this.getNodeNearPosition(positionInWorldSpace, this.selectionRadius);
    }
    
    
    mousePressed(mousePos){
        this.stopTracking();
        this.mouseDownPos = this.screenToWorldSpace(mousePos);
        
        this.updateSelectedNode(this.mouseDownPos);

        if(this.selectedNode){
            this.dragNode = this.selectedNode;
            this.dragNode.bShouldTick = false;
        }
        else{
            this.isDraggingGraph = true;
        }
    }
    
    
    mouseReleased(){
        // Release dragged node
        if(this.dragNode){
            this.dragNode.bShouldTick = true;
            this.dragNode = null;
        }

        if(this.isDraggingGraph){
            this.isDraggingGraph = false;
        }
    }
    
    
    // Either move the "dragging" node or move the graph itself
    mouseDragged(newMousePos){
        let newMousePosWS = this.screenToWorldSpace(newMousePos);
        
        if(this.dragNode){  // If dragging a node
            this.dragNode.position = newMousePosWS;
        }
        else if(this.isDraggingGraph){  // If dragging graph
            this.origin = p5.Vector.sub(newMousePos, this.mouseDownPos);
        }
    }
}