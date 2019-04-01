
var PROPERTY_THRESHOLD;
var PIXEL_COLOR;
var DEFAULT_DAUGHTER_ANGLE;
var MIN_DAUGHTER_ANGLE;
var MAX_DAUGHTER_ANGLE;

var rootNode;


function setupNode()
{
	PROPERTY_THRESHOLD = 5;
	PIXEL_COLOR = [26, 173, 48];
	DEFAULT_DAUGHTER_ANGLE = PI/2;
	MIN_DAUGHTER_ANGLE = PI/2 - PI/4;
	MAX_DAUGHTER_ANGLE = PI/2 + PI/4;

	rootNode = {
		pos: [0, 0],
		parent: null,
		children: null,
		angles: DEFAULT_DAUGHTER_ANGLE,
		property: 100
	}
}



function n_divide(node)
{
	if(node.property >= PROPERTY_THRESHOLD)	// division condition
	{
		var newNode = {pos: null, parent: node, children: null, angles: null, property: node.property /2};	// create new node with all nulls
		newNode.angles = random(MIN_DAUGHTER_ANGLE, MAX_DAUGHTER_ANGLE);
		//newNode.angles = PI/2 + 1;
		newNode.pos = getPointAtEndOfArm(node.pos[0], node.pos[1], node.angles, GRID_TILE_SIZE);	// Calculate the x and y pos of the new node

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

		node.property /= 2;	// half the property of this node as if half of it was added to the next node
	}
}


function n_drawPixels(node)
{
	drawPixelOnGrid(node.pos[0], node.pos[1], PIXEL_COLOR);
	if(node.children != null)
	{
		n_drawPixels(node.children);
	}
}


function n_drawTree(node)
{
	strokeWeight(6);
	stroke(0);
	if(node.children != null)
	{
		strokeWeight(2);
		stroke(100);
		line(GRID_X_OFFSET + node.pos[0], GRID_Y_OFFSET + node.pos[1], GRID_X_OFFSET + node.children.pos[0], GRID_Y_OFFSET + node.children.pos[1]);
		n_drawTree(node.children);
	}
	point(GRID_X_OFFSET + node.pos[0], GRID_Y_OFFSET + node.pos[1]);
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