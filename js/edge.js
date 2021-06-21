
// Edges maintain references to two nodes and apply forces on them in order to keep them a fixed distance apart
class Edge{
    constructor(n1, n2, rigidity){
        this.n1 = n1;
        this.n2 = n2;
        this.n1TargetAngle = n1.getReferenceAngle(n2.position) - n1.rotation;
        this.n2TargetAngle = n2.getReferenceAngle(n1.position) - n2.rotation;
        this.n1BaseAngle = 0;   // Added to the calculated angle to handle angles > PI and < -PI
        this.n2BaseAngle = 0;
        this.n1ReferenceAngle = this.n1TargetAngle;     // Angle in the range -PI < angle < PI
        this.n2ReferenceAngle = this.n2TargetAngle;
        this.n1Angle = this.n1TargetAngle;  // The actual angle to use
        this.n2Angle = this.n2TargetAngle;
        this.n1AngularDisplacement = 0;     // The difference between the target angle and the actual angle
        this.n2AngularDisplacement = 0;
        this.targetLength = n1.position.dist(n2.position);
        this.rigidity = rigidity;
        this.damping = 15; // Fraction of force lost as if due to friction or drag
        this.netForceMag = 0;
    }

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
        
        this.tickAngular();
    }


    tickAngular(){
        //this.updateAngles();
        
        /*  =====
              n1 
            =====  */

        // Find force due to springiness of the node
        let n1SpringTorque = -1 * this.n1AngularDisplacement * this.n1.angularRigidity;

        // Find damping force
        let n1DampingDirection = this.n1.velocity.dot(this.n1Angle + PI / 2) >= 0 ? -1 : 1;
        let n1Torque = n1SpringTorque * (1 - this.n1.angularDampingFactor) * n1DampingDirection;

        // Apply torque to n1
        this.n1.applyTorque(n1Torque);

        // Calculate and apply equal and opposite force to n2
        let n2ForceMag = abs(n1Torque) / this.getCurrentLength() * 1500;
        let n2ForceAngle = this.n1AngularDisplacement >= 0 ? this.n1Angle - PI/2 : this.n1Angle + PI/2;
        this.n2.applyForce(p5.Vector.fromAngle(n2ForceAngle, n2ForceMag));
        // console.log("applying force: " + p5.Vector.fromAngle(n2ForceAngle, n2ForceMag));


        /*  =====
              n2 
            =====  */

        // Find force due to springiness of the node
        let n2SpringTorque = -1 * this.n2AngularDisplacement * this.n2.angularRigidity;

        // Find damping force
        // There is a bug in the way that damping is done because the angular velocity of n2 says nothing about the actual velocity of n1
        let n2DampingDirection = this.n2.velocity.dot(this.n2Angle + PI / 2) >= 0 ? -1 : 1;
        let n2Torque = n2SpringTorque * (1 - this.n2.angularDampingFactor) * n2DampingDirection;

        // Apply torque to n1
        this.n2.applyTorque(n2Torque);

        // Calculate and apply equal and opposite force to n2
        let n1ForceMag = abs(n2Torque) / this.getCurrentLength() * 1500;
        let n1ForceAngle = this.n2AngularDisplacement >= 0 ? this.n2Angle - PI/2 : this.n2Angle + PI/2;
        this.n1.applyForce(p5.Vector.fromAngle(n1ForceAngle, n1ForceMag));
    }


    // 
    updateAngles(){
        let newRefAngleN1 = this.n1.getReferenceAngle(this.n2.position) - this.n1.rotation;
        if(this.n1ReferenceAngle > PI/2 && newRefAngleN1 < -PI/2){
            this.n1BaseAngle += (2 * PI);
            console.log("new n1 base angle: " + this.n1BaseAngle);
        }
        else if(this.n1ReferenceAngle < -PI/2 && newRefAngleN1 > PI/2){
            this.n1BaseAngle -= (2 * PI);
            console.log("new n1 base angle: " + this.n1BaseAngle);
        }
        else{
            // console.log("not updating n1 base angle");
        }
        this.n1ReferenceAngle = newRefAngleN1;
        this.n1Angle = this.n1ReferenceAngle + this.n1BaseAngle;
        this.n1AngularDisplacement = this.n1Angle - this.n1TargetAngle;

        let newRefAngleN2 = this.n2.getReferenceAngle(this.n1.position) - this.n2.rotation;
        if(this.n2ReferenceAngle > PI/2 && newRefAngleN2 < -PI/2){
            this.n2BaseAngle += (2 * PI);
            console.log("new n2 base angle: " + this.n1BaseAngle);
        }
        else if(this.n2ReferenceAngle < -PI/2 && newRefAngleN2 > PI/2){
            this.n2BaseAngle -= (2 * PI);
            console.log("new n2 base angle: " + this.n1BaseAngle);
        }
        else{
            // console.log("not updating n2 base angle");
        }
        this.n2ReferenceAngle = newRefAngleN2;
        this.n2Angle = this.n2ReferenceAngle + this.n2BaseAngle;
        this.n2AngularDisplacement = this.n2Angle - this.n2TargetAngle;
    }


    render(originOffset){
        this.updateAngles();
        stroke(0);
        strokeWeight(2);
        let begin = createVector(this.n1.position.x + originOffset.x, this.n1.position.y + originOffset.y);
        let end = createVector(this.n2.position.x + originOffset.x, this.n2.position.y + originOffset.y);
        line(begin.x, begin.y, end.x, end.y);

        // Draw forces acting on nodes from edge
        let force = p5.Vector.sub(this.n2.position, this.n1.position);
        force.setMag(this.netForceMag);
        drawVector(force, p5.Vector.add(this.n1.position, originOffset), RED);
        force.mult(-1);
        drawVector(force, p5.Vector.add(this.n2.position, originOffset), RED);

        // Draw target angles from nodes
        fill(RED);
        noStroke();
        text(round(this.n1TargetAngle, 2), originOffset.x + this.n1.position.x + 10, originOffset.y + this.n1.position.y - 10);
        //this.updateAngles();
        text(round(this.n1Angle, 2), originOffset.x + this.n1.position.x + 10, originOffset.y + this.n1.position.y + 5);
        let n1AngularDisplacement = this.n1TargetAngle - this.n1Angle;
        text(round(n1AngularDisplacement, 2), originOffset.x + this.n1.position.x + 10, originOffset.y + this.n1.position.y + 20);
    }


    getCurrentLength(){
        return this.n1.position.dist(this.n2.position);
    }
}