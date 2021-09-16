<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="Jonathan Becker (jonathan@jbecker.dev)">
    <title>Pleonexia</title>

    <link href="assets/css/chessboard-1.0.0.min.css" rel="stylesheet">
    <link href="assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
  </head>
  <body>

    <div class="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow header">
      <h5 class="my-0 mr-md-auto font-weight-normal">Pleonexia</h5>
      <nav class="my-2 my-md-0 mr-md-3">
        <a class="p-2 text-light" href="https://github.com/Jon-Becker/pleonexia">GitHub</a>
      </nav>
      <a class="btn btn-outline-primary" href="https://lichess.org/@/PleonexiaBot/all">Play on Lichess</a>
    </div>

    <div class="container">
      <div class="card-deck mb-3 text-center">
        <div class="col-8 box-shadow">
          <div id="board"></div>
        </div>
        <div class="card col-4 box-shadow">
          <div class="card-body">     
            <input type="text" id="pgn">
            <input type="text" id="fen">
            <p>Timer: <span id="timer">0.00<span></p>
            <p>Positions Evaulated: <span id="evaluated">0<span></p>
            <p>Depth: <span id="depth">0 Moves<span></p>
            <div class="flex-spacer">&nbsp;</div>
            <div id="button-inline">
              <button class="btn btn-outline-primary" onclick="reset()">Reset Board</button>
              <button class="btn btn-outline-primary" onclick="copy('fen')">Copy FEN</button>
              <button class="btn btn-outline-primary" onclick="copy('pgn')">Copy PGN</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="assets/js/notiflix-aio-2.7.0.min.js"></script>
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/chess.js"></script>
    <script src="assets/js/chessboard-1.0.0.min.js"></script>
    <script src="assets/js/script.js"></script>
  </body>
</html>