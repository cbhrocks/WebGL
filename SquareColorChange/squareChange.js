
var gl;
var thetaLoc;
var theta;
var colorLoc;
var color = 0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
	var vertices = [vec2(-0.5, -0.5), vec2(0.5, -0.5), vec2(-0.5, 0.5), vec2(0.5, 0.5)];
	theta = 0.0;
	thetaLoc = gl.getUniformLocation (program, "theta");
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	// Associate the color variable with the shader
	
	colorLoc = gl.getUniformLocation (program, "color");
	
	// Set up event handler

    document.getElementById("ColorButton").onclick = function () {
        if (color == 2){
            color = 0;
        }
        else{
            color +=1;
        }
    };

	render();
};


function render() {
	gl.clear( gl.COLOR_BUFFER_BIT );
	theta -= 0.01;
	gl.uniform1f (thetaLoc, theta);
	if (color == 0) {
		gl.uniform4fv (colorLoc, vec4(1.0, 0.0, 0.0, 1.0));
        // gl.clearColor (colorLoc, vec4(0.0, 1.0, 1.0, 0.5));
	}
	else if (color == 1){
		gl.uniform4fv (colorLoc, vec4(0.0, 0.0, 1.0, 1.0));
        // gl.clearColor (colorLoc, vec4(1.0, 0.0, 0.0, 1.0));
	}
    else if (color == 2){
        gl.uniform4fv (colorLoc, vec4(0.0, 1.0, 1.0, 0.5));
        // gl.clearColor (colorLoc, vec4(0.0, 0.0, 1.0, 1.0));
    }
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4);
	requestAnimFrame (render);
}
