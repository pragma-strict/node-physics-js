
// Holds a bunch of nodes and calls functions on them. Maybe one day will implement a cool data structure to hold them.
class Graph{
    constructor()
    {
        this.nodes = new Array();
    }

    
    // Add a node to the graph at a given position
    addNode(position){
        this.nodes.push(new Node(position, 1.0));
    }


    // Calls tick on all nodes
    tick(){
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].tick();
        }
    }


    render(){
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].render();
        }
    }


    // Naive implementation
    getNodeNearPosition(position, maxDistance){
        for(let i = 0; i < this.nodes.length; i++){
            if(calculateDistance2D(position, this.nodes[i].position) <= maxDistance){
                return this.nodes[i];
            }
        }
    }
}