var board = null
var game = new Chess()
var $board = $('#chess-board')
var $fen = $('#fen')
var $pgn = $('#pgn')
var notify_audio = new Audio('./assets/sounds/notify.mp3');
var move_audio_w = new Audio('./assets/sounds/move_piece.mp3');
var move_audio_b = new Audio('./assets/sounds/move_piece.mp3');
var capture_audio_w = new Audio('./assets/sounds/capture_piece.mp3');
var capture_audio_b = new Audio('./assets/sounds/capture_piece.mp3');
var positionCount;

Notiflix.Notify.Init({
  fontFamily: "Quicksand",
  useGoogleFont: true,
  position: "right-bottom",
  useIcon: false,
  cssAnimationStyle: "from-right"
});

function reset() {
  game.reset();
  board.position(game.fen());
}

function copy(element) {
  let textarea = document.getElementById(element);
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  document.execCommand("copy");
}

function reverse_array(array) {
  return array.slice().reverse();
}

function evaluate_board(temp_move_game) {
  positionCount++;
  blm = get_material("b", temp_move_game.fen())
  whm = get_material("w", temp_move_game.fen())
  if (temp_move_game.in_checkmate() && temp_move_game.turn() == "b") {
    whm += 1000000
  }
  if (temp_move_game.in_checkmate() && temp_move_game.turn() == "w") {
    blm += 1000000
  }
  if (temp_move_game.in_draw()) {
    blm = 0;
    whm = 0;
  }
  return (whm - blm)
}

function get_best_move(depth, game) {
  positionCount = 0;
  var start_minimax_timestamp = new Date().getTime();
  var best_move = begin_minimax(depth, game, true);
  var end_minimax_timestamp = new Date().getTime();
  var timestamp = (end_minimax_timestamp - start_minimax_timestamp)
  $('#timer').html(`${(timestamp/1000).toFixed(2)} seconds`)
  $('#evaluated').html(positionCount)
  return best_move
}

function make_best_move(depth, game) {
  $('#depth').html(`${depth} Moves`)
  setTimeout(function() {
    var best_move = get_best_move(depth, game)
    make_move(best_move)
  }, 300)
}

function begin_minimax(depth, game, maximize) {
  var potential_moves = game.moves()
  var maximum = -9999999999;
  var best_move = "";

  for (var move of potential_moves) {
    game.move(move)
    var move_score = minimax(depth - 1, game, -10000000000, 1000000000, !maximize);
    game.undo()
    if (move_score >= maximum) {
      best_move = move;
      maximum = move_score;
    }
  }
  return best_move
}

function minimax(depth, game, alpha, beta, maximize) {
  if (depth == 0) {
    return -1 * (evaluate_board(game))
  }

  var potential_moves = game.moves()
  if (maximize) {
    var maximum = -9999999999;
    for (var move of potential_moves) {
      game.move(move)
      var maximum = Math.max(maximum, minimax(depth - 1, game, alpha, beta, !maximize));
      game.undo()
      alpha = Math.max(alpha, maximum)
      if (beta <= alpha) {
        return maximum;
      }
    }
    return maximum;
  } else {
    var minimum = 9999999999;
    for (var move of potential_moves) {
      game.move(move)
      var minimum = Math.min(minimum, minimax(depth - 1, game, alpha, beta, !maximize));
      game.undo()
      beta = Math.min(beta, minimum)
      if (beta <= alpha) {
        return minimum;
      }
    }
    return minimum;
  }
}

function make_move(move) {
  game.move(move)
  board.position(game.fen())
  updateStatus()
}

function onDragStart(source, piece, position, orientation) {
  if ((game.in_checkmate() === true) || (game.in_draw() === true) || (piece.search(/^b/) !== -1)) {
    return false;
  }
}

function onDrop(source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  })
  if (move === null) {
    return 'snapback'
  } else {
    squareToHighlight = move.to
  }
}

function onSnapEnd() {
  board.position(game.fen())
  updateStatus()
}

function get_material(color, fen) {
  var material = 0;
  var material_game = new Chess(fen);
  var files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  var rows = [1, 2, 3, 4, 5, 6, 7, 8];
  var bishop_count = 0;

  var pawnEvalBlack = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
    [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
    [0.0, 0.0, 0.0, 3.0, 3.0, 0.0, 0.0, 0.0],
    [-1.0, -0.5, 1.0, 0.0, 0.0, 1.0, -0.5, -1.0],
    [0.5, 1.0, -1.0, -3.0, -3.0, -1.0, 1.0, 0.5],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  ];
  var knightEval = [
    [1.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, 1.0],
    [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
    [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
    [-3.0, 0.5, 1.5, 3.0, 3.0, 1.5, 0.5, -3.0],
    [-3.0, 0.0, 1.5, 3.0, 3.0, 1.5, 0.0, -3.0],
    [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
    [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
    [1.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, 1.0]
  ];
  var bishopEvalBlack = [
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
    [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
    [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
    [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
    [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
  ];
  var rookEvalBlack = [
    [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
    [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-1.0, -1.0, 0.5, 0.5, 0.5, 0.5, -1.0, -1.0]
  ];
  var evalQueen = [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
  ];
  var kingEvalBlack = [
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 1.0, 0.0, 0.0, 1.0, 5.0, 5.0]
  ];
  var pawnEvalWhite = reverse_array(pawnEvalBlack);
  var bishopEvalWhite = reverse_array(bishopEvalBlack);
  var rookEvalWhite = reverse_array(rookEvalBlack);
  var kingEvalWhite = reverse_array(kingEvalBlack);
  for (var f in files) {
    for (var r in rows) {
      file = files[f];
      row = rows[r];
      piece = material_game.get(`${file}${row}`);
      if (piece && piece.color == color) {
        if (piece.type == "p") {
          if (color == "b") {
            material += 80 + pawnEvalBlack[r][f] * 10;
          } else {
            material += 80 + pawnEvalWhite[r][f] * 10;
          }
        } else if (piece.type == "b") {
          bishop_count++;
          if (color == "b") {
            material += 300 + bishopEvalBlack[r][f] * 10;
          } else {
            material += 300 + bishopEvalWhite[r][f] * 10;
          }
        } else if (piece.type == "n") {
          material += 300 + knightEval[r][f] * 10;
        } else if (piece.type == "r") {
          if (color == "b") {
            material += 500 + rookEvalBlack[r][f] * 10;
          } else {
            material += 500 + rookEvalWhite[r][f] * 10;
          }
        } else if (piece.type == "q") {
          material += 800 + evalQueen[r][f];
        } else if (piece.type == "k") {
          if (color == "b") {
            material += 10000 + kingEvalBlack[r][f] * 10;
          } else {
            material += 10000 + kingEvalWhite[r][f] * 10;
          }
        }
      }
    }
  }
  if (bishop_count == 2) {
    material += 50;
  }
  return material;
}

function updateStatus() {
  if (game.in_checkmate()) {
    notify_audio.play()
    Notiflix.Notify.Success(`Black is in checkmate, white wins!`);
  } else if (game.in_draw()) {
    notify_audio.play()
    Notiflix.Notify.Success(`Game over, it's a draw.`);
  } else if (game.in_check()) {
    if (game.turn() == "b") {
      Notiflix.Notify.Success(`Black is in check!`);
    } else {
      Notiflix.Notify.Success(`White is in check!`);
    }
  } else {
    $fen.val(game.fen())
    $pgn.val(game.pgn())
    if (game.history()[game.history().length - 1].includes("x")) {
      if (game.turn() == "b") {
        capture_audio_b.play()
      } else {
        capture_audio_w.play()
      }
    } else {
      if (game.turn() == "b") {
        move_audio_b.play()
      } else {
        move_audio_w.play()
      }
    }
    if (game.turn() == "b") {
      make_best_move(3, game)
    }
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