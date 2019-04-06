
var leftScreenBuffer = 30;	// distance from left of screen to text box in px
var topScreenBuffer = 50;	// distance from top of screen to text box in px
var headerGap = 30;
var inspectorWidth = 250;

function renderNodeInspector(node)
{
	var bodyToTextDistance = 0;
	var leading = textAscent() * 1.5;
	
	strokeWeight(0);
	fill(0);
	textSize(24);
	text("Selected Node", leftScreenBuffer, topScreenBuffer);
	strokeWeight(2);
	line(leftScreenBuffer, topScreenBuffer + (headerGap/3), leftScreenBuffer + inspectorWidth, topScreenBuffer + (headerGap/3));
	strokeWeight(0);
	textSize(16);
	if(node != null)
	{
		// Position text
		text("World position: " + round(node.pos[X]) + ", " + round(node.pos[Y]), leftScreenBuffer, topScreenBuffer + headerGap);

		// Mass text
		bodyToTextDistance += leading;
		text("Mass: " + round(node.mass), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Center of mass text, dot and vector
		/*
		bodyToTextDistance += leading;
		var COM = n_calculateArmatureCenterOfMass(node);
		text("Armature Center Of Mass: " + round(COM[X]) + ", " + round(COM[Y]), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		stroke(RED);
		strokeWeight(8);
		COM = convertWorldToScreenCoordinates(COM);
		point(COM[X], COM[Y]);
		strokeWeight(4);
		var nodePosInScreenSpace = convertWorldToScreenCoordinates(node.pos);
		line(nodePosInScreenSpace[X], nodePosInScreenSpace[Y], COM[X], COM[Y]);
		strokeWeight(0);
		*/

		
		// Torque
		bodyToTextDistance += leading;
		text("Torque: " + node.netTorque, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		
	}
	else
	{
		text("<null node selected>", leftScreenBuffer, topScreenBuffer + headerGap);
	}
}