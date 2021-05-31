
// Edges maintain references to two nodes and apply forces on them in order to keep them a fixed distance apart
class Edge{
    constructor(n1, n2, rigidity){
        this.n1 = n1;
        this.n2 = n2;
        this.length = n1.position.dist(n2.position);
        this.rigidity = rigidity;
    }

    tick(deltaTime){
        //
    }

    render(originOffset){
        stroke(0);
        strokeWeight(2);
        let begin = createVector(this.n1.position.x + originOffset.x, this.n1.position.y + originOffset.y);
        let end = createVector(this.n2.position.x + originOffset.x, this.n2.position.y + originOffset.y);
        line(begin.x, begin.y, end.x, end.y);
    }
}