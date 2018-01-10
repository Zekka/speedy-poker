var SCALING = 2;
var poker;
(function (poker) {
    // export const HAND_SIZE = 5;
    // 5 is too hard for me
    poker.HAND_SIZE = 7;
    poker.CENTER_SIZE = 2 * poker.HAND_SIZE + 1;
    poker.CARDS = [
        0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 11, 12, 13, 14, 15,
        16, 17, 18, 19, 20, 21, 22, 23
    ];
    (function (Suit) {
        Suit[Suit["Sou"] = 0] = "Sou";
        Suit[Suit["Man"] = 1] = "Man";
        Suit[Suit["Pin"] = 2] = "Pin";
        Suit[Suit["N"] = 3] = "N";
    })(poker.Suit || (poker.Suit = {}));
    var Suit = poker.Suit;
    (function (Rank) {
        Rank[Rank["One"] = 0] = "One";
        Rank[Rank["Two"] = 1] = "Two";
        Rank[Rank["Three"] = 2] = "Three";
        Rank[Rank["Four"] = 3] = "Four";
        Rank[Rank["Five"] = 4] = "Five";
        Rank[Rank["Six"] = 5] = "Six";
        Rank[Rank["Seven"] = 6] = "Seven";
        Rank[Rank["Eight"] = 7] = "Eight";
        Rank[Rank["N"] = 8] = "N";
    })(poker.Rank || (poker.Rank = {}));
    var Rank = poker.Rank;
    (function (Phase) {
        Phase[Phase["PlayerTurn"] = 0] = "PlayerTurn";
        Phase[Phase["ComputerTurn"] = 1] = "ComputerTurn";
        Phase[Phase["PlayerWon"] = 2] = "PlayerWon";
        Phase[Phase["ComputerWon"] = 3] = "ComputerWon";
    })(poker.Phase || (poker.Phase = {}));
    var Phase = poker.Phase;
    function presentTwoHands() {
        var handCards = Deck.deal(2 * poker.HAND_SIZE);
        var handOne = new Hand(handCards.slice(0, poker.HAND_SIZE));
        var handTwo = new Hand(handCards.slice(poker.HAND_SIZE, 16));
        console.log("Hand one: " + handOne.toString() + ": " + handOne.cards);
        console.log("Hand two: " + handTwo.toString() + ": " + handTwo.cards);
        switch (Hand.better(handOne, handTwo)) {
            case -1:
                console.log("Hand two is better.");
                break;
            case 0:
                console.log("No hand is better.");
                break;
            case 1:
                console.log("Hand one is better.");
                break;
        }
    }
    var Deck = (function () {
        function Deck() {
        }
        Deck.deal = function (n) {
            for (var i = 0; i < Deck.cards.length - 1; i++) {
                var j = i + Math.floor(Math.random() * (Deck.cards.length - i));
                var tmp = Deck.cards[i];
                Deck.cards[i] = Deck.cards[j];
                Deck.cards[j] = tmp;
            }
            return Deck.cards.slice(0, n);
        };
        Deck.cards = poker.CARDS.slice(0);
        return Deck;
    }());
    var Cards = (function () {
        function Cards() {
        }
        Cards.from = function (rank, suit) { return rank * Suit.N + suit; };
        Cards.rank = function (c) { return Math.floor(c / Suit.N); };
        Cards.suit = function (c) { return c % Suit.N; };
        Cards.dump = function (c) {
            var rank = Cards.rank(c);
            var suit = Cards.suit(c);
            var rankPart;
            switch (rank) {
                case Rank.One:
                    rankPart = "1";
                    break;
                case Rank.Two:
                    rankPart = "2";
                    break;
                case Rank.Three:
                    rankPart = "3";
                    break;
                case Rank.Four:
                    rankPart = "4";
                    break;
                case Rank.Five:
                    rankPart = "5";
                    break;
                case Rank.Six:
                    rankPart = "6";
                    break;
                case Rank.Seven:
                    rankPart = "7";
                    break;
                case Rank.Eight:
                    rankPart = "8";
                    break;
                default:
                    rankPart = "?";
                    break;
            }
            var suitPart;
            switch (suit) {
                case Suit.Sou:
                    suitPart = "s";
                    break;
                case Suit.Man:
                    suitPart = "m";
                    break;
                case Suit.Pin:
                    suitPart = "p";
                    break;
                default:
                    suitPart = "?";
                    break;
            }
            return rankPart + suitPart;
        };
        return Cards;
    }());
    poker.Cards = Cards;
    var Canon = (function () {
        function Canon() {
            this.suits = {};
            this.ranks = {};
            for (var s = 0; s < Suit.N; s++) {
                this.suits[s] = 0;
            }
            for (var r = 0; r < Rank.N; r++) {
                this.ranks[r] = 0;
            }
        }
        Canon.prototype.add = function (card) {
            this.suits[Cards.suit(card)]++;
            this.ranks[Cards.rank(card)]++;
        };
        Canon.prototype.countSuit = function (suit) { return this.suits[suit]; };
        Canon.prototype.countRank = function (rank) { return this.ranks[rank]; };
        Canon.prototype.isStraight = function () {
            for (var r = 0; r < Rank.N - poker.HAND_SIZE; r++) {
                var straight = true;
                for (var r2 = 0; r2 < poker.HAND_SIZE; r2++) {
                    if (this.countRank(r + r2) !== 1) {
                        straight = false;
                        break;
                    }
                }
                if (straight) {
                    return true;
                }
            }
            return false;
        };
        // in our version of the game, a full house is any hand which contains no single cards
        Canon.prototype.isFullHouse = function () {
            for (var s = 0; s < Rank.N; s++) {
                if (this.ranks[s] === 1) {
                    return false;
                }
            }
            return true;
        };
        Canon.prototype.isFlush = function () {
            for (var s = 0; s < Suit.N; s++) {
                if (this.suits[s] === poker.HAND_SIZE) {
                    return true;
                }
            }
            return false;
        };
        Canon.prototype.isFourOfAKind = function () {
            for (var r = 0; r < Rank.N; r++) {
                if (this.ranks[r] === poker.HAND_SIZE) {
                    return true;
                }
            }
            return false;
        };
        Canon.prototype.high = function (n, pos) {
            for (var r = Rank.N - 1; r >= 0; r--) {
                if (this.ranks[r] > n) {
                    pos--;
                    if (pos === 0) {
                        return pos;
                    }
                }
            }
            return -1;
        };
        Canon.prototype.groupsDescending = function () {
            var arr = [];
            for (var i = poker.HAND_SIZE; i >= 0; i--) {
                for (var r = Rank.N - 1; r >= 0; r--) {
                    if (this.ranks[r] == i) {
                        arr.push([r, i]);
                    }
                }
            }
            return arr;
        };
        return Canon;
    }());
    var Hand = (function () {
        function Hand(arr) {
            var _this = this;
            this.toString = function () {
                return "Hand(" + Cards.dump(_this.cards[0]) + ", " + Cards.dump(_this.cards[1]) + ", " + Cards
                    .dump(_this.cards[2]) + ", " + Cards.dump(_this.cards[3]) + ")";
            };
            if (arr.length !== poker.HAND_SIZE) {
                throw "array doesn't have four elements";
            }
            this.cards = arr.slice(0);
            this.cards.sort(function (x, y) { return x - y; });
        }
        Hand.prototype.canon = function () {
            var canon = new Canon();
            for (var i = 0; i < this.cards.length; i++) {
                canon.add(this.cards[i]);
            }
            return canon;
        };
        Hand.better = function (h1, h2) {
            var c1 = h1.canon();
            var c2 = h2.canon();
            var g1 = c1.groupsDescending();
            var g2 = c2.groupsDescending();
            var tb;
            // straight flush
            tb = this.tiebreak(function (c) { return c.isStraight() && c.isFlush(); }, c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }
            // four of a kind
            tb = this.tiebreak(function (c) { return c.isFourOfAKind(); }, c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }
            // flush
            tb = this.tiebreak(function (c) { return c.isFullHouse(); }, c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }
            // flush
            tb = this.tiebreak(function (c) { return c.isFlush(); }, c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }
            // straight
            tb = this.tiebreak(function (c) { return c.isStraight(); }, c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }
            // the existing tiebreaker is sufficient from here:
            //   three of a kind
            //   two pair
            //   one pair
            //   high card
            return this.tiebreak(function (_) { return true; }, c1, c2, g1, g2);
        };
        Hand.tiebreak = function (c, c1, c2, g1, g2) {
            var isC1 = c(c1);
            var isC2 = c(c2);
            if (isC1 && isC2) {
                var shortest = Math.min(g1.length, g2.length);
                for (var i = 0; i < shortest; i++) {
                    var cmpCount = this.compare(g1[i][1], g2[i][1]);
                    if (cmpCount !== 0) {
                        return cmpCount;
                    }
                    var cmpRank = this.compare(g1[i][0], g2[i][0]);
                    if (cmpRank !== 0) {
                        return cmpRank;
                    }
                }
            }
            else if (isC1) {
                return 1;
            }
            else if (isC2) {
                return -1;
            }
            return 0;
        };
        Hand.compare = function (n1, n2) {
            if (n1 === n2) {
                return 0;
            }
            if (n1 > n2) {
                return 1;
            }
            return -1;
        };
        return Hand;
    }());
    var GameState = (function () {
        function GameState(centerCards) {
            var _this = this;
            this.toString = function () {
                var player = _this.playerCards.map(function (value) { return Cards.dump(value); }).join(", ");
                var center = _this.centerCards.map(function (value) { return Cards.dump(value); }).join(", ");
                var computer = _this.computerCards.map(function (value) { return Cards.dump(value); }).join(", ");
                return "GameState(Player[" + player + "], Center[" + center + "], Computer[" + computer + "])";
            };
            if (centerCards.length !== poker.CENTER_SIZE) {
                throw "wrong number of center cards";
            }
            this.playerCards = [];
            this.centerCards = centerCards.slice(0);
            this.computerCards = [];
            this.centerCards.sort(function (x, y) { return x - y; });
            this.trie = new MCTNode(null);
        }
        GameState.random = function () {
            return new GameState(Deck.deal(poker.CENTER_SIZE));
        };
        // player calls this to take a card
        GameState.prototype.playerTake = function (c) {
            if (this.phase() !== Phase.PlayerTurn) {
                throw "cannot take: it is not the player's turn";
            }
            var idx = this.centerCards.indexOf(c);
            if (idx === -1) {
                throw "cannot take that: it is not a card in the center pool";
            }
            this.centerCards.splice(idx, 1);
            this.playerCards.push(c);
            this.playerCards.sort(function (x, y) { return x - y; });
            this.trie = this.trie.subnode(c);
            this.trie.parent = null;
        };
        GameState.prototype.computerTake = function (c) {
            if (this.playerCards.length !== this.computerCards.length + 1) {
                throw "cannot take: it is not the computer's turn";
            }
            var idx = this.centerCards.indexOf(c);
            if (idx === -1) {
                throw "cannot take that: it is not a card in the center pool";
            }
            this.centerCards.splice(idx, 1);
            this.computerCards.push(c);
            this.computerCards.sort(function (x, y) { return x - y; });
            this.trie = this.trie.subnode(c);
            this.trie.parent = null;
        };
        // call this to ask the computer to make a move
        GameState.prototype.computerMakeMove = function () {
            this.computerTake(this.findBestTake());
        };
        GameState.prototype.findBestTake = function () {
            if (this.phase() !== Phase.ComputerTurn) {
                throw "cannot find best take: it is not my turn to take";
            }
            return this.trie.bestOptionToExploit(this.centerCards, false);
        };
        GameState.prototype.think = function (nIterations) {
            // todo: make it possible to think when not your turn
            if (this.phase() !== Phase.ComputerTurn) {
                throw "cannot think: it is not my turn to take";
            }
            for (var i = 0; i < nIterations; i++) {
                var trieNode = this.trie;
                var pCards = this.playerCards.slice(0);
                var cards = this.centerCards.slice(0);
                var cCards = this.computerCards.slice(0);
                while (true) {
                    // pick our move
                    var ourMove = trieNode.bestOptionToExplore(cards, false);
                    cCards.push(ourMove);
                    cards.splice(cards.indexOf(ourMove), 1);
                    trieNode = trieNode.subnode(ourMove);
                    // maybe we won
                    if (cCards.length === poker.HAND_SIZE) {
                        switch (this.scoreEndgame(pCards, cards, cCards)) {
                            case 1:
                                trieNode.lose();
                                break;
                            case 0:
                            case -1:
                                // in a tie, the player loses so we win
                                trieNode.win();
                                break;
                        }
                        break;
                    }
                    // pick the most exploitative move for our opponent
                    var theirMove = trieNode.bestOptionToExplore(cards, true);
                    pCards.push(theirMove);
                    cards.splice(cards.indexOf(theirMove), 1);
                    trieNode = trieNode.subnode(theirMove);
                }
            }
        };
        GameState.prototype.scoreEndgame = function (player, center, computer) {
            if (player.length !== poker.HAND_SIZE) {
                throw ("cannot score endgame with != HAND_SIZE player cards");
            }
            if (computer.length !== poker.HAND_SIZE) {
                throw ("cannot score endgame with != HAND_SIZE computer cards");
            }
            var playerHand = new Hand(player);
            var computerHand = new Hand(computer);
            return Hand.better(playerHand, computerHand);
        };
        GameState.prototype.phase = function () {
            if (this.computerCards.length === poker.HAND_SIZE && this.playerCards.length === poker.HAND_SIZE) {
                switch (this.scoreEndgame(this.playerCards, this.centerCards, this.computerCards)) {
                    case 1:
                        return Phase.PlayerWon;
                    default:
                        return Phase.ComputerWon;
                }
            }
            if (this.playerCards.length === this.computerCards.length + 1) {
                return Phase.ComputerTurn;
            }
            return Phase.PlayerTurn;
        };
        return GameState;
    }());
    poker.GameState = GameState;
    var MCTNode = (function () {
        function MCTNode(parent) {
            this.wins = 0;
            this.simulations = 0;
            this.parent = parent;
            this.subnodes = {};
        }
        MCTNode.prototype.bestOptionToExploit = function (options, flipWins) {
            if (options.length === 0) {
                throw "no options, but we were still asked for options";
            }
            var bestOption = options[0];
            var bestScore = this.scoreExploit(options[0], flipWins);
            for (var i = 1; i < options.length; i++) {
                var score = this.scoreExploit(options[i], flipWins);
                if (score > bestScore) {
                    bestOption = options[i];
                    bestScore = score;
                }
            }
            return bestOption;
        };
        MCTNode.prototype.bestOptionToExplore = function (options, flipWins) {
            if (options.length === 0) {
                throw "no options, but we were still asked for options";
            }
            var bestOption = options[0];
            var totalSimulations = 0;
            for (var i = 0; i < options.length; i++) {
                totalSimulations += this.subnode(options[i]).simulations;
            }
            var bestScore = this.scoreExplore(totalSimulations, options[0], flipWins);
            for (var i = 1; i < options.length; i++) {
                var score = this.scoreExplore(totalSimulations, options[i], flipWins);
                if (score > bestScore) {
                    bestOption = options[i];
                    bestScore = score;
                }
            }
            return bestOption;
        };
        MCTNode.prototype.subnode = function (card) {
            var c;
            if ((c = this.subnodes[card]) === undefined) {
                this.subnodes[card] = c = new MCTNode(this);
            }
            return c;
        };
        MCTNode.prototype.scoreExplore = function (totalSimulations, option, flipWins) {
            var node = this.subnode(option);
            var exploitation;
            if (node.simulations > 0) {
                exploitation = (flipWins ? node.simulations - node.wins : node.wins) / node.simulations;
            }
            else {
                exploitation = 0;
            }
            var exploration;
            if (node.simulations > 0 && totalSimulations > 0) {
                exploration = MCTNode.exploration * Math.sqrt(Math.log(totalSimulations) / node.simulations);
            }
            else {
                exploration = 10; // you're heavily encouraged to explore each node once
            }
            return exploration + exploitation;
        };
        MCTNode.prototype.scoreExploit = function (option, flipWins) {
            var node = this.subnode(option);
            if (node.simulations > 0) {
                return (flipWins ? node.simulations - node.wins : node.wins) / node.simulations;
            }
            else {
                return 0;
            }
        };
        MCTNode.prototype.win = function () {
            this.wins++;
            this.simulations++;
            // backpropagate too
            if (this.parent == null) {
                return;
            }
            this.parent.win();
        };
        MCTNode.prototype.lose = function () {
            this.simulations++;
            // backpropagate too
            if (this.parent == null) {
                return;
            }
            this.parent.lose();
        };
        MCTNode.prototype.dump = function () { this.dumpIndent(""); };
        MCTNode.prototype.dumpIndent = function (indent) {
            console.log(indent + ("Wins: " + this.wins));
            console.log(indent + ("Simulations: " + this.simulations));
            console.log(indent + "Subnodes:");
            for (var i = 0; i < poker.CARDS.length; i++) {
                if (this.subnode(i).simulations > 0) {
                    console.log(indent + '- ' + Cards.dump(i));
                    this.subnode(i).dumpIndent("  " + indent);
                    ;
                }
            }
        };
        MCTNode.exploration = 1.41;
        return MCTNode;
    }());
})(poker || (poker = {}));
var ui;
(function (ui_1) {
    var Vec2 = (function () {
        function Vec2(x, y) {
            this.x = x;
            this.y = y;
        }
        Vec2.duplicate = function (vec) {
            return new Vec2(vec.x, vec.y);
        };
        Vec2.eq = function (v1, v2) {
            return v1.x === v2.x && v1.y === v2.y;
        };
        Vec2.distance = function (v1, v2) {
            return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
        };
        return Vec2;
    }());
    ui_1.Vec2 = Vec2;
    var SingleGameUIState = (function () {
        function SingleGameUIState(game) {
            this.game = game;
            this.cardUiPos = new Array(poker.CARDS.length);
            this.cardUiTarPos = new Array(poker.CARDS.length);
            this.cardUiScale = new Array(poker.CARDS.length);
            this.cardUiTarScale = new Array(poker.CARDS.length);
            this.cardUiPresent = new Array(poker.CARDS.length);
            this.cardInteract = new Array(poker.CARDS.length);
            for (var i = 0; i < poker.CARDS.length; i++) {
                this.cardUiScale[i] = 1.0;
                this.cardUiTarScale[i] = 1.0;
            }
            this.applyGameLogic();
        }
        SingleGameUIState.prototype.calculateMouseCard = function (mousePosition) {
            for (var i = 0; i < poker.CARDS.length; i++) {
                if (this.cardInteract[i] == null) {
                    continue;
                }
                if (this.inCard(i, mousePosition)) {
                    this.mouseCard = i;
                    return;
                }
            }
            this.mouseCard = -1;
        };
        SingleGameUIState.prototype.tick = function (adjustedMousePosition, nThink) {
            this.applyGameLogic();
            this.calculateMouseCard(adjustedMousePosition);
            for (var i = 0; i < poker.CARDS.length; i++) {
                if (!this.cardUiPresent[i]) {
                    continue;
                }
                // move towards target
                var dist = Vec2.distance(this.cardUiPos[i], this.cardUiTarPos[i]);
                if (dist < 0.4) {
                    // then just snap to target
                    this.cardUiPos[i] = Vec2.duplicate(this.cardUiTarPos[i]);
                }
                else {
                    // speed along!
                    this.cardUiPos[i] = new Vec2(this.cardUiPos[i].x * 0.8 + this.cardUiTarPos[i].x * 0.2, this.cardUiPos[i].y * 0.8 + this.cardUiTarPos[i].y * 0.2);
                }
                // adjust scale based on mouse
                if (i === this.mouseCard) {
                    this.cardUiScale[i] = Math.min(this.cardUiScale[i] + 0.04, 1.2);
                }
                else {
                    this.cardUiScale[i] = Math.max(this.cardUiScale[i] - 0.01, 1.0);
                }
            }
            if (this.game.phase() === poker.Phase.ComputerTurn) {
                this.ticksForAiMove--;
                if (this.ticksForAiMove < 0) {
                    this.game.computerMakeMove();
                }
                else {
                    this.game.think(nThink);
                }
            }
            // TODO: Track a ticky time limit for player move too
            this.applyGameLogic();
        };
        // true if the mouse is considered to be over the given card
        SingleGameUIState.prototype.inCard = function (card, adjustedMousePosition) {
            if (!this.cardUiPresent[card]) {
                return false;
            }
            if (Vec2.distance(this.cardUiPos[card], adjustedMousePosition) > 0.5) {
                return false;
            }
            return true;
        };
        SingleGameUIState.prototype.mouseDown = function (adjustedMousePosition) {
            this.applyGameLogic();
            this.calculateMouseCard(adjustedMousePosition);
            if (this.mouseCard !== -1) {
                this.cardInteract[this.mouseCard](this.mouseCard);
            }
            this.applyGameLogic();
        };
        // Calculates where things belong on the screen and stuff based on current game state.
        // It is a felony to actually change the game or UI state within this function as you have no idea how many times it will be called during a given frame.
        SingleGameUIState.prototype.applyGameLogic = function () {
            for (var i = 0; i < poker.CARDS.length; i++) {
                this.cardInteract[i] = null;
                this.cardUiPresent[i] = false;
            }
            switch (this.game.phase()) {
                case poker.Phase.PlayerTurn:
                    var _loop_1 = function(i) {
                        var slot = this_1.game.centerCards[i];
                        var lthis = this_1;
                        this_1.cardInteract[slot] = function (card) {
                            lthis.game.playerTake(card);
                            lthis.ticksForAiMove = TICKS_TO_THINK;
                        };
                    };
                    var this_1 = this;
                    for (var i = 0; i < this.game.centerCards.length; i++) {
                        _loop_1(i);
                    }
                    break;
                case poker.Phase.PlayerWon:
                    break;
                case poker.Phase.ComputerTurn:
                    break;
                case poker.Phase.ComputerWon:
                    break;
            }
            // The display has three regions:
            // x = 1 to x = HAND_SIZE + 1 (half-open): the cards of the player
            // x = HAND_SIZE + 2 to x = HAND_SIZE + CENTER_SIZE + 3: the center cards
            // x = HAND_SIZE + CENTER_SIZE + 4 to x = HAND_SIZE + CENTER_SIZE + HAND_SIZE + 5: the far cards
            // (y is always 0)
            for (var i = 0; i < this.game.playerCards.length; i++) {
                this.moveCardTo(this.game.playerCards[i], new Vec2(1 + i + 0.5, 0.5));
            }
            var leftMargin = 2 + poker.HAND_SIZE;
            var rightMargin = leftMargin + poker.CENTER_SIZE;
            for (var i = 0; i < this.game.centerCards.length; i++) {
                this.moveCardTo(this.game.centerCards[i], new Vec2((leftMargin + rightMargin) / 2 - this.game.centerCards.length / 2 + i + 0.5, 0.5));
            }
            for (var i = 0; i < this.game.computerCards.length; i++) {
                this.moveCardTo(this.game.computerCards[i], new Vec2((4 + poker.HAND_SIZE + poker.CENTER_SIZE + poker.HAND_SIZE - this.game.computerCards.length) + i + 0.5, 0 + 0.5));
            }
        };
        SingleGameUIState.prototype.moveCardTo = function (card, vec) {
            this.cardUiPresent[card] = true;
            this.cardUiTarPos[card] = vec;
            if (this.cardUiPos[card] == undefined) {
                this.cardUiPos[card] = vec;
            }
        };
        return SingleGameUIState;
    }());
    var GameView = (function () {
        function GameView(ui, topLeft, size) {
            this.ui = ui;
            this.externalTopLeft = topLeft;
            this.externalSize = size;
            this.tarExternalTopLeft = topLeft;
            this.tarExternalSize = size;
        }
        // for aspect ratio reasons, we may not use the whole absolute extent
        // so corrected for aspect ratio, the top left
        GameView.prototype.adjustedExternalTopLeft = function () {
            var centerX = this.externalTopLeft.x + this.externalSize.x / 2;
            var centerY = this.externalTopLeft.y + this.externalSize.y / 2;
            var aExtSize = this.adjustedExternalSize();
            return new Vec2(centerX - aExtSize.x / 2, centerY - aExtSize.y / 2);
        };
        // for aspect ratio reasons, we may not use the whole absolute extent
        // so corrected for aspect ratio, the size
        GameView.prototype.adjustedExternalSize = function () {
            var iSize = this.internalSize();
            var scf = this.sizeConversionFactor();
            return new Vec2(iSize.x * scf, iSize.y * scf);
        };
        // the size of the internal coordinate space. this is calculated based on the poker hand size
        GameView.prototype.internalSize = function () {
            return new Vec2(poker.HAND_SIZE + poker.CENTER_SIZE + poker.HAND_SIZE + 5, 1);
        };
        // the external size of one x or one y in the internal space
        GameView.prototype.sizeConversionFactor = function () {
            var iSize = this.internalSize();
            return Math.max(Math.min(this.externalSize.x / iSize.x, this.externalSize.y / iSize.y), 1);
        };
        GameView.prototype.externalToInternal = function (external) {
            var aetl = this.adjustedExternalTopLeft();
            var scf = this.sizeConversionFactor();
            return new Vec2((external.x - aetl.x) / scf, (external.y - aetl.y) / scf);
        };
        GameView.prototype.internalToExternal = function (internal) {
            var aetl = this.adjustedExternalTopLeft();
            var scf = this.sizeConversionFactor();
            return new Vec2(aetl.x + scf * internal.x, aetl.y + scf * internal.y);
        };
        GameView.prototype.tick = function (mousePosition, nThink) {
            var imouse = this.externalToInternal(mousePosition);
            var dist;
            dist = Vec2.distance(this.externalTopLeft, this.tarExternalTopLeft);
            if (dist < 16) {
                // then just snap to target
                this.externalTopLeft = Vec2.duplicate(this.tarExternalTopLeft);
            }
            else {
                // speed along!
                this.externalTopLeft = new Vec2(this.externalTopLeft.x * 0.8 + this.tarExternalTopLeft.x * 0.2, this.externalTopLeft.y * 0.8 + this.tarExternalTopLeft.y * 0.2);
            }
            dist = Vec2.distance(this.externalSize, this.tarExternalSize);
            if (dist < 16) {
                // then just snap to target
                this.externalSize = Vec2.duplicate(this.tarExternalSize);
            }
            else {
                // speed along!
                this.externalSize = new Vec2(this.externalSize.x * 0.8 + this.tarExternalSize.x * 0.2, this.externalSize.y * 0.8 + this.tarExternalSize.y * 0.2);
            }
            this.ui.tick(imouse, nThink);
        };
        GameView.prototype.moveTo = function (topLeft, size) {
            this.tarExternalTopLeft = topLeft;
            this.tarExternalSize = size;
        };
        GameView.prototype.mouseDown = function (mousePosition) {
            var imouse = this.externalToInternal(mousePosition);
            this.ui.mouseDown(imouse);
        };
        GameView.prototype.draw = function (canvas) {
            var ctx = canvas.getContext("2d");
            ctx.lineWidth = 2.0;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "24px segoe ui";
            var scf = this.sizeConversionFactor();
            var cardRadius = 0.4 * scf;
            for (var i = 0; i < poker.CARDS.length; i++) {
                if (!this.ui.cardUiPresent[i]) {
                    continue;
                }
                var cardSite = this.ui.cardUiPos[i];
                var externalCardSite = this.internalToExternal(cardSite);
                switch (poker.Cards.suit(i)) {
                    case poker.Suit.Sou:
                        ctx.strokeStyle = "#0f0";
                        break;
                    case poker.Suit.Man:
                        ctx.strokeStyle = "#f00";
                        break;
                    case poker.Suit.Pin:
                        ctx.strokeStyle = "#00f";
                        break;
                    default:
                        ctx.strokeStyle = "#000";
                        break;
                }
                ctx.beginPath();
                var x1 = externalCardSite.x - cardRadius * this.ui.cardUiScale[i];
                var y1 = externalCardSite.y - cardRadius * this.ui.cardUiScale[i];
                var x2 = externalCardSite.x + cardRadius * this.ui.cardUiScale[i];
                var y2 = externalCardSite.y + cardRadius * this.ui.cardUiScale[i];
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x1, y2);
                ctx.lineTo(x1, y1);
                ctx.stroke();
                ctx.fillText(poker.Cards.dump(i), externalCardSite.x, externalCardSite.y);
            }
        };
        return GameView;
    }());
    var THINKS_PER_TICK = 100;
    var TICKS_TO_THINK = 50;
    var MultiGameAdmin = (function () {
        function MultiGameAdmin(element) {
            this.element = element;
            this.dimensions = new Vec2(0, 0);
            this.views = [];
            this.mouseXy = new Vec2(0, 0);
            this.fixDimensions();
        }
        MultiGameAdmin.prototype.fixDimensions = function () {
            var dims = this.bodyDimensions();
            if (dims.x !== this.dimensions.x || dims.y !== this.dimensions.y) {
                this.element.width = dims.x;
                this.element.height = dims.y;
                this.dimensions = dims;
            }
        };
        MultiGameAdmin.prototype.bodyDimensions = function () {
            var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            return new Vec2(w * SCALING, h * SCALING);
        };
        MultiGameAdmin.prototype.addGame = function (gs) {
            var dims = this.dimensions;
            // TODO: Start it at the position of the last currently running game if views is nonempty
            this.views.push(new GameView(new SingleGameUIState(gs), new Vec2(0, 0), new Vec2(dims.x, dims.y)));
        };
        MultiGameAdmin.prototype.start = function () {
            var lthis = this;
            for (var i = 0; i < 1; i++) {
                this.addGame(poker.GameState.random());
            }
            requestAnimationFrame(function () { return lthis.draw(); });
            this.element.addEventListener('mousemove', function (e) {
                lthis.mouseXy = new ui.Vec2(e.clientX * SCALING, e.clientY * SCALING);
            });
            this.element.addEventListener('mousedown', function (e) {
                lthis.mouseXy = new ui.Vec2(e.clientX * SCALING, e.clientY * SCALING);
                lthis.mouseDown();
            });
        };
        MultiGameAdmin.prototype.tick = function () {
            // TODO: Dispose of views that have completed games.
            this.positionViews();
            var nThinkers = 0;
            for (var i = 0; i < this.views.length; i++) {
                if (this.views[i].ui.game.phase() == poker.Phase.ComputerTurn) {
                    nThinkers++;
                }
            }
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].tick(this.mouseXy, Math.floor(THINKS_PER_TICK / Math.max(nThinkers, 1)));
            }
        };
        MultiGameAdmin.prototype.mouseDown = function () {
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].mouseDown(this.mouseXy);
            }
        };
        MultiGameAdmin.prototype.draw = function () {
            var lthis = this;
            this.tick();
            this.element.getContext('2d').clearRect(0, 0, this.element.width, this.element.height);
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].draw(this.element);
            }
            requestAnimationFrame(function () { return lthis.draw(); });
            var ctx = this.element.getContext('2d');
            ctx.beginPath();
            ctx.arc(this.mouseXy.x, this.mouseXy.y, 4, 0, 360);
            ctx.stroke();
        };
        MultiGameAdmin.prototype.positionViews = function () {
            var dims = this.dimensions;
            var vertSlice = dims.y / Math.max(this.views.length, 1);
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].moveTo(new Vec2(0, vertSlice * i), new Vec2(dims.x, vertSlice));
            }
        };
        return MultiGameAdmin;
    }());
    ui_1.MultiGameAdmin = MultiGameAdmin;
})(ui || (ui = {}));
window.onload = function () {
    var el = document.getElementById('gamezone');
    var greeter = new ui.MultiGameAdmin(el);
    greeter.start();
    window.addEventListener("resize", function (e) { return greeter.fixDimensions(); });
};
//# sourceMappingURL=app.js.map