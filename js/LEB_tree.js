
/*

*/
class LEBTree{
    constructor(graph){
        this.rootNodes = [];
        this.L0Size = 350;

        this.referenceGraph = graph;

        this.generate();
    }


    generate(){
        this.rootNodes.push(new LEBNode(0, null, createVector(0, 0), this.L0Size, 3));
        this.rootNodes[0].generate(this.referenceGraph);
    }


    // 
    render(drawColor){
        this.rootNodes.forEach((node) => {
            node.render(this.referenceGraph.origin, drawColor);
        });
    }


    tick(deltaTime){
        //
    }
}