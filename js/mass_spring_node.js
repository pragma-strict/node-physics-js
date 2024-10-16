
/*
    Specialization of node that stores physics concepts for a mass-spring model.
*/
class MassSpringNode extends Node{
    constructor(index, position, mass, tag = ""){
        super(position);

        // Meta properties
        this.indexInGraph = index;
        this.tag = tag;
        this.bShouldTick = true;

        // Basic material properties
        this.mass = mass;
        this.velocity = createVector(0, 0);
        this.netForce = createVector(0, 0);
        this.prevNetForce = createVector(0, 0);
        this.filterVector = createVector(0, 0);
    
        // Relational properties
        this.edgeCurrentAngles = [];
        this.edgeTargetAngles = [];  // The target angle of each edge relative to the next edge in the list (last edge wraps)
        this.edgeNetForces = [];
                
        this.incidentNodeForces = [];  // The force to apply to each incident node
        
        // Angular material properties
        this.angularRigidity = 50000;

        // Linear material properties
        this.bounciness = 0.4;
        this.dragStrength = 0.8;  // Higher values -> more drag
    }


    // Return a vector with its compressed by ln
    logFilterVectorMag(v){
        return p5.Vector.setMag(v, log(v.mag()));
    }


    // 
    render(gridOrigin, nodeColor){
        super.render(gridOrigin, nodeColor);

        // Render adjacent nodal forces from angular
        // stroke(color(100, 100, 255));
        // strokeWeight(1);
        // for(let i = 0; i < this.edges.length; i++){
        //     let nodeSSPos = p5.Vector.add(this.edges[i].getIncidentNode(this).position, gridOrigin);
        //     let lengthMultiplier = 1;
        //     let forceVectorEndSSPos = p5.Vector.add(nodeSSPos, p5.Vector.mult(this.edgeNetForces[i], lengthMultiplier));
        //     line(nodeSSPos.x, nodeSSPos.y, forceVectorEndSSPos.x, forceVectorEndSSPos.y);
        // }

        // let vectorScaleFactor = 1;

        // // Render the net force
        // stroke(color(100, 100, 255));
        // strokeWeight(2);
        // let nodePosSS = p5.Vector.add(this.position, gridOrigin);
        // let forceVectorEndSS = p5.Vector.add(nodePosSS, p5.Vector.mult(this.netForce, vectorScaleFactor));
        // line(nodePosSS.x, nodePosSS.y, forceVectorEndSS.x, forceVectorEndSS.y);
        
        // let offset = 4;

        // // Render the filter vector
        // stroke(color(200, 0, 0));
        // let filterVectorEndSS = p5.Vector.add(nodePosSS, p5.Vector.mult(this.filterVector, vectorScaleFactor));
        // line(nodePosSS.x - offset, nodePosSS.y, filterVectorEndSS.x - offset, filterVectorEndSS.y);
        
        // // Render the filtered vector
        // stroke(color(50, 200, 50));
        // let finalVectorEndSS = p5.Vector.add(nodePosSS, p5.Vector.mult(this.filterForce(this.netForce, this.filterVector), vectorScaleFactor));
        // line(nodePosSS.x + offset, nodePosSS.y, finalVectorEndSS.x + offset, finalVectorEndSS.y);

        // Render node index or tag
        fill(0);
        strokeWeight(0);
        let textOffset = 15;
        if(this.tag != ""){
            text(this.tag, gridOrigin.x + this.position.x + textOffset, gridOrigin.y + this.position.y + textOffset);
        }
        else{
            text(String(this.indexInGraph), gridOrigin.x + this.position.x + textOffset, gridOrigin.y + this.position.y + textOffset);
        }
    }



    addEdge(edge){
        super.addEdge(edge);
        
        let numEdges = this.edges.length;
        
        // Add a new placeholder element to the target angles list
        this.edgeTargetAngles.push(0);
        this.edgeNetForces.push(createVector(0, 0));
        
        // If there's only one edge, the target angle is trivially TWO_PI so we can return
        if(numEdges == 1){
            this.edgeTargetAngles[0] = TWO_PI;
            return;
        }

        // Assert arrays all the same length
        if(numEdges != this.edgeTargetAngles.length){
            console.log("<!> The edge arrays are not the same length!");
            return;
        }

        // Get positions of the new node (attached to the new edge) and the node attached to the origin edge
        let originEdgeNodePos = this.edges[0].getIncidentNode(this).position;
        let newEdgeNodePos = edge.getIncidentNode(this).position;
        
        // Get angle between origin edge and new edge
        let newEdgeAngleFromOrigin = Geometry.getAngleBetween(this.position, originEdgeNodePos, newEdgeNodePos);
        
        /*=== UPDATE EDGE ORDER MAP ===*/
        
        // Look for the edge to precede the new one based on its angle relative to the origin edge
        let precedingEdgeIndex = 0;
        let newEdgeIndex = 1;

        // Start at 1 because you can't put the new edge before the origin edge. End before last element because that's the new edge that you're comparing with.
        for(let i = 1; i < numEdges - 1; i++){
            // Get angle between origin edge and current edge for comparison
            let currentEdgeAngle = Geometry.getAngleBetween(this.position, originEdgeNodePos, this.edges[i].getIncidentNode(this).position);

            // The new edge needs to come before the current edge in the order
            if(currentEdgeAngle > newEdgeAngleFromOrigin){
                break; // We have found the new index
            }

            precedingEdgeIndex++; // Highest possible value is numEdges - 2
            newEdgeIndex++; // Highest possible value is numEdges - 1
        }
        
        // Shift all edges and targets starting at the new edge index up one place to make room for the new edge
        for(let i = numEdges - 1; i > precedingEdgeIndex + 1; i--){
            this.edges[i] = this.edges[i - 1];
            this.edgeTargetAngles[i] = this.edgeTargetAngles[i - 1];
            this.edgeNetForces[i] = this.edgeNetForces[i - 1];
        }

        // Assign the new edge to the proper spot in the list
        this.edges[newEdgeIndex] = edge;
        let followingEdgeIndex = (newEdgeIndex + 1) % numEdges;
        
        /*=== UPDATE TARGET ANGLE LIST ===*/
        
        let nPrecedingPos = this.edges[precedingEdgeIndex].getIncidentNode(this).position;
        let nFollowingPos = this.edges[followingEdgeIndex].getIncidentNode(this).position;
        let angleBetweenExistingNeighbours = Geometry.getAngleBetween(this.position, nPrecedingPos, nFollowingPos);
        
        // If this is only the second edge, the existing angle should be 2 PI, even though it will be returned as 0
        if(numEdges == 2){
            angleBetweenExistingNeighbours = TWO_PI;
        }
        let angleBetweenNewAndPreceding = Geometry.getAngleBetween(this.position, nPrecedingPos, newEdgeNodePos);
        let fractionOfExistingAngle = angleBetweenNewAndPreceding / angleBetweenExistingNeighbours;

        // Assert fraction okay
        if(fractionOfExistingAngle > TWO_PI || fractionOfExistingAngle < 0){
            console.log("<!> This shouldn't happen. Fraction of existing angle: " + fractionOfExistingAngle);
            return;
        }

        // Assign the updated target angles
        let targetAngleExisting = this.edgeTargetAngles[precedingEdgeIndex];
        let newTargetAnglePreceding = targetAngleExisting * fractionOfExistingAngle;
        let newTargetAngleFollowing = targetAngleExisting - newTargetAnglePreceding;
        this.edgeTargetAngles[precedingEdgeIndex] = newTargetAnglePreceding;
        this.edgeTargetAngles[newEdgeIndex] = newTargetAngleFollowing;

        // console.log("Final target angles: " + this.edgeTargetAngles);
        // for(let i = 0; i < numEdges; i++){
        //     console.log("Final angle between edges " + this.edges[i].uid + " and " + this.edges[(i + 1) % numEdges].uid + ": " + this.edgeTargetAngles[i]);
        // }
        // console.log(" ");
    }



    deleteEdge(edge){
        // Get the index of the edge to delete in all the relevant arrays
        let edgeIndex = this.edges.indexOf(edge);

        // Remove that index from relevant arrays
        if(edgeIndex !== -1){
            this.edgeCurrentAngles.splice(edgeIndex, 1);
            this.edgeTargetAngles.splice(edgeIndex, 1);
            this.edgeNetForces.splice(edgeIndex, 1);
            this.incidentNodeForces.splice(edgeIndex, 1);
        }
        else{
            console.log("<!> Couldn't find edge in node's edge list. Cannot delete properly.");
        }

        super.deleteEdge(edge);
    }



    // Calculate a physics step
    tick(deltaTime){
        super.tick(deltaTime);

        if(this.bShouldTick){
            // Apply acceleration and position
            let acceleration = p5.Vector.div(this.netForce, this.mass);
            this.velocity.add(p5.Vector.mult(acceleration, deltaTime));
            this.position.add(p5.Vector.mult(this.velocity, deltaTime));

            // Clear force for next tick
            this.netForce = createVector();
    
            // Generate a drag force based on velocity
            let drag = this.velocity.copy();
            drag.mult(-1);
            drag.mult(this.dragStrength);
            this.applyForce(drag);
            
            // Apply gravity
            let fGravity = createVector(0, Physics.GRAVITATIONAL_CONSTANT * this.mass);
            this.applyForce(fGravity);

            // Apply bottom boundary
            if(this.position.y > 0){
                this.position.y = 0;
                this.velocity.y *= -this.bounciness;
                this.netForce.y = 0;
            }
        }
    }
    

    tickAngular(deltaTime){
        // Cannot tick angular unless there at least 2 edges
        let numEdges = this.edges.length;
        if(numEdges < 2){
            return;
        }

        // Zero out all net forces
        for(let i = 0; i < numEdges; i++){
            this.edgeNetForces[i] = createVector(0, 0);
        }

        for(let thisEdgeIndex = 0; thisEdgeIndex < numEdges; thisEdgeIndex++){
            let nextEdgeIndex = (thisEdgeIndex + 1) % numEdges;
            let targetAngle = this.edgeTargetAngles[thisEdgeIndex];

            let n1 = this.edges[thisEdgeIndex].getIncidentNode(this);
            let n2 = this.edges[nextEdgeIndex].getIncidentNode(this);
            let n1Pos = n1.position;
            let n2Pos = n2.position;

            // Find current angle and angle error
            console.log("\nAngle between edges " + this.edges[thisEdgeIndex].uid + " and " + this.edges[nextEdgeIndex].uid);
            let currentAngle = Geometry.getAngleBetween(this.position, n1Pos, n2Pos);
            console.log("Current angle: " + currentAngle);
            console.log("Target angle: " + targetAngle);
            let angleError = currentAngle - targetAngle;
            console.log("Angle error: " + angleError);
            let torqueMag = abs(angleError) * this.angularRigidity;

            // Use angular stiffness and reverse torque calculation to find the normal force to apply to each node
            let n1ForceMag = Physics.calculateForceOnArm(torqueMag, this.edges[thisEdgeIndex].getLength());
            let n2ForceMag = Physics.calculateForceOnArm(torqueMag, this.edges[nextEdgeIndex].getLength());

            // Apply the forces, modulated by deltaTime
            console.log("Appying force of " + n1ForceMag + " to n1 and " + n2ForceMag + " to n2");
            
            let e1Dir = p5.Vector.sub(n1Pos, this.position).normalize();
            let e2Dir = p5.Vector.sub(n2Pos, this.position).normalize();
            let n1ForceDir = e1Dir.cross(createVector(0, 0, (angleError > 0 ? -1 : 1)));
            let n2ForceDir = e2Dir.cross(createVector(0, 0, (angleError > 0 ? 1 : -1)));
            let n1Force = p5.Vector.mult(n1ForceDir, n1ForceMag);
            let n2Force = p5.Vector.mult(n2ForceDir, n2ForceMag);
            let thisNodeForce = p5.Vector.div(p5.Vector.add(p5.Vector.mult(n1Force, -1), p5.Vector.mult(n2Force, -1)), 2);

            this.edgeNetForces[thisEdgeIndex].add(n1Force);
            this.edgeNetForces[nextEdgeIndex].add(n2Force);

            console.log(" ");
            console.log("Adding to net force " + thisEdgeIndex + ": " + n1ForceDir);
            console.log("Adding to net force " + nextEdgeIndex + ": " + n2ForceDir);

            n1.applyForce(n1Force);
            n2.applyForce(n2Force);
            this.applyForce(thisNodeForce);
        }
        console.log("Final forces: ");
        for(let i = 0; i < numEdges; i++){
            console.log(String(this.edgeNetForces[i]));
        }
    }


    // 
    applyForce(force){
        if(this.bShouldTick){
            this.netForce.add(force);
        }
    }



    //=== GRAVEYARD ===//

    // Filter a force vector based on a filter vector and return the resulting force.
    // This uses a combination of the filter's direction and magnitude.
    // If the filter's magnitude is zero, it should not be applied at all. 
    // If its direction matches that of the force, it should not be applied at all, regardless of its magnitude.
    // If its direction is opposite to that of the force, its magnitude should be subtracted from that of the force with
    // a hard limit at zero.
    getFilteredVector(v, filterVec, printDebug = false){
        if(printDebug){
            console.log(" ");
            console.log(">>> Filtering force <<<");
            console.log("Input vector: " + v);
            console.log("Filter vector: " + filterVec);
        }
        
        if(v.mag() < 0.000001){
            if(printDebug){
                console.log("Input vector mag is low. Filter disabled.");
                console.log(" ");
            }
            return v;
        }
        
        if(filterVec.mag() < 0.00001){
            if(printDebug){
                console.log("Filter magnitude is low. Filter disabled.");
                console.log(" ");
            }
            return v;
        }

        let magAggressionExp = 8; // Large values suppress the mag coeff more strongly

        let filterMag = filterVec.mag();
        let filterDir = p5.Vector.normalize(filterVec);
        let coeffMagBased = pow(1 - (Math.min(1, filterMag / v.mag())), magAggressionExp);
        let coeffDirBased = (p5.Vector.normalize(v).dot(filterDir) + 1) / 2;
        let coeffTotal = Math.min(1, coeffMagBased + coeffDirBased);
        
        if(printDebug){
            console.log("Filter mag: " + filterMag);
            console.log("Filter dir: " + filterDir);
            console.log("Coeff (mag): " + coeffMagBased);
            console.log("Coeff (dir): " + coeffDirBased);
            console.log("Coeff (total): " + coeffTotal);
            console.log(" ");
        }

        return p5.Vector.mult(v, coeffTotal);
    }
    
}