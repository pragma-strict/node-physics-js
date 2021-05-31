
// Edges maintain references to two nodes and apply forces on them in order to keep them a fixed distance apart
class Edge{
    constructor(n1, n2, rigidity){
        this.n1 = n1;
        this.n2 = n2;
        this.length = n1.position.dist(n2.position);
        this.rigidity = rigidity;
        this.positionVector = p5.Vector.sub(this.n2.position, this.n1.position); // Vector from n1 -> n2
    }

    tick(deltaTime){
        // Update position vector
        this.positionVector = p5.Vector.sub(this.n2.position, this.n1.position);
        let lengthError = this.positionVector.mag() - this.length;
        let n1Force = this.positionVector.copy();
        n1Force.normalize();
        let n2Force = n1Force.copy();
        n2Force.mult(-1);
        if(this.n1.position.dist(this.n2.position) != this.length){
            // need to pull together
            n1Force.mult(lengthError / this.n2.mass * this.rigidity);
            n2Force.mult(lengthError / this.n1.mass * this.rigidity);
            this.n1.applyImpulse(n1Force);
            this.n2.applyImpulse(n2Force);
        }
    }

    render(originOffset){
        stroke(0);
        strokeWeight(2);
        let begin = createVector(this.n1.position.x + originOffset.x, this.n1.position.y + originOffset.y);
        let end = createVector(this.n2.position.x + originOffset.x, this.n2.position.y + originOffset.y);
        line(begin.x, begin.y, end.x, end.y);

        drawVector(this.positionVector, p5.Vector.add(this.n1.position, originOffset), RED);
    }
}