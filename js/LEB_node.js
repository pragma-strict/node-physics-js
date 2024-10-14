
/*
    Represents a triangular region of space in a 2D LEB hierarchy.
    
    Note: a lot of algorithms here are described with directional terms like "up", "down", etc. These are to be interpreted
    within a local reference frame where the triangle is oriented to have left-right symmetry and is pointing upwards. The
    top vertex in this orientation is the "tip". The "left" subgrid is the subdivision region in the bottom left.

*/
class LEBNode{
    constructor(level, parent, tipPos, sideLength, dirIndex){
        // Hierarchy fields
        this.parent = parent;
        this.leftChild = null;
        this.rightChild = null;
        this.level = level;

        // Geometry fields
        this.tipPos = tipPos;
        this.sideLength = sideLength;
        this.hypLength = sqrt(pow(sideLength, 2) + pow(sideLength, 2));
        this.dirIndex = dirIndex;
        this.dirVector = this.dirVectorFromIndex(dirIndex); // Can probably compute dir analytically from the level
    
        // Anchor positions
        this.anchors = new Array(7).fill(null);
        this.updateAnchorPositions(tipPos, this.dirVector);

        // Store all nodes in a single array with 3x the number of rows. Subgrid order: top, left, right.
        this.grid = new Array(7).fill(null);

        // The first element in each pair is the parent node index. The second is the child index.
        this.rightChildNodeMappings = [
            [0, 6],
            [1, 5],
            [3, 1],
            [5, 0],
            [6, 4]
        ];

        // The first element in each pair is the parent node index. The second is the child index.
        this.leftChildNodeMappings = [
            [0, 4],
            [2, 5],
            [3, 2],
            [4, 6],
            [5, 0]
        ];

    }


    /**
     * To do:
        - Anchor positions are only used during generation and probably break when subdividing while not
          in original position. Make anchor positions _relative_ to the tip under no rotation? Somehow
          rigidbody rotation is going to need to be handled here it seems so that subdivisions can happen
          under dynamic positions and deformations.
    */

    render(gridOrigin, drawColor){
        let c1WS = p5.Vector.add(gridOrigin, this.grid[0].position);
        let c2WS = p5.Vector.add(gridOrigin, this.grid[4].position);
        let c3WS = p5.Vector.add(gridOrigin, this.grid[6].position);
        stroke(drawColor);
        strokeWeight(2);
        line(c1WS.x, c1WS.y, c2WS.x, c2WS.y);
        line(c2WS.x, c2WS.y, c3WS.x, c3WS.y);
        line(c1WS.x, c1WS.y, c3WS.x, c3WS.y);
    }


    // The current direction vector (from node 0 to node 5)
    updateAnchorPositions(tipPos, dir){
        this.tipPos = tipPos;
        this.anchors[0] = this.tipPos;
        this.anchors[1] = p5.Vector.add(this.tipPos, p5.Vector.rotate(dir, -PI / 4).setMag(this.sideLength / 2));
        this.anchors[2] = p5.Vector.add(this.tipPos, p5.Vector.rotate(dir, PI / 4).setMag(this.sideLength / 2));
        this.anchors[3] = p5.Vector.add(this.tipPos, p5.Vector.setMag(dir, this.hypLength / 4));
        this.anchors[4] = p5.Vector.add(this.tipPos, p5.Vector.rotate(dir, PI / 4).setMag(this.sideLength));
        this.anchors[5] = p5.Vector.add(this.tipPos, p5.Vector.setMag(dir, this.hypLength / 2));
        this.anchors[6] = p5.Vector.add(this.tipPos, p5.Vector.rotate(dir, -PI / 4).setMag(this.sideLength));
    }


    subdivide(graph){
        // Make sure the node is a leaf
        if(!this.isLeaf()){
            return;
        }
        
        // 
        this.deleteInternalEdges(graph);
        
        // Delete the other edges along the hypotenuse because they need to get nodes inserted in between
        let fifthNode = this.grid[5];
        for(let i = 0; i < fifthNode.edges.length; i++){
            if(fifthNode.edges[i].getIncidentNode(fifthNode) === this.grid[4]){
                graph.deleteEdge(fifthNode.edges[i]);
            }
        }
        
        for(let i = 0; i < fifthNode.edges.length; i++){
            if(fifthNode.edges[i].getIncidentNode(fifthNode) === this.grid[6]){
                graph.deleteEdge(fifthNode.edges[i]);
            }
        }
        
        let currentDirVector = p5.Vector.sub(this.grid[5].position, this.grid[0].position).normalize();
        this.updateAnchorPositions(this.grid[0].position, currentDirVector);

        // Create children
        // console.log("Grid[3]: " + this.grid[3]);
        this.rightChild = new LEBNode(this.level + 1, this, this.anchors[5], this.hypLength / 2, (this.dirIndex + 3) % 8);
        this.leftChild = new LEBNode(this.level + 1, this, this.anchors[5], this.hypLength / 2, (this.dirIndex + 5) % 8);
        
        // Set the border nodes of the right children
        for(let i = 0; i < this.rightChildNodeMappings.length; i++){
            let parentIndex = this.rightChildNodeMappings[i][0];
            let childIndex = this.rightChildNodeMappings[i][1];
            this.rightChild.grid[childIndex] = this.grid[parentIndex];
        }
        
        // Set the border nodes of the left children
        for(let i = 0; i < this.leftChildNodeMappings.length; i++){
            let parentIndex = this.leftChildNodeMappings[i][0];
            let childIndex = this.leftChildNodeMappings[i][1];
            this.leftChild.grid[childIndex] = this.grid[parentIndex];
        }
        
        // Generate the single new internal node of each child (pass internal-only flag)
        this.rightChild.instantiateNodes(graph, true);
        this.leftChild.instantiateNodes(graph, true);
        
        // Generate the final node at index 1 of left child and index 2 of right child
        this.leftChild.grid[1] = graph.createNode(this.leftChild.anchors[1]);
        this.rightChild.grid[2] = graph.createNode(this.rightChild.anchors[2]);
        
        // Connect the child nodes with edges (pass the internal-only flag)
        this.leftChild.instantiateEdges(graph, true);
        this.rightChild.instantiateEdges(graph, true);

        // Generate the final edges. We could do this better by leaning into hardcoding instead of
        // trying to be general since these were actually deleted because they were "internal" to the
        // parent and now we have to recreate them for no reason.
        graph.createEdge(this.grid[0], this.grid[3]);
        graph.createEdge(this.grid[3], this.grid[5]);

        // Right child extra edges
        graph.createEdge(this.rightChild.grid[0], this.rightChild.grid[2]);
        graph.createEdge(this.rightChild.grid[2], this.rightChild.grid[4]);

        // Left child extra edges
        graph.createEdge(this.leftChild.grid[0], this.leftChild.grid[1]);
        graph.createEdge(this.leftChild.grid[1], this.leftChild.grid[6]);
    }


    // Connect all nodes in the grid with edges
    instantiateEdges(graph, internalOnly = false){
        // Internal primary edges
        graph.createEdge(this.grid[3], this.grid[1]);
        graph.createEdge(this.grid[3], this.grid[2]);
        graph.createEdge(this.grid[3], this.grid[5]);
        
        // Internal diagonal edges
        graph.createEdge(this.grid[0], this.grid[3]);
        graph.createEdge(this.grid[1], this.grid[5]);
        graph.createEdge(this.grid[2], this.grid[5]);

        if(internalOnly){
            return;
        }

        // Border edges
        graph.createEdge(this.grid[0], this.grid[1]);
        graph.createEdge(this.grid[0], this.grid[2]);
        graph.createEdge(this.grid[6], this.grid[1]);
        graph.createEdge(this.grid[6], this.grid[5]);
        graph.createEdge(this.grid[4], this.grid[2]);
        graph.createEdge(this.grid[4], this.grid[5]);
    }


    instantiateNodes(graph, internalOnly = false){
        if(internalOnly){
            let internalNodeIndex = 3;
            this.grid[internalNodeIndex] = graph.createNode(this.anchors[internalNodeIndex]);
            return;
        }
        for(let i = 0; i < this.anchors.length; i++){
            this.grid[i] = graph.createNode(this.anchors[i]);
        }
    }


    deleteInternalEdges(graph){
        // Delete edges connected to the central node
        while(this.grid[3].edges.length){
            graph.deleteEdge(this.grid[3].edges[0]);
        }

        // Delete the diagonal from 1 to 5
        for(let i = 0; i < this.grid[1].edges.length; i++){
            if(this.grid[1].edges[i].getIncidentNode(this.grid[1]) === this.grid[5]){
                graph.deleteEdge(this.grid[1].edges[i]);
                break;
            }
        }

        // Delete the diagonal from 2 to 5
        for(let i = 0; i < this.grid[1].edges.length; i++){
            if(this.grid[2].edges[i].getIncidentNode(this.grid[2]) === this.grid[5]){
                graph.deleteEdge(this.grid[2].edges[i]);
                break;
            }
        }
    }


    // Return a list of evenly-spaced vectors on an edge, starting at p1 and ending at p2
    subdivideEdge(p1, p2, numSubdivisions){
        let edge = p5.Vector.sub(p2, p1);
        let edgeStep = p5.Vector.setMag(edge, p5.Vector.mag(edge) / (numSubdivisions + 1));
        let intervalPoints = new Array(numSubdivisions + 2);
        for(let i = 0; i < intervalPoints.length; i++){
            intervalPoints[i] = p5.Vector.add(p1, p5.Vector.mult(edgeStep, i));
        }
        return intervalPoints;
    }


    dirVectorFromIndex(dirIndex){
        switch(dirIndex){
            case 0:
                return createVector(0, 1);
            case 1:
                return createVector(1, 1).normalize();
            case 2:
                return createVector(1, 0);
            case 3:
                return createVector(1, -1).normalize();
            case 4:
                return createVector(0, -1);
            case 5:
                return createVector(-1, -1).normalize();
            case 6:
                return createVector(-1, 0);
            case 7:
                return createVector(-1, 1).normalize();
            default:
                console.log("<!> Invalid direction index '" + dirIndex + "'.");
        }
    }

    
    // Return true only if this LEB node has no children
    isLeaf(){
        return !this.rightChild && !this.leftChild;
    }


    // Return true if the given worldspace coordinates fall within this node. Copy-pasted from
    // chatGPT. Don't ask.
    isPositionWithinWS(pos){
        // Get the current corner positions of the node
        let c1 = this.grid[0].position;
        let c2 = this.grid[4].position;
        let c3 = this.grid[6].position;

        // I think this does the cross product? Somehow of 3 positions?
        function sign(p1, p2, p3) {
            return (p1.x - p3.x) * (p2.y - p3.y) -
                   (p2.x - p3.x) * (p1.y - p3.y);
        }
    
        const d1 = sign(pos, c1, c2);
        const d2 = sign(pos, c2, c3);
        const d3 = sign(pos, c3, c1);
    
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        
        // If the signs are either all positive or all negative, the position is inside
        return !(hasNeg && hasPos);
    }
    

    //=== FUNCTION PURGATORY ===//

    // Get the position of a point on a subgrid based on its corner positions and a coordinate
    // Note: the coordinate is interpreted _as a coordinate_ and not as a row/col index. 
    subgridCoordinateToPosition(topLeft, topRight, bottomRight, bottomLeft, coordinatePair){
        let rightPoints = this.subdivideEdge(topRight, bottomRight, this.numSubdivisions);
        let leftPoints = this.subdivideEdge(topLeft, bottomLeft, this.numSubdivisions);
        let rowPoints = this.subdivideEdge(leftPoints[coordinatePair.y], rightPoints[coordinatePair.y], this.numSubdivisions);
        return rowPoints[coordinatePair.x];
    }

    // Deletes all graph nodes that are part of this LEB element, except the ones that are shared by neighbouring LEB elements.
    // Takes precomputed LEB neighbours to avoid finding them again. These can be null if they don't exist.
    deleteUnsharedGraphNodes(graph, rightNeighbour, leftNeighbour, bottomNeighbour){
        if(!this.isLeaf()){
            // Could update to recursively delete from child elements in the future
            console.log("<!> This is not a leaf; no nodes to delete.");
            return;
        }

        // Delete from the top subgrid
        for(let i = (rightNeighbour ? 1 : 0); i < this.subgridSize; i++){
            for(let j = (leftNeighbour ? 1 : 0); j < this.subgridSize; j++){
                graph.deleteNode(this.subgridTop[i][j]);
            }
        }

        // Delete from left subgrid. Start from 1 because top row already deleted from top subgrid
        for(let i = 1; i < (bottomNeighbour ? this.subgridSize - 1 : this.subgridSize); i++){
            for(let j = (leftNeighbour ? 1 : 0); j < this.subgridSize; j++){
                graph.deleteNode(this.subgridLeft[i][j]);
            }
        }

        // Delete from right subgrid. Start from 1 because top row already delete from top subgrid
        for(let i = 1; i < (bottomNeighbour ? this.subgridSize - 1 : this.subgridSize); i++){
            // Start from 1 here too for same reason
            for(let j = 1; j < (rightNeighbour ? this.subgridSize - 1 : this.subgridSize); j++){
                graph.deleteNode(this.subgridRight[i][j]);
            }
        }
    }
    

    // Traverses the tree and returns another LEBNode element that's acjacent this one in the direction of dirTag where the tag is
    // on of: "left", "right", "bottom". You can check the returned element's level field to check its relative resolution (could
    // be equal, one higher, or one lower).
    findAdjacentElement(dirTag){
        // Early return if this node is root
        if(!this.parent){
            console.log("<!> Cannot find adjacent element of LEB node: parent is null.");
            return null;
        }

        // Do the stuff
        switch(dirTag){
            case "left":
                // Easy case, we're direct neighbours
                if(this.parent.leftChild === this){
                    return this.parent.rightChild;
                }
                else{
                    // Recursive case: we need the left child of the parent's bottom neighbour
                    let parentBottomNeighbour = this.parent.findAdjacentElement("bottom");
                    if(parentBottomNeighbour){
                        return parentBottomNeighbour.leftChild;
                    }
                    return null;
                }
            case "right":
                // Easy case, we're direct neighbours
                if(this.parent.rightChild === this){
                    return this.parent.leftChild;
                }
                else{
                    // Recursive case: we need the right child of the parent's bottom neighbour
                    let parentBottomNeighbour = this.parent.findAdjacentElement("bottom");
                    if(parentBottomNeighbour){
                        return parentBottomNeighbour.rightChild;
                    }
                    return null;
                }
            case "bottom":
                // Get the left child of the parent's right neighbour
                if(this.parent.leftChild === this){
                    let parentRightNeighbour = this.parent.findAdjacentElement("right");
                    if(parentRightNeighbour){
                        return parentRightNeighbour.leftChild;
                    }
                    return null;
                }
                // Get the right child of the parent's left neighbour
                if(this.parent.rightChild === this){
                    let parentLeftNeighbour = this.parent.findAdjacentElement("right");
                    if(parentLeftNeighbour){
                        return parentLeftNeighbour.rightChild;
                    }
                    return null;
                }
            default:
                console.log("Invalid input dirTag to findAdjacentElement: " + dirTag);
                return null;
        }
    }
}