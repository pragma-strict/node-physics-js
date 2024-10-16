
/*

*/
class LEBTree{
    constructor(graph){
        // User interface properties
        this.hoveredNode = null;
        this.selectLevel = 0;
        this.L0Size = 550;
        
        this.rootNodes = [];
        this.graph = graph;

        // this.generate();
    }


    generate(){
        this.rootNodes.push(new LEBNode(0, null, createVector(0, 0), this.L0Size, 3));
        this.rootNodes[0].instantiateNodes(this.graph);
        this.rootNodes[0].instantiateEdges(this.graph);
    }


    // 
    render(drawColor){
        if(this.hoveredNode){
            this.hoveredNode.render(this.graph.origin, color(200, 0, 0));
        }
    }


    tick(deltaTime){
        //
    }


    // Return the node that's at the current selection level and under the mouse, or null if none found
    getNodeUnderMouse(mousePosWS){
        let currentNode = this.rootNodes[0];
        
        // Make sure the mouse is within the root node
        if(!currentNode.isPositionWithinWS(mousePosWS)){
            return null;
        }

        // Get the current node down 
        // while(currentNode.level < this.selectLevel){
        //     if(currentNode.isLeaf()){
        //         // The mouse is over the current node but we still need to go down more and it's a leaf.
        //         return null; // Cannot continue: selection level too deep.
        //     }

        while(!currentNode.isLeaf()){
            if(currentNode.leftChild.isPositionWithinWS(mousePosWS)){
                currentNode = currentNode.leftChild;
            }
            else if(currentNode.rightChild.isPositionWithinWS(mousePosWS)){
                currentNode = currentNode.rightChild;
            }
            else{
                // This is an edge case where the mouse is over the parent node but the child nodes are a bit deformed so the mouse
                // isn't quite over either of them.
                return false;
            }
        }

        return currentNode;
    }


    updateHoveredNode(){
        if(this.rootNodes.length === 0){
            return;
        }
        let mousePosWS = this.graph.screenToWorldSpace(createVector(mouseX, mouseY));
        this.hoveredNode = this.getNodeUnderMouse(mousePosWS);
    }

    
    mouseMoved(position){
        this.updateHoveredNode();
    }
}