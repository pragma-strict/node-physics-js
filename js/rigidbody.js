/*
    A 2D physics-simulated line, mostly going to be used for the ground.
    I might just scrap this because implementing a full physics system sounds like a big job.
*/
class RigidBodyLine{
    constructor(start, end){
        this.start = start;
        this.end = end;
        this.isStatic = true;
    }

    isPointOver(){
        
    }
}