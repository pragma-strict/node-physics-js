


// Should hold all information about a node but nothing about graphs and no actual physics calculations
class Node{
    constructor(position, mass){
        this.bShouldTick = true;
        this.position = position;
        this.mass = mass;
        this.radius = 25;
        this.velocity = createVector(0, 0);
        this.netForce = createVector(0, 0);
        this.rotation = 0.0;
        this.angularRigidity = 200;
        this.angularDampingFactor = 0.9;
        this.netTorque = 0.0;
        this.angularVelocity = 0.0;
        this.bounciness = 0.4;
    }


    // Calculate a physics step
    tick(deltaTime){
        if(!this.bShouldTick){
            return;
        }

        // Apply acceleration and position
        let acceleration = p5.Vector.div(this.netForce, this.mass);
        this.velocity.add(p5.Vector.mult(acceleration, deltaTime));
        this.position.add(p5.Vector.mult(this.velocity, deltaTime));

        // Clear net force
        this.netForce = createVector(); 

        // Apply bottom boundary
        if(this.position.y > 0){
            this.position.y = 0;
            this.velocity.y *= -this.bounciness;
            this.netForce.y = 0;
        }

        let fGravity = createVector(0, 9.8 * this.mass);

        // Apply gravity
        this.applyForce(fGravity);

        // Angular stuff
        //let angularAcceleration = this.netTorque / this.mass;
        //this.angularVelocity += angularAcceleration * deltaTime;
        //this.rotation += this.angularVelocity * deltaTime;

        // Clear torque
        this.netTorque = 0;
    }


    calculateTorque(edge){
        
    }


    render(gridOrigin, color){
        noStroke();
        fill(color);
        ellipse(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y, 15, 15);
        drawVector(this.velocity, p5.Vector.add(gridOrigin, this.position), BLUE);

        // Render collision bubble
        stroke(200);
        strokeWeight(0.3);
        noFill();
        ellipse(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y, this.radius*2, this.radius*2);

        // Render line to show rotation
        stroke(color);
        strokeWeight(2);
        let lineBegin = createVector(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y);
        let lineEnd = p5.Vector.fromAngle(this.rotation, 20);
        line(lineBegin.x, lineBegin.y, lineBegin.x + lineEnd.x, lineBegin.y + lineEnd.y);
    }


    // 
    applyForce(force){
        if(this.bShouldTick){
            this.netForce.add(force);
        }
    }


    // 
    applyTorque(force){
        if(this.bShouldTick){
            this.netTorque += force;
        }
    }


    // Return the angle angle between the horizontal, this node, and the given position vector
    getReferenceAngle(point){
        return createVector(1, 0).angleBetween(p5.Vector.sub(point, this.position));
    }
}