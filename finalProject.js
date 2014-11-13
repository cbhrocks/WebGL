/* Charles Horton, Nathan Cheung */

var canvas;
var gl;
var ctx;

var fieldOfView = 45;

//initialize GL to the canvas
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if ( !gl ) { alert( "WebGL isn't available" ); }
}


var program;

//
//  Load shaders then set attributes and uniforms.
//
function setAttributeAndUniformLocations() {

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
    gl.enableVertexAttribArray(program.textureCoordAttribute);

    program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);

    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
    program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
    program.samplerUniform = gl.getUniformLocation(program, "uSampler");
    program.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
    program.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
    program.pointLightingLocationUniform = gl.getUniformLocation(program, "uPointLightingLocation");
    program.pointLightingColorUniform = gl.getUniformLocation(program, "uPointLightingColor");
}

//
//  Binds the given texture and generates mipmaps for it.
//
function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}


var crateTexture;

//apply all the textures to the objects
function initTextures() {
    for (var planetNum = 0; planetNum < planets.length; planetNum++){
        planets[planetNum].initPlanetTexture();
    }

    crateTexture = gl.createTexture();
    crateTexture.image = new Image();
    crateTexture.image.onload = function () {
        handleLoadedTexture(crateTexture)
    }
    crateTexture.image.src = "asteroidMap.png";
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

//
//   Makes a copy of the current model-view matrix and pushes it onto the stack.
//
function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}


//
//   Pops off the last model-view matrix on the stack.
//
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//
//   Sets the perspection and model-view matrices to their respective uniforms in the HTML file.
//   Also uses the model-view matrix to create the normal matrix which is then set to its respective uniform in the HTML file.
//
function setMatrixUniforms() {
    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(program.nMatrixUniform, false, normalMatrix);
}

//
//   Converts the given degree angle into radians.
//
function radians(degrees) {
    return degrees * Math.PI / 180;
}

//create the planet class
var Planet = (function() {
    //construct a planet object
    function Planet(radius, xpos, ypos, zpos, longitudeBands, latitudeBands, initRotateAngle, rotateSpeed, turnSpeed, isSun, textureFile){
        this._longitudeBands = longitudeBands;
        this._latitudeBands = latitudeBands;
        this._radius = radius;
        this._xpos = xpos;
        this._ypos = ypos;
        this._zpos = zpos;
        this._rotateAngle = initRotateAngle;
        this._turnAngle = 0;
        this._rotateSpeed = rotateSpeed;
        this._turnSpeed = turnSpeed;
        this._textureFile = textureFile;
        this._texture;
        this._vertexPositionData = [];
        this._normalData = [];
        this._textureCoordData = [];
        this._indexData = [];
        this._vertexPositionBuffer;
        this._vertexNormalBuffer;
        this._vertexTextureCoordBuffer;
        this._vertexIndexBuffer;
        this._isSun = isSun;
    };

    //put fill planet arrays and create planet buffer data into one function so that they can be called together.
    Planet.prototype.initPlanetBuffers = function(){
        this.fillPlanetArrays();
        this.createPlanetBufferData();
    };

    // fill the planet arrays with the data necessary for creating
    // the wire frame (_vertexPositionData), the planet's normals
    // (_normalData), the texture coordinate data (_textureCoordData),
    // and the index data (_indexData)
    Planet.prototype.fillPlanetArrays = function(){
        // go around in a circle getting theta for each lattitude band 
        for (var latNumber=0; latNumber <= this._latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / this._latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= this._longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / this._longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);


                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / this._longitudeBands);
                var v = 1 - (latNumber / this._latitudeBands);

                // fill normalData witht he x y and z components of the 
                // normal vector for each plane. if its the sun make the normals
                // face inward so that its always lit up.
                if (this._isSun == true){
                    this._normalData.push(-x);
                    this._normalData.push(-y);
                    this._normalData.push(-z);
                }
                else{
                    this._normalData.push(x);
                    this._normalData.push(y);
                    this._normalData.push(z);
                }
                // fill textureCoordData with the x and y values so it knows where
                // on the object to place the texture.
                this._textureCoordData.push(u);
                this._textureCoordData.push(v);
                // fill vertexPositionData with the x y and z coordinates 
                // of all the vertices created
                // by the overlapping longitude and latitude bands
                this._vertexPositionData.push(this._radius * x);
                this._vertexPositionData.push(this._radius * y);
                this._vertexPositionData.push(this._radius * z);
            }
        }

        // create the index array so that the texture is mapped correctly.
        // use 6 values so that the two points of each triangle are overlapped.
        var indexData = [];
        for (var latNumber=0; latNumber < this._latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < this._longitudeBands; longNumber++) {
                var first = (latNumber * (this._longitudeBands + 1)) + longNumber;
                var second = first + this._longitudeBands + 1;
                this._indexData.push(first);
                this._indexData.push(second);
                this._indexData.push(first + 1);

                this._indexData.push(second);
                this._indexData.push(second + 1);
                this._indexData.push(first + 1);
            }
        }
    };

    // create the buffers using the four arrays made in fillPlanetArrays. 
    Planet.prototype.createPlanetBufferData = function(){
        this._vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._normalData), gl.STATIC_DRAW);
        this._vertexNormalBuffer.itemSize = 3;
        this._vertexNormalBuffer.numItems = this._normalData.length / 3;

        this._vertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._textureCoordData), gl.STATIC_DRAW);
        this._vertexTextureCoordBuffer.itemSize = 2;
        this._vertexTextureCoordBuffer.numItems = this._textureCoordData.length / 2;

        this._vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertexPositionData), gl.STATIC_DRAW);
        this._vertexPositionBuffer.itemSize = 3;
        this._vertexPositionBuffer.numItems = this._vertexPositionData.length / 3;

        this._vertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indexData), gl.STREAM_DRAW);
        this._vertexIndexBuffer.itemSize = 1;
        this._vertexIndexBuffer.numItems = this._indexData.length;
    };

    // perform the planet translations, rotations, building, and texturing. 
    Planet.prototype.drawPlanet = function(){
        //use for moving/rotating the stuff that is going to be loaded by gl.
        mvPushMatrix();

        // rotate the data based on the rotate angle in the constructor. makes it orbit
        mat4.rotate(mvMatrix, radians(this._rotateAngle), [0, 1, .2]);
        // move the data based on the x y and z position in the constructor.
        mat4.translate(mvMatrix, [0 + this._xpos, 0 + this._ypos, 0 + this._zpos]);
        // rotate the data again based on the turn angle after it has been translated. makes it spin
        mat4.rotate(mvMatrix, radians(this._turnAngle), [0, 1, .2]);

        // bind the textures to the planet
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.uniform1i(program.samplerUniform, 0);

        // give gl the vertices stored in the vertexPositionBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexPositionBuffer);
        gl.vertexAttribPointer(program.vertexPositionAttribute, this._vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // give gl the vertices stored in the vertexTextureCoordBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexTextureCoordBuffer);
        gl.vertexAttribPointer(program.textureCoordAttribute, this._vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // give gl the vertices stored in the vertexNormalBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexNormalBuffer);
        gl.vertexAttribPointer(program.vertexNormalAttribute, this._vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // give gl the vertices stored in the vertexIndexBuffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vertexIndexBuffer);
        setMatrixUniforms();

        //draw all the elements using gl
        gl.drawElements(gl.TRIANGLES, this._vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();
    };

    // create the texture that is going to be put on the planet by grabbing it from the file.
    Planet.prototype.initPlanetTexture = function(){
        this._texture = gl.createTexture();
        this._texture.image = new Image();
        var tempTexture = this._texture;
        this._texture.image.onload = function () {
            handleLoadedTexture(tempTexture)
        }
        this._texture.image.src = this._textureFile;
        // planets[0].setPlanetTexture(this._texture);
    };

    // rotate and turn the planet its rotate and turn speed and the amount of time elapsed.
    Planet.prototype.rotateAndTurn = function(elapsed){
        currentRotateAngle = this.getPlanetRotateAngle();
        currentTurnAngle = this.getPlanetTurnAngle();
        this.setPlanetAngles(currentRotateAngle + this._rotateSpeed * elapsed, currentTurnAngle + this._turnSpeed * elapsed);
    };

    // set current rotate and turn angles of the planet
    Planet.prototype.setPlanetAngles = function(rotateAngle, turnAngle){
        this._rotateAngle = rotateAngle;
        this._turnAngle = turnAngle;
    };

    // get the planet rotate angle
    Planet.prototype.getPlanetRotateAngle = function(){
        return this._rotateAngle;
    };

    // get the planet turn angle
    Planet.prototype.getPlanetTurnAngle = function(){
        return this._turnAngle;
    }

    // get the planet xposition
    Planet.prototype.getPlanetXpos = function(){
        return this._xpos;
    }

    // get the planet y position
    Planet.prototype.getPlanetYpos = function(){
        return this._ypos;
    }

    // get the planet z position
    Planet.prototype.getPlanetZPos = function(){
        return this._zpos;
    }

    // set the planet x position
    Planet.prototype.setPlanetXpos = function(xpos){
        this._xpos = xpos;
    }

    // set the planet y position
    Planet.prototype.setPlanetYpos = function(ypos){
        this._ypos = ypos;
    }

    // set the planet z position
    Planet.prototype.setPlanetZpos = function(zpos){
        this._zpos = zpos;
    }

    return Planet
})();

var cubeVertexPositionBuffer;
var cubeVertexNormalBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;

//create the planets array that holds all of the planet objects, and fill it with new planets.
var planets = [];
planets.push(new Planet(4, 0, 0, 0, 30, 30, 180, .06, .1, true, "sunMap.jpg"));
planets.push(new Planet(1, 4+4, 0, 0, 30, 30, 180, .02, .2, false, "mercurymap.jpg"));
planets.push(new Planet(1, 6+4, 0, 0, 30, 30, 180, .06, .4, false, "venusmap.jpg"));
planets.push(new Planet(1, 8+4, 0, 0, 30, 30, 180, .034, .13, false, "earthMap.jpg"));
planets.push(new Planet(1, 10+4, 0, 0, 30, 30, 180, .071, .17, false, "marsmap1k.jpg"));
planets.push(new Planet(1, 12+4, 0, 0, 30, 30, 180, .024, .12, false, "jupitermap.jpg"));
planets.push(new Planet(1, 14+4, 0, 0, 30, 30, 180, .011, .32, false, "saturnmap.jpg"));
planets.push(new Planet(1, 16+4, 0, 0, 30, 30, 180, .055, .25, false, "uranusmap.jpg"));
planets.push(new Planet(1, 18+4, 0, 0, 30, 30, 180, .049, .32, false, "neptunemap.jpg"));
planets.push(new Planet(1, 20+4, 0, 0, 30, 30, 180, .056, .06, false, "plutomap1k.jpg"));

function initCubeBuffers() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    var vertexNormals = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back face
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top face
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom face
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right face
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = 24;

    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    var textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;

    for (var planetNum = 0; planetNum < planets.length; planetNum++){
        planets[planetNum].initPlanetBuffers();
    }
}

var cubeAngle = 0;

// draw everything!
function render() {
    // make the viewport
    gl.viewport(0, 0, gl.viewportWidth - fieldOfView, gl.viewportHeight - fieldOfView);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the perspective in the viewport
    mat4.perspective(pMatrix, fieldOfView, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    // set the lighting values in the scene
    gl.uniform1i(program.useLightingUniform, true);
    gl.uniform3f(program.ambientColorUniform, 0.2, 0.2, 0.2);
    gl.uniform3f(program.pointLightingLocationUniform, 0.0, 0.0, -50.0);
    gl.uniform3f(program.pointLightingColorUniform, 1.0, 1.0, 1.0);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0, 0, -50]);

    for (planetNum = 0; planetNum < planets.length; planetNum++){
        planets[planetNum].drawPlanet();
    }

    mvPushMatrix();

    mat4.rotate(mvMatrix, radians(cubeAngle), [0, 1, 0]);
    mat4.translate(mvMatrix, [28, 0, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(program.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(program.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, crateTexture);
    gl.uniform1i(program.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();
}


var lastTime = 0;

// a function that keeps track of time and updates positions based on the change in time between renders.
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        for (planetNum = 0; planetNum < planets.length; planetNum++){
            planets[planetNum].rotateAndTurn(elapsed)
        }

        cubeAngle += 0.05 * elapsed;
    }
    lastTime = timeNow;
}

function tick() {
    requestAnimFrame(tick);
    render();
    animate();
}

// Start webGL!
function webGLStart() {
    canvas = document.getElementById( "gl-canvas" );
    ctx = canvas.getContext("experimental-webgl");
    
    window.addEventListener('resize', resizeCanvas, false);

    // resize the canvas and initialize everything based on the current window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // initialize all the stuff 
        initGL(canvas);
        initTextures();
        setAttributeAndUniformLocations();
        initCubeBuffers();

        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // move the field of view farther away
    document.addEventListener('keyup', function(event) {
        if (event.keyCode == 38) {
            fieldOfView += 0.1;
        }
    });

    // move the field of view closer
    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 40) {
            fieldOfView -= 0.1;
        }
    });
    
    resizeCanvas();

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
};
