
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
    
        // Subgrid fields (only apply to leaf nodes)
        this.numSubdivisions = 1;    
        this.subgridSize = this.numSubdivisions + 2;
        this.subgrid1 = new Array(this.subgridSize).fill(null).map(() => new Array(this.subgridSize));
        this.subgrid2 = new Array(this.subgridSize).fill(null).map(() => new Array(this.subgridSize));
        this.subgrid3 = new Array(this.subgridSize).fill(null).map(() => new Array(this.subgridSize));

        // Subgrid anchor nodes
        this.a1 = this.tipPos;
        this.a2 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength / 2));
        this.a3 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, -PI / 4).setMag(this.sideLength));
        this.a4 = p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 2));
        this.a5 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength));
        this.a6 = p5.Vector.add(this.a1, p5.Vector.rotate(this.dirVector, PI / 4).setMag(this.sideLength / 2));
        this.a7 = p5.Vector.add(this.a1, p5.Vector.setMag(this.dirVector, this.hypLength / 3));
    }


    subdivide(graph){
        // Delete all interior nodes from graph

        // // For each pair of anchors, check for adjacent elements. Delete final exterior nodes from graph for pairs that
        // // do not have adjacent elements. Technically, nodes will be regenerated in their exact positions, but it's probably
        // // easier to delete them... wait... maybe not actually... because then the default case will be to use existing
        // // exterior nodes because this will always happen except for when generating the outer-most LEB element

        // Create children
        this.leftChild = new LEBNode(this.level + 1, this, this.a4, this.hypLength / 2, (this.dirIndex + 5) % 8);
        this.rightChild = new LEBNode(this.level + 1, this, this.a4, this.hypLength / 2, (this.dirIndex + 3) % 8);
        this.leftChild.instantiateSubgrids(graph);
        this.rightChild.instantiateSubgrids(graph);

        let hopefullyRightChild = this.leftChild.findAdjacentElement("left");
        console.log("Result: " + hopefullyRightChild);
        if(hopefullyRightChild === this.rightChild){
            console.log("GOOD");
        }
        else{
            console.log("BAD");
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


    getOtherChild(child){
        if(this.leftChild === child){
            return this.rightChild;
        }
        if(this.rightChild === child){
            return this.leftChild;
        }
        console.log("<!> The child provided to getOtherChild was neither the left or the right child.");
        return null;
    }


    instantiateSubgrids(graph){
        // Potential point of confusion below: i is a row index and therefore a y coordinate. j is an column index and therefore
        // an x coordinate. That's why i and j are passed as coordinates in reverse, i.e., (j, i)

        // Generate subgrid 1
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                this.subgrid1[i][j] = graph.createNode(this.subgridCoordinateToPosition(this.a1, this.a2, this.a7, this.a6, createVector(j, i)));
                if(i > 0){
                    graph.createEdge(this.subgrid1[i - 1][j], this.subgrid1[i][j]);
                }
                if(j > 0){
                    graph.createEdge(this.subgrid1[i][j - 1], this.subgrid1[i][j]);
                }
                if(i > 0 && j > 0){
                    graph.createEdge(this.subgrid1[i - 1][j - 1], this.subgrid1[i][j]);
                }
            }
        }

        // Generate subgrid 2
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(i > 0){
                    this.subgrid2[i][j] = graph.createNode(this.subgridCoordinateToPosition(this.a7, this.a2, this.a3, this.a4, createVector(j, i)));
                    graph.createEdge(this.subgrid2[i - 1][j], this.subgrid2[i][j]);
                }
                else{
                    this.subgrid2[i][j] = this.subgrid1[this.subgridSize - j - 1][this.subgridSize - 1];
                }
                if(j > 0){
                    graph.createEdge(this.subgrid2[i][j - 1], this.subgrid2[i][j]);
                }
                if(i > 0 && j < this.subgridSize - 1){
                    graph.createEdge(this.subgrid2[i - 1][j + 1], this.subgrid2[i][j]);
                }
            }
        }

        // Generate subgrid 3
        for(let i = 0; i < this.subgridSize; i++){
            for(let j = 0; j < this.subgridSize; j++){
                if(i > 0 && j < this.subgridSize - 1){
                    this.subgrid3[i][j] = graph.createNode(this.subgridCoordinateToPosition(this.a6, this.a7, this.a4, this.a5, createVector(j, i)));
                }
                else if(i == 0){
                    this.subgrid3[i][j] = this.subgrid1[this.subgridSize - 1][j];
                }
                else if(j == this.subgridSize - 1){
                    this.subgrid3[i][j] = this.subgrid2[i][0];
                }
                if(i > 0){
                    graph.createEdge(this.subgrid3[i - 1][j], this.subgrid3[i][j]);
                }
                if(j > 0){
                    graph.createEdge(this.subgrid3[i][j - 1], this.subgrid3[i][j]);
                }
                if(i > 0 && j > 0){
                    graph.createEdge(this.subgrid3[i - 1][j - 1], this.subgrid3[i][j]);
                }
            }
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
    subdivideHexahedron(p1, p2, p3, p4, numSubdivisions){
        let pointPairs = new Array(2 * (numSubdivisions + 2));
        let e1Points = this.subdivideEdge(p1, p2, numSubdivisions);
        let e2Points = this.subdivideEdge(p2, p3, numSubdivisions);
        let e3Points = this.subdivideEdge(p3, p4, numSubdivisions);
        let e4Points = this.subdivideEdge(p4, p1, numSubdivisions);
        for(let i = 0; i < numSubdivisions + 2; i++){
            pointPairs[i] = [e1Points[i], e3Points[e3Points.length - i - 1]];
            pointPairs[i + numSubdivisions] = [e2Points[i], e4Points[e4Points.length - i - 1]];
        }
        return pointPairs;
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