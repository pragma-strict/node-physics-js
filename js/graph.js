
// Holds a bunch of nodes and calls functions on them. Maybe one day will implement a cool data structure to hold them.
class Graph{
    constructor()
    {
        this.nodes = new Array();
        this.edges = new Array();
        this.selected = null;
    }

    
    // Add a node to the graph at a given position
    addNode(position){
        let newNode = new Node(position, 10);
        this.nodes.push(newNode);
        if(this.selected){
            this.addEdge(this.selected, newNode);
        }
        this.selected = newNode;
    }


    // Add an edge between nodes at the given indices
    addEdgeFromIndices(indexA, indexB){
        this.edges.push([indexA, indexB]);
    }


    addEdge(a, b){
        let indexA = this.getIndexOf(a);
        let indexB = this.getIndexOf(b);
        if(indexA >= 0 && indexB >= 0){
            this.addEdgeFromIndices(indexA, indexB);
        }
        else{
            console.log("Unable to add edge because one or more nodes were not found in the graph");
        }
    }


    // Calls tick on all nodes
    tick(){
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].tick(this.getNeighbors(i));
        }
    }


    // Draw the graph to the screen
    render(originOffset){
        noStroke();

        // Render nodes
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].render(originOffset, 0);
        }

        // Re-render selected node and neighbors with highlights
        if(this.selected){
            let selectedNeighbors = this.getNeighbors(this.getIndexOf(this.selected));
            for(let i = 0; i < selectedNeighbors.length; i++){
                selectedNeighbors[i].render(originOffset, color(0, 230, 230));
            }
            this.selected.render(originOffset,color(230, 0, 38));
        }

        // Render edges
        for(let i = 0; i < this.edges.length; i++){
            stroke(0);
            strokeWeight(1);
            let n1 = this.nodes[this.edges[i][0]];
            let n2 = this.nodes[this.edges[i][1]];
            let begin = createVector(n1.position.x + originOffset.x, n1.position.y + originOffset.y);
            let end = createVector(n2.position.x + originOffset.x, n2.position.y + originOffset.y);
            line(begin.x, begin.y, end.x, end.y);
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


    // Naively returns the index of the given node or -1 if node is not in the graph
    getIndexOf(node){
        for(let i = 0; i < this.nodes.length; i++){
            if(node === this.nodes[i]){
                return i;
            }
        }
        return -1;
    }


    // Return all nodes sharing an edge with the node at the given index
    getNeighbors(index){
        let neighbors = new Array();
        for(let i = 0; i < this.edges.length; i++){
            if(this.edges[i][0] === index){
                neighbors.push(this.nodes[this.edges[i][1]]);
            }
            else if(this.edges[i][1] === index){
                neighbors.push(this.nodes[this.edges[i][0]]);
            }
        }
        return neighbors;
    }


    // Update the selected node given a click position
    updateSelected(position){
        this.selected = this.getNodeNearPosition(position, 8)
    }
}