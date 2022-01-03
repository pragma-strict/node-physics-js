
/*
    All information about a node but nothing about graphs and no actual physics calculations

    TODO: 
        - Fix the bug where inspector says current edge angles are NaN when making a triangle
        - Combine edge data into a dictionary so the properties of this class aren't so cluttered
        - Make a dedicated function to calculate angular force magnitudes with a little more complexity
        - Prevent explosions by capping forces applied
        - Add some kind of damping or prevent infinite gliders or mimic conservation of energy in some other way
            - Backwards acceleration?
        - Implement a more standarized unit and scale to help calibrate calculations to realistic levels?
        - Make angular force calculations relative to local node rotation rather than global reference angle.
            - Just make an updated version of the ref angle function that calculates relative to a parameter rather than
              the new (0, 1) vector!
*/
class Node{
    constructor(position, mass){
        this.mass = mass;
        this.edges = [];
        this.edgeTargetAngles = []; // To find and maintain the relative angles of edges to each other
        this.edgeCurrentAngles = [];
        this.incidentNodeForces = [];   // The force to apply to each incident node
        this.radius = 25;
        this.position = position;
        this.velocity = createVector(0, 0);
        this.netForce = createVector(0, 0);
        this.angularRigidity = 100;
        this.angularDampingFactor = 0.9;    // Values 0-1 where 1 is total damping
        this.netTorque = 0.0;
        this.angularVelocity = 0.0;
        this.bounciness = 0.4;
        this.dragStrength = 0.8;    // Higher values -> more drag
        this.bShouldTick = true; 

        // To be deprecated
        this.rotation = 0.0;
    }


    // Calculate a physics step
    tick(deltaTime){
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
    
            let fGravity = createVector(0, 9.8 * this.mass);
    
            // Apply gravity
            this.applyForce(fGravity);
        }


        // Apply perpendicular forces to incident nodes to adjust their relative angles
        this.edgeTargetAngles.forEach((targetAngle, i) => {
            let otherNode = this.edges[i].getIncidentNode(this);
            let currentAngle = this.edgeCurrentAngles[i];
            let forceToApply = this.calcRotationalForceOnNeighbor(otherNode, currentAngle, targetAngle, i);
            otherNode.applyForce(forceToApply);
            this.incidentNodeForces[i] = forceToApply;
        })

        // To apply angular drag to nodes, find the component of their velocity relative to neighbors along the arc prescribed by their edge and use it to generate a force in the opposite direction.

        // Angular stuff - this is probably calculated wrong
        // let angularAcceleration = this.netTorque / this.mass;
        // this.angularVelocity += angularAcceleration * deltaTime;
        // this.rotation += this.angularVelocity * deltaTime;

        // Clear torque
        // this.netTorque = 0;
    }
    
    
    // 
    render(gridOrigin, color){
        noStroke();
        fill(color);
        ellipse(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y, 15, 15);
        Geometry.drawVector(this.velocity, p5.Vector.add(gridOrigin, this.position), BLUE);
        
        // Render collision bubble
        stroke(200);
        strokeWeight(0.3);
        noFill();
        ellipse(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y, this.radius*2, this.radius*2);
        
        // Render line to show rotation
        stroke(color);
        strokeWeight(2);
        let lineBegin = createVector(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y);
        let lineEnd = p5.Vector.fromAngle(this.rotation, 20);
        line(lineBegin.x, lineBegin.y, lineBegin.x + lineEnd.x, lineBegin.y + lineEnd.y);

        // Render incident node forces
        this.incidentNodeForces.forEach((force, i) => {
            let incidentNodePosition = this.edges[i].getIncidentNode(this).position;
            Geometry.drawVector(force, p5.Vector.add(incidentNodePosition, gridOrigin), GREEN);
        })
    }

    
    // Add an existing edge
    addEdge(edge){
        this.edges.push(edge);
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



    // Add a neighbor by creating a new edge
    addIncidentNode(node){

    }

    
    // Maybe fill out later
    calculateTorque(edge){
        
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
    

    // Return the angle between the horizontal, this node, and the given edge
    getEdgeAngle(edgeIndex){
        return this.getReferenceAngle(this.position, edgeIndex.getIncidentNode(this).position);
    }


    getReferenceAngleToNode(node){
        return Geometry.getReferenceAngle(this.position, node.position);
    }


    getEdgeCount(){
        return this.edges.length;
    }
}