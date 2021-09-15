var board = null
var game = new Chess()
var $board = $('#chess-board')
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var $whm = $('#whm')
var $blm = $('#blm')
var $viewed = $('#viewed')



function copy(element) {
  let textarea = document.getElementById(element);
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  document.execCommand("copy");
}
function reverseArray(array){
  return array.slice().reverse();
}
function getMove(move, fen){
  var temp_move_game = new Chess(fen);
  temp_move_game.move(move);
  blm = getMaterial("b", temp_move_game.fen())
  whm = getMaterial("w", temp_move_game.fen())
  if(temp_move_game.in_checkmate() && temp_move_game.turn() == "b"){
    whm += 10000
  }
  if(temp_move_game.in_checkmate() && temp_move_game.turn() == "w"){
    bhm += 10000
  }
  if(temp_move_game.in_draw()){
    bhm = 0;
    whm = 0;
  }
  return [move, blm, whm*-1, temp_move_game.fen()];
}
function getBestMove(depth, fen){
  var temp_game = new Chess(fen);
  var best = -99999999;
  var best_move = "";
  var ai_possible_moves = temp_game.moves()
  for(var ai_move of ai_possible_moves){
    var player_game = new Chess(getMove(ai_move, fen)[3])
    var player_possible_moves = player_game.moves()
    var min = 99999999;
    var best_response = ""
    for(var player_move of player_possible_moves){
      $viewed.html(($viewed.html()*1)+1)
      var player_move_results = getMove(player_move, player_game.fen());
      if((player_move_results[1] + player_move_results[2]) < min){
        min = (player_move_results[1] + player_move_results[2])
      }
      //console.log(`${ai_move} responded by ${player_move} leads to ${(player_move_results[1] + player_move_results[2])}, current min of ${min}`)
    }
    if(min > best){
      best = min;
      best_move = ai_move;
    }
  }
  return [best_move, best];
}
function makeBestMove(depth){
  var fen = game.fen()

  setTimeout(function(){makeMove(getBestMove(depth, fen)[0])},500)
}
function makeMove(move){
  game.move(move)
  board.position(game.fen())
}
function onDragStart(source, piece, position, orientation){
  if ((game.in_checkmate() === true) || (game.in_draw() === true) /*|| (piece.search(/^b/) !== -1)*/ ) {
    return false;
  }
}
function onDrop(source, target){
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  })
  if (move === null) {
    return 'snapback'
  }
  else {
    squareToHighlight = move.to
  }
}
function onSnapEnd(){
  board.position(game.fen())
  updateStatus()
}
function getMaterial(color, fen){
  var material = 0;
  var material_game = new Chess(fen);
  var files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  var rows = [1, 2, 3, 4, 5, 6, 7, 8];
  var bishop_count = 0;

  var pawnEvalBlack = [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
  ];
  var knightEval = [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
  ];
  var bishopEvalBlack = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
  ];
  var rookEvalBlack = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
  ];
  var evalQueen = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
  ];
  var kingEvalBlack = [
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
  ];
  var pawnEvalWhite = reverseArray(pawnEvalBlack);
  var bishopEvalWhite = reverseArray(bishopEvalBlack);
  var rookEvalWhite = reverseArray(rookEvalBlack);
  var kingEvalWhite = reverseArray(kingEvalBlack);
  for(var f in files){
    for(var r in rows){
      file = files[f];
      row = rows[r];
      piece = material_game.get(`${file}${row}`);
      if(piece && piece.color == color){
        if(piece.type == "p"){
          if(color == "b"){
            material += 100 + pawnEvalBlack[r][f];
          }
          else {
            material += 100 + pawnEvalWhite[r][f];
          }
        }
        else if (piece.type == "b"){
          bishop_count++;
          if(color == "b"){
            material += 300 + bishopEvalBlack[r][f];
          }
          else {
            material += 300 + bishopEvalWhite[r][f];
          }
        }
        else if (piece.type == "n"){
          material += 300 + knightEval[r][f];
        }
        else if (piece.type == "r"){
          if(color == "b"){
            material += 500 + rookEvalBlack[r][f];
          }
          else {
            material += 500 + rookEvalWhite[r][f];
          }
        }
        else if (piece.type == "q"){
          material += 800 + evalQueen[r][f];
        }
        else if (piece.type == "k"){
          if(color == "b"){
            material += 10000 + kingEvalBlack[r][f];
          }
          else {
            material += 10000 + kingEvalWhite[r][f];
          }
        }
      }
    }
  }
  if(bishop_count == 2){
    material += 50;
  }
  return material;
}
function updateStatus () {

  /*if (game.in_checkmate()) {
    alert("checkmate")
  }
  if (game.in_draw()) {
    alert("stalemate")
  }
  if (game.in_check()) {
    alert("check")
  }*/

  $fen.val(game.fen())
  $pgn.val(game.pgn())
  $whm.html(getMaterial("w", game.fen()))
  $blm.html(getMaterial("b", game.fen()))
  //console.log(game.moves())
  if(game.turn() == "b"){
    makeBestMove(1)
  }
}
var config = {
  pieceTheme: 'assets/images/chesspieces/wikipedia/{piece}.png',
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('board', config)
updateStatus()
