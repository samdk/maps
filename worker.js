onmessage = function(e) {
	data = eval(e.data);
	var grid = genMap(data[0],data[1],data[2]);
	postMessage(grid);
}

/* generates a map with the given dimensions
 */
function genMap(width,height,threshold) {
	if (height === undefined) { 
		return genMap(width,width);
	} else {
		return mapSubGrid(randGrid(4,4,threshold),width/8,1);
	}
}

/* does the actual map-generating algorithm:
 *	-start with large blocks
 *	-split each block into four sub-blocks
 *	-replace each block in the new (larger) grid with a
 *	 random one of its neighbors (wrapping around edges)
 *	-repeat until small enough
 */
function mapSubGrid(grid,pixelSize,minPixelSize) {
	if (pixelSize < minPixelSize) {
		return cleanBorders(borderize(smooth(grid,2)));
	} else {
		newGrid = [];
		for (var x = 0; x < grid.length; x++) {
			var xNew1 =  x*2,
				xNew2 = (x*2)+1;
			newGrid[xNew1] = [];
			newGrid[xNew2] = [];
			for (var y = 0; y < grid[x].length; y++) {
				var yNew1 =  y*2,
					yNew2 = (y*2)+1,
					value = grid[x][y];
				newGrid[xNew1][yNew1] = value;
				newGrid[xNew1][yNew2] = value;
				newGrid[xNew2][yNew1] = value;
				newGrid[xNew2][yNew2] = value;
			}
		}
		fractalizedGrid = fractalize(newGrid);
		return mapSubGrid(fractalizedGrid,pixelSize/2,minPixelSize);
	}
}

/* utility function for iterating over and
 * updating the value of every square.
 */
function mapGrid(grid,func) {
	newGrid = [];
	for (var x = 0; x < grid.length; x++) {
		newGrid[x] = [];
		for (var y = 0; y < grid[x].length; y++) {
			newGrid[x][y] = func(grid,x,y);
		}
	}
	return newGrid;
}

/* generates a random grid of 0s and 1s
 */
function randGrid(width,height,threshold) {
	var arr = [];
	for (var x = 0; x < width; x++) {
		arr[x] = [];
		for (var y = 0; y < height; y++) {
			arr[x][y] = Math.random() < threshold ? 1 : 0;
		}
	}
	return arr;
}

/* smooths out the map. replaces all pixels with
 * their most common neighbor
 */
function smooth(grid,n) {
	function majorityNeighbor(grid,x,y) {
		var surrounding = neighbors(grid,x,y),
			val = -3,
			runLength = -4,
			mostVal = -5,
			longestRun = -6;
		surrounding.sort();
		for (var n = 0; n < surrounding.length; n++) {
			if (val == surrounding[n]) {
				runLength += 1;
			} else {
				if (runLength > longestRun) {
					longestRun = runLength;
					mostVal = val;
				}
				val = surrounding[n];
				runLength = 1;
			}
		}
		if (runLength > longestRun) {
			longestRun = runLength;
			mostVal = val;
		}
		return mostVal;
	}
	var smoothed = mapGrid(grid,majorityNeighbor);
	if (n === undefined || n <= 0) return smoothed;
	else return smooth(smoothed,n-1);
}

/* draws borders on the map. any land (> 0) square
 * touching a water square (0) becomes a border.
 */
function borderize(grid) {
	function assignBorder(grid,x,y) { return isBorder(grid,x,y) ? -1 : grid[x][y]; }
	return mapGrid(grid,assignBorder);
}

/* cleans up extra borders. makes any border pixels
 * touching only water or other borders into water.
 */
function cleanBorders(grid) {
	return mapGrid(grid,function(grid,x,y) {
		return isLonelyBorder(grid,x,y) ? 0 : grid[x][y];
	});
}

/* replaces each element in grid with a random
 * one of its neighbors (wrapping on edges)
 */
function fractalize(grid) {
	return mapGrid(grid,randSurrounding);
}

/* returns the neighbors of grid[x][y]
 */
function neighbors(grid,x,y) {
	var surrounding = [];
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			if (!(i === 0 && j === 0)) {
				surrounding.push(grid[wrap(x+i,grid.length)][wrap(y+j,grid[x].length)]);
			}
		}
	}
	return surrounding;
}

/* selects a random neighbor's value
 */
function randSurrounding(grid,x,y) {
	var surrounding = neighbors(grid,x,y);
	return surrounding[Math.floor(Math.random()*surrounding.length)];
}

/* wraps n around the edges if n is 0 or len
 */
function wrap(n,len) {
	if		(n < 0)		return len-1;
	else if (n > len-1)	return 0;
	else				return n;
}

/* checks if a given 'land' point is bordered by water
 */
function isBorder(grid,x,y) {
	var val = grid[x][y];
	if (val > 0) {
		var surrounding = neighbors(grid,x,y);
		for (var i = 0; i < surrounding.length; i++) {
			if (surrounding[i] === 0) return true;
		}
	}
	return false;
}

/* checks if a given 'border' point is bordered only
 * by water and other borders
 */
function isLonelyBorder(grid,x,y) {
	var val = grid[x][y];
	if (val < 0) {
		var surrounding = neighbors(grid,x,y);
		for (var i = 0; i < surrounding.length; i++) {
			if (surrounding[i] > 0) return false;
		}
		return true;
	}
	return false;
}

