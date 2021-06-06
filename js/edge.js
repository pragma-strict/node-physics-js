
// Edges maintain references to two nodes and apply forces on them in order to keep them a fixed distance apart
class Edge{
    constructor(n1, n2, rigidity){
        this.n1 = n1;
        this.n2 = n2;
        this.targetLength = n1.position.dist(n2.position);
        this.rigidity = rigidity;
        this.damping = 0.995; // Fraction of force lost as if due to friction or drag
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
    }


    getCurrentLength(){
        return this.n1.position.dist(this.n2.position);
    }


    render(originOffset){
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
    }
}