//Charles Horton, Nathan Cheung

var gl;

var points = [];
blackBoardPoints = [];
redBoardPoints = [];
var rectangleBoardPoints = [];
gamePieces = [];

triangles = [];

redScored = 0;
blackScored = 0;
redCentered = 0;
blackCentered = 0;

var player1 = new Player("Player 1", "red");
var player2 = new Player("Player 2", "black");

var players = [player1, player2];

var currentPlayer;
var currentPlayerIndex;

var firstClick = true;
var playGame; //= true;

var color;
var colorLoc;

indexOfTriangleToMovePieceFrom = 0;

window.onload = function init() {
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 0.39, 0.2, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    // color = vec4 (0.0, 0.0, 0.0, 1.0);
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

    eligibleTrianglePositions = [];
    maxMoves = 0;
    piecesMoved = 0;

    canvas.addEventListener ("click", function(event) {
        if (currentPlayer.hasRolled()) {
            var x = -1 + 2*(event.clientX)/canvas.width;
            var y = -1 + 2*(canvas.height-event.clientY)/canvas.height;

            var indexOfTriangleToMovePieceTo;
            // var eligibleTrianglePositions = [];
            for (var i = 0; i < triangles.length; i++) {
                if (triangles[i].hitTest(x,y) && piecesMoved < maxMoves){
                    if(firstClick && ((currentPlayer.shade == "red" && triangles[i].hasRedPiece) || (currentPlayer.shade == "black" && triangles[i].hasBlackPiece))) {
                        firstClick = false;
                        indexOfTriangleToMovePieceFrom = i;
                        if (currentPlayerIndex === 0) {
                            if (currentPlayer.canBearOff == true) {
                                // if there are no pieces at the triangle corresponding to die 1
                                if (triangles[24 - currentPlayer.dice[0]].pieceNumber == 0) {
                                    eligibleTrianglePositions.push(i + currentPlayer.dice[0]);
                                } else {
                                    var highestGamePieceIndex = getIndexOfHighestGamePieceOnATriangle(24 - currentPlayer.dice[0]);
                                    gamePieces[highestGamePieceIndex].setLocation(24);
                                    gamePieces[highestGamePieceIndex].setCenter();
                                    piecesMoved++;

                                }

                                // if there are no pieces at the triangle corresponding to die 2
                                if (triangles[24 - currentPlayer.dice[1]].pieceNumber == 0) {
                                    eligibleTrianglePositions.push(i + currentPlayer.dice[1]);
                                } else {
                                    var highestGamePieceIndex = getIndexOfHighestGamePieceOnATriangle(24 - currentPlayer.dice[1]);
                                    gamePieces[highestGamePieceIndex].setLocation(24);
                                    gamePieces[highestGamePieceIndex].setCenter();
                                    piecesMoved++;
                                }

                            } else {
                                eligibleTrianglePositions.push(indexOfTriangleToMovePieceFrom + currentPlayer.dice[0]);
                                eligibleTrianglePositions.push(indexOfTriangleToMovePieceFrom + currentPlayer.dice[1]);
                            }
                        } else {
                            if (currentPlayer.canBearOff == true) {
                                // if there are no pieces at the triangle corresponding to die 1
                                if (triangles[6 - currentPlayer.dice[0]].pieceNumber == 0) {
                                    eligibleTrianglePositions.push(i - currentPlayer.dice[0]);
                                } else {
                                    var highestGamePieceIndex = getIndexOfHighestGamePieceOnATriangle(6 - currentPlayer.dice[0]);
                                    gamePieces[highestGamePieceIndex].setLocation(-1);
                                    gamePieces[highestGamePieceIndex].setCenter();
                                    piecesMoved++;
                                }

                                // if there are no pieces at the triangle corresponding to die 2
                                if (triangles[6 - currentPlayer.dice[1]].pieceNumber == 0) {
                                    eligibleTrianglePositions.push(i - currentPlayer.dice[1]);
                                } else {
                                    var highestGamePieceIndex = getIndexOfHighestGamePieceOnATriangle(6 - currentPlayer.dice[1]);
                                    gamePieces[highestGamePieceIndex].setLocation(-1);
                                    gamePieces[highestGamePieceIndex].setCenter();
                                    piecesMoved++;
                                }

                            } else {
                                eligibleTrianglePositions.push(indexOfTriangleToMovePieceFrom - currentPlayer.dice[0]);
                                eligibleTrianglePositions.push(indexOfTriangleToMovePieceFrom - currentPlayer.dice[1]);
                            }
                        }
                        console.log("Move piece from triangle " + indexOfTriangleToMovePieceFrom);
                        console.log("Can move to " + eligibleTrianglePositions[0]  + " or " + eligibleTrianglePositions[1]);
                        //alert("Clicked a " + triangles[i].shade + " triangle whose number is " + triangles[i].position);
                    } else {
                        indexOfTriangleToMovePieceTo = i;
                        console.log("Tried to move to " + indexOfTriangleToMovePieceTo);
                        if ((indexOfTriangleToMovePieceTo === eligibleTrianglePositions[0]) || (indexOfTriangleToMovePieceTo === eligibleTrianglePositions[1])) {
                            //alert("Clicked a " + triangles[i].shade + " triangle whose number is " + triangles[i].position);
                            if (indexOfTriangleToMovePieceTo === eligibleTrianglePositions[0]) {
                                currentPlayer.dice[0] = currentPlayer.dice[1];
                            } else {
                                currentPlayer.dice[1] = currentPlayer.dice[0];
                            }
                            firstClick = true;
                            var highestGamePieceIndex = getIndexOfHighestGamePieceOnATriangle(indexOfTriangleToMovePieceFrom);
                            if (gamePieces[highestGamePieceIndex].setLocation(indexOfTriangleToMovePieceTo) != false) {
                                eligibleTrianglePositions = [];
                                piecesMoved++;
                                renderPieces(program);
                            } else {
                                alert("You can't move that piece here\nPick the piece you want to move again");
                                firstClick = true;
                            }

                        } else {
                            alert("You can't move that piece here\nPick the piece you want to move again");
                            firstClick = true;
                        }
                    }
                }
            }
        } else {
            alert("You need to roll first");
        }
    });

    document.getElementById("RollDice").onclick = function() {
        if(!currentPlayer.hasRolled()) {
            currentPlayer.rollDice();
            alert("Rolled a " + currentPlayer.dice[0] + " and a " + currentPlayer.dice[1]);
        } else {
            alert("You can't roll again!\nYou already rolled a " + currentPlayer.dice[0] + " and a " + currentPlayer.dice[1]);
        }
    };

    document.getElementById("EndTurn").onclick = function() {
        if (currentPlayer.hasRolled()) {
            if (currentPlayerIndex === 1) {
                currentPlayerIndex = 0;
            } else {
                currentPlayerIndex = 1;
            }
            currentPlayer.dice = [];
            currentPlayer = players[currentPlayerIndex];
            piecesMoved = 0;
        } else {
            alert("You haven't rolled yet!")
        }
        alert(currentPlayer.nickname + "'s turn");
    };

    currentPlayerIndex = 0; //determineFirstMove();
    currentPlayer = players[0];
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

function determineCanBearOff() {
    var count = 0;
    for (var i = 18; i < 23; i++) {
        count += triangles[i].pieceNumber;
    }
    if (count === 15) {
        player1.canBearOff = true;
    }

    count = 0;
    for (var i = 0; i < 6; i++) {
        count += triangles[i].pieceNumber;
    }
    if (count === 15) {
        player2.canBearOff = true;
    }
}

function Player(nickname, color) {
    this.nickname = nickname;
    this.shade = color;
    this.dice = [];
    this.canBearOff = false;

    this.rollDice = function() {
        var die1 = Math.floor(Math.random() * (6)) + 1;
        var die2 = Math.floor(Math.random() * (6)) + 1;
        if (die1 == die2) {
            maxMoves = 4;
        } else {
            maxMoves = 2;
        }
        this.dice = [ die1, die2 ];
    };

    this.hasRolled = function() {
        return this.dice.length != 0;
    };
}

// Draws the black triangles on the board
function renderBlackBoard(program) {
    gl.clear( gl.COLOR_BUFFER_BIT );

    var blackBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, blackBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(blackBoardPoints), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.uniform4fv (colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
    gl.drawArrays( gl.TRIANGLES, 0, blackBoardPoints.length )
}

// Draws the red triangles on the board
function renderRedBoard(program) {
    var redBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, redBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(redBoardPoints), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.uniform4fv (colorLoc, vec4(1.0, 0.0, 0.0, 1.0));
    gl.drawArrays( gl.TRIANGLES, 0, redBoardPoints.length )
}

// Draws the two vertical bars on the board
function renderRectangleBoard(program) {
    var rectangleBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, rectangleBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectangleBoardPoints), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
        

    gl.uniform4fv (colorLoc, vec4 (0.5, 0.15, 0.1, 1.0));
    gl.drawArrays( gl.TRIANGLES, 0, rectangleBoardPoints.length )
}

function renderPieces(program){
    renderBlackBoard(program);
    renderRedBoard(program);
    renderRectangleBoard(program);
    for (var i = 0; i < gamePieces.length; i++) {
        gamePieces[i].fillPointsArray();
        var gamePieceBufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gamePieceBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(gamePieces[i].points), gl.STATIC_DRAW);

        if (gamePieces[i].shade === "red") {
            color = vec4(0.6, 0.0, 0.0, gamePieces[i].lightness);
        }
        else{
            color = vec4(0.1, 0.1, 0.1, gamePieces[i].lightness);
        }

        vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.uniform4fv(colorLoc, color);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, gamePieces[i].points.length);
    }
    determineCanBearOff();
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
    this.hasBlackPiece = false;
    this.hasRedPiece = false;

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
    this.lightness = 1.0;
    this.setCenter();
}

GamePiece.prototype.setCenter = function(){
    if (this.position < 6){
        this.xCord = ((5/7 - this.position/7) + (6/7 - this.position/7))/2;
        this.yCord = -1 + (1/14) + triangles[this.position].pieceNumber*(1/15);
    }
    else if (this.position < 12 && this.position > 5){
        this.xCord = ((-2/7 - (this.position-6)/7) + (-1/7 - (this.position-6)/7))/2;
        this.yCord = -1 + (1/14) + triangles[this.position].pieceNumber*(1/15);
    }
    else if (this.position < 18 && this.position > 11){
        this.xCord = ((-1 + (this.position-12)/7) + (-1 + (this.position-11)/7))/2;
        this.yCord = 1 - (1/14) - triangles[this.position].pieceNumber*(1/15);
    }
    else if (this.position < 25 && this.position > 17){
        this.xCord = ((this.position-18)/7 + (this.position-17)/7)/2;
        this.yCord = 1 - (1/14) - triangles[this.position].pieceNumber*(1/15);
    }
    //black center jail
    else if (this.position === 25 && this.shade === 'black'){
        this.xCord = -1/14;
        this.yCord = 1/15 + (1/15)*blackCentered
    }
    //red center jail
    else if (this.position === 25 && this.shade === 'red'){
        this.xCord = -1/14;
        this.yCord = -1/15 - (1/15)*redCentered
    }
    // this.lightness += triangles[this.position].pieceNumber*(1/27);
    if (this.position != 25){
        this.lightness = 1 - triangles[this.position].pieceNumber*(1/15);
    }
};

GamePiece.prototype.setLocation = function(position){
    if (position == 25){
        triangles[this.position].pieceNumber--;
        this.position = position;
        return true;
    }
    else if (triangles[position].hasRedPiece && triangles[position].pieceNumber > 1 && this.shade == 'black')
        return false;
    else if (triangles[position].hasBlackPiece && triangles[position].pieceNumber > 1 && this.shade == 'red')
        return false;
    else if (triangles[position].hasRedPiece && triangles[position].pieceNumber === 1 && this.shade == 'black') {
        for (var i = 0; i < gamePieces.length; i++) {
            if (gamePieces[i].position === position) {
                triangles[position].hasRedPiece = false;
                gamePieces[i].setLocation(25);
                gamePieces[i].setCenter();
            }
        }
    }
    else if (triangles[position].hasBlackPiece && triangles[position].pieceNumber === 1 && this.shade == 'red') {
        for (i = 0; i < gamePieces.length; i++) {
            if (gamePieces[i].position === position) {
                triangles[position].hasBlackPiece = false;
                gamePieces[i].setLocation(25);
                gamePieces[i].setCenter()
            }
        }
    }
    if (triangles[this.position].pieceNumber === 1){
        triangles[this.position].hasBlackPiece = false;
        triangles[this.position].hasRedPiece = false;
    }

    triangles[this.position].pieceNumber--;
    this.position = position;
    this.setCenter();
    triangles[this.position].pieceNumber++;

    if (this.shade === 'red'){
        triangles[this.position].hasRedPiece = true;
    }
    else{
        triangles[this.position].hasBlackPiece = true;
    }
    return true;
};

GamePiece.prototype.fillPointsArray = function(){
    this.points = [];
    for (var theta = 0; theta < Math.PI*2; theta += Math.PI/20){
        var p = vec2((Math.cos(theta))*(1/14)+this.xCord, Math.sin(theta)*(1/14)+this.yCord);
        this.points.push(p);
    }
};

function fillGamePieceArray(){
    for (var i = 0; i < 2; i++){
        this.gamePieces.push(new GamePiece("red", 0));
        this.triangles[0].pieceNumber +=1;
        this.triangles[0].hasRedPiece = true;
        this.gamePieces.push(new GamePiece("black", 23));
        this.triangles[23].pieceNumber +=1;
        this.triangles[23].hasBlackPiece = true;
    }

    for (i = 0; i < 3; i++){
        this.gamePieces.push(new GamePiece("red", 16));
        this.triangles[16].pieceNumber +=1;
        this.triangles[16].hasRedPiece = true;
        this.gamePieces.push(new GamePiece("black", 7));
        this.triangles[7].pieceNumber +=1;
        this.triangles[7].hasBlackPiece = true;
    }

    for (i = 0; i < 5; i++){
        this.gamePieces.push(new GamePiece("red", 11));
        this.triangles[11].pieceNumber +=1;
        this.triangles[11].hasRedPiece = true;
        this.gamePieces.push(new GamePiece("red", 18));
        this.triangles[18].pieceNumber +=1;
        this.triangles[18].hasRedPiece = true;
        this.gamePieces.push(new GamePiece("black", 5));
        this.triangles[5].pieceNumber +=1;
        this.triangles[5].hasBlackPiece = true;
        this.gamePieces.push(new GamePiece("black", 12));
        this.triangles[12].pieceNumber +=1;
        this.triangles[12].hasBlackPiece = true;
    }
}

