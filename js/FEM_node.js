
/*
    All information about a node but nothing about graphs and no actual physics calculations

    TODO: 
        - Fix the bug where inspector says current edge angles are NaN when making a triangle
        - Combine edge data into a dictionary so the properties of this class aren't so cluttered
        - Make a dedicated function to calculate angular force magnitudes with a little more complexity
        - Prevent explosions by capping forces applied
        - Add some kind of damping or prevent infinite gliders or mimic conservation of energy in some other way
            - Backwards acceleration?
        - Implement a more standarized unit and scale to help calibrate calculations to realistic levels?
        - Make angular force calculations relative to local node rotation rather than global reference angle.
            - Just make an updated version of the ref angle function that calculates relative to a parameter rather than
              the new (0, 1) vector!
        - Remove the gridOrigin arg from render()
*/
class FEMNode extends Node{
    constructor(position, index){
        super(position);

        this.indexInGraph = index;  // This is a sin, I understand. I have done this for my son.

        this.constrainedX = false;
        this.constrainedY = false;

        this.bShouldTick = true;
    }


    // Calculate a physics step
    tick(deltaTime){
        super.tick(deltaTime);

        if(this.bShouldTick){
            // 
        }
    }
    

    cycleConstraintType(){
        // Neither -> both
        if(!this.constrainedX && !this.constrainedY){
            this.constrainedX = true;
            this.constrainedY = true;
        }

        // Both -> X free
        else if(this.constrainedX && this.constrainedY){
            this.constrainedX = false;
        }

        // X free -> Y free
        else if(!this.constrainedX && this.constrainedY){
            this.constrainedX = true;
            this.constrainedY = false;
        }

        // Y free -> neither
        else{
            this.constrainedX = false;
        }
    }

    
    // 
    render(gridOrigin, color){

        // Unconstrained
        if(!this.constrainedX && !this.constrainedY){
            super.render(gridOrigin, color);
        }

        strokeWeight(5);
        stroke(color);
        
        // Constrained on x
        if(this.constrainedX){
            line(
                gridOrigin.x + this.position.x, 
                gridOrigin.y + this.position.y - (this.renderSize / 2),
                gridOrigin.x + this.position.x, 
                gridOrigin.y + this.position.y + (this.renderSize / 2),
            )
        }
        // Constrained on y
        if(this.constrainedY){
            line(
                gridOrigin.x + this.position.x - (this.renderSize / 2), 
                gridOrigin.y + this.position.y,
                gridOrigin.x + this.position.x + (this.renderSize / 2), 
                gridOrigin.y + this.position.y,
            )
        }

        // Render node index
        fill(0);
        strokeWeight(0);
        let textOffset = 15;
        text(String(this.indexInGraph), gridOrigin.x + this.position.x + textOffset, gridOrigin.y + this.position.y + textOffset);
    }
}