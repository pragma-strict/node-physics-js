
// Holds a bunch of nodes and calls functions on them. Maybe one day will implement a cool data structure to hold them.
class Graph{
    constructor()
    {
        this.nodes = new Array();
        this.selected = null;
    }

    
    // Add a node to the graph at a given position
    addNode(position){
        let newNode = new Node(position, 1.0);
        this.nodes.push(newNode);
        console.log("Added node at: " + position);
        return newNode;
    }


    // Calls tick on all nodes
    tick(){
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].tick();
        }
    }


    render(originOffset){
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].render(originOffset, 0);
        }
    }


    // Naive implementation
    getNodeNearPosition(position, maxDistance){
        for(let i = 0; i < this.nodes.length; i++){
            if(position.dist(this.nodes[i].position) <= maxDistance){
                return this.nodes[i];
            }
        }
        return 0;
    }


    // Update the selected node given a click position
    updateSelected(position){
        this.selected = this.getNodeNearPosition(position, 8)
    }
}