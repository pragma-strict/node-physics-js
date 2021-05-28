
// Should hold all information about a node but nothing about graphs and no actual physics calculations
class Node{
    constructor(position, mass){
        this.position = position;
        this.mass = mass;
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.applyForce(createVector(0, 9.8));
    }


    // Calculate a physics step
    tick(){
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        
        // Apply gravity
        //this.applyForce(createVector(0, 9.8));

        // Apply boundaries
        if(this.position.x < -width/2){
            this.position.x = -width/2;
            this.velocity.x *= -1;
        }

        if(this.position.x > width/2){
            this.position.x = width/2;
            this.velocity.x *= -1;
        }

        if(this.position.y < -height/2){
            this.position.y = -height/2;
            this.velocity.y *= -1;
        }

        if(this.position.y > height/2){
            this.position.y = height/2;
            this.velocity.y *= -1;
        }
    }


    render(positionOffset, color, isSelected){
        fill(color);
        if(isSelected){
            strokeWeight(5);
            stroke(200, 0, 0);
        }
        ellipse(positionOffset.x + this.position.x, positionOffset.y + this.position.y, 15, 15)
    }


    // Apply an instantaneous force. i.e. change the velocity directly w/o changing acceleration
    applyImpulse(force){
        this.velocity.add(force.div(this.mass));
    }


    // Apply a force i.e. update acceleration
    applyForce(force){
        this.acceleration.add(force.div(this.mass));
    }
}