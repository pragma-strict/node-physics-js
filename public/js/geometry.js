
// BUG: the first if statement should always be true. this works because sin/cos seem to evaluate to >1 sometimes. This makes no sense.
// BUG: this function is NOT guaranteed to work 100% of the time!!!
// given a point (x, y) and an angle and an arm length, find the point at the end of that arm
function getPointAtEndOfArm(x, y, angle, armLength)
{
	if(x == null || y == null || angle == null || armLength == null)
	{
		console.log("<!> getPointAtEndOfArm - NULL PARAMETER!!!");
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