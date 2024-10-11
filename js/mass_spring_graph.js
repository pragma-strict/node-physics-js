
/* 
    A specialization of graph that supports basic mass-spring calculations.
*/
class MassSpringGraph extends Graph{
    constructor(originVector)
    {
        super(originVector);

        this.defaultEdgeRigidity = 5000;
        this.defaultNodeMass = 10;
    }
    

    // Add a node to the graph at a given world position
    createNode(pos, tag = ""){
        let newNode = new MassSpringNode(this.nodes.length, pos, this.defaultNodeMass, tag);
        this.nodes.push(newNode);
        return newNode;
    }


    // Add an edge between two nodes
    createEdge(a, b){
        let newEdge = new MassSpringEdge(a, b, this.defaultEdgeRigidity, this.edges.length);
        this.edges.push(newEdge);
        return newEdge;
    }


    // Run the simulation in node-based mode
    tick(deltaTime){
        super.tick(deltaTime);

        // Tick nodes
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].tick(deltaTime);
        }

        // Tick edges
        for(let i = 0; i < this.edges.length; i++){
            this.edges[i].tick(deltaTime);
        }

        // Perform inter-node collision
        // for(let i = 0; i < this.nodes.length; i++){
        //     for(let j = 0; j < this.nodes.length; j++){
        //         if(i != j){
        //             let n1 = this.nodes[i];
        //             let n2 = this.nodes[j];
        //             let distance = n1.position.dist(n2.position);
        //             if(distance <= (n1.radius + n2.radius)){
        //                 let vectorBetween = p5.Vector.sub(n2.position, n1.position);
        //                 n1.velocity.reflect(vectorBetween);
        //                 n2.velocity.reflect(vectorBetween);
        //             }
        //         } 
        //     }
        // }
    }


    // Draw the graph to the screen
    render(){
        super.render();
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
            
            // If we're holding down control when we start dragging, make it so that we're setting the force on the dragged node
            if(keyIsDown(CONTROL)){
                this.isSettingForceOnDraggedNode = true;
                this.dragNodeOrigin = this.dragNode.position;
            }
        }
        else{
            this.isDraggingGraph = true;
        }
    }
    
    
    mouseReleased(newMousePos){
        // Release dragged node
        if(this.dragNode){
            // Apply force if we're releasing while being in force application mode
            if(this.isSettingForceOnDraggedNode){
                let newMousePosWS = this.screenToWorldSpace(newMousePos);
                let displacement = p5.Vector.sub(newMousePosWS, this.dragNodeOrigin);
                
                // Add the force or, if it's really small, zero it
                if(displacement.mag() > 10){
                    this.setNodalForce(this.dragNode, displacement);
                }
                else{
                    this.setNodalForce(this.dragNode, createVector(0, 0));
                }
                this.isSettingForceOnDraggedNode = false;
            }
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
        
        if(this.dragNode && !this.isSettingForceOnDraggedNode){  // If dragging a node
            this.dragNode.position = newMousePosWS;
        }
        else if(this.isDraggingGraph){  // If dragging graph
            this.origin = p5.Vector.sub(newMousePos, this.mouseDownPos);
        }
    }
}