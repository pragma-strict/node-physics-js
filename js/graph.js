
// Holds a bunch of nodes and calls functions on them. Maybe one day will implement a cool data structure to hold them.
class Graph{
    constructor(originVector)
    {
        this.origin = originVector;
        this.nodes = new Array();
        this.edges = new Array();
        this.selected = null;   // Node that is selected
        this.hovered = null;    // Node that the mouse is over
        this.dragging = null;   // Node being held / dragged
        this.tracking = null;   // Node that the graph repositions itself to track
        this.selectionRadius = 25;
    }

    
    // Add a node to the graph at a given position unless position is already a node, then join to selected
    addNode(position){
        position = this.getPositionRelativeToGrid(position);
        let nodeNearPosition = this.getNodeNearPosition(position, this.selectionRadius);
        
        // If adding a node near existing node, connect it to selected node
        if(nodeNearPosition){
            if(nodeNearPosition != this.selected){
                // let neighbors = this.getNeighbors(this.selected);
                // if(!neighbors.includes(nodeNearPosition)){
                    this.addEdge(nodeNearPosition, this.selected);
                // }
            }
            this.selected = nodeNearPosition;
        }
        else{
            let newNode = new Node(position, 10);
            this.nodes.push(newNode);
            if(this.selected){
                this.addEdge(this.selected, newNode);
            }
            this.selected = newNode;
        }
    }


    // Add an edge between nodes at the given indices
    addEdgeFromIndices(indexA, indexB){
        this.edges.push([indexA, indexB]);
    }


    // <!> Does not check to make sure nodes are actually part of the graph
    addEdge(a, b){
        let defaultEdgeRigidity = 75;
        this.edges.push(new Edge(a, b, defaultEdgeRigidity));
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

        if(this.tracking){
            this.origin.x = width/2 - this.tracking.position.x;
            this.origin.y = height/2 - this.tracking.position.y;
        }

        // Render nodes
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].render(this.origin, 0);
        }

        // Re-render pre-selected (hovered) node
        if(this.hovered){
            this.hovered.render(this.origin, YELLOW);
        }
        
        // Re-render selected node and neighbors with highlights
        if(this.selected){
            this.selected.render(this.origin,color(230, 0, 38));
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


    getPositionRelativeToGrid(position){
        return createVector(position.x - this.origin.x, position.y - this.origin.y);
    }


    trackSelected(){
        if(this.selected){
            this.tracking = this.selected;
        }
    }


    stopTracking(){
        this.tracking = null;
    }


    // Update the selected node given a worldspace position (does not convert mouse->world space)
    updateSelected(positionInWorldSpace){
        this.selected = this.getNodeNearPosition(positionInWorldSpace, this.selectionRadius)
    }
    
    
    mouseMoved(position){
        let positionInWorldSpace = this.getPositionRelativeToGrid(position);
        this.hovered = this.getNodeNearPosition(positionInWorldSpace, this.selectionRadius);
    }
    
    
    mousePressed(position){
        this.stopTracking();

        let positionInWorldSpace = this.getPositionRelativeToGrid(position);
        this.updateSelected(positionInWorldSpace);

        // Set a node to "dragging" if mouse is over the selected node
        if(this.selected && this.selected === this.hovered){
            this.dragging = this.selected;
            this.dragging.bShouldTick = false;
        }
    }
    
    
    mouseReleased(){
        // Release dragged node
        if(this.dragging){
            this.dragging.bShouldTick = true;
            this.dragging = null;
        }
    }
    
    
    // Either move the "dragging" node or move the graph itself
    mouseDragged(positionDelta){
        if(this.dragging){
            this.dragging.position.add(positionDelta);
        }
        else{
            this.origin.x += positionDelta.x;
            this.origin.y += positionDelta.y;
        }
    }
}