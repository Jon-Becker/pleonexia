
# pleonexia
Pleonexia is a minimax based chess engine that calculates the best move for the machine to make by material counting as well as positional scoring.
You can [View The Demo](https://jbecker.dev/demos/pleonexia) here.

## How it works
Pleonexia utilizes the popular minimax method to search for and calculate ideal moves within two-player games such as chess. In order to reduce the amount of total calculations, we also implement aplha-beta pruning which removes possibilities if they result in worse positions that previously calculated moves.

- We start off by creating a chess.js `Chess` object which we will use for the duration of the game for calculations, moves, and more.
- The `Chess` object has many useful methods, such a `Chess.moves()` which lists all possible moves found for the current position for that player.
- To begin calculating, we wait for it to be our turn within the `updateGame()` function which interacts with Chessboard.js's frontend to take in plays from the player. This function calls `make_best_move(depth, game)` after checking that the game is not over, with `depth` being the amount of moves to calculate ahead, and `game` being the current `Chess` object.
- `make_best_move` makes a call to `get_best_move()`, which is just a simple wrapper that begins a timer, counter, and handles other statistics before making a call to our minimax functions.
- The minimax functions loop through the array of possible moves from `Chess.moves()`, giving each a score using `minimum` and `maximum`, with `minimum` being the minimum score for the AI if it plays this line, and `maximum` being the maximum player score if the AI chooses this line. 
  - Within chess, scores are calculated using material values, pawns being 1, bishops and knights being 3, rooks being 5, and the queen being 8.
  - Our calculations use these basic ratios but also include a 0.5 score bonus if the player has both bishops remaining, since having both bishops is more powerful than having both knights.
  - In addition to these material scores, we also give each piece additional value based on which of the 64 squares it resides on. Chess is a game about control, so the AI will try to prioritize controlling and keeping control of the center, giving these squares more weight for pieces like pawns, bishops, and knights.
  - The AI is incentivized to avoid checkmate and find checkmates by giving lines that end up in checkmate a massive score boost. This also helps us avoid ending up in checkmate.
- Each call to `minimax` calls a scoring function which returns the total difference in score for both white and black, with negative scores being worse than positive scores. 
- `minimax` will continue to call itself, saving the highest `minimum` and `maximum` until it runs out of possibile moves for the `depth` provided. If a move line results in a worse `minimum` or `maximum` than we currently have stored, we will skip calculations for that line to save time.
- `minimax` returns the move, and we make it using `Chess.move(move)`.
- The game continues until a draw or checkmate is reached.

## Statistics & Specifications
- Default depth: `3`
  - This parameter can be edited on line 299 within the `updateGame()` function.
- Lichess Winrate: `40.39%`
  - A lichess bot is currently running and playing 2 games concurrently with a depth of 3. Since we are only material counting, its not a very good AI.
- AES: `~3100 Evaluations per Second`

### Credits
This project is completely coded by [Jonathan Becker](https://jbecker.dev), using [Bootstrap](https://getbootstrap.com) & [Chessboard.js](https://chessboardjs.com/) for the frontend, with [Chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) powering the basic chess functionality.