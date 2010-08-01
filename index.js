$(document).ready(function() {
	$('#button').live("click",drawMap);
});

function drawMap() {
	var canvas = document.getElementById('map'),
		ctx = canvas.getContext('2d'),
		canvasData = ctx.createImageData(canvas.width, canvas.height),
		MIN_SIZE = 1,
		THRESHOLD = 0.40,
		LAND_COLOR = [[52,155,63],[151,155,52]],
		BORDER_COLOR = [40,60,40],
		WATER_COLOR = [60,88,231];

	/* draws the map from a grid
	 */
	function drawGrid(grid) {
		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[x].length; y++) {
				var color = grid[x][y],
					idx = (x + y*canvas.width) * 4, // 4 elements per pixel
					colorParts = BORDER_COLOR;
				if		(color === 0) colorParts = WATER_COLOR;
				else if (color === 1) colorParts = LAND_COLOR[0];
				else if (color === 2) colorParts = LAND_COLOR[1];
				canvasData.data[idx+0] = colorParts[0];
				canvasData.data[idx+1] = colorParts[1];
				canvasData.data[idx+2] = colorParts[2];
				canvasData.data[idx+3] = 255; // opaque
			}
		}
		ctx.putImageData(canvasData,0,0);
	}
	
	var worker = new Worker("worker.js");
	worker.onmessage = function(e) {
		if (e.data[0] === "[") { // then we're in a buggy version of firefox...
			var data = eval(e.data);
		} else { // the data is an object as expected
			var data = e.data;
		}
		drawGrid(data);
	}
	worker.postMessage([canvas.width,canvas.height,THRESHOLD]);

	return false;
}

