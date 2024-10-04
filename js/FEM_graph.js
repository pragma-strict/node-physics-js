
/* 
    Maintains and manages nodes, edges, and the origin of the world, as well as some UI-related data 
    to support basic interactivity.

    Maybe one day will implement a cool data structure to hold nodes & edges.
*/
class FEMGraph extends Graph{
    constructor(originVector)
    {
        super(originVector);

        // FEM fields
        this.elements = [];
        this.F = [];  // Global (internal) force vector
        this.FExternal = [];  // Global (external) force vector
        this.FNet = []  // Global net force vector
        this.D = [];  // Global displacement vector
        this.V = [];  // Global velocity vector
        this.A = [];  // Global acceleration vector
        this.M = [[]];  // Global mass matrix. Note: a matrix to allow mass distribution between nodes. Diagonal gives lumped mass.
        this.C = [[]];  // Global damping matrix (reduces velocities to simulate energy dissipation)

        //=== SETUP FOR FEM SANDBOX ===//

        // // Create nodes and edges
        // let n1 = this.addNode(createVector(0, 0));
        // let n2 = this.addNode(createVector(100, 0));
        // let n3 = this.addNode(createVector(0, 100));
        // let n4 = this.addNode(createVector(100, 100));

        // this.addEdgeFromIndices(0, 1);
        // this.addEdgeFromIndices(1, 2);
        // this.addEdgeFromIndices(2, 0);
        // this.addEdgeFromIndices(1, 3);
        // this.addEdgeFromIndices(2, 3);

        // // Create elements
        // this.selectedNodes = [n1, n2, n3];
        // this.makeElementFromSelected();
        // this.selectedNodes = [n2, n4, n3];
        // this.makeElementFromSelected();
        // this.selectedNodes = [n1];

        // // Initialize the various arrays and matrices
        // const numDOFs = 8;
        // this.F = new Array(numDOFs).fill(0);
        // this.FExternal = new Array(numDOFs).fill(0);
        // this.FNet = new Array(numDOFs).fill(0);
        // this.M = new Array(numDOFs).fill(0).map(() => new Array(numDOFs).fill(0));
        // for(let i = 0; i < numDOFs; i++){
        //     this.M[i][i] = 1; // Set diagonal to 1 and leave everything else at 0
        // }
        // this.V = new Array(numDOFs).fill(0);
        // this.A = new Array(numDOFs).fill(0);
    }
    
    
    // Either add a node or connect selected to an existing node
    createKeyPressed(pos){
        let originalNumNodes = this.nodes.length;
        super.createKeyPressed(pos);
        if(this.nodes.length > originalNumNodes){
            this.F = this.F.concat([0, 0]);
        }
    }


    // Add a node to the graph at a given world position
    createNode(pos){
        let newNode = new FEMNode(pos, this.nodes.length);
        this.nodes.push(newNode);
        return newNode;
    }


    makeElementFromSelected(){
        // Validate selection
        if(this.selectedNodes.length != 3){
            console.log("Can only make elements from triangular selections");
            return;
        }

        this.elements.push(new FEMElementTri(this.selectedNodes[0], this.selectedNodes[1], this.selectedNodes[2]));
    }


    cycleNodeConstraintType(){
        // Update hovered node
        if(this.hoveredNode){
            this.hoveredNode.cycleConstraintType();
        }
    }


    tick(deltaTime){
        let res = super.tick(deltaTime);

        console.log(" ");
        console.log(" ");
        console.log(" ");
        console.log(">>> Ticking FEM <<<");
        console.log("-------------------");
        console.log(" ");

        if(this.elements.length == 0){
            console.log("<!> Graph has no elements. Nothing to tick.");
            return;
        }

        // Recalculate stiffness for each element according to current node positions
        for(let i = 0; i < this.elements.length; i++){
            let e = this.elements[i];
            e.tick(deltaTime);
        }

        // Assemble global stiffness matrix from each element's local k
        this.compileGlobalStiffnessMatrix();
        // console.log("Global stiffness: ");
        // IOUtils.printMatrix(this.K);

        // Create a global augmented matrix combining K and F
        let aug = LinearAlgebra.augmentMatrix(this.F, this.K);
        console.log("Global augmented: ");
        IOUtils.printMatrix(aug, true);

        // Add boundary conditions according to constraints in each node (constrain K and F via aug)
          // This process returns a vector that maps each original row/col index to its index in the constrained aug (no need to map augmented column)
        let constrainedAugRes = this.constrainGlobalAugmented(aug);
        let constrainedAug = constrainedAugRes[0];
        let constrainedAugMapping = constrainedAugRes[1];
        let numDOFs = constrainedAug.length;
        console.log("Global constrained augmented: ");
        IOUtils.printMatrix(constrainedAug);

        // Run forward elimination on constrained aug
        let feOk = LinearAlgebra.forwardEliminate(constrainedAug);
        if(!feOk){
            console.log("<!> Forward elimination failed.");
            return res;
        }
        // console.log("In REF: ");
        // IOUtils.printMatrix(constrainedAug);
        
        // Run back substitution on constrained aug, passing a displacement vector sized according to the number of unconstrained DOFs
        let constrainedD = new Array(numDOFs);
        let bsOk = LinearAlgebra.backSubstitute(constrainedAug, constrainedD);
        if(!bsOk){
            console.log("<!> Back substitution failed.");
            return res;
        }
        console.log("Displacements (constrained): ");
        IOUtils.printRowVector(constrainedD);

        // Loop through the constrained displacement vector and use the mapping to update the node positions
        for(let i = 0; i < numDOFs; i++){
            // Assume nodes in the node list are indexed the same as node DOFs in K, except that K stores an x and y for each
            let currentNodeIndex = floor(constrainedAugMapping[i] / 2);
            let currentNode = this.nodes[currentNodeIndex];

            // If the mapped (range) index is even, the displacement applies to x
            if(constrainedAugMapping[i] % 2){
                currentNode.position.y += constrainedD[i];
            }
            else{
                currentNode.position.x += constrainedD[i];
            }
        }


        {
            // let f = [0, 0, 1, 1, 0, 0];
            // let d = [0, 0, 0, 0, 0, 0];
            // let aug = this.augmentMatrix(f, e.k);
            // console.log("Augmented: ");
            // IOUtils.printMatrix(aug);
            
            // let constrainedAug = this.removeBoundariesFromAugmented(aug);
            // console.log("Constrained augmented matrix:");
            // IOUtils.printMatrix(constrainedAug);

            // console.log("Reducing to REF...");
            // let feOk = this.forwardEliminate(constrainedAug);
            // if(!feOk){
            //     console.log("<!> Forward elimination failed.");
            //     return;
            // }
            // console.log("REF matrix: ");
            // IOUtils.printMatrix(constrainedAug);

            // let bsOk = this.backSubstitute(constrainedAug, d);
            // if(!bsOk){
            //     console.log("<!> Back substitution failed.");
            //     return;
            // }
            // console.log("d: ");
            // IOUtils.printColumnVector(d);
        }
        return res;
    }



    mousePressed(mousePos){
        super.mousePressed(mousePos);
        
        // If we're holding down control when we start dragging, make it so that we're setting the force on the dragged node
        if(keyIsDown(CONTROL)){
            this.isSettingForceOnDraggedNode = true;
            this.dragNodeOrigin = this.dragNode.position;
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
        }

        super.mouseReleased(newMousePos);
    }


    mouseDragged(newMousePos){
        if(!this.isSettingForceOnDraggedNode){
            super.mouseDragged(newMousePos);
        }
    }


    compileGlobalStiffnessMatrix(){
        const numGlobalDOFs = this.nodes.length * 2;
        this.K = new Array(numGlobalDOFs).fill(0).map(() => new Array(numGlobalDOFs).fill(0));
        const numLocalDOFs = this.elements[0].k.length; // Assume all elements have the same num DOFs (ignoring constraints)
        for(let i = 0; i < this.elements.length; i++){
            console.log("Local stiffness matrix for element " + i + ": ");
            IOUtils.printMatrix(this.elements[i].k, true);
            for(let localRow = 0; localRow < numLocalDOFs; localRow++){
                const globalRow = this.getGlobalFromLocalDOFIndex(this.elements[i], localRow);
                for(let localCol = 0; localCol < numLocalDOFs; localCol++){
                    const globalCol = this.getGlobalFromLocalDOFIndex(this.elements[i], localCol);

                    // Global stiffnesses are the sum of all local stiffnesses. This could be wrong!
                    this.K[globalRow][globalCol] += this.elements[i].k[localRow][localCol];
                }
            }
        }
    }


    // Given an element and a local DOF index, return the global DOF index
    getGlobalFromLocalDOFIndex(element, localIndex){
        let globalDOFIndex = -1;
        switch(localIndex){
            case 0:
                globalDOFIndex = 2 * element.n1.indexInGraph;
                break;
            case 1:
                globalDOFIndex = 2 * element.n1.indexInGraph + 1;
                break;
            case 2:
                globalDOFIndex = 2 * element.n2.indexInGraph;
                break;
            case 3:
                globalDOFIndex = 2 * element.n2.indexInGraph + 1;
                break;
            case 4:
                globalDOFIndex = 2 * element.n3.indexInGraph;
                break;
            case 5:
                globalDOFIndex = 2 * element.n3.indexInGraph + 1;
                break;
            default:
                console.log("<!> Default case hit in local DOF switch.");
        }
        return globalDOFIndex;
    }


    // @param nodeIndex: the index of the node whose global DOF index you want
    // @param y: 0 for x, 1 for y
    // getGlobalDOFIndexFromNode(nodeIndex, y){
    //     return this.nodes[nodeIndex].indexInGraph + y;
    // }


    // Return an array where element 0 is the constrained aug and element 1 is a mapping vector from constrained to original rows
    constrainGlobalAugmented(aug){
        // Calculate the number of constrained DOFs
        let numBoundaries = 0;
        for(let i = 0; i < this.nodes.length; i++){
            if(this.nodes[i].constrainedX){
                numBoundaries++;
            }
            if(this.nodes[i].constrainedY){
                numBoundaries++;
            }
        }
        
        // Create constrained aug matrix
        const n = aug.length;
        const newAug = new Array(n - numBoundaries).fill(0).map(() => new Array(n + 1 - numBoundaries).fill(0));
        let mapping = new Array(n - numBoundaries);
        
        let newRow = 0;
        for(let row = 0; row < n; row++){
            // Figure out whether this row should be copied
            let nodeIndexAtRow = floor(row / 2);
            let shouldCopyRow = true;
            
            // If this row is for an X DOF and this node is constrained on X, exclude the row
            if(row % 2 == 0 && this.nodes[nodeIndexAtRow].constrainedX){
                shouldCopyRow = false;
            }
            
            // If this row is for a Y DOF and this node is constrained on Y, exclude the row
            if(row % 2 == 1 && this.nodes[nodeIndexAtRow].constrainedY){
                shouldCopyRow = false;
            }
            
            if(shouldCopyRow){
                let newCol = 0;
                for(let col = 0; col < n; col++){
                    // Figure out whether this column should be copied
                    let nodeIndexAtCol = floor(col / 2);
                    let shouldCopyCol = true;
                    
                    // If this col is for an X DOF and this node is constrained on X, exclude the col
                    if(col % 2 == 0 && this.nodes[nodeIndexAtCol].constrainedX){
                        shouldCopyCol = false;
                    }
                    
                    // If this col is for a Y DOF and this node is constrained on Y, exclude the col
                    if(col % 2 == 1 && this.nodes[nodeIndexAtCol].constrainedY){
                        shouldCopyCol = false;
                    }

                    // Copy the element at [row][col]
                    if(shouldCopyCol){
                        newAug[newRow][newCol] = aug[row][col];
                        mapping[newRow] = row;
                        newCol++;
                    }
                }
                newAug[newRow][newCol] = aug[row][n]; // Add the final augmented element from the original row to this row
                newRow++;
            }
        }
        return [newAug, mapping];
    }


    // removeBoundariesFromAugmented(aug){
    //     const n = aug.length;
    //     const numBoundaries = this.fixedDOFs.length;
    //     const newAug = new Array(n - numBoundaries).fill(0).map(() => new Array(n + 1 - numBoundaries).fill(0));
    //     let newRow = 0;
    //     for(let row = 0; row < n; row++){
    //         let newCol = 0;
    //         if(!this.fixedDOFs.includes(row)){
    //             for(let col = 0; col <= n; col++){
    //                 if(!this.fixedDOFs.includes(col)){
    //                     newAug[newRow][newCol] = aug[row][col];
    //                     newCol++;
    //                 }
    //             }
    //             newRow++;
    //         }
    //     }
    //     return newAug;
    // }



    setNodalForce(node, forceVector){
        this.F[node.indexInGraph * 2] = forceVector.x;
        this.F[node.indexInGraph * 2 + 1] = forceVector.y;
        IOUtils.printRowVector(this.F);
    }


    // solveDisplacement(f, k, i){
    //     initialSum = 0;
    //     for(let j = 0; j < f.length; j++){
    //         if(j != i){
    //             initialSum += k[i][j];
    //         }
    //     }
    //     d = f[i] - 
    // }


    // Draw the graph to the screen
    render(){
        noStroke();

        // Render elements
        for(let i = 0; i < this.elements.length; i++){
            this.elements[i].render(this.origin, color(0, 0, 50, 50));
        }
        
        // Render nodal force vectors
        for(let i = 0; i < this.F.length; i += 2){
            let vecToRender = createVector(this.F[i], this.F[i + 1]);
            if(vecToRender.mag() > 0){
                let currentNode = this.nodes[floor(i / 2)];
                let screenSpaceOrigin = this.worldToScreenSpace(currentNode.position);
                // console.log("Force: " + vecToRender);
                // console.log("Origin: " + screenSpaceOrigin);
                Geometry.drawVector(vecToRender, screenSpaceOrigin, BLUE);
            }
        }

        return super.render();
    }

}