
const https = require('https');
const request = require('request');
const {Chess} = require('chess.js');

console.clear()

https.get({
  hostname: 'lichess.org',
  path: '/api/stream/event',
  headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
  }
  },(resp) => {
  resp.on('data', (chunk) => {
    try {
      var jsonbody = JSON.parse(chunk)
      if(jsonbody.type == 'challenge'){
        handle_new_challenge(jsonbody)
      }
      else if(jsonbody.type == 'gameStart'){
        stream_game(jsonbody.game.id)
      }
      else if(jsonbody.type == 'gameFinish'){
        console.log(`Joining queue...`)
        setTimeout(function(){
          join_queue()
        },2500)
      }
    }
    catch(e){}
  });
});

function handle_new_challenge(challenge){
  if(challenge.challenge.timeControl.limit < 300){
    decline_challenge(challenge.challenge.id, "timeControl")
  }
  else if(challenge.challenge.timeControl.limit > 1800){
    decline_challenge(challenge.challenge.id, "timeControl")
  }
  else if(challenge.challenge.variant.key != "standard"){
    decline_challenge(challenge.challenge.id, "variant")
  }
  else {
    accept_challenge(challenge.challenge.id)
  }
  
}
function accept_challenge(challenge_id){
  request({
    url: `https://lichess.org/api/challenge/${challenge_id}/accept`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    }
  }, (err, res, body) => {});
}
function decline_challenge(challenge_id, reason){
  request({
    url: `https://lichess.org/api/challenge/${challenge_id}/decline`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    },
    body: `reason=${reason}`
  }, (err, res, body) => {});
}
function stream_game(game_id){
  /*request({
    url: `https://lichess.org/api/bot/game/${game_id}/chat`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    },
    body: `room=player&text=Hello! I'm a bot coded by Jonathan Becker (https://jbecker.dev) using minimax. Don't worry, I can only look 3 moves ahead ;). Good luck!`
  }, (err, res, body) => {console.log(body)});*/
  https.get({
    hostname: 'lichess.org',
    path: `/api/board/game/stream/${game_id}`,
    headers: {
        Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    }
    },(resp) => {
    var side = "";
    resp.on('data', (chunk) => {
      try {
        var jsonbody = JSON.parse(chunk.toString())
        if(jsonbody.hasOwnProperty("white")){
          if(jsonbody.white.id == 'pleonexiabot'){
            side = "w";
            var this_game = new Chess(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`)
            updateStatus(game_id, this_game, side)
          }
          else {
            side = "b";
          }
        }
        else if(jsonbody.hasOwnProperty("moves")){
          var moves = jsonbody.moves.split(" ")
          lastMove = moves[moves.length-1]
          var this_game = new Chess(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`)
          for(var vmove of moves){
            this_game.move(vmove, { sloppy: true })
          }
          if(moves.length != 0){
            updateStatus(game_id, this_game, side)
          }
        }
        
      }
      catch(e){}
    });
  });
}
function join_queue(){
  request({
    url: `https://lichess.org/api/board/seek`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    },
    body: `rated=false&time=3000&increment=30&variant=standard&color=random&ratingRange=500-2500`
  }, (err, res, ssadsfsdfads) => {
    request({
      url: `https://lichess.org/api/account`,
      method: 'GET',
      headers: {
        Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
      }
    }, (err, res, body) => {
      try {
        var jsonbody = JSON.parse(body)
        if(jsonbody.hasOwnProperty("count")){
          if(jsonbody.count.hasOwnProperty("win") && jsonbody.count.hasOwnProperty("loss")){
            var total = ((jsonbody.count.win*1)+(jsonbody.count.loss*1))
            console.log(`Found a match! Current winrate is ${(((jsonbody.count.win*1)/total)*100).toFixed(3)}%`)
          }
        }
      }
      catch(e){}
    });
  });
}

function make_move(game_id, game, move, side){
  game.move(move)
  var hist = game.history({ verbose: true })
  request({
    url: `https://lichess.org/api/board/game/${game_id}/move/${hist[hist.length-1].from}${hist[hist.length-1].to}`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    }
  }, (err, res, body) => {});
  updateStatus(game_id, game, side)
}
function reverse_array(array){
  return array.slice().reverse();
}
function evaluate_board(temp_move_game){
  blm = get_material("b", temp_move_game.fen())
  whm = get_material("w", temp_move_game.fen())
  if(temp_move_game.in_checkmate() && temp_move_game.turn() == "b"){
    whm += 10000
  }
  if(temp_move_game.in_checkmate() && temp_move_game.turn() == "w"){
    blm += 10000
  }
  if(temp_move_game.in_draw()){
    blm = 0;
    whm = 0;
  }
  return(whm-blm)
}
function get_best_move(depth, game, side){
  var start_minimax_timestamp = new Date().getTime();
  var best_move = begin_minimax(depth, game, true, side);
  var end_minimax_timestamp = new Date().getTime();
  var timestamp = (end_minimax_timestamp-start_minimax_timestamp)
  return best_move
}
function make_best_move(depth, game_id, game, side){
  setTimeout(function(){
    var best_move = get_best_move(depth, game, side)
    make_move(game_id, game, best_move, side)
  },300)
}
function begin_minimax(depth, game, maximize, side){
  var potential_moves = game.moves()
  var maximum = -9999999999;
  var best_move = "";

  for(var move of potential_moves){
    game.move(move)
    var move_score = minimax(depth-1, game, -10000000000, 1000000000, !maximize, side);
    game.undo()
    if(move_score >= maximum){
      best_move = move;
      maximum = move_score;
    }
  }
  return best_move
}
function minimax(depth, game, alpha, beta, maximize, side){
  if(depth == 0){
    if(side == "b"){
      return -1 * (evaluate_board(game))
    }
    else {
      return evaluate_board(game)
    }
  }

  var potential_moves = game.moves()
  if(maximize){
    var maximum = -9999999999;
    for(var move of potential_moves){
      game.move(move)
      var maximum = Math.max(maximum, minimax(depth-1, game, alpha, beta, !maximize, side));
      game.undo()
      alpha = Math.max(alpha, maximum)
      if(beta <= alpha) {
        return maximum;
      }
    }
    return maximum;
  }
  else {
    var maximum = 9999999999;
    for(var move of potential_moves){
      game.move(move)
      var maximum = Math.min(maximum, minimax(depth-1, game, alpha, beta, !maximize, side));
      game.undo()
      beta = Math.min(beta, maximum)
      if(beta <= alpha) {
        return maximum;
      }
    }
    return maximum;
  }
}
function get_material(color, fen){
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
  var pawnEvalWhite = reverse_array(pawnEvalBlack);
  var bishopEvalWhite = reverse_array(bishopEvalBlack);
  var rookEvalWhite = reverse_array(rookEvalBlack);
  var kingEvalWhite = reverse_array(kingEvalBlack);
  for(var f in files){
    for(var r in rows){
      file = files[f];
      row = rows[r];
      piece = material_game.get(`${file}${row}`);
      if(piece && piece.color == color){
        if(piece.type == "p"){
          if(color == "b"){
            material += 100 + pawnEvalBlack[r][f]*5;
          }
          else {
            material += 100 + pawnEvalWhite[r][f]*5;
          }
        }
        else if (piece.type == "b"){
          bishop_count++;
          if(color == "b"){
            material += 300 + bishopEvalBlack[r][f]*5;
          }
          else {
            material += 300 + bishopEvalWhite[r][f]*5;
          }
        }
        else if (piece.type == "n"){
          material += 300 + knightEval[r][f]*5;
        }
        else if (piece.type == "r"){
          if(color == "b"){
            material += 500 + rookEvalBlack[r][f]*5;
          }
          else {
            material += 500 + rookEvalWhite[r][f]*5;
          }
        }
        else if (piece.type == "q"){
          material += 800 + evalQueen[r][f];
        }
        else if (piece.type == "k"){
          if(color == "b"){
            material += 10000 + kingEvalBlack[r][f]*5;
          }
          else {
            material += 10000 + kingEvalWhite[r][f]*5;
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
function updateStatus(game_id, game, side) {
  if (!game.in_checkmate() && !game.in_draw()) {
    if(game.turn() == side){
      make_best_move(4, game_id, game, side)
    }
  }
}

for(var i = 0; i < 5; i++){
  console.log(`Joining queue...`)
  join_queue()
}