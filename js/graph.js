
/* 
    Maintains and manages nodes, edges, and the origin of the world, as well as some UI-related data 
    to support basic interactivity.

    Maybe one day will implement a cool data structure to hold nodes & edges.
*/
class Graph{
    constructor(originVector)
    {
        this.origin = originVector;
        this.nodes = new Array();   // Nodes & edge refs are stored here AND in the nodes & edges themselves
        this.edges = new Array();

        // UI fields        
        this.isDraggingGraph = false;
        this.mouseDownPos = null;   // World space position of mouse click relative to origin
        this.selectedNode = null;  // Node that is currently selected, if there is only one, else null
        this.selectedNodes = [];   // List of nodes that are selected, if any
        this.hoveredNode = null;    // Node that the mouse is over
        this.dragNode = null;   // Node being held / dragged
        this.trackingNode = null;   // Node that the graph repositions itself to track
        this.selectionRadius = 25;
    }
    

    // Either create or find an existing node near a given position. Return the node.
    createOrFindNodeAtPos(pos){
        let nodeNearPos = this.getNodeNearPosition(pos, this.selectionRadius);
        if(nodeNearPos){
            return nodeNearPos;
        }
        else{
            return this.createNode(pos);
        }
    }


    // Either add a node or connect selected to an existing node
    createKeyPressed(pos){
        let node = this.createOrFindNodeAtPos(pos);
        if(this.selectedNode){
            this.createEdge(this.selectedNode, node);
        }
        this.selectNode(node);
    }


    // Add a node to the graph at a given world position
    createNode(pos){
        let newNode = new Node(pos);
        this.nodes.push(newNode);
        return newNode;
    }
    
    
    // Add an edge between two nodes
    createEdge(a, b){
        let newEdge = new Edge(a, b, this.edges.length);
        this.edges.push(newEdge);
        return newEdge;
    }


    // Add an edge between nodes at the given indices
    addEdgeFromIndices(indexA, indexB){
        this.createEdge(this.nodes[indexA], this.nodes[indexB]);
    }


    deleteNode(node){
        // Delete the edges attached to this node
        while(node.edges.length > 0){
            this.deleteEdge(node.edges[0]);
        }

        // Overwrite the node with the last node in the list to avoid having to reindex all the ones that come after
        let lastNodeIndex = this.nodes.length - 1;
        this.nodes[node.indexInGraph] = this.nodes[lastNodeIndex];
        this.nodes[node.indexInGraph].indexInGraph = node.indexInGraph;
        this.nodes.splice(lastNodeIndex, 1);

        // All references to the node should now be removed (once local 'node' goes out of scope), allowing it to be garbage collected
    }


    deleteEdge(edge){
        // Delete edge from the n1 edge list
        let edgeIndexN1 = edge.n1.edges.indexOf(edge);
        if(edgeIndexN1 !== -1){
            edge.n1.edges.splice(edgeIndexN1, 1);
        }
        else{
            console.log("<!> Couldn't find edge in incident node's edge list. Cannot delete properly.");
        }

        // Delete edge from the n2 edge list
        let edgeIndexN2 = edge.n2.edges.indexOf(edge);
        if(edgeIndexN2 !== -1){
            edge.n2.edges.splice(edgeIndexN2, 1);
        }
        else{
            console.log("<!> Couldn't find edge in incident node's edge list. Cannot delete properly.");
        }
        
        // Overwrite the edge with the last edge in the list to avoid having to reindex all the ones that come after
        let lastEdgeIndex = this.edges.length - 1;
        this.edges[edge.indexInGraph] = this.edges[lastEdgeIndex];
        this.edges[edge.indexInGraph].indexInGraph = edge.indexInGraph;
        this.edges.splice(lastEdgeIndex, 1);

        // All references to the edge should now be removed (once local 'edge' goes out of scope), allowing it to be garbage collected
    }


    // Do physics operations every frame
    tick(deltaTime){
        //
    }


    // Draw the graph to the screen
    render(){
        noStroke();

        // Update origin based on tracked node position
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
        for(let i = 0; i < this.selectedNodes.length; i++){
            this.selectedNodes[i].render(this.origin, color(230, 0, 38));
        }

        // Render edges
        for(let i = 0; i < this.edges.length; i++){
            this.edges[i].render(this.origin, color(0));
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
        let nodeNearClick = this.getNodeNearPosition(positionInWorldSpace, this.selectionRadius);

        if(nodeNearClick){
            this.selectNode(nodeNearClick)
        } 
        else{
            this.clearNodeSelection();
        }
    }
    
    
    selectNode(node, multiSelect = false){
        if(keyIsDown(SHIFT) || multiSelect){
            this.selectedNode = null;
            this.selectedNodes.push(node);
        }
        else{
            this.selectedNode = node;
            this.selectedNodes = [node];
        }
    }
    
    
    clearNodeSelection(){
        this.selectedNode = null;
        this.selectedNodes = [];
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
    
    
    mouseReleased(newMousePos){
        // Release dragged node
        if(this.dragNode){
            this.dragNode.bShouldTick = true;
            this.dragNode = null;
            this.dragNodeOrigin = null;
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