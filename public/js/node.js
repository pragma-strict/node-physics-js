
var NODE_SIZE = 8;

var PROPERTY_THRESHOLD;
var PIXEL_COLOR;
var DEFAULT_DAUGHTER_ANGLE;
var MIN_DAUGHTER_ANGLE;
var MAX_DAUGHTER_ANGLE;
var DEFAULT_MASS;

var rootNode;




function setupNode()
{
	PROPERTY_THRESHOLD = 5;
	PIXEL_COLOR = [26, 173, 48];
	DEFAULT_DAUGHTER_ANGLE = PI/2;
	MIN_DAUGHTER_ANGLE = PI/2 - PI/2;
	MAX_DAUGHTER_ANGLE = PI/2 + PI/2;
	DEFAULT_MASS = 1;

	rootNode = {
		pos: [0, 0],
		parent: null,
		children: null,
		angles: DEFAULT_DAUGHTER_ANGLE,
		mass: DEFAULT_MASS,
		netTorque: 0,
		property: 100
	}
}


// Create a single node. Basically the node "class" definition
function n_create(parentNode)
{
	var newNode = 
		{
			pos: null, 
			parent: parentNode, 
			children: null, 
			angles: null, 
			mass: DEFAULT_MASS, 
			netTorque: 0,
			property: parentNode.property /2
		};	// create new node with all nulls

	newNode.angles = random(MIN_DAUGHTER_ANGLE, MAX_DAUGHTER_ANGLE);
	newNode.pos = getPointAtEndOfArm(parentNode.pos[0], parentNode.pos[1], parentNode.angles, GRID_TILE_SIZE);	// Calculate the x and y pos of the new node

	return newNode;
}



function n_divide(node)
{
	if(node.property >= PROPERTY_THRESHOLD)	// division condition
	{
		var newNode = n_create(node);
		if(node.children != null)	// If this node already has a children, do a swap (!! MAYBE JUST ADD A SECOND DAUGHTER?)
		{
			var temp = node.children;
			node.children = newNode;
			node.children.children = temp;
			node.children.children.pos = getPointAtEndOfArm(node.children.pos[0], node.children.pos[1], node.children.angles, GRID_TILE_SIZE);	// Calculate the new x and y pos of the original child
			n_divide(node.children.children);	// continue the division
		}
		else	// Otherwise just assign the new node
		{
			node.children = newNode;
		}
	}
}


// Recursively crawl up the node tree and calculate and save torque forces on each node.
// Toqrue left is negative and right is positive.
function n_recalculateTorques(node)
{
	if(node == null)	// error check
	{
		console.log("<!> calculateArmatureCOM: input node is null!");	
	}

	if(node.children == null)	// base case, return.
	{
		return node.mass;
	}

	/*	Recursive call to find mass sum off all descendants, then use that mass to apply a torque force originating from this node's children	*/
	var totalMass =	n_recalculateTorques(node.children);
	node.netTorque = calculateGravitationalTorque(calculateDistance2D(node.pos, node.children.pos), totalMass, calculateAbsoluteAngle(node.pos, node.children.pos));

	/*	Update the total mass with our own mass before we return it.		*/
	totalMass += node.mass;

	/*	Return the total mass	*/
	return totalMass;
}


function n_drawPixels(node)
{
	drawGridPixelFromWorldCoordinates(node.pos, PIXEL_COLOR);
	if(node.children != null)
	{
		n_drawPixels(node.children);
	}
}


function n_drawTree(node)
{
	if(node.children != null)
	{
		strokeWeight(2);
		stroke(100);
		line(GRID_X_OFFSET + node.pos[0], GRID_Y_OFFSET + node.pos[1], GRID_X_OFFSET + node.children.pos[0], GRID_Y_OFFSET + node.children.pos[1]);
		n_drawTree(node.children);
	}
	if(node == selectedNode)
	{
		stroke(RED);
	}
	else
	{
		stroke(0);		
	}
	strokeWeight(6);
	point(GRID_X_OFFSET + node.pos[0], GRID_Y_OFFSET + node.pos[1]);
}


// Return the first node that is within cutoffDistance of a point
function n_findNodeNearPoint(node, point, cutoffDistance)
{
	if(node == null)	// error check
	{
		console.log("<!> n_findNodeNearPoint: node is NULL!!!");
		return null;	
	}

	if(calculateDistance2D(node.pos, point) <= cutoffDistance)	// check if point is within cutoffDistance of node
	{
		return node;
	}
	else if(node.children != null)
	{
		return n_findNodeNearPoint(node.children, point, cutoffDistance);
	}
	else
	{
		return null;
	}
}


// Return the first node that exists within the grid pixel whose top-left coordinate is at (x, y) input. Return null if none found.
function n_findNodeWithinGridPixel(pixelPos, node)
{
	if(node == null)
	{
		console.log("<!> n_findNodeWithinGridPixel: node is NULL!!!");
		return null;
	}

	if(node.pos[X] >= pixelPos[X] && node.pos[X] < (pixelPos[X] + GRID_TILE_SIZE))
	{
		if(node.pos[Y] >= pixelPos[Y] && node.pos[Y] < (pixelPos[Y] + GRID_TILE_SIZE))
		{
			return node;	// Return this node if it is within the specified grid pixel
		}
	}


	if(node.children != null)	// Do a recursive call on this node's children if it has any
	{
		return n_findNodeWithinGridPixel(pixelPos, node.children);
	}
	else	// Otherwise we didn't find any satisfactory nodes so return null.
	{
		return null;
	}
}



function n_print(node)
{
	console.log("property: " + node.property);
	if(node.children != null)
	{
		n_print(node.children);
	}
}


function n_printSingle(node)
{
	console.log(node);
	/*
	console.log("pos: " + pos);
	console.log("parent: " + parent);
	console.log("child: " + children);
	console.log("angles: " + angles);
	console.log("property: " + property);
	*/
}


function n_displayNodeInfo(node)
{
	if(node != null)
	{
		strokeWeight(0);
		fill(0);
		var nodePosScreenSpace = convertWorldToScreenCoordinates(node.pos);
		text("node property: " + node.property, nodePosScreenSpace[X], nodePosScreenSpace[Y]);
	}
	else
	{
		//console.log("<!> n_displayNodeInfo: node is null");
	}
}
