
/*

*/
class LEBTree{
    constructor(graph){
        this.rootNodes = [];
        this.L0Size = 550;

        this.referenceGraph = graph;

        this.generate();
    }


    generate(){
        this.rootNodes.push(new LEBNode(0, null, createVector(0, 0), this.L0Size, 3));
        this.rootNodes[0].instantiateNodes(this.referenceGraph);
        this.rootNodes[0].instantiateEdges(this.referenceGraph);
        this.rootNodes[0].subdivide(this.referenceGraph);
        // this.rootNodes[0].rightChild.subdivide(this.referenceGraph);
        // this.rootNodes[0].rightChild.leftChild.subdivide(this.referenceGraph);
        // this.rootNodes[0].rightChild.leftChild.leftChild.subdivide(this.referenceGraph);
        // this.rootNodes[0].rightChild.leftChild.leftChild.leftChild.subdivide(this.referenceGraph);
        // this.rootNodes[0].rightChild.leftChild.leftChild.leftChild.leftChild.subdivide(this.referenceGraph);
        // this.rootNodes[0].rightChild.leftChild.leftChild.leftChild.rightChild.subdivide(this.referenceGraph);
        // this.rootNodes[0].rightChild.leftChild.leftChild.leftChild.rightChild.rightChild.subdivide(this.referenceGraph);
    }


    // 
    render(drawColor){
        // this.rootNodes.forEach((node) => {
        //     node.render(this.referenceGraph.origin, drawColor);
        // });
    }


    tick(deltaTime){
        //
    }
}