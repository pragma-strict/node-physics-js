


// Should hold all information about a node but nothing about graphs and no actual physics calculations
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
        this.angularRigidity = 1;
        this.angularDampingFactor = 0.9;    // Values 0-1 where 1 is total damping
        this.netTorque = 0.0;
        this.angularVelocity = 0.0;
        this.bounciness = 0.4;
        this.bShouldTick = true;

        // To be deprecated
        this.rotation = 0.0;
    }


    // Calculate a physics step
    tick(deltaTime){
        if(!this.bShouldTick){
            return;
        }

        // Apply acceleration and position
        let acceleration = p5.Vector.div(this.netForce, this.mass);
        this.velocity.add(p5.Vector.mult(acceleration, deltaTime));
        this.position.add(p5.Vector.mult(this.velocity, deltaTime));

        // Clear net force
        this.netForce = createVector(); 

        // Apply bottom boundary
        if(this.position.y > 0){
            this.position.y = 0;
            this.velocity.y *= -this.bounciness;
            this.netForce.y = 0;
        }

        let fGravity = createVector(0, 9.8 * this.mass);

        // Apply gravity
        this.applyForce(fGravity);

        // Apply perpendicular forces to incident nodes to return their angles to target
        this.edgeTargetAngles.forEach((targetAngle, i) => {
            let otherNode = this.edges[i].getIncidentNode(this);
            let actualAngle = this.getReferenceAngleToNode(otherNode);
            this.edgeCurrentAngles[i] = actualAngle;
            let angleDiff = Geometry.getAngleDifference(targetAngle, actualAngle);
            let forceToApply = Geometry.getPerpendicularVector(this.position, otherNode.position);
            forceToApply.setMag(angleDiff * 100);
            otherNode.applyForce(forceToApply);
            this.incidentNodeForces[i] = forceToApply;
        })

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
        drawVector(this.velocity, p5.Vector.add(gridOrigin, this.position), BLUE);
        
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
            drawVector(force, p5.Vector.add(this.position, gridOrigin), GREEN);
        })
    }

    
    // Add an existing edge
    addEdge(edge){
        this.edges.push(edge);
    }


    // Add a neighbor by creating a new edge
    addIncidentNode(node){

    }

    
    // Maybe fill out later
    calculateTorque(edge){
        
    }


    // getIncidentNodeForce(index){

    // }
    
    
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
        return this.getReferenceAngle(edgeIndex.getIncidentNode(this).position);
    }


    getReferenceAngleToNode(node){
        return Geometry.getReferenceAngle(node.position);
    }


    getEdgeCount(){
        return this.edges.length;
    }
}