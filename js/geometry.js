/*
	Contains static methods for geometric calculations, mostly related to angles for now
*/
class Geometry{
	   
	// Return the angle between a and b around the origin in the range (0, TWO_PI)
	static getAngleBetween(origin, a, b){
		let toA = p5.Vector.sub(a, origin);
		let toB = p5.Vector.sub(b, origin);
		return toA.angleBetween(toB);
	}


	// Return the angle angle between the horizontal, this node, and the given position vector
	// Angle will be negative if in bottom quadrants and positive if in top quadrants (I think)
	static getReferenceAngle(origin, point){
		if(origin instanceof p5.Vector && point instanceof p5.Vector){
			return Geometry.getAngleBetween(origin, createVector(origin.x + 1, origin.y), point);
		}
		console.log("<!> One or more params to Geometry.getReferenceAngle are of incorrect type");
		return null;
	}


    // Return the angle of a1 relative to a2 i.e. a2 minus a1 such that the absolute result is never more than PI
    static getAngleDifference(a1, a2){
        let diff = (a2 - a1) % TWO_PI;
		if(diff > PI){
			diff = -PI + (diff % PI);
		}
		else if(diff < -PI){
			diff = PI + (diff % PI);
		}
        return diff % PI;
    }


	// Transform final angle so that it's representation is never more than PI different from initial angle
	static updateAngle(initial, final){
		let angleDelta = this.getAngleDifference(initial, final);
		return initial + angleDelta;
	}


	// Convert an angle in range (0, TWO_PI) to the range (-PI, PI)
	static clampAngleToPI(angle){
		if(angle > PI){
			return angle - TWO_PI;
		}
		return angle;
	}


	// Return a vector pointing 90 degrees to the right of the vector a->b
	static getPerpendicularVector(a, b){
		let c = p5.Vector.sub(a, b);
		let tempX = c.x;
		c.x = c.y;
		c.y = -tempX;
		return c;
	}


	// Return the slope between two points
	static findSlope(a, b){
		if(a.x == b.x){
		return 9999999.00;
		}
		return (a.y - b.y) / (a.x - b.x);
	}


	// Return the y-intercept of a line
	static findIntercept(point, slope){
		return point.y - point.x * slope;
	}


	static drawVector(v, origin, color){
		stroke(color);
		strokeWeight(1);
		line(origin.x, origin.y, origin.x + v.x, origin.y + v.y);
	}
}





// BUG: the first if statement should always be true. this works because sin/cos seem to evaluate to >1 sometimes. This makes no sense.
// BUG: this function is NOT guaranteed to work 100% of the time!!!
// given a point (x, y) and an angle and an arm length, find the point at the end of that arm
function getPointAtEndOfArm(x, y, angle, armLength)
{
	if(x == null || y == null || angle == null || armLength == null)
	{
		console.log("<!> getPointAtEndOfArm - NULL PARAMETER!!!");
	}


	//	Bring angle into acceptable range (0 - 2PI)
	while(angle < 0)
	{
		angle += TWO_PI;
	}

	while(angle >= TWO_PI)
	{
		angle -= TWO_PI;
	}


	var newPoint = [x, y];	// initialize new point

	//console.log("getPointAtEndOfArm: " + angle + ", cos: " + cos(angle));
	if(angle >= 0)
	{
		newPoint[0] = x + armLength * cos(angle);
		newPoint[1] = y - armLength * sin(angle);
	}
	else if(angle >= PI /2 && angle < PI)
	{
		newPoint[0] = x - armLength * cos(angle);
		newPoint[1] = y - armLength * sin(angle);
	}
	else if(angle >= PI && angle < 2*PI/3)
	{
		newPoint[0] = x - armLength * cos(angle);
		newPoint[1] = y + armLength * sin(angle);
	}
	else if(angle >= 2*PI/3 && angle < 2*PI)
	{
		newPoint[0] = x + armLength * cos(angle);
		newPoint[1] = y + armLength * sin(angle);
	}
	else
	{
		console.log("<!> getPointAtEndOfArm parameter out of acceptable range!!! (0 - 2PI)");
	}

	return newPoint;
}


// Calculate distance between 2 points on the 2D plane
function calculateDistance2D(p1, p2)
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	return sqrt(pow(dx, 2) + pow(dy, 2));
}


// Calculate angle at p1 between p2 and the positive x-axis 
// Return angle in range 0 - 2PI
function calculateAbsoluteAngle(p1, p2)
{
	var dx = p2[X] - p1[X];
	var dy = p2[Y] - p1[Y];
	var angle = 0;

	if(dy < 0)
	{
		if(dx >= 0)	// Quadrant 1
		{
			angle = abs(atan(dy / dx));
		}
		else	// Quadrant 2
		{
			angle = abs(atan(dx / dy)) + HALF_PI; 
		}
	}
	else
	{
		if(dx < 0)	// Quadrant 3
		{
			angle = abs(atan(dy / dx)) + PI;
		}
		else	// Quadrant 4
		{
			angle = abs(atan(dx / dy)) + PI + HALF_PI;
		}
	}

	return angle;
}