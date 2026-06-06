let spaces = [];
let forcedMoves = [];
let threatenedSpaces = [];
let safeSpaces = [];
let attackingPiece = [];
let whiteKing = [4, 0];
let whiteKingRange = [];
let blackKing = [4, 7];
let blackKingRange = [];
let enPassant = null;
let checks = 0;
let turn = "white";
let opposite = "black";
let selectedPiece = null;
let check = null;
let connected = null;
let winner = null;
let uiDisplay;
let whiteCastle = true;
let blackCastle = true;
let promoting = false
const pieces = {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟"
};
document.addEventListener("DOMContentLoaded", loadBoard); 
function loadBoard() {
    const board = document.getElementById("board");
    uiDisplay = document.getElementById("status");
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let newSquare = document.createElement("div");
            newSquare.classList.add("square");
            board.appendChild(newSquare);
            newSquare.id = j + "-" + (7 - i);
            newSquare.dataset.row = 7 - i;
            newSquare.dataset.col = j;
            spaces.push(newSquare);
            if ((i + j) % 2 === 0) {
                newSquare.classList.add("light");
            } else {
                newSquare.classList.add("dark");
            }
        }
    }
    newGame();
    board.addEventListener("click", handleBoardClick);
    document.getElementById("reset").addEventListener("click", newGame);
}
function newGame() {
    turn = "white";
    winner = null;
    uiDisplay.textContent = "";
    forcedMoves = [];
    safeSpaces = [];
    threatenedSpaces = [];
    attackingPiece = [];
    whiteKing = [4, 0];
    blackKing = [4, 7];
    whiteKingRange = [];
    blackKingRange = [];
    enPassant = null; 
    checks = 0;
    selectedPiece = null; 
    connected = null;
    check = null;
    whiteCastle = true;
    blackCastle = true;
    promoting = false;
    document.getElementById("promotion-modal").style.display = "none";
   clearSelections(true);
   spaces.forEach(space => {
        let row = parseInt(space.dataset.row);
        let col = parseInt(space.dataset.col);
        if (row === 0) {
            if (col === 0 || col === 7) {
                setPiece(space, "rook", "white");
                space.classList.add("castle");
            } else if (col === 1 || col === 6) {
                setPiece(space, "knight", "white");
            } else if (col === 2 || col === 5) {
                setPiece(space, "bishop", "white");
            } else if (col === 3) {
                setPiece(space, "queen", "white");
            } else if (col === 4) {
                setPiece(space, "king", "white");
            }
        } else if (row === 1) {
            setPiece(space, "pawn", "white");
        } else if (row === 6) {
            setPiece(space, "pawn", "black");
        } else if (row === 7) {
            if (col === 0 || col === 7) {
                setPiece(space, "rook", "black");
                space.classList.add("castle");
            } else if (col === 1 || col === 6) {
                setPiece(space, "knight", "black");
            } else if (col === 2 || col === 5) {
                setPiece(space, "bishop", "black");
            } else if (col === 3) {
                setPiece(space, "queen", "black");
            } else if (col === 4) {
                setPiece(space, "king", "black");
            }
        }
   });
}
function setPiece(space, piece, color) {
    clearPiece(space);
    space.classList.add(color);
    space.textContent = pieces[piece];
    space.dataset.piece = piece;
    if (piece === "king") {
        if (turn === "white") {
            if (whiteCastle && parseInt(space.dataset.col) === 6) {
                setPiece(document.getElementById("5-0"), "rook", "white")
                clearPiece(document.getElementById("7-0"));
                whiteCastle = false;
            } else if (whiteCastle && parseInt(space.dataset.col) === 2) {
                setPiece(document.getElementById("3-0"), "rook", "white")
                clearPiece(document.getElementById("0-0"));
                whiteCastle = false;
            } else {
                whiteCastle = false
            }
        } else {
             if (blackCastle && parseInt(space.dataset.col) === 6) {
                setPiece(document.getElementById("5-7"), "rook", "black")
                clearPiece(document.getElementById("7-7"));
                blackCastle = false;
            } else if (blackCastle && parseInt(space.dataset.col) === 2) {
                setPiece(document.getElementById("3-7"), "rook", "black")
                clearPiece(document.getElementById("0-7"));
                blackCastle = false;
            } else {
                blackCastle;
            }
        }
    }
    if (piece === "pawn") {
        if ((turn === "white" && parseInt(space.dataset.row) === 7) || (turn === "black" && parseInt(space.dataset.row) === 0)) {
            showPromotion(space, turn);
        }
    }
}
function clearPiece(space) {
    space.textContent = "";
    space.classList.remove("white", "black", "castle");
    delete space.dataset.piece;
}
function clearSelections(restart) {
    spaces.forEach(space => {
        space.classList.remove("valid-move", "valid-capture", "selected");
        if (restart) {
            clearPiece(space);
        }
    });
}
function handleBoardClick(e) {
    const clickedSpace = e.target.closest(".square");
    if (!clickedSpace) return;
    if (clickedSpace.classList.contains(turn) && !promoting) {
        clearSelections();
        clickedSpace.classList.add("selected");
        selectedPiece = clickedSpace.dataset.piece;
        getValidMoves(clickedSpace);
        if (selectedPiece === "king" && !check) {
            if (turn === "white" && whiteCastle) {
                if (document.getElementById("7-0").classList.contains("castle") && !(document.getElementById("6-0").dataset.piece || document.getElementById("5-0").dataset.piece || threatenedSpaces.includes(document.getElementById("6-0")) || threatenedSpaces.includes(document.getElementById("5-0")))) {
                    testDirectory(document.getElementById("6-0"), "moves", true);
                }
                if (document.getElementById("0-0").classList.contains("castle") && !(document.getElementById("1-0").dataset.piece || document.getElementById("2-0").dataset.piece || document.getElementById("3-0").dataset.piece || threatenedSpaces.includes(document.getElementById("2-0")) || threatenedSpaces.includes(document.getElementById("3-0")))) {
                    testDirectory(document.getElementById("2-0"), "moves", true);
                }
            } else if (turn === "black" && blackCastle) {
                if (document.getElementById("7-7").classList.contains("castle") && !(document.getElementById("6-7").dataset.piece || document.getElementById("5-7").dataset.piece || threatenedSpaces.includes(document.getElementById("6-7")) || threatenedSpaces.includes(document.getElementById("5-7")))) {
                    testDirectory(document.getElementById("6-7"), "moves", true);
                }
                if (document.getElementById("0-7").classList.contains("castle") && !(document.getElementById("1-7").dataset.piece || document.getElementById("2-7").dataset.piece || document.getElementById("3-7").dataset.piece || threatenedSpaces.includes(document.getElementById("2-7")) || threatenedSpaces.includes(document.getElementById("3-7")))) {
                    testDirectory(document.getElementById("2-7"), "moves", true);
                }
            }
        }
    } else if ((clickedSpace.classList.contains("valid-move") || clickedSpace.classList.contains("valid-capture")) && !promoting) {
        let currentSelected = document.querySelector(".selected")
        enPassant = null;
        if (selectedPiece === "pawn" && Math.abs(parseInt(currentSelected.dataset.row) - parseInt(clickedSpace.dataset.row)) === 2) {
            enPassant = clickedSpace;
        }
        if (selectedPiece === "pawn" && currentSelected.dataset.col !== clickedSpace.dataset.col && clickedSpace.classList.contains("valid-move")) {
            if (turn === "white") {
                clearPiece(document.getElementById(clickedSpace.dataset.col + "-" + (parseInt(clickedSpace.dataset.row) - 1)));
            } else {
                clearPiece(document.getElementById(clickedSpace.dataset.col + "-" + (parseInt(clickedSpace.dataset.row) + 1)));
            }
        }
        clearPiece(currentSelected);
        clearSelections();        
        setPiece(clickedSpace, selectedPiece, turn);
        selectedPiece = null;
        switchTurn();
    } else if (!promoting) {
        clearSelections();
    }
}
function setValid(space, king) {
    if (!check || ((check === "open" || check === "block") && forcedMoves.includes(space)) || king) {
        if (space.dataset.piece && space.classList.contains(opposite)) {
            space.classList.add("valid-capture");
        } else if (!space.classList.contains(turn)) {
            space.classList.add("valid-move");
        }
    }
}
function getValidMoves(space) {
    let firstMove;
    let enPassantMod = null;
    let enPassantSpace = null;
    if (!selectedPiece) return;
    let directionMod = 1;
    if (selectedPiece === "pawn") {
        if (turn === "black") {
            directionMod = -1;
            firstMove = parseInt(space.dataset.row) === 6;
        } else {
            firstMove = parseInt(space.dataset.row) === 1;
        }
        if (enPassant && space.dataset.row === enPassant.dataset.row && Math.abs(parseInt(enPassant.dataset.col) - parseInt(space.dataset.col)) === 1) {
            enPassantMod = parseInt(enPassant.dataset.col) - parseInt(space.dataset.col);
            enPassantSpace = document.getElementById((parseInt(space.dataset.col) + enPassantMod) + "-" + (parseInt(space.dataset.row) + directionMod));
        }
        if (space.classList.contains("pinned")) {
            if (space.classList.contains("vertical")) {
                VerticalMoves(space, directionMod, "moves", true, firstMove);
            } else if (space.classList.contains("diagonalNWSE")) {
                DiagonalNWSE(space, directionMod, true);
                if (enPassantMod && enPassantMod !== directionMod) {
                    testDirectory(enPassantSpace, "moves");
                }
            } else if (space.classList.contains("diagonalNESW")) {
                DiagonalNESW(space, directionMod, "moves", true);
                if (enPassantMod && enPassantMod === directionMod) {
                    testDirectory(enPassantSpace, "moves");
                }
            }
        } else {
            VerticalMoves(space, directionMod, "moves", true, firstMove);
            DiagonalNWSE(space, directionMod, "moves", true);
            DiagonalNESW(space, directionMod, "moves", true);
            if (enPassantMod) {
                testDirectory(enPassantSpace, "moves");
            }
        }
    } else if (selectedPiece === "rook") {
        if (space.classList.contains("pinned")) {
            if (space.classList.contains("vertical")) {
                VerticalMoves(space, 1, "moves");
                VerticalMoves(space, -1, "moves");
            } else if (space.classList.contains("horizontal")) {
                HorizontalMoves(space, 1, "moves");
                HorizontalMoves(space, -1, "moves");
            }
        } else {
            VerticalMoves(space, 1, "moves");
            VerticalMoves(space, -1, "moves");
            HorizontalMoves(space, 1, "moves");
            HorizontalMoves(space, -1, "moves");
        }
    } else if (selectedPiece === "bishop") {
        if (space.classList.contains("pinned")) {
            if (space.classList.contains("diagonalNWSE")) {
                DiagonalNWSE(space, 1, "moves");
                DiagonalNWSE(space, -1, "moves");
            } else if (space.classList.contains("diagonalNESW")) {
                DiagonalNESW(space, 1, "moves");
                DiagonalNESW(space, -1, "moves");
            }
        } else {
            DiagonalNWSE(space, 1, "moves");
            DiagonalNWSE(space, -1, "moves");
            DiagonalNESW(space, 1, "moves");
            DiagonalNESW(space, -1, "moves");
        }
    } else if (selectedPiece === "queen") {
        if (space.classList.contains("pinned")) {
            if (space.classList.contains("vertical")) {
                VerticalMoves(space, 1, "moves");
                VerticalMoves(space, -1, "moves");
            } else if (space.classList.contains("horizontal")) {
                HorizontalMoves(space, 1, "moves");
                HorizontalMoves(space, -1, "moves");
            } else if (space.classList.contains("diagonalNWSE")) {
                DiagonalNWSE(space, 1, "moves");
                DiagonalNWSE(space, -1, "moves");
            } else if (space.classList.contains("diagonalNESW")) {
                DiagonalNESW(space, 1, "moves");
                DiagonalNESW(space, -1, "moves");
            }
        } else {
            VerticalMoves(space, 1, "moves");
            VerticalMoves(space, -1, "moves");
            HorizontalMoves(space, 1, "moves");
            HorizontalMoves(space, -1, "moves");
            DiagonalNWSE(space, 1, "moves");
            DiagonalNWSE(space, -1, "moves");
            DiagonalNESW(space, 1, "moves");
            DiagonalNESW(space, -1, "moves");
        }
    } else if (selectedPiece === "knight") {
        KnightMoves(space, "moves");
    } else if (selectedPiece === "king") {
        if (turn === "white") {
            whiteKingRange.forEach(space => {
                testDirectory(space, "moves", true);
            });
        } else {
            blackKingRange.forEach(space => {
                testDirectory(space, "moves", true);
            });
        }
    }
}
function VerticalMoves(space, directionMod, test, pawn, firstMove) {
    let maxSteps = 7;
    let x;
    let y;
    if (pawn) {
        maxSteps = 1;
        if (firstMove) {
            maxSteps = 2;
        }
    }
    let targetSpace;
    for (let i = 1; i <= maxSteps; i++) {
        x = parseInt(space.dataset.col);
        y = parseInt(space.dataset.row) + directionMod * i;
        if (y < 0 || y > 7) break;
        targetSpace = document.getElementById(x + "-" + y);
        if (targetSpace.classList.contains(turn) && test === "moves") break;
        if (targetSpace.dataset.piece) {
            if (pawn) break;
            testDirectory(targetSpace, test);
            if (test === "checks" && targetSpace.dataset.piece === "king" && targetSpace.classList.contains(turn)) {
                targetSpace = document.getElementById(x + "-" + (y + directionMod));
                testDirectory(targetSpace, test);
            }
            break;
        }
        testDirectory(targetSpace, test);
    }
}
function HorizontalMoves(space, directionMod, test) {
    let targetSpace;
    let x;
    let y;
    for (let i = 1, j = 1; j < 8; i++, j++) {
        x = parseInt(space.dataset.col) + directionMod * i;
        y = parseInt(space.dataset.row);
        if (x < 0 || x > 7) break;
        targetSpace = document.getElementById(x + "-" + y);
        if (targetSpace.classList.contains(turn) && test === "moves") break;
        testDirectory(targetSpace, test);
        if (targetSpace.dataset.piece) {
            if (test === "checks" && targetSpace.dataset.piece === "king" && targetSpace.classList.contains(turn)) {
                j = 6;
            } else {
                break;
            }
        }
    }
}
function DiagonalNWSE(space, directionMod, test, pawn) {
    let targetSpace;
    let x;
    let y;
    for (let i = 1, j = 1; j < 8; i++, j++) {
        x = parseInt(space.dataset.col) - directionMod * i;
        y = parseInt(space.dataset.row) + directionMod * i;
        if (x < 0 || x > 7 || y < 0 || y > 7) break;
        targetSpace = document.getElementById(x + "-" + y);
        if (targetSpace.classList.contains(turn) && test === "moves") break;
        if (pawn) {
            if (targetSpace.dataset.piece || test === "checks") {
                testDirectory(targetSpace, test);
            }
            break;
        }
        testDirectory(targetSpace, test);
        if (targetSpace.dataset.piece) {
            if (test === "checks" && targetSpace.dataset.piece === "king" && targetSpace.classList.contains(turn)) {
                j = 6;
            } else {
                break;
            }
        }
    }
}
function DiagonalNESW(space, directionMod, test, pawn) {
    let targetSpace;
    let x;
    let y;
    for (let i = 1, j = 1; j < 8; i++, j++) {
        x = parseInt(space.dataset.col) + directionMod * i;
        y = parseInt(space.dataset.row) + directionMod * i;
        if (x < 0 || x > 7 || y < 0 || y > 7) break;
        targetSpace = document.getElementById(x + "-" + y);
        if (targetSpace.classList.contains(turn) && test === "moves") break;
        if (pawn) {
            if (targetSpace.dataset.piece || test === "checks") {
                testDirectory(targetSpace, test);
            }
            break;
        }
        testDirectory(targetSpace, test);
        if (targetSpace.dataset.piece) {
            if (test === "checks" && targetSpace.dataset.piece === "king" && targetSpace.classList.contains(turn)) {
                j = 6;
            } else {
                break;
            }
        }
    }
}
function KnightMoves(space, test) {
    if (space.classList.contains("pinned")) return;
    let x = parseInt(space.dataset.col);
    let y = parseInt(space.dataset.row);
    let targetSpace;
    if (x > 0 && y > 1) {
        targetSpace = document.getElementById((x - 1) + "-" + (y - 2));
        testDirectory(targetSpace, test);
    }
    if (x < 7 && y > 1) {
        targetSpace = document.getElementById((x + 1) + "-" + (y - 2));
        testDirectory(targetSpace, test);
    }
    if (x > 1 && y > 0) {
        targetSpace = document.getElementById((x - 2) + "-" + (y - 1));
        testDirectory(targetSpace, test);
    }
    if (x < 6 && y > 0) {
        targetSpace = document.getElementById((x + 2) + "-" + (y - 1));
        testDirectory(targetSpace, test);
    }
    if (x > 1 && y < 7) {
        targetSpace = document.getElementById((x - 2) + "-" + (y + 1));
        testDirectory(targetSpace, test);
    }
    if (x < 6 && y < 7) {
        targetSpace = document.getElementById((x + 2) + "-" + (y + 1));
        testDirectory(targetSpace, test);
    }
    if (x > 0 && y < 6) {
        targetSpace = document.getElementById((x - 1) + "-" + (y + 2));
        testDirectory(targetSpace, test);
    }
    if (x < 7 && y < 6) {
        targetSpace = document.getElementById((x + 1) + "-" + (y + 2));
        testDirectory(targetSpace, test);
    }
}
function KingRange (color) {
    if (color === "white") {
        whiteKingRange = [document.getElementById((whiteKing[0] - 1) + "-" + (whiteKing[1] - 1)), document.getElementById(whiteKing[0] + "-" + (whiteKing[1] - 1)), document.getElementById((whiteKing[0] + 1) + "-" + (whiteKing[1] - 1)), document.getElementById((whiteKing[0] - 1) + "-" + whiteKing[1]), document.getElementById((whiteKing[0] + 1) + "-" + whiteKing[1]), document.getElementById((whiteKing[0] - 1) + "-" + (whiteKing[1] + 1)), document.getElementById(whiteKing[0] + "-" + (whiteKing[1] + 1)), document.getElementById((whiteKing[0] + 1) + "-" + (whiteKing[1] + 1))];
        whiteKingRange = whiteKingRange.filter(space => space !== null);
    } else {
        blackKingRange = [document.getElementById((blackKing[0] - 1) + "-" + (blackKing[1] - 1)), document.getElementById(blackKing[0] + "-" + (blackKing[1] - 1)), document.getElementById((blackKing[0] + 1) + "-" + (blackKing[1] - 1)), document.getElementById((blackKing[0] - 1) + "-" + blackKing[1]), document.getElementById((blackKing[0] + 1) + "-" + blackKing[1]), document.getElementById((blackKing[0] - 1) + "-" + (blackKing[1] + 1)), document.getElementById(blackKing[0] + "-" + (blackKing[1] + 1)), document.getElementById((blackKing[0] + 1) + "-" + (blackKing[1] + 1))];
        blackKingRange = blackKingRange.filter(space => space !== null);
    }
}
function findKing (color) {
    if (color === "white") {
        spaces.forEach(space => {
            if (space.dataset.piece === "king" && space.classList.contains("white")) {
                whiteKing = [parseInt(space.dataset.col), parseInt(space.dataset.row)];
            }
        });
    } else {
        spaces.forEach(space => {
            if (space.dataset.piece === "king" && space.classList.contains("black")) {
                blackKing = [parseInt(space.dataset.col), parseInt(space.dataset.row)];
            }
        });
    }
}
function testDirectory(space, test, king) {
    if (test === "moves") {
        if (king) {
            setValid(space, king);
        } else {
            setValid(space);
        }
    } else if (test === "checks") {
       threatenedSpaces.push(space);
       if (space.classList.contains(turn) && space.dataset.piece === "king") {
        checks++;
       }
    } else if (test === "pins") {
    if (space.classList.contains(opposite) && (space.dataset.piece === "queen" || (space.dataset.piece === "rook" && connected.classList.contains("vertical")) || (space.dataset.piece === "rook" && connected.classList.contains("horizontal")) || (space.dataset.piece === "bishop" && connected.classList.contains("diagonalNWSE")) || (space.dataset.piece === "bishop" && connected.classList.contains("diagonalNESW")))) {
        connected.classList.add("pinned");
    }
    } else if (test === "connections") {
        if (space.classList.contains(turn)) {
            space.classList.add("connected");
        }
    } else if (test === "safe") {
        safeSpaces.push(space);
    }
}
function switchTurn() {
    if (turn === "white") {
        turn = "black";
    } else {
        turn = "white";
    }
    clearMoveRestrictions();
    findPins(); 
    findKing("white");
    findKing("black");
    KingRange("white");
    KingRange("black");
    findChecks();
    winGame();
}
function findChecks() {
    checks = 0;
    attackingPiece = [];
    threatenedSpaces = [];
    if (turn === "white") {
        opposite = "black";
    } else {
        opposite = "white";
    }
    spaces.forEach(space => {
        if (space.classList.contains(opposite)) {
            selectedPiece = space.dataset.piece;
            attackingPiece.push(space);
            if (selectedPiece === "pawn") {
                if (opposite === "white") {
                    DiagonalNWSE(space, 1, "checks", true);
                    DiagonalNESW(space, 1, "checks", true);
                } else {
                    DiagonalNWSE(space, -1, "checks", true);
                    DiagonalNESW(space, -1, "checks", true);
                }
            }  else if (selectedPiece === "rook") {
                VerticalMoves(space, 1, "checks");
                VerticalMoves(space, -1, "checks");
                HorizontalMoves(space, 1, "checks");
                HorizontalMoves(space, -1, "checks");
            } else if (selectedPiece === "bishop") {
                DiagonalNWSE(space, 1, "checks");
                DiagonalNWSE(space, -1, "checks");
                DiagonalNESW(space, 1, "checks");
                DiagonalNESW(space, -1, "checks");
            } else if (selectedPiece === "queen") {
                VerticalMoves(space, 1, "checks");
                VerticalMoves(space, -1, "checks");
                HorizontalMoves(space, 1, "checks");
                HorizontalMoves(space, -1, "checks");
                DiagonalNWSE(space, 1, "checks");
                DiagonalNWSE(space, -1, "checks");
                DiagonalNESW(space, 1, "checks");
                DiagonalNESW(space, -1, "checks");
            } else if (selectedPiece === "knight") {
                KnightMoves(space, "checks");
            }
            if (checks < attackingPiece.length) {
                attackingPiece.pop();
            }
        }
    });
    if (opposite === "white") {
        whiteKingRange.forEach(space => {
            testDirectory(space, "checks");
        });
        blackKingRange = blackKingRange.filter(space => !space.classList.contains(turn) && !threatenedSpaces.includes(space));
    } else {
        blackKingRange.forEach(space => {
            testDirectory(space, "checks");
        });
        whiteKingRange = whiteKingRange.filter(space => !space.classList.contains(turn) && !threatenedSpaces.includes(space));
    }
    if (checks === 2) {
        if (turn === "white" && whiteKingRange.length === 0) {
            check = "win";
        } else if (turn === "black" && blackKingRange.length === 0) {
            check = "win";
        } else {
            check = "king";
        }
    } else if (checks === 1) {
        if (turn === "white" && whiteKingRange.length === 0) {
            check = "block";
            confirmCheckmate();
        } else if (turn === "black" && blackKingRange.length === 0) {
            check = "block";
            confirmCheckmate();
        } else {
            check = "open";
            confirmCheckmate();
        }
    } else {
        check = null;
        if (turn === "white" && whiteKingRange.length === 0) {
            confirmStalemate();
        } else if (turn === "black" && blackKingRange.length === 0) {
            confirmStalemate();
        } 
    }
}
function findSafeSpaces() {
    let type;
    let add;
    safeSpaces = [];
    spaces.forEach(space => {
        if (space.classList.contains(turn)) {
            type = space.dataset.piece;
            if (type === "pawn") {
                if (turn === "white") {
                    if (space.dataset.col > 0 && (!space.classList.contains("pinned") || space.classList.contains("diagonalNWSE"))) {
                        add = document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) + 1));
                        testDirectory(add, "safe")
                    }
                    if (space.dataset.col < 7 && (!space.classList.contains("pinned") || space.classList.contains("diagonalNESW"))) {
                        add = document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) + 1));
                        testDirectory(add, "safe")
                    }
                } else {
                    if (space.dataset.col > 0 && (!space.classList.contains("pinned") || space.classList.contains("diagonalNESW"))) {
                        add = document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) - 1));
                        testDirectory(add, "safe")
                    }
                    if (space.dataset.col < 7 && (!space.classList.contains("pinned") || space.classList.contains("diagonalNWSE"))) {
                        add = document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) - 1));
                        testDirectory(add, "safe")
                    }
                }
            } else if (type === "rook") {
                if (space.classList.contains("pinned")) {
                    if (space.classList.contains("vertical")) {
                        VerticalMoves(space, 1, "safe");
                        VerticalMoves(space, -1, "safe");
                    } else if (space.classList.contains("horizontal")) {
                        HorizontalMoves(space, 1, "safe");
                        HorizontalMoves(space, -1, "safe");
                    }
                } else {
                    VerticalMoves(space, 1, "safe");
                    VerticalMoves(space, -1, "safe");
                    HorizontalMoves(space, 1, "safe");
                    HorizontalMoves(space, -1, "safe");
                }
            } else if (type === "bishop") {
                if (space.classList.contains("pinned")) {
                    if (space.classList.contains("diagonalNESW")) {
                        DiagonalNESW(space, 1, "safe");
                        DiagonalNESW(space, -1, "safe");
                    } else if (space.classList.contains("diagonalNWSE")) {
                        DiagonalNWSE(space, 1, "safe");
                        DiagonalNWSE(space, -1, "safe");
                    }
                } else {
                    DiagonalNESW(space, 1, "safe");
                    DiagonalNESW(space, -1, "safe");
                    DiagonalNWSE(space, 1, "safe");
                    DiagonalNWSE(space, -1, "safe");
                }
            } else if (type === "queen") {
                if (space.classList.contains("pinned")) {
                    if (space.classList.contains("vertical")) {
                        VerticalMoves(space, 1, "safe");
                        VerticalMoves(space, -1, "safe");
                    } else if (space.classList.contains("horizontal")) {
                        HorizontalMoves(space, 1, "safe");
                        HorizontalMoves(space, -1, "safe");
                    } else if (space.classList.contains("diagonalNESW")) {
                        DiagonalNESW(space, 1, "safe");
                        DiagonalNESW(space, -1, "safe");
                    } else if (space.classList.contains("diagonalNWSE")) {
                        DiagonalNWSE(space, 1, "safe");
                        DiagonalNWSE(space, -1, "safe");
                    }
                } else {
                    VerticalMoves(space, 1, "safe");
                    VerticalMoves(space, -1, "safe");
                    HorizontalMoves(space, 1, "safe");
                    HorizontalMoves(space, -1, "safe");
                    DiagonalNESW(space, 1, "safe");
                    DiagonalNESW(space, -1, "safe");
                    DiagonalNWSE(space, 1, "safe");
                    DiagonalNWSE(space, -1, "safe");
                }
            } else if (type === "knight") {
                if (!space.classList.contains("pinned")) {
                    KnightMoves(space, "safe");
                }
            }
        }
    });
}
function confirmCheckmate() {
    findSafeSpaces() 
    let space = attackingPiece[0];
    let chances = [space];
    let king;
    if (turn === "white") {
        king = document.getElementById(whiteKing[0] + "-" + whiteKing[1]);
    } else {
        king = document.getElementById(blackKing[0] + "-" + blackKing[1]);
    }
    if (Math.max(Math.abs(parseInt(space.dataset.row) - parseInt(king.dataset.row)), Math.abs(parseInt(space.dataset.col) - parseInt(king.dataset.col))) > 1) {
        if (king.dataset.row === space.dataset.row) {
            for (let i = Math.min(parseInt(king.dataset.col) + 1, parseInt(space.dataset.col) + 1); i <= Math.max(parseInt(king.dataset.col) - 1, parseInt(space.dataset.col) - 1); i++) {
                chances.push(document.getElementById(i + "-" + space.dataset.row));
            }
        } else if (king.dataset.col === space.dataset.col){
            for (let i = Math.min(parseInt(king.dataset.row) + 1, parseInt(space.dataset.row) + 1); i <= Math.max(parseInt(king.dataset.row) - 1, parseInt(space.dataset.row) - 1); i++) {
                chances.push(document.getElementById(space.dataset.col + "-" + i));
            }
        } else if (parseInt(king.dataset.col) > parseInt(space.dataset.col) && parseInt(king.dataset.row) > parseInt(space.dataset.row)) {
            for (let i = 1; i < parseInt(king.dataset.col) - parseInt(space.dataset.col); i++) {
                chances.push(document.getElementById((parseInt(space.dataset.col) + i) + "-" + (parseInt(space.dataset.row) + i)));
            }
        } else if (parseInt(king.dataset.col) > parseInt(space.dataset.col)) {
            for (let i = 1; i < parseInt(king.dataset.col) - parseInt(space.dataset.col); i++) {
                chances.push(document.getElementById((parseInt(space.dataset.col) + i) + "-" + (parseInt(space.dataset.row) - i)));
            }
        } else if (parseInt(king.dataset.row) > parseInt(space.dataset.row)) {
            for (let i = 1; i < parseInt(king.dataset.row) - parseInt(space.dataset.row); i++) {
                chances.push(document.getElementById((parseInt(space.dataset.col) - i) + "-" + (parseInt(space.dataset.row) + i)));
            }
        } else {
            for (let i = 1; i < parseInt(space.dataset.col) - parseInt(king.dataset.col); i++) {
                chances.push(document.getElementById((parseInt(king.dataset.col) + i) + "-" + (parseInt(king.dataset.row) + i)));
            }
        }
    }
    forcedMoves = chances.filter(chance => safeSpaces.includes(chance));
    if (forcedMoves.length === 0 && check === "block") {
        check = "win";
    } else if (forcedMoves.length === 0) {
        check = "king";
    }
}
function confirmStalemate() {
    let blocked;
    for (let i = 0; i < spaces.length; i++) {
        let space = spaces[i];
        if (space.classList.contains(turn)) {
            selectedPiece = space.dataset.piece;
            if (selectedPiece === "pawn") {
                if (turn === "white") {
                    blocked = document.getElementById(space.dataset.col + "-" + (parseInt(space.dataset.row) + 1));
                    if (!blocked.dataset.piece) {
                        return;
                    }
                } else {
                    blocked = document.getElementById(space.dataset.col + "-" + (parseInt(space.dataset.row) - 1));
                    if (!blocked.dataset.piece) {
                        return;
                    }
                }
                blocked = document.getElementById((parseInt(space.dataset.col) + 1) + "-" + blocked.dataset.row);
                if (blocked && blocked.classList.contains(opposite)) {
                    return;
                }
                blocked = document.getElementById((parseInt(space.dataset.col) - 1) + "-" + blocked.dataset.row);
                if (blocked && blocked.classList.contains(opposite)) {
                    return;
                }
            } else if (selectedPiece === "knight") {
                if (!space.classList.contains("pinned")) {
                    blocked = [
                    document.getElementById((parseInt(space.dataset.col) + 2) + "-" + (parseInt(space.dataset.row) + 1)),
                    document.getElementById((parseInt(space.dataset.col) + 2) + "-" + (parseInt(space.dataset.row) - 1)),
                    document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) - 2)),
                    document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) - 2)),
                    document.getElementById((parseInt(space.dataset.col) - 2) + "-" + (parseInt(space.dataset.row) - 1)),
                    document.getElementById((parseInt(space.dataset.col) - 2) + "-" + (parseInt(space.dataset.row) + 1)),
                    document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) + 2)),
                    document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) + 2))
                    ];
                    blocked = blocked.filter(block => block && !block.classList.contains(turn));
                    if (blocked.length > 0) {
                        return;
                    }
                }
            } else if (selectedPiece === "bishop") {
                if (!(space.classList.contains("pinned")) || !(space.classList.contains("horizontal") || space.classList.contains("vertical"))) {
                    blocked = [
                    document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) + 1)),
                    document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) + 1)),
                    document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) - 1)),
                    document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) - 1))
                    ];
                    blocked = blocked.filter(block => block && !block.classList.contains(turn));
                    if (blocked.length > 0) {
                        return;
                    }
                }
            } else if (selectedPiece === "rook") {
                if (!(space.classList.contains("pinned")) || !(space.classList.contains("diagonalNWSE") || space.classList.contains("diagonalNESW"))) {
                    blocked = [
                        document.getElementById((parseInt(space.dataset.col) + 1) + "-" + space.dataset.row),
                        document.getElementById((parseInt(space.dataset.col) - 1) + "-" + space.dataset.row),
                        document.getElementById(space.dataset.col + "-" + (parseInt(space.dataset.row) + 1)),
                        document.getElementById(space.dataset.col + "-" + (parseInt(space.dataset.row) - 1))
                    ];
                     blocked = blocked.filter(block => block && !block.classList.contains(turn));
                    if (blocked.length > 0) {
                        return;
                    }
                }
            } else if (selectedPiece === "queen") {
                blocked = [
                    document.getElementById((parseInt(space.dataset.col) + 1) + "-" + space.dataset.row),
                    document.getElementById((parseInt(space.dataset.col) - 1) + "-" + space.dataset.row),
                    document.getElementById(space.dataset.col + "-" + (parseInt(space.dataset.row) + 1)),
                    document.getElementById(space.dataset.col + "-" + (parseInt(space.dataset.row) - 1)),
                    document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) + 1)),
                    document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) + 1)),
                    document.getElementById((parseInt(space.dataset.col) + 1) + "-" + (parseInt(space.dataset.row) - 1)),
                    document.getElementById((parseInt(space.dataset.col) - 1) + "-" + (parseInt(space.dataset.row) - 1))
                ];
                blocked = blocked.filter(block => block && !block.classList.contains(turn));
                if (blocked.length > 0) {
                    return;
                }
            }
        }
    };
    check = "stalemate";
}
function findPins() {
    if (turn === "white") {
        opposite = "black";
    } else {
        opposite = "white";
    }
    let king;
    if (turn === "white") {
        king = document.getElementById(whiteKing[0] + "-" + whiteKing[1]);
    } else {
        king = document.getElementById(blackKing[0] + "-" + blackKing[1]);
    }
    VerticalMoves(king, 1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("vertical");
        VerticalMoves(connected, 1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
    VerticalMoves(king, -1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("vertical");
        VerticalMoves(connected, -1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
    HorizontalMoves(king, 1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("horizontal");
        HorizontalMoves(connected, 1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
    HorizontalMoves(king, -1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("horizontal");
        HorizontalMoves(connected, -1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
    DiagonalNWSE(king, 1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("diagonalNWSE");
        DiagonalNWSE(connected, 1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
    DiagonalNWSE(king, -1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("diagonalNWSE");
        DiagonalNWSE(connected, -1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
    DiagonalNESW(king, 1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("diagonalNESW");
        DiagonalNESW(connected, 1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
    DiagonalNESW(king, -1, "connections");
    connected = document.querySelector(".connected");
    if (connected) {
        connected.classList.add("diagonalNESW");
        DiagonalNESW(connected, -1, "pins");
        connected.classList.remove("connected");
        connected = null;
    }
}
function clearMoveRestrictions() {
    spaces.forEach(space => {
        space.classList.remove("pinned", "vertical", "horizontal", "diagonalNWSE", "diagonalNESW", "connected");
    });
}
function winGame() {
    if (check === "win") {
        winner = opposite;
    } else if (check === "stalemate") {
        winner = check;

    }
    if (winner === "stalemate") {
        uiDisplay.textContent = winner;
    } else if (winner) {
        uiDisplay.textContent = winner + " wins";
    } else {
        uiDisplay.textContent = turn + "'s turn";
    }
}
function showPromotion(space, color) {
    promoting = true
    const modal = document.getElementById("promotion-modal");
    const choices = document.getElementById("promotion-choices");
    const promotionPieces = ["queen", "rook", "bishop", "knight"];
    choices.innerHTML = "";
    promotionPieces.forEach(piece => {
        const option = document.createElement("span");
        option.textContent = pieces[piece];
        option.classList.add(color); 
        option.addEventListener("click", () => {
            setPiece(space, piece, color);
            modal.style.display = "none";
            promoting = false;
            if (turn === "white") {
                turn = "black";
            } else {
                turn = "white";
            }
            switchTurn();
        });
        choices.appendChild(option);
    });
    modal.style.display = "flex";
}