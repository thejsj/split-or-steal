
# Split Or Deal

A real-time web game based on the prisoner's dilemma using RethinkDB

### Rules

1. Each players starts off with 1000 coins.
2. They player with 3000 coins wins the game.
3. The game is played in rounds, until a player reaches 3000 or everyone else reaches 0.
4. When a player reaches 0 coins, he or she is eliminated.
5. Every round, each player bets an amount of coins higher than 0 and lower than their total amount of coins.
6. The players have no knowledge of what all the other players are betting.
6. The two players closest to the average, will face off in a head-to-head showdown.
7. The two finalists will then decide to split or steal the pot.
8. If both players decided to split the coins, the pot (from all players/two players) are split 50/50.
9. If both players decide to steal the coins, the two players lose their initial bets and everyone else keeps their bets.
10. If one player decides to steal and another chooses to split, all coins from (all players/two players) go to the player who decides to steal.

### Tasks

    [x] Have GitHub Login
        [x] Add all users to database
        [x] Add user gravatars to database (`r.binary`)
        [x] GitHub handle
    [x] Login users and add them to the room in RT (only one room at the beginning)
        [x] Have a room variable that contains all users in the room
    [x] Add a Create Game button. Create a game
        [x] Insert new game into database with join for users
        [x] Add a score of 1000 to all players
    [x] Create a new round
        [x] Start all players with score of 0
        [x] Add winner, finalists, players
    [x] Add UI for changing bets
        [x] Add LOCK button to lock bet
        [x] Update the database when bet is locked
    [x] When all bets are in (`.changes`)
        [x] Calculate the average (`.reduce`)
        [x] Get the closest 2 players. If it's tied, use random
        [x] Update the UI with relevant classes
        [x] Remove bets from amount
    [x] When all finalist decisions are in (`.changes`)
        [x] Write split-or-steal logic in JS
        [x] Update Winner in database
        [x] Update Finalist Scores
    [ ] When winner is declared (`.changes`)
        [ ] Change CSS classes on winner
    [x] When players reaches score of 3000 (`.changes`)
        [x] Declare a winner!
