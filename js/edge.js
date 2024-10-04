
/* 
    The base edge class only stores info about incident nodes, positions, UI, rendering, and the graph.
*/
class Edge{
    constructor(n1, n2){
        this.n1 = n1;
        this.n2 = n2;
        
        this.connectNodes();
    }


    // Connect incident nodes by updating their properties i.e. add the edge and relative angles to them 
    connectNodes(){
        this.n1.addEdge(this);
        this.n2.addEdge(this);
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
        //
    }


    render(originOffset, color){
        stroke(color);
        strokeWeight(2);
        let begin = createVector(this.n1.position.x + originOffset.x, this.n1.position.y + originOffset.y);
        let end = createVector(this.n2.position.x + originOffset.x, this.n2.position.y + originOffset.y);
        line(begin.x, begin.y, end.x, end.y);
    }


    getCurrentLength(){
        return this.n1.position.dist(this.n2.position);
    }

}