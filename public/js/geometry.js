
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
	var dx = p2[X] - p1[X];
	var dy = p2[Y] - p1[Y];
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