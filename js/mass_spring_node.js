
/*
    Specialization of node that stores physics concepts for a mass-spring model.
*/
class MassSpringNode extends Node{
    constructor(position, mass){
        super(position);

        this.mass = mass;
        this.velocity = createVector(0, 0);
        this.netForce = createVector(0, 0);
        
        this.edgeCurrentAngles = [];
        this.edgeTargetAngles = []; // To find and maintain the relative angles of edges to each other
        
        this.incidentNodeForces = [];   // The force to apply to each incident node
        this.netTorque = 0.0;
        this.angularVelocity = 0.0;
        
        this.angularRigidity = 100;
        this.angularDampingFactor = 0.9;    // Values 0-1 where 1 is total damping

        this.bounciness = 0.4;
        this.dragStrength = 0.8;    // Higher values -> more drag
        
        this.bShouldTick = true;
    }


    // 
    render(gridOrigin, color){
        super.render(gridOrigin, color);
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
        }

        // this.tickAngular(deltaTime);
    }
    

    // Calculate torque and apply forces to neighboring nodes
    tickAngular(deltaTime){
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