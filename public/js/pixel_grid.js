
var GRID_TILE_SIZE;
var HALF_GRID_TILE_SIZE;
var GRID_X_OFFSET;
var GRID_Y_OFFSET;

var gridHeight;
var gridWidth;

function setupGrid()
{
	GRID_TILE_SIZE = 20;
	HALF_GRID_TILE_SIZE = GRID_TILE_SIZE /2;
	gridHeight = ceil(height / GRID_TILE_SIZE);
	gridWidth = ceil(width / GRID_TILE_SIZE);
	GRID_X_OFFSET = ceil(width/2);
	GRID_Y_OFFSET = ceil(height - height/6);
}


// takes an x,y screen pixel coordinate and colours in the grid pixel within which the screen pixel lies
function drawPixelOnGrid(x, y, color)
{
	//console.log("drawing at " + (GRID_X_OFFSET + GRID_TILE_SIZE * x) + ", " + (GRID_TILE_SIZE * y));
	//console.log("drawing pixel: " + x + ", " + y);
	fill(color);
	var gridTileX;
	var gridTileY; 
	if(x >= 0)
	{
		gridTileX = x - (x % GRID_TILE_SIZE);
	}
	else
	{
		gridTileX = x - (GRID_TILE_SIZE - (abs(x) % GRID_TILE_SIZE));
	}

	if(y >= 0)
	{
		gridTileY = y - (y % GRID_TILE_SIZE) - GRID_TILE_SIZE;
	}
	else
	{
		gridTileY = y - (GRID_TILE_SIZE - (abs(y) % GRID_TILE_SIZE));
	}
	rect(GRID_X_OFFSET + gridTileX, GRID_Y_OFFSET + gridTileY, GRID_TILE_SIZE, GRID_TILE_SIZE);
}


function drawCenterLine()
{
	stroke(BACKGROUND_COLOR[0] - 20, BACKGROUND_COLOR[1] - 20, BACKGROUND_COLOR[2] - 20);
	strokeWeight(1);
	line(GRID_X_OFFSET, 0, GRID_X_OFFSET, height);
}

function drawGridLines()
{
	stroke(BACKGROUND_COLOR[0] - 10, BACKGROUND_COLOR[1] - 10, BACKGROUND_COLOR[2] - 10);
	strokeWeight(1);
	for(i = 0; i < GRID_X_OFFSET /GRID_TILE_SIZE; i++)	// Draw horizontal lines
	{
		line(GRID_X_OFFSET + i * GRID_TILE_SIZE, 0, GRID_X_OFFSET + i * GRID_TILE_SIZE, height);
		line(GRID_X_OFFSET - i * GRID_TILE_SIZE, 0, GRID_X_OFFSET - i * GRID_TILE_SIZE, height);
	}
	for(i = 0; i < GRID_Y_OFFSET /GRID_TILE_SIZE; i++)	// Draw vertical lines
	{
		line(0, GRID_Y_OFFSET + i * GRID_TILE_SIZE, width, GRID_Y_OFFSET + i * GRID_TILE_SIZE);
		line(0, GRID_Y_OFFSET - i * GRID_TILE_SIZE, width, GRID_Y_OFFSET - i * GRID_TILE_SIZE);
	}
	drawCenterLine();
}