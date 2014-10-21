//Charles Horton, Nathan Cheung

var gl;

var points = [];
var blackBoardPoints = [];
var redBoardPoints = [];
var rectangleBoardPoints = [];
var gamePieces = [];

var triangles = [];

var player1 = new Player("Player 1", "red");
var player2 = new Player("Player 2", "black");

var players = [player1, player2];

var currentPlayer;
var currentPlayerIndex;

var firstClick = true;
var playGame; //= true;

var color;
var colorLoc;

window.onload = function init() {
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 0.8, 0.7, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    color = vec4 (0.0, 0.0, 0.0, 1.0);
    colorLoc = gl.getUniformLocation (program, "color");

    // setTriangleCoords(1, "red", "black");
    // setTriangleCoords(-1, "black", "red");
    setTriangles("red", "black");
    setCoords();
    setRectangleBoardCoords();

    var blackBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, blackBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(blackBoardPoints), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    renderBlackBoard();

    var redBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, redBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(redBoardPoints), gl.STATIC_DRAW );
    color = vec4 (1.0, 0.0, 0.0, 1.0);

    // Associate out shader variables with our data buffer

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    renderRedBoard();

    var rectangleBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, rectangleBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectangleBoardPoints), gl.STATIC_DRAW );
    color = vec4 (0.3, 0.0, 0.0, 1.0);

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    renderRectangleBoard();

    fillGamePieceArray();
    renderPieces(program);

    canvas.addEventListener ("click", function(event) {
        var x = -1 + 2*(event.clientX)/canvas.width;
        var y = -1 + 2*(canvas.height-event.clientY)/canvas.height;
        var indexOfTriangleToMovePieceFrom;
        var indexOfTriangleToMovePieceTo;
        for (var i = 0; i < triangles.length; i++) {
            if (triangles[i].hitTest(x,y)) {
                if(firstClick) {
                    firstClick = false;
                    indexOfTriangleToMovePieceFrom = i;
                    alert("Clicked a " + triangles[i].shade + " triangle whose number is " + triangles[i].position);
                } else {
                    firstClick = true;
                    indexOfTriangleToMovePieceTo = i;
                    alert("Clicked a " + triangles[i].shade + " triangle whose number is " + triangles[i].position);
                    triangles[indexOfTriangleToMovePieceFrom].pieceNumber -= 1;
                    triangles[indexOfTriangleToMovePieceTo].pieceNumber += 1;
                    // TODO: need to access gamePiece and setLocation to ith triangle
                    gamePieces[getIndexOfHighestGamePieceOnATriangle].setLocation(indexOfTriangleToMovePieceTo);
                    renderPieces(program);
                }
            }
        }
    });

    document.getElementById("RollDice").onclick = function() {
        if(!currentPlayer.hasRolled()) {
            currentPlayer.rollDice();
            alert("Rolled a " + currentPlayer.dice[0] + " and a " + currentPlayer.dice[1]);
        } else {
            alert("You can't roll again!\nYou already rolled a " + currentPlayer.dice[0] + " and a " + currentPlayer.dice[1]);
        }
    }

    document.getElementById("EndTurn").onclick = function() {
        if (currentPlayer.hasRolled()) {
            if (currentPlayerIndex === 1) {
                currentPlayerIndex = 0;
            } else {
                currentPlayerIndex = 1;
            }
            currentPlayer.dice = [];
            currentPlayer = players[currentPlayerIndex];
        } else {
            alert("You haven't rolled yet!")
        }
        alert(currentPlayer.nickname + "'s turn");
    }

    currentPlayerIndex = determineFirstMove();
    console.log(playGame);
    //playGame = true;

    // while (playGame) {
    //      currentPlayer = players[currentPlayerIndex];
    //      playGame = false;
    // }
};

// Each player rolls a die to determine who goes first
function determineFirstMove() {
    var player1Roll = Math.random(1,6);
    var player2Roll = Math.random(1,6);

    if (player1Roll > player2Roll) {
        currentPlayer = players[0];
        playGame = confirm("Player 1 Goes First");
        if (playGame) {
            // do nothing
        } else {
            playGame = true;
        }
        return 0;
    } else if (player2Roll > player1Roll) {
        currentPlayer = players[1];
        playGame = confirm("Player 2 Goes First");
        if (playGame) {
            // do nothing
        } else {
            playGame = true;
        }
        return 1;
    } else {
        determineFirst();
    }
}

function Player(nickname, color) {
    this.nickname = nickname;
    this.shade = color;
    this.dice = [];

    this.rollDice = function() {
        this.dice = [ Math.floor(Math.random() * (6)) + 1, Math.floor(Math.random() * (6)) + 1 ];
    };

    this.hasRolled = function() {
        return this.dice.length != 0;
    };
}

// Draws the black triangles on the board
function renderBlackBoard() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.TRIANGLES, 0, blackBoardPoints.length )
}

// Draws the red triangles on the board
function renderRedBoard() {
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.TRIANGLES, 0, redBoardPoints.length )
}

// Draws the two vertical bars on the board
function renderRectangleBoard() {
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.TRIANGLES, 0, rectangleBoardPoints.length )
}

function renderPieces(program){
    for (var i = 0; i < gamePieces.length; i++) {
        gamePieces[i].fillPointsArray();
        var gamePieceBufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gamePieceBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(gamePieces[i].points), gl.STATIC_DRAW);
        color = vec4(0.0, 0.0, 1.0, 1.0);

        vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.uniform4fv(colorLoc, color);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, gamePieces[i].points.length);
    }
}

// Pushes the vertices of each triangle to an array of points based on the triangle's color
function setCoords() {
    var length = triangles.length;
    for (var i = 0; i < length; i++) {
        if (triangles[i].shade === 'red') {
            redBoardPoints.push(triangles[i].vertexA);
            redBoardPoints.push(triangles[i].vertexB);
            redBoardPoints.push(triangles[i].vertexC);
        }
        else {
            blackBoardPoints.push(triangles[i].vertexA);
            blackBoardPoints.push(triangles[i].vertexB);
            blackBoardPoints.push(triangles[i].vertexC);
        }
    }
}

// Draws alternating black and red triangles in each quadrant
function setTriangles(color1, color2){
    for (var i = 0; i < 6; i++){
        if (i%2===0)
            var tColor = color2;
        else
            tColor = color1;

        var leftBound = 5/7 - i/7;
        var rightBound = 6/7 - i/7;
        var topBound = -1/8;
        var bottomBound = -1;

        var p1 = vec2(5/7 - i/7, -1);
        var p2 = vec2(6/7 - i/7, -1);
        var p3 = vec2(((5/7 - i/7) + (6/7 - i/7))/2, -1/8);
        triangles.push(new Triangle(p1, p2, p3, tColor, leftBound, rightBound, topBound, bottomBound, i));
    }

    for (i = 6; i < 12; i++){
        if (i%2===0)
            tColor = color2;
        else
            tColor = color1;

        leftBound = -2/7 - (i-6)/7;
        rightBound = -1/7 - (i-6)/7;
        topBound = -1/8;
        bottomBound = -1;

        p1 = vec2(-2/7 - (i-6)/7, -1);
        p2 = vec2(-1/7 - (i-6)/7, -1);
        p3 = vec2(((-2/7 - (i-6)/7) + (-1/7 - (i-6)/7))/2, -1/8);
        triangles.push(new Triangle(p1, p2, p3, tColor, leftBound, rightBound, topBound, bottomBound, i));
    }

    for (i = 12; i < 18; i++){
        if (i%2===0)
            tColor = color2;
        else
            tColor = color1;

        leftBound = -1 + (i-12)/7;
        rightBound = -1 + (i-11)/7;
        topBound = 1;
        bottomBound = 1/8;

        p1 = vec2(-1 + (i-12)/7, 1);
        p2 = vec2(-1 + (i-11)/7, 1);
        p3 = vec2(((-1 + (i-12)/7) + (-1 + (i-11)/7))/2, 1/8);
        triangles.push(new Triangle(p1, p2, p3, tColor, leftBound, rightBound, topBound, bottomBound, i));
    }

    for (i = 18; i < 24; i++){
        if (i%2===0)
            tColor = color2;
        else
            tColor = color1;

        leftBound = (i-18)/7;
        rightBound = (i-17)/7;
        topBound = 1;
        bottomBound = 1/8;

        p1 = vec2((i-18)/7, 1);
        p2 = vec2((i-17)/7, 1);
        p3 = vec2(((i-18)/7 + (i-17)/7)/2, 1/8);
        triangles.push(new Triangle(p1, p2, p3, tColor, leftBound, rightBound, topBound, bottomBound, i));
    }
}

// Sets up the vertical bars in the middle of the board and at the right edge of the board
function setRectangleBoardCoords() {
    var p1 = vec2(-1/7, 1);
    var p2 = vec2(-1/7, -1);
    var p3 = vec2(0, 1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);
    p1 = vec2(-1/7, -1);
    p2 = vec2(0, 1);
    p3 = vec2(0, -1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);

    p1 = vec2(6/7, 1);
    p2 = vec2(6/7, -1);
    p3 = vec2(1, 1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);
    p1 = vec2(6/7, -1);
    p2 = vec2(1, 1);
    p3 = vec2(1, -1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);
}

function getIndexOfHighestGamePieceOnATriangle(trianglePosition) {
    var highestGamePieceIndex = null;

    for (var i = 0; i < gamePieces.length; i++) {
        if (gamePieces[i].position === trianglePosition) {
            if (highestGamePieceIndex == null) {
                highestGamePieceIndex = i;
            } else if (trianglePosition >= 12) {
                if (gamePieces[highestGamePieceIndex].yCord > gamePieces[i].yCord) {
                    highestGamePieceIndex = i;
                }
            } else {
                if (gamePieces[highestGamePieceIndex].yCord < gamePieces[i].yCord) {
                    highestGamePieceIndex = i;
                }
            }
        }
    }
    return highestGamePieceIndex;
}

function Triangle(a, b, c, color, leftBound, rightBound, topBound, bottomBound, position) {
    this.vertexA = a;
    this.vertexB = b;
    this.vertexC = c;
    this.leftBound = leftBound
    this.rightBound = rightBound;
    this.topBound = topBound;
    this.bottomBound = bottomBound;
    this.position = position;
    this.pieceNumber = 0;

    this.shade = color;
    // this.onClick1 = function(event) {
    //     console.log("Clicked a triangle");
    // };
    // this.onClick2 = function(event) {
    //     console.log("Clicked a triangle");
    // };
    // element.addEventListener('click', this.onClick1, false);
    // element.addEventListener('click', this.onClick2, false);

    this.hitTest = function (x, y) {

        var inWidthBox = false;
        var inLengthBox = false;

        if (x > this.leftBound && x < this.rightBound) {
            inWidthBox = true;
        }

        if (y > this.bottomBound && y < this.topBound) {
            inLengthBox = true;
        }

        return (inWidthBox && inLengthBox);
    };
}

function sayClicked(event) {
    console.log("Click event");
}

function GamePiece(color, position) {
    this.shade = color;
    this.position = position;
    this.points = [];
    this.xCord = 0;
    this.yCord = 0;
}

GamePiece.prototype.setCenter = function(){
    if (this.position < 6){
        this.xCord = ((5/7 - this.position/7) + (6/7 - this.position/7))/2;
        this.yCord = triangles[this.position].pieceNumber*1/15*-1
    }
    else if (this.position < 12 && this.position > 5){
        this.xCord = ((-2/7 - (this.position-6)/7) + (-1/7 - (this.position-6)/7))/2;
        this.yCord = triangles[this.position].pieceNumber*1/15*-1
    }
    else if (this.position < 18 && this.posiiton > 11){
        this.xCord = ((-1 + (this.position-12)/7) + (-1 + (this.position-11)/7))/2;
        this.yCord = triangles[this.position].pieceNumber*1/15
    }
    else if (this.position < 24 && this.posiiton > 17){
        this.xCord = ((this.position-18)/7 + (this.position-17)/7)/2;
        this.yCord = triangles[this.position].pieceNumber*1/15
    }
};

GamePiece.prototype.setLocation = function(position){
    this.position = position;
};

GamePiece.prototype.fillPointsArray = function(){
    this.setCenter();
    for (var theta = 0; theta < Math.PI*2; theta += Math.PI/20){
        var p = vec2((-(1/14) - Math.cos(theta))*.1+this.xCord, Math.sin(theta)*.1+this.yCord);
        this.points.push(p);
    }
};

function fillGamePieceArray(){
    for (var i = 0; i < 2; i++){
        this.gamePieces.push(new GamePiece("red", 0));
        this.triangles[0].pieceNumber +=1;
        this.gamePieces.push(new GamePiece("black", 23));
        this.triangles[23].pieceNumber +=1;
    }

    for (i = 0; i < 3; i++){
        this.gamePieces.push(new GamePiece("red", 16));
        this.triangles[16].pieceNumber +=1;
        this.gamePieces.push(new GamePiece("black", 7));
        this.triangles[7].pieceNumber +=1;
    }

    for (i = 0; i < 5; i++){
        this.gamePieces.push(new GamePiece("red", 11));
        this.triangles[11].pieceNumber +=1;
        this.gamePieces.push(new GamePiece("red", 18));
        this.triangles[18].pieceNumber +=1;
        this.gamePieces.push(new GamePiece("black", 5));
        this.triangles[5].pieceNumber +=1;
        this.gamePieces.push(new GamePiece("black", 12));
        this.triangles[12].pieceNumber +=1;
    }
}

