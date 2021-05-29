
var GRID_TILE_SIZE;
var HALF_GRID_TILE_SIZE;


var gridOrigin;
var gridHeight;
var gridWidth;


var isDragging = false;

function setupGrid()
{
	GRID_TILE_SIZE = 12;
	HALF_GRID_TILE_SIZE = GRID_TILE_SIZE /2;
	gridHeight = ceil(height / GRID_TILE_SIZE);
	gridWidth = ceil(width / GRID_TILE_SIZE);
	gridOrigin = createVector(ceil(width/2), ceil(height - height/6));
}


// Returns an (x,y) coordinate pair array (in world space) representing the top-left of the grid pixel in which the input coords lay.
// (Essentially rounds off the input coords to the coords of a grid tile)
function roundCoordinatesToTile(point)
{
	var gridTileX;
	var gridTileY; 
	if(point.x >= 0)
	{
		gridTileX = point.x - (point.x % GRID_TILE_SIZE);
	}
	else
	{
		gridTileX = point.x - (GRID_TILE_SIZE - (abs(point.x) % GRID_TILE_SIZE));
	}

	if(point.y > 0)
	{
		gridTileY = point.y - (point.y % GRID_TILE_SIZE);
	}
	else
	{
		gridTileY = point.y - (GRID_TILE_SIZE - (abs(point.y) % GRID_TILE_SIZE));
	}

	return createVector(gridTileX, gridTileY);
}



// colours in the grid pixel in which the input (world) coordinates lay
function drawGridPixelFromWorldCoordinates(point, color)
{
	fill(color);
	strokeWeight(0);
	var gridTileScreenCoordinates = convertWorldToScreenCoordinates(roundCoordinatesToTile(point));
	rect(gridTileScreenCoordinates.x, gridTileScreenCoordinates.y, GRID_TILE_SIZE, GRID_TILE_SIZE);
}


// Draw a cross with its center at 0, 0 in world space
function drawCenterLines()
{
	stroke(BG_COL_SHADE_2);
	strokeWeight(1);
	line(gridOrigin.x, 0, gridOrigin.x, height);
	line(0, gridOrigin.y, width, gridOrigin.y);
}


// Draw grid lines aligned with 0, 0 in world space
function drawGridLines()
{
	// First find the gap between the left-most grid line and the left of the screen. Same for the top.
	// Then draw the lines from left to right and then from top to bottom, starting at the left-most and top-most pointss.

	var leftGap = abs(gridOrigin.x % GRID_TILE_SIZE);
	var topGap = abs(gridOrigin.y % GRID_TILE_SIZE);

	stroke(BG_COL_SHADE_1);
	strokeWeight(1);

	for(i = leftGap; i < width; i += GRID_TILE_SIZE)
	{
		line(i, 0, i, height);
	}
	for(i = topGap; i < height; i += GRID_TILE_SIZE)
	{
		line(0, i, width, i);
	}
	
	drawCenterLines();
}


function convertScreenToWorldCoordinates(point)
{
	return createVector(point.x - gridOrigin.x, point.y - gridOrigin.y);
}


function convertWorldToScreenCoordinates(point)
{
	return createVector(point.x + gridOrigin.x, point.y + gridOrigin.y);	
}


function drawCoordinatesToScreen(x, y, verticalOffset)
{
	fill(0);
	strokeWeight(0);
	text((x + ", " + y), x + HALF_GRID_TILE_SIZE, y - verticalOffset);
}


