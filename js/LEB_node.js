

/**
 * A way to specify a strip of points in an LEB node's grid.
 */
// class LEBSubgridStrip{
//     constructor(indexMultiplier, stride){
//         this.indexMultiplier = indexMultiplier;
//         this.stride = stride;
//     }
// }


/*
    Represents a triangular region of space in a 2D LEB hierarchy.
    
    Note: the anchor points a1-7 are the corner points of the hexahedra subgrids of this triangular element.
    They start with a1 at the element's tip and are ordered clockwise around the element's perimeter, ending with
    the only non-perimeter node -- the center node -- a7. a3 is the bottom right corner and a5 is the bottom left.

    Note: a lot of these algorithms refer to left and right and bottom. These are always to be interpreted from a frame of
    reference local to this node where this node's "tip" (a1) is UP. So the left child touches this node along the anchors
    a1, a6, and a5, the right child touches this node along the anchors a1, a2, and a3, and the bottom node touches along
    a5, a4, and a3. 

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
    
        // Subgrid fields (only applies to leaf nodes)
        this.numSubdivisions = 0;
        this.subgridSize = this.numSubdivisions + 2;
        this.subgridTop = new Array(this.subgridSize).fill(null).map(() => new Array(this.subgridSize));
        this.subgridRight = new Array(this.subgridSize).fill(null).map(() => new Array(this.subgridSize));
        this.subgridLeft = new Array(this.subgridSize).fill(null).map(() => new Array(this.subgridSize));

        // Subgrid anchor positions
        this.a1 = this.tipPos;
        this.a2 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength / 2));
        this.a3 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength));
        this.a4 = p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 2));
        this.a5 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength));
        this.a6 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength / 2));
        this.a7 = p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 3));

        // Subgrid anchor positions
        // this.anchors = [
        //     this.tipPos,
        //     p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength / 2)),
        //     p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength)),
        //     p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 2)),
        //     p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength)),
        //     p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength / 2)),
        //     p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 3)),
        // ];

        this.anchors = [
            this.tipPos,
            p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength / 2)),
            p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength / 2)),
            p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 4)),
            p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength)),
            p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 2)),
            p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength)),
        ];

        // Store all nodes in a single array with 3x the number of rows. Subgrid order: top, left, right.
        // This might enable you to do everything from a single loop instead of handling all these copy-paste
        // cases where you're explicitly specifying which subgrid to look at, etc.
        // Use the concepts of masks? In cases where you need to know about subgrids individually you could use
        // masks and otherwise maybe you could do stuff from a loop?
        // This would allow you to store your neighbour adjacencies as pairs of indices without the need to 
        // represent edges explicitly. You'd just have primary and alt pairs that can be accessed as needed
        // depending on the relative neighbour resolution level.
        // let numGridRows = this.subgridSize * 3;
        // let numGridCols = this.subgridSize;
        // this.grid = new Array(numGridRows * numGridCols).fill(null);
        this.grid = new Array(7).fill(null);

        // this.borderStrips = [
        //     new LEBSubgridStrip(0, 1),
        //     new LEBSubgridStrip(0, 1),
        //     new LEBSubgridStrip(0, 1),
        //     new LEBSubgridStrip(0, 1),
        //     new LEBSubgridStrip(0, 1),
        //     new LEBSubgridStrip(0, 1),
        // ];

        this.borderIndices = [
            0, 1, 2, 4, 5, 6
        ];

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

        // For adjacent LEB nodes at the same level
        // Maps from this index to neighbour index
        // Note: the corner points are a special case since they can be shared by up to 7 other LEB nodes. I'm contstraining
        // this to at most 2 other nodes since these are the only cases that correspond to reasonable grid structures. In any
        // case, we can't just map from local index to neighbour index. However, since corners can only meet other corners, there
        // are only 3 cases to distinguish between.
        // I'm constraining to only find shared corner points from LEB nodes that are adjacent (i.e., that share a border on
        // more than one point). Therefore, there are only 2 options (for neighbours at the same level; considering the alt
        // relations gives you another 2 options) because there are only 2 borders that the neighbour can share for a given corner node. 
        // This means that if we keep a notion of mapping between borders instead of just mapping between nodes directly, we get the
        // corner case resolved for us.
        this.edgeAdjacenciesPrimary = [

        ];

        // Might have to store these actually as pairs of origin indices and strides, like [[origin1, stride1], [origin2, stride2]]

        // Adjacent LEB nodes at +1 or -1 levels
        this.edgeAdjacenciesAlt = [

        ];
    }


    /**
     * To do:
     * - Hardcode all indices assuming a num subdivisions of zero. Interpret below accordingly.
     * - Add notion of strips and specify all important ones
     * - Generate mask from strips
     * - During subdivide, delete only internal using a mask
     * - During subdivide, pass border nodes to children directly using hard-coded pairs of strips
     * - Update position from coordinate to be more generalized? Just pass anchor indices instead if possible.
     * - In instantiation, separate node from edge instantiation
     * - In instantiation, add flag for how to handle the center strips. Either you generate them or you
     *   set them directly from neighbour as the first step. Generate for the first child and set for
     *   the second. You'd also generate for the top-most LEBs, so maybe have generate be the default?
     * - In instantiation, instantiate all remaining (as-yet null) nodes using the coordinate-to-position function
     * - Finally, instantiate edges
     */


    subdivide(graph){
        // When num subdivisions == 0, each anchor including internal ones become borders on the
        // subnodes so no need to delete any of them.
        // Delete all interior nodes from graph
        // this.deleteUnsharedGraphNodes(graph, rightNeighbour, leftNeighbour, bottomNeighbour);

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

        // Create children
        this.rightChild = new LEBNode(this.level + 1, this, this.a4, this.hypLength / 2, (this.dirIndex + 3) % 8);
        this.leftChild = new LEBNode(this.level + 1, this, this.a4, this.hypLength / 2, (this.dirIndex + 5) % 8);
        
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

        // this.leftChild.instantiateSubgrids(graph);
        // this.rightChild.instantiateSubgrids(graph);

        // May want to adjust position of node that was previously center node on parent. Maybe not
        // though, as keeping positions the same could aid in stability.

        // let hopefullyRightChild = this.leftChild.findAdjacentElement("left");
        // this.leftChild.deleteUnsharedGraphNodes(graph, null, hopefullyRightChild, null);
        // console.log("Result: " + hopefullyRightChild);
        // if(hopefullyRightChild === this.rightChild){
        //     console.log("GOOD");
        // }
        // else{
        //     console.log("BAD");
        // }
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


    // getOtherChild(child){
    //     if(this.leftChild === child){
    //         return this.rightChild;
    //     }
    //     if(this.rightChild === child){
    //         return this.leftChild;
    //     }
    //     console.log("<!> The child provided to getOtherChild was neither the left or the right child.");
    //     return null;
    // }


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


    instantiateSubgrids(graph){
        // Find neighbouring elements
        let rightNeighbour = this.findAdjacentElement("right");
        let leftNeighbour = this.findAdjacentElement("left");
        let bottomNeighbour = this.findAdjacentElement("bottom");

        // Potential point of confusion below: i is a row index and therefore a y coordinate. j is an column index and therefore
        // an x coordinate. That's why i and j are passed as coordinates in reverse, i.e., (j, i)

        // Generate top subgrid nodes
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(i === 0){
                    this.subgridTop[i][j] = this.getBorderNodeFromNeighbour(0, j, leftNeighbour, rightNeighbour, bottomNeighbour);
                }
                if(j === 0){
                    this.subgridTop[i][j] = this.getBorderNodeFromNeighbour(5, i, leftNeighbour, rightNeighbour, bottomNeighbour);
                }
                if(!this.subgridTop[i][j]){
                    this.subgridTop[i][j] = graph.createNode(this.subgridCoordinateToPosition(this.a1, this.a2, this.a7, this.a6, createVector(j, i)));
                }
            }
        }
        
        // Generate top subgrid edges
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(i > 0){
                    graph.createEdge(this.subgridTop[i - 1][j], this.subgridTop[i][j]);
                }
                if(j > 0){
                    graph.createEdge(this.subgridTop[i][j - 1], this.subgridTop[i][j]);
                }
                // Diagonal edges
                if(i > 0 && j > 0){
                    // graph.createEdge(this.subgridTop[i - 1][j - 1], this.subgridTop[i][j]);
                }
            }
        }

        // Generate right subgrid nodes
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(j === this.subgridSize - 1){
                    this.subgridRight[i][j] = this.getBorderNodeFromNeighbour(1, i, leftNeighbour, rightNeighbour, bottomNeighbour);
                }
                if(i === this.subgridSize - 1){
                    this.subgridRight[i][j] = this.getBorderNodeFromNeighbour(2, j, leftNeighbour, rightNeighbour, bottomNeighbour);
                }
                if(i === 0){
                    this.subgridRight[i][j] = this.subgridTop[this.subgridSize - j - 1][this.subgridSize - 1];
                }
                if(!this.subgridRight[i][j]){
                    this.subgridRight[i][j] = graph.createNode(this.subgridCoordinateToPosition(this.a7, this.a2, this.a3, this.a4, createVector(j, i)));
                }
            }
        }

        // Generate right subgrid edges
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(i > 0){
                    graph.createEdge(this.subgridRight[i - 1][j], this.subgridRight[i][j]);
                }
                if(j > 0){
                    graph.createEdge(this.subgridRight[i][j - 1], this.subgridRight[i][j]);
                }
                // Diagonal edges
                if(i > 0 && j < this.subgridSize - 1){
                    // graph.createEdge(this.subgridRight[i - 1][j + 1], this.subgridRight[i][j]);
                }
            }
        }

        // Generate left subgrid nodes
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(j === 0){
                    this.subgridLeft[i][j] = this.getBorderNodeFromNeighbour(4, i, leftNeighbour, rightNeighbour, bottomNeighbour);
                }
                if(i === this.subgridSize - 1){
                    this.subgridLeft[i][j] = this.getBorderNodeFromNeighbour(3, j, leftNeighbour, rightNeighbour, bottomNeighbour);
                }
                if(i === 0){
                    this.subgridLeft[i][j] = this.subgridTop[this.subgridSize - 1][j];
                }
                if(j === this.subgridSize - 1){
                    this.subgridLeft[i][j] = this.subgridRight[i][0];
                }
                if(!this.subgridLeft[i][j]){
                    this.subgridLeft[i][j] = graph.createNode(this.subgridCoordinateToPosition(this.a6, this.a7, this.a4, this.a5, createVector(j, i)));
                }
            }
        }

        // Generate left subgrid edges
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(i > 0){
                    graph.createEdge(this.subgridLeft[i - 1][j], this.subgridLeft[i][j]);
                }
                if(j > 0){
                    graph.createEdge(this.subgridLeft[i][j - 1], this.subgridLeft[i][j]);
                }
                // Diagonal edges
                if(i > 0 && j > 0){
                    // graph.createEdge(this.subgridLeft[i - 1][j - 1], this.subgridLeft[i][j]);
                }
            }
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


    // Return true only if this LEB node has no children
    isLeaf(){
        return !this.rightChild && !this.leftChild;
    }


    // The border index is in the range [0, 5] where b0 is between a1 and a2, b1 is between a2 and a3, etc.
    // The node index is in the range [0, subgridSize] and specifies which node along the border edge you're looking for.
    // These node indices are ordered from low to high according to the neighbouring column or row indices they correspond to.
    // This also takes some precomputed LEB neighbours to save having to find them here. Pass null if they don't exist.
    // Returns null if there is no neighbour that stores this vertex.
    getBorderNodeFromNeighbour(borderIndex, nodeIndex, leftNeighbour, rightNeighbour, bottomNeighbour){
        switch(borderIndex){
            // Right neighbour
            case 0:
                if(rightNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, rightNeighbour);
                }
                else if(nodeIndex === 0 && leftNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, leftNeighbour);
                }
                break;
            case 1:
                if(rightNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, rightNeighbour);
                }
                else if(nodeIndex === (this.subgridSize - 1) && bottomNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, bottomNeighbour);
                }
                break;

            // Bottom neighbour
            case 2:
                if(bottomNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, bottomNeighbour);
                }
                else if(nodeIndex === (this.subgridSize - 1) && rightNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, rightNeighbour);
                }
                break;
            case 3:
                if(bottomNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, bottomNeighbour);
                }
                else if(nodeIndex === 0 && leftNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, leftNeighbour);
                }
                break;
            
            // Left neighbour
            case 4:
                if(leftNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, leftNeighbour);
                }
                else if(nodeIndex === (this.subgridSize - 1) && bottomNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, bottomNeighbour);
                }
                break;
            case 5:
                if(leftNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, leftNeighbour);
                }
                else if(nodeIndex === 0 && rightNeighbour){
                    return this.getBorderFromKnownNeighbour(borderIndex, nodeIndex, rightNeighbour);
                }
                break;
        }
        console.log("<!> Index " + nodeIndex + " out of range or relevant neighbour(s) are null.");
        return null;
    }


    // See getBorderFromNeighbour
    // Neighbour is the left, right, or bottom LEB neighbour corresponding to the index. Assumed to be non-null.
    getBorderFromKnownNeighbour(borderIndex, nodeIndex, neighbour){
        switch(borderIndex){
            // Right neighbour
            case 0:
                if(neighbour.level === this.level){
                    return neighbour.subgridTop[nodeIndex][0];
                }
                else if(neighbour.level === this.level + 1){
                    return subgridLeft[this.subgridSize - 1][nodeIndex];
                }
                break;
            case 1:
                if(neighbour.level === this.level){
                    return neighbour.subgridLeft[nodeIndex][0];
                }
                else if(neighbour.level === this.level + 1){
                    return subgridRight[this.subgridSize - 1][nodeIndex];
                }
                break;
            
            // Bottom neighbour
            case 2:
                if(neighbour.level === this.level){
                    return neighbour.subgridLeft[this.subgridSize - 1][this.subgridSize - 1 - nodeIndex];
                }
                else if(neighbour.level === this.level - 1){
                    return subgridRight[nodeIndex][this.subgridSize - 1];
                }
                break;
            case 3:
                if(neighbour.level === this.level){
                    return neighbour.subgridRight[this.subgridSize - 1][this.subgridSize - 1 - nodeIndex];
                }
                else if(neighbour.level === this.level - 1){
                    return subgridRop[0][nodeIndex];
                }
                break;

            // Left neighbour
            case 4:
                if(neighbour.level === this.level){
                    return neighbour.subgridRight[this.subgridSize - 1][nodeIndex];
                }
                else if(neighbour.level === this.level + 1){
                    return subgridTop[this.subgridSize - 1][this.subgridSize - 1 - nodeIndex];
                }
                break;
            case 5:
                if(neighbour.level === this.level){
                    return neighbour.subgridTop[this.subgridSize - 1][nodeIndex];
                }
                else if(neighbour.level === this.level + 1){
                    return subgridRight[this.subgridSize - 1][this.subgridSize - 1 - nodeIndex];
                }
                break;
            default:
                console.log("<!> This should never happen.");
                return null;
        }
    }


    // 
    render(gridOrigin, drawColor){
        // // Get the outer points of the LEB triangle
        // let p1 = p5.Vector.add(gridOrigin, this.tipPos);
        // let p2 = p5.Vector.add(gridOrigin, p5.Vector.add(this.tipPos, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength)));
        // let p3 = p5.Vector.add(gridOrigin, p5.Vector.add(this.tipPos, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength)));
        
        // // Draw the triangle
        // noFill();
        // strokeWeight(2);
        // stroke(drawColor);
        // triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

        // // Get the halfway points to be the corners of the hex subregions
        // let numSubdivisions = 2;
        // let p1p2Center = p5.Vector.add(p1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength / 2));
        // let p1p3Center = p5.Vector.add(p1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength / 2));
        // let p2p3Center = p5.Vector.add(p2, p5.Vector.rotate(this.dirVector, -PI / 2).setMag(this.hypLength / 2));
        // let triCenter = p5.Vector.add(p1, p5.Vector.setMag(this.dirVector, this.sideLength / 2));
        
        // stroke(color(200, 0, 0));
        // for(let i = 0; i < this.numSubdivisions + 2; i++){
        //     for(let j = 0; j < this.numSubdivisions + 2; j++){
        //         let currPoint = this.subgridCoordinateToPosition(p1, p1p2Center, triCenter, p1p3Center, createVector(i, j));
        //         ellipse(currPoint.x, currPoint.y, 3, 3);
        //     }
        // }
    }


    // Get the position of a point on a subgrid based on its corner positions and a coordinate
    // Note: the coordinate is interpreted _as a coordinate_ and not as a row/col index. 
    subgridCoordinateToPosition(topLeft, topRight, bottomRight, bottomLeft, coordinatePair){
        let rightPoints = this.subdivideEdge(topRight, bottomRight, this.numSubdivisions);
        let leftPoints = this.subdivideEdge(topLeft, bottomLeft, this.numSubdivisions);
        let rowPoints = this.subdivideEdge(leftPoints[coordinatePair.y], rightPoints[coordinatePair.y], this.numSubdivisions);
        return rowPoints[coordinatePair.x];
    }


    // Return a list of start and end point pairs that lay along the lines defined by the input points and
    // represent the subdivided shape
    // subdivideHexahedron(p1, p2, p3, p4, numSubdivisions){
    //     let pointPairs = new Array(2 * (numSubdivisions + 2));
    //     let e1Points = this.subdivideEdge(p1, p2, numSubdivisions);
    //     let e2Points = this.subdivideEdge(p2, p3, numSubdivisions);
    //     let e3Points = this.subdivideEdge(p3, p4, numSubdivisions);
    //     let e4Points = this.subdivideEdge(p4, p1, numSubdivisions);
    //     for(let i = 0; i < numSubdivisions + 2; i++){
    //         pointPairs[i] = [e1Points[i], e3Points[e3Points.length - i - 1]];
    //         pointPairs[i + numSubdivisions] = [e2Points[i], e4Points[e4Points.length - i - 1]];
    //     }
    //     return pointPairs;
    // }


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


    // Create and return a list of mass-spring nodes from a list of positions
    generateNodesFromPoints(graph, points){
        let nodes = new Array(points.length);
        points.forEach((p, i) => {
            console.log("Point: " + p);
            nodes[i] = graph.createNode(p);
        });
        return nodes;
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


    // Add nodes and edges to a mass-spring graph within this node
    generateGraphSegment(graph){
        //
    }
}