
/*
    Specialization of node that stores physics concepts for a mass-spring model.
*/
class MassSpringNode extends Node{
    constructor(index, position, mass, tag = ""){
        super(position);

        this.indexInGraph = index;
        this.tag = tag;

        this.mass = mass;
        this.velocity = createVector(0, 0);
        this.netForce = createVector(0, 0);
    
        this.edgeCurrentAngles = [];
        this.edgeTargetAngles = [];  // The target angle of each edge relative to the next edge in the list (last edge wraps)
        this.edgeNetForces = [];
        
        this.incidentNodeForces = [];  // The force to apply to each incident node
        this.netTorque = 0.0;
        this.angularVelocity = 0.0;
        
        this.angularRigidity = 50000;
        this.angularDampingFactor = 0.9;  // Values 0-1 where 1 is total damping

        this.bounciness = 0.4;
        this.dragStrength = 0.8;  // Higher values -> more drag
        
        this.bShouldTick = true;
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


    // TODO: Update previous angles in the target angles array too
    addEdge(edge){
        // console.log(" ");
        // console.log("Adding edge to node " + this.indexInGraph + " >>> Initial status");
        // console.log("Target edges: " + this.edges);
        // console.log("Target angles: " + this.edgeTargetAngles);
        
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
        // console.log("Preceding edge: " + precedingEdgeIndex);
        // console.log("New edge: " + newEdgeIndex);
        // console.log("Following edge: " + followingEdgeIndex);
        
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
        // console.log("angle between preceding and following: " + angleBetweenExistingNeighbours);
        // console.log("angle between preceding and new: " + angleBetweenNewAndPreceding);
        // console.log("Fraction of existing angle: " + fractionOfExistingAngle);

        // Assert fraction okay
        if(fractionOfExistingAngle > TWO_PI || fractionOfExistingAngle < 0){
            console.log("<!> This shouldn't happen.");
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


    // Calculate a physics step
    tick(deltaTime){
        super.tick(deltaTime);

        if(this.bShouldTick){
            // Apply acceleration and position
            let acceleration = p5.Vector.div(this.netForce, this.mass);
            this.velocity.add(p5.Vector.mult(acceleration, deltaTime));
            this.position.add(p5.Vector.mult(this.velocity, deltaTime));
    
            // Clear net force
            this.netForce = createVector(); 
    
            // Generate a drag force based on velocity
            let drag = this.velocity.copy();
            drag.mult(-1);
            drag.mult(this.dragStrength);
            this.applyForce(drag);

            // Apply bottom boundary
            if(this.position.y > 0){
                this.position.y = 0;
                this.velocity.y *= -this.bounciness;
                this.netForce.y = 0;
            }
    
            let fGravity = createVector(0, Physics.GRAVITATIONAL_CONSTANT * this.mass);
    
            // Apply gravity
            this.applyForce(fGravity);
            
            // this.tickAngular(deltaTime);
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
            // console.log("This position: " + this.position);
            // console.log("n1 position: " + n1.position);
            // console.log("n2 position: " + n2.position);
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


    // Calculate torque and apply forces to neighboring nodes
    tickAngularOriginal(deltaTime){
        if(this.getEdgeCount() > 0){
            // let normalTorques = []; // Torques generated by the 'rigidity' of the node
            // let appliedTorques = [];
            let normalTorque = 0;
            let appliedTorque = 0;

            // Loop through all neighbors and find the applied and normal torques
            this.edges.forEach((edge, i) => {
                let otherNode = edge.getIncidentNode(this);
                this.updateAngleToNeighbor(i, otherNode);   // Update relative neighbor angle
                let currentAngle = this.edgeCurrentAngles[i];
                let targetAngle = this.edgeTargetAngles[i];
                let angularDisplacement = Geometry.getAngleDifference(targetAngle, currentAngle);

                // Find the torque generated by the rigidity of the node against this neighbor
                let nTorqueMag = pow(angularDisplacement * this.angularRigidity, 2);
                let nTorqueDir = angularDisplacement > 0 ? 1 : -1;
                let nTorque = nTorqueMag * nTorqueDir;
                // normalTorques.push(nTorque);
                normalTorque += nTorque;
                
                // Find the torque generated by the net force on this neighbors
                let edgeLength = this.edges[i].getCurrentLength();
                /*
                    Note: Here, the force applied by the other node to this node must be derived from its relative velocity. 
                    Consider that when both nodes are moving in the same direction there will be no torque applied.
                */
                let aTorque = Physics.calculateTorque2D(this.position, otherNode.netForce, otherNode.position);
                // appliedTorques.push(aTorque);
                appliedTorque += aTorque.z;
            });

            // Update the net torque by adding the generated and applied torques
            // console.log("applied torque: " + appliedTorque);
            // console.log("normal torque: " + normalTorque);


            // this.edges.forEach((edge, i) => {
            //     let otherNode = edge.getIncidentNode(this);

            //     // Find & apply the forces on neighbors
            //     let neighborForceMag = Physics.calculateForceOnArm(nTorqueMag, edgeLength);
            //     let neighborForce = Geometry.getPerpendicularVector(this.position, otherNode.position);
            //     neighborForce.setMag(nTorqueDir * neighborForceMag);
            //     this.incidentNodeForces[i] = neighborForce;
            //     otherNode.applyForce(neighborForce);
            // });
        }

        // Update rotation on this node (probably calculated wrong)
        // let angularAcceleration = this.netTorque / this.mass;
        // this.angularVelocity += angularAcceleration * deltaTime;
        // this.rotation += this.angularVelocity * deltaTime;
        
        // Clear torque
        // this.netTorque = 0;

        // To apply angular drag to nodes, find the component of their velocity relative to neighbors along the arc prescribed by their edge and use it to generate a force in the opposite direction.
    }


    // 
    applyForce(force){
        if(this.bShouldTick){
            this.netForce.add(force);
        }
    }
    
    
    // 
    applyTorque(force){
        if(this.bShouldTick){
            this.netTorque += force;
        }
    }


    // Updates the angle between the rotation of this node and a neighbor
    updateAngleToNeighbor(edgeIndex, neighborNode){
        let currentAngle = this.edgeCurrentAngles[edgeIndex];
        let newAngle = Geometry.updateAngle(currentAngle, this.getRelativeAngleToNode(neighborNode));
        this.edgeCurrentAngles[edgeIndex] = newAngle;
        return newAngle;
    }


    // Return the force to apply to an incident node
    calcRotationalForceOnNeighbor(neighborNode, currentAngle, targetAngle, index){
        let referenceAngle = this.getReferenceAngleToNode(neighborNode);
        let actualAngle = Geometry.updateAngle(currentAngle, referenceAngle);
        let angularDisplacement = Geometry.getAngleDifference(targetAngle, actualAngle);
        let forceToApply = Geometry.getPerpendicularVector(this.position, neighborNode.position);
        let edgeLength = this.edges[index].getCurrentLength();
        let torqueForceMag = pow(angularDisplacement * this.angularRigidity, 2);
        let torqueForceDirection = angularDisplacement > 0 ? 1 : -1;

        // console.log(currentAngle)
        forceToApply.setMag(torqueForceDirection * Physics.calculateForceOnArm(torqueForceMag, edgeLength));

        this.edgeCurrentAngles[index] = actualAngle;
        this.incidentNodeForces[index] = forceToApply;

        return forceToApply;
    }

}