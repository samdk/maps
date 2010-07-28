$(document).ready(function() {
	drawMap();
});


function drawMap() {
	var canvas = document.getElementById('map'),
		ctx = canvas.getContext('2d'),
		canvasData = ctx.createImageData(canvas.width, canvas.height),
		MIN_SIZE = 1,
		THRESHOLD = 0.40;

	function randGrid(width,height) {
		var arr = [];
		for (var x = 0; x < width; x++) {
			arr[x] = [];
			for (var y = 0; y < height; y++) {
				arr[x][y] = Math.random() < THRESHOLD ? 0 : 1;
			}
		}
		return arr;
	}
	function drawGrid(grid) {
		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[x].length; y++) {
				var color = isBorder(x,y,grid) ? 2 : grid[x][y],
					idx = (x + y * canvas.width) * 4, // 4 elements per pixel
					colorParts = [32,60,35];
				if (color === 0) colorParts = [44,126,47];
				else if (color === 1) colorParts = [60,88,231];
				canvasData.data[idx + 0] = colorParts[0];
				canvasData.data[idx + 1] = colorParts[1];
				canvasData.data[idx + 2] = colorParts[2];
				canvasData.data[idx + 3] = 255;
			}
		}
		ctx.putImageData(canvasData, 0, 0);
	}
	function mapSubGrid(grid,pixelSize) {
		if (pixelSize < MIN_SIZE) {
			drawGrid(grid);
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
			mapSubGrid(fractalizedGrid,pixelSize / 2);
		}
	}

	function genMap(width,height) {
		if (height === undefined) { 
			genMap(width,width);
		} else {
			mapSubGrid(randGrid(8,8),width/16);
		}
	}
	genMap(canvas.width,canvas.height);
}

function fractalize(grid) {
	var newGrid = [];
	for (var x = 0; x < grid.length; x++) {
		newGrid[x] = [];
		for (var y = 0; y < grid[x].length; y++) {
			newGrid[x][y] = randSurrounding(grid,x,y);
		}
	}
	return newGrid;
}
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
function randSurrounding(grid,x,y) {
	var surrounding = neighbors(grid,x,y);
	return surrounding[Math.floor(Math.random()*surrounding.length)];
}
function wrap(n,len) {
	if (n < 0) {
		return len-1;
	} else if (n > len-1) {
		return 0;
	} else {
		return n;
	}
}
function isBorder(x,y,grid) {
	var val = grid[x][y];
	if (val === 0) {
		var surrounding = neighbors(grid,x,y),
			foundDiff = false;
		for (var i = 0; i < surrounding.length; i++) {
			if (surrounding[i] !== 0) foundDiff = true;
		}
		if (foundDiff) return true;
	}
	return false;
}
