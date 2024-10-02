
/* 
    Edges maintain references to two nodes and apply forces on them in order to keep them a fixed distance apart

    TODO:
        - May want to consider calculating actual edge length only once and storing it.
*/
class Edge{
    constructor(n1, n2, rigidity){
        this.n1 = n1;
        this.n2 = n2;
        this.targetLength = n1.position.dist(n2.position);
        this.rigidity = rigidity;
        this.damping = 75; // Fraction of force lost as if due to friction or drag
        this.netForceMag = 0;
        
        this.connectNodes();

        // To be deprecated
        // this.n1TargetAngle = n1.getReferenceAngle(n2.position) - n1.rotation;
        // this.n2TargetAngle = n2.getReferenceAngle(n1.position) - n2.rotation;
        // this.n1BaseAngle = 0;   // Added to the calculated angle to handle angles > PI and < -PI
        // this.n2BaseAngle = 0;
        // this.n1ReferenceAngle = this.n1TargetAngle;     // Angle in the range -PI < angle < PI
        // this.n2ReferenceAngle = this.n2TargetAngle;
        // this.n1Angle = this.n1TargetAngle;  // The actual angle to use
        // this.n2Angle = this.n2TargetAngle;
        // this.n1AngularDisplacement = 0;     // The difference between the target angle and the actual angle
        // this.n2AngularDisplacement = 0;
    }


    // Connect incident nodes by updating their properties i.e. add the edge and relative angles to them 
    connectNodes(){
        this.n1.addEdge(this);
        this.n2.addEdge(this);
        
        // Set up relative edge angle(s) on n1
        if(this.n1.getEdgeCount() > 0){
            let n1RelativeAngle = this.n1.getRelativeAngleToNode(this.n1.edges[0].getIncidentNode(this.n1))
            this.n1.edgeTargetAngles.push(n1RelativeAngle);
            this.n1.incidentNodeForces.push(createVector(0, 0));
            this.n1.edgeCurrentAngles.push(0);
        }

        // Set up relative edge angle(s) on n2
        if(this.n2.getEdgeCount() > 0){
            let n2RelativeAngle = this.n2.getRelativeAngleToNode(this.n2.edges[0].getIncidentNode(this.n2))
            this.n2.edgeTargetAngles.push(n2RelativeAngle);
            this.n2.incidentNodeForces.push(createVector(0, 0));
            this.n2.edgeCurrentAngles.push(0);
        }
    }


    // Return the node opposite the given one, or false if the given node isn't from the edge
    getIncidentNode(node){
        if(node === this.n1){
            return this.n2;
        }
        if(node === this.n2){
            return this.n1;
        }
        return false;
    }


    // Do physics every frame
    tick(deltaTime){
        // Find force due to springiness of edge
        let lengthError = this.getCurrentLength() - this.targetLength;
        let springForceMag = lengthError * this.rigidity;

        // Find damping force (uses node velocities because it needs to dampen them through application of damp force)
        let vectorBetween = p5.Vector.sub(this.n2.position, this.n1.position).normalize();
        let nodeVelocityDifference = p5.Vector.sub(this.n2.velocity, this.n1.velocity);
        let dampForceMag = vectorBetween.dot(nodeVelocityDifference) * this.damping;
        
        // Accumulate net force
        this.netForceMag = springForceMag + dampForceMag;
        let force = vectorBetween.copy();
        force.setMag(this.netForceMag);
        
        // Apply forces
        this.n1.applyForce(force);
        force.mult(-1);
        this.n2.applyForce(force);
        
        // this.tickAngular();
    }



    // Update base angle, reference angle, current angle and angular displacement for both nodes 
    // updateAngles(){
    //     let newRefAngleN1 = this.n1.getReferenceAngle(this.n2.position) - this.n1.rotation;
    //     if(this.n1ReferenceAngle > PI/2 && newRefAngleN1 < -PI/2){
    //         this.n1BaseAngle += (2 * PI);
    //     }
    //     else if(this.n1ReferenceAngle < -PI/2 && newRefAngleN1 > PI/2){
    //         this.n1BaseAngle -= (2 * PI);
    //     }
    //     this.n1ReferenceAngle = newRefAngleN1;
    //     this.n1Angle = this.n1ReferenceAngle + this.n1BaseAngle;
    //     this.n1AngularDisplacement = this.n1Angle - this.n1TargetAngle;

    //     let newRefAngleN2 = this.n2.getReferenceAngle(this.n1.position) - this.n2.rotation;
    //     if(this.n2ReferenceAngle > PI/2 && newRefAngleN2 < -PI/2){
    //         this.n2BaseAngle += (2 * PI);
    //     }
    //     else if(this.n2ReferenceAngle < -PI/2 && newRefAngleN2 > PI/2){
    //         this.n2BaseAngle -= (2 * PI);
    //     }
    //     this.n2ReferenceAngle = newRefAngleN2;
    //     this.n2Angle = this.n2ReferenceAngle + this.n2BaseAngle;
    //     this.n2AngularDisplacement = this.n2Angle - this.n2TargetAngle;
    // }


    render(originOffset){
        // Determine line colour
        let maxLogForceMag = 10
        let lineColor = color(0, 0, 0)
        let netForceLog = log(abs(this.netForceMag + 1))
        if(this.netForceMag > 0){
            lineColor.setGreen(map(netForceLog, 0, maxLogForceMag, 0, 255))
        }
        else{
            lineColor.setBlue(map(netForceLog, 0, maxLogForceMag, 0, 255))
        }

        // Draw line
        stroke(lineColor);
        strokeWeight(2);

        let begin = createVector(this.n1.position.x + originOffset.x, this.n1.position.y + originOffset.y);
        let end = createVector(this.n2.position.x + originOffset.x, this.n2.position.y + originOffset.y);
        line(begin.x, begin.y, end.x, end.y);

        // Draw forces acting on nodes from edge
        // let force = p5.Vector.sub(this.n2.position, this.n1.position);
        // force.setMag(this.netForceMag);
        // Geometry.drawVector(force, p5.Vector.add(this.n1.position, originOffset), RED);
        // force.mult(-1);
        // Geometry.drawVector(force, p5.Vector.add(this.n2.position, originOffset), RED);

        // Draw target angles from nodes
        // fill(RED);
        // noStroke();
        // text("Target: " + round(this.n1TargetAngle, 2), originOffset.x + this.n1.position.x + 10, originOffset.y + this.n1.position.y - 10);
        // let n1CurrentAngle = this.n1.getReferenceAngle(this.n2.position) - this.n1.rotation;
        // text("Current: " + round(n1CurrentAngle, 2), originOffset.x + this.n1.position.x + 10, originOffset.y + this.n1.position.y + 5);
        // let n1AngularDisplacement = this.n1TargetAngle - n1CurrentAngle;
        // text("Error: " + round(n1AngularDisplacement, 2), originOffset.x + this.n1.position.x + 10, originOffset.y + this.n1.position.y + 20);
    }


    getCurrentLength(){
        return this.n1.position.dist(this.n2.position);
    }





    /* ====================
               OLD
    =====================*/



        /*
        This function is supposed to apply forces to the nodes on each end of the edge in such a way that would 
        help the node reach its target rotation relative to the edge. I'm not really even sure if this makes sense
        since the node should just as well rotate relative to the edge. Only when a node is held still should its
        springiness relative to the edge actually cause a force to be applied to the other node. Need we measure and
        store the rotation of nodes at all or can we just consider the angles of edges relative to each other?
    */
        tickAngular(){
            /*
                Note: Linear force applications are temporarily disabled while I'm debugging the torque. 
                I'm still not really sure what's wrong with it but they shouldn't be going super spinny!
            */        
                /*  =====
                      n1 
                    =====  */
        
                // Find force due to springiness of the node
                let n1SpringTorque = -1 * this.n1AngularDisplacement * this.n1.angularRigidity;
        
                // Find damping force
                let n1DampingDirection = this.n1.velocity.dot(this.n1Angle + PI / 2) >= 0 ? -1 : 1;
                let n1DampingForce = this.n1.angularDampingFactor * n1DampingDirection;
                let n1Torque = n1SpringTorque + n1DampingForce;
        
                // Apply torque to n1
                // this.n1.applyTorque(n1Torque);
        
                // Calculate and apply equal and opposite force to n2
                let n2ForceMag = abs(n1Torque) / this.getCurrentLength() * 1500;
                let n2ForceAngle = this.n1AngularDisplacement >= 0 ? this.n1Angle - PI/2 : this.n1Angle + PI/2;
                //this.n2.applyForce(p5.Vector.fromAngle(n2ForceAngle, n2ForceMag));
                // console.log("applying force: " + p5.Vector.fromAngle(n2ForceAngle, n2ForceMag));
        
        
                /*  =====
                      n2 
                    =====  */
        
                // Find force due to springiness of the node
                let n2SpringTorque = -1 * this.n2AngularDisplacement * this.n2.angularRigidity;
        
                // Find damping force
                let n2DampingDirection = this.n2.velocity.dot(this.n2Angle + PI / 2) >= 0 ? -1 : 1;
                let n2DampingForce = this.n2.angularDampingFactor * n2DampingDirection;
                let n2Torque = n2SpringTorque + n2DampingForce;
        
                // // Apply torque to n1
                // this.n2.applyTorque(n2Torque);
        
                // Calculate and apply equal and opposite force to n2
                let n1ForceMag = abs(n2Torque) / this.getCurrentLength() * 1500;
                let n1ForceAngle = this.n2AngularDisplacement >= 0 ? this.n2Angle - PI/2 : this.n2Angle + PI/2;
                //this.n1.applyForce(p5.Vector.fromAngle(n1ForceAngle, n1ForceMag));
            }
}