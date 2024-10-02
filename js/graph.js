
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

        // UI fields        
        this.isDraggingGraph = false;
        this.mouseDownPos = null;   // World space position of mouse click relative to origin
        this.selectedNode = null;  // Node that is currently selected, if there is only one, else null
        this.selectedNodes = [];   // List of nodes that are selected, if any
        this.hoveredNode = null;    // Node that the mouse is over
        this.dragNode = null;   // Node being held / dragged
        this.dragNodeOrigin = null;  // Position of dragged node before it was grabbed
        this.isSettingForceOnDraggedNode = false;
        this.trackingNode = null;   // Node that the graph repositions itself to track
        this.selectionRadius = 25;
        
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

    
    // Add a node to the graph at a given world position unless position is already a node, then join to selected
    addNode(pos){
        let nodeNearPos = this.getNodeNearPosition(pos, this.selectionRadius);
        
        // If adding a node near existing node, connect it to selected node instead
        if(nodeNearPos){
            if(nodeNearPos != this.selectedNode){
                this.addEdge(nodeNearPos, this.selectedNode);
            }
            this.selectNode(nodeNearPos);
            return null;
        }
        else{
            let newNode = new Node(pos, 10, this.nodes.length);
            this.F = this.F.concat([0, 0]);
            this.nodes.push(newNode);
            if(this.selectedNode){
                this.addEdge(this.selectedNode, newNode);
            }
            this.selectNode(newNode);
            return newNode;
        }
    }


    // Add an edge between nodes at the given indices
    addEdgeFromIndices(indexA, indexB){
        this.addEdge(this.nodes[indexA], this.nodes[indexB]);
    }


    // 
    addEdge(a, b){
        if(this.nodes.includes(a) && this.nodes.includes(b)){   // This check is not efficient
            let defaultEdgeRigidity = 750;
            let newEdge = new Edge(a, b, defaultEdgeRigidity);
            this.edges.push(newEdge);
        }
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


    // Do physics operations every frame
    tick(deltaTime){
        // this.tickFEM(deltaTime);
        this.tickNodeBased(deltaTime);
    }


    tickFEM(deltaTime){
        console.log(" ");
        console.log(" ");
        console.log(" ");
        console.log(">>> Ticking FEM <<<");
        console.log("-------------------");
        console.log(" ");
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
        let aug = this.augmentMatrix(this.F, this.K);
        console.log("Global augmented: ");
        IOUtils.printMatrix(aug, true);

        // Add boundary conditions according to constraints in each node (constrain K and F via aug)
          // This process returns a vector that maps each original row/col index to its index in the constrained aug (no need to map augmented column)
        let res = this.constrainGlobalAugmented(aug);
        let constrainedAug = res[0];
        let constrainedAugMapping = res[1];
        let numDOFs = constrainedAug.length;
        console.log("Global constrained augmented: ");
        IOUtils.printMatrix(constrainedAug);

        // Run forward elimination on constrained aug
        let feOk = this.forwardEliminate(constrainedAug);
        if(!feOk){
            console.log("<!> Forward elimination failed.");
            return;
        }
        // console.log("In REF: ");
        // IOUtils.printMatrix(constrainedAug);
        
        // Run back substitution on constrained aug, passing a displacement vector sized according to the number of unconstrained DOFs
        let constrainedD = new Array(numDOFs);
        let bsOk = this.backSubstitute(constrainedAug, constrainedD);
        if(!bsOk){
            console.log("<!> Back substitution failed.");
            return;
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


    // Performs forward eliminaiton on an augmented matrix to convert it into REF. Return false if failed.
    forwardEliminate(m){
        const n = m.length; // The number of rows
        
        // Loop through the pivot indices
        for(let pivot = 0; pivot < n - 1; pivot++){ // Go to second-last row because you're zeroing the one below this
            
            // If the pivot is zero, swap rows in the matrix until there's a non-zero element on each pivot
            // Commented out for now because swapping changes the mapping from row indices to equations (and thus the
            // interpretation of the rows when we apply them to actual displacements)
            // if(m[pivot][pivot] == 0){
            //     console.log("Found zero-pivot: " + pivot + ", attempting to swap with row below...");
                
            //     let swapIndex = pivot;
            //     for(let j = pivot; j < n; j++){
            //         if(m[j][pivot] != 0){
            //             swapIndex = j;
            //             continue;
            //         }
            //     }
            //     if(swapIndex == pivot){
            //         console.log("<!> Unable to resolve zero-pivot by swapping. Exiting early to avoid div by zero.");
            //         return false;
            //     }
            //     else{
            //         console.log("Swapping rows " + pivot + " and " + swapIndex);
            //         this.swapRows(m, pivot, swapIndex);
            //     }
            // }

            if(m[pivot][pivot] == 0){
                console.log("<!> Zero-element in pivot column. Unable to complete forward substitution.")
                return false;
            }

            // For each column, loop through the rows below the pivot index
            for(let row = pivot + 1; row < n; row++){
                // Get the factor which, when multiplied by the current pivot, would make it equal to m[row][pivot]
                const factor = m[row][pivot] / m[pivot][pivot];

                // m[row][pivot] is an element in the column below the current pivot that we're trying to zero out

                // Multiply the entire pivot row by the factor and subtract it from the current row to zero out m[row][pivot]
                // Go all the way to the last column here so our updates get applied to the augmented part too
                let foundNonZero = false;
                for(let col = 0; col <= n; col++){
                    m[row][col] -= factor * m[pivot][col];
                    if(abs(m[row][col]) > 0.00001){
                        foundNonZero = true;
                    }
                }
                if(!foundNonZero){
                    console.log("<!> A row of all zeroes was created, indicating that this system as infinite solutions. Returning.");
                    return false;
                }
            }
        }
        return true;
    }


    // Solves for the unknown vector d based on an REF augmented matrix m. Return false if failed.
    backSubstitute(m, d){
        const n = m.length; // The number of rows

        // Loop through each row, starting from the last (since we need to solve the last ones first)
        for(let row = n - 1; row >= 0; row--){
            d[row] = m[row][n]; // Get the augmented element in this row

            // Subtract all of the solved variables in the row multiplied by their coefficients in m
            for(let solvedRow = row + 1; solvedRow < n; solvedRow++){
                d[row] -= d[solvedRow] * m[row][solvedRow];
            }

            // Handle the case where the coefficient of the unknown is zero (we can't solve the unknown then)
            if(m[row][row] == 0){
                if(m[row][n] != 0){
                    console.log("Found row with diagonal element as zero but the augmented element is non-zero. This indicates an inconsistent system with zero solutions.");
                    return false;
                }
                else{
                    // If both the unknown's coefficient and the augmented element are zero, just set the unknown to zero
                    d[row] = 0;
                }
            }
            else{
                // Divide by the coefficient of the unknown in the current row to get the final value
                d[row] /= m[row][row];
            }
        }
        return true;
    }


    // Swap rows i and j
    swapRows(m, i, j){
        // Validate i
        if(i < 0 || i >= m.length){
            console.log("Input row i (" + i + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate j
        if(j < 0 || j >= m.length){
            console.log("Input row j (" + j + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Create new matrix
        let _m = [];
        for(let currentRow = 0; currentRow < m.length; currentRow++){
            if(currentRow == i){
                _m.push(m[j]);
            }
            else if(currentRow == j){
                _m.push(m[i]);
            }
            else{
                _m.push(m[currentRow]);
            }
        }

        return _m;
    }


    // Multiply row i by non-zero number x
    multiplyRow(m, i, x){
        // Validate i
        if(i < 0 || i >= m.length){
            console.log("Input row i (" + i + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate x
        if(x == 0){
            console.log("The scalar value cannot be zero when multiplying matrix rows.");
            return m;
        }

        // Create new matrix
        let _m = [];
        for(let currentRow = 0; currentRow < m.length; currentRow++){
            if(currentRow == i){
                let newRow = [];
                for(let currentCol = 0; currentCol < m[0].length; currentCol++){
                    newRow.push(m[i][currentCol] * x);
                }
                _m.push(newRow);
            }
            else{
                _m.push(m[currentRow]);
            }
        }

        return _m;
    }


    // Add the row i, scaled by x, to the row j
    addScaledRow(m, i, x, j){
        // Validate i
        if(i < 0 || i >= m.length){
            console.log("Input row i (" + i + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate j
        if(j < 0 || j >= m.length){
            console.log("Input row j (" + j + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate x
        if(x == 0){
            console.log("The scalar value cannot be zero when multiplying matrix rows.");
            return m;
        }

        let scaledRow = [];
        for(let currentCol = 0; currentCol < m[0].length; currentCol++){
            scaledRow.push(m[i][currentCol] * x);
        }

        let summedRow = [];
        for(let currentCol = 0; currentCol < m[0].length; currentCol++){
            summedRow.push(m[j][currentCol] + scaledRow[currentCol]);
        }

        // Create new matrix
        let _m = [];
        for(let currentRow = 0; currentRow < m.length; currentRow++){
            if(currentRow == j){
                _m.push(summedRow);
            }
            else{
                _m.push(m[currentRow]);
            }
        }

        return _m;
    }


    augmentMatrix(f, k){
        let aug = [];
        for(let i = 0; i < k.length; i++){
            let row = [];
            for(let j = 0; j < k[0].length; j++){
                row.push(k[i][j]);
            }
            row.push(f[i]);
            aug.push(row);
        }
        return aug;
    }


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


    // Run the simulation in node-based mode
    tickNodeBased(deltaTime){
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
                console.log("Drag node origin: " + this.dragNodeOrigin);
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