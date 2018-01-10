const SCALING = 2;

module poker {
    // export const HAND_SIZE = 5;
    // 5 is too hard for me
    export const HAND_SIZE = 7;
    export const CENTER_SIZE = 2 * HAND_SIZE + 1;
    export const CARDS = [
        0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 11, 12, 13, 14, 15,
        16, 17, 18, 19, 20, 21, 22, 23
    ];


    export enum Suit { Sou = 0, Man = 1, Pin = 2, N = 3 }

    export enum Rank { One = 0, Two = 1, Three = 2, Four = 3, Five = 4, Six = 5, Seven = 6, Eight = 7, N = 8 }

    export enum Phase { PlayerTurn = 0, ComputerTurn = 1, PlayerWon = 2, ComputerWon = 3 }

    export type Card = number;

    function presentTwoHands() {
        var handCards = Deck.deal(2 * HAND_SIZE);

        var handOne: Hand = new Hand(handCards.slice(0, HAND_SIZE));
        var handTwo: Hand = new Hand(handCards.slice(HAND_SIZE, 16));

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

    class Deck {
        static cards: Array<Card> = CARDS.slice(0);

        static deal(n: number): Array<Card> {
            for (var i = 0; i < Deck.cards.length - 1; i++) {
                var j = i + Math.floor(Math.random() * (Deck.cards.length - i));
                var tmp = Deck.cards[i];
                Deck.cards[i] = Deck.cards[j];
                Deck.cards[j] = tmp;
            }
            return Deck.cards.slice(0, n);
        }
    }

    export class Cards {
        static from(rank: Rank, suit: Suit): Card { return rank * Suit.N + suit; }

        static rank(c: Card): Rank { return Math.floor(c / Suit.N); }

        static suit(c: Card): Suit { return c % Suit.N; }

        static dump(c: Card): string {
            var rank = Cards.rank(c);
            var suit = Cards.suit(c);

            var rankPart: string;
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

            var suitPart: string;
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
        }
    }

    class Canon {
        suits: { [key: number]: number };
        ranks: { [key: number]: number };

        constructor() {
            this.suits = {};
            this.ranks = {}

            for (var s = 0; s < Suit.N; s++) {
                this.suits[s] = 0;
            }
            for (var r = 0; r < Rank.N; r++) {
                this.ranks[r] = 0;
            }
        }

        add(card: Card): void {
            this.suits[Cards.suit(card)]++;
            this.ranks[Cards.rank(card)]++;
        }

        countSuit(suit: Suit): number { return this.suits[suit]; }

        countRank(rank: Rank): number { return this.ranks[rank]; }

        isStraight(): boolean {
            for (let r = 0; r < Rank.N - HAND_SIZE; r++) {
                var straight = true;
                for (let r2 = 0; r2 < HAND_SIZE; r2++) {
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
        }

        // in our version of the game, a full house is any hand which contains no single cards
        isFullHouse(): boolean {
            for (var s = 0; s < Rank.N; s++) {
                if (this.ranks[s] === 1) {
                    return false;
                }
            }
            return true;
        }

        isFlush(): boolean {
            for (var s = 0; s < Suit.N; s++) {
                if (this.suits[s] === HAND_SIZE) {
                    return true;
                }
            }
            return false;
        }

        isFourOfAKind(): boolean {
            for (var r = 0; r < Rank.N; r++) {
                if (this.ranks[r] === HAND_SIZE) {
                    return true;
                }
            }
            return false;
        }

        high(n: number, pos: number): Rank {
            for (var r = Rank.N - 1; r >= 0; r--) {
                if (this.ranks[r] > n) {
                    pos--;
                    if (pos === 0) {
                        return pos;
                    }
                }
            }
            return -1;
        }

        groupsDescending(): Array<[Rank, number]> {
            var arr = [];
            for (var i = HAND_SIZE; i >= 0; i--) {
                for (var r = Rank.N - 1; r >= 0; r--) {
                    if (this.ranks[r] == i) {
                        arr.push([r, i]);
                    }
                }
            }
            return arr;
        }
    }

    class Hand {
        cards: Array<Card>;

        constructor(arr: Array<Card>) {
            if (arr.length !== HAND_SIZE) {
                throw "array doesn't have four elements";
            }
            this.cards = arr.slice(0)
            this.cards.sort((x, y) => x - y);
        }

        canon(): Canon {
            var canon = new Canon();
            for (var i = 0; i < this.cards.length; i++) {
                canon.add(this.cards[i]);
            }
            return canon;
        }

        static better(h1: Hand, h2: Hand): number { // 1 if h1 is better, -1 if h2 is better, 0 otherwise
            const c1 = h1.canon();
            const c2 = h2.canon();

            const g1 = c1.groupsDescending();
            const g2 = c2.groupsDescending();
            var tb: number;

            // straight flush
            tb = this.tiebreak((c) => c.isStraight() && c.isFlush(), c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }

            // four of a kind
            tb = this.tiebreak((c) => c.isFourOfAKind(), c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }

            // flush
            tb = this.tiebreak((c) => c.isFullHouse(), c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }

            // flush
            tb = this.tiebreak((c) => c.isFlush(), c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }

            // straight
            tb = this.tiebreak((c) => c.isStraight(), c1, c2, g1, g2);
            if (tb !== 0) {
                return tb;
            }

            // the existing tiebreaker is sufficient from here:
            //   three of a kind
            //   two pair
            //   one pair
            //   high card
            return this.tiebreak((_) => true, c1, c2, g1, g2);
        }

        static tiebreak(
            c: (canon: Canon) => boolean,
            c1: Canon,
            c2: Canon,
            g1: Array<[Rank, number]>,
            g2: Array<[Rank, number]>
        ) {
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
            } else if (isC1) {
                return 1;
            } else if (isC2) {
                return -1;
            }
            return 0;
        }

        static compare(n1: number, n2: number): number {
            if (n1 === n2) {
                return 0;
            }
            if (n1 > n2) {
                return 1;
            }
            return -1;
        }

        public toString = (): string => {
            return `Hand(${Cards.dump(this.cards[0])}, ${Cards.dump(this.cards[1])}, ${Cards
                .dump(this.cards[2])}, ${Cards.dump(this.cards[3])})`;
        }
    }


    export class GameState {
        playerCards: Array<Card>;
        centerCards: Array<Card>;
        computerCards: Array<Card>;
        trie: MCTNode;
        flipTrie: boolean;

        static random(): GameState {
            return new GameState(Deck.deal(CENTER_SIZE));
        }

        constructor(centerCards: Array<Card>) {
            if (centerCards.length !== CENTER_SIZE) {
                throw "wrong number of center cards";
            }

            this.playerCards = [];
            this.centerCards = centerCards.slice(0);
            this.computerCards = [];

            this.centerCards.sort((x, y) => x - y);
            this.trie = new MCTNode(null);
        }

        // player calls this to take a card
        playerTake(c: Card) {
            if (this.phase() !== Phase.PlayerTurn) { throw "cannot take: it is not the player's turn"; }

            var idx = this.centerCards.indexOf(c);
            if (idx === -1) {
                throw "cannot take that: it is not a card in the center pool";
            }

            this.centerCards.splice(idx, 1);
            this.playerCards.push(c);
            this.playerCards.sort((x, y) => x - y);

            this.trie = this.trie.subnode(c);
            this.trie.parent = null;
        }

        computerTake(c: Card) {
            if (this.playerCards.length !== this.computerCards.length + 1) {
                throw "cannot take: it is not the computer's turn";
            }

            var idx = this.centerCards.indexOf(c);
            if (idx === -1) {
                throw "cannot take that: it is not a card in the center pool";
            }

            this.centerCards.splice(idx, 1);
            this.computerCards.push(c);
            this.computerCards.sort((x, y) => x - y);

            this.trie = this.trie.subnode(c);
            this.trie.parent = null;
        }

        // call this to ask the computer to make a move
        computerMakeMove() {
            this.computerTake(this.findBestTake());
        }

        findBestTake(): Card {
            if (this.phase() !== Phase.ComputerTurn) { throw "cannot find best take: it is not my turn to take"; }
            return this.trie.bestOptionToExploit(this.centerCards, false);
        }

        think(nIterations: number) {
            // todo: make it possible to think when not your turn
            if (this.phase() !== Phase.ComputerTurn) { throw "cannot think: it is not my turn to take"; }

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
                    if (cCards.length === HAND_SIZE) {
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
        }

        scoreEndgame(player: Array<Card>, center: Array<Card>, computer: Array<Card>): number {
            if (player.length !== HAND_SIZE) {
                throw("cannot score endgame with != HAND_SIZE player cards");
            }
            if (computer.length !== HAND_SIZE) {
                throw("cannot score endgame with != HAND_SIZE computer cards");
            }

            var playerHand = new Hand(player);
            var computerHand = new Hand(computer);

            return Hand.better(playerHand, computerHand);
        }

        public toString = (): string => {
            var player = this.playerCards.map((value) => Cards.dump(value)).join(", ");
            var center = this.centerCards.map((value) => Cards.dump(value)).join(", ");
            var computer = this.computerCards.map((value) => Cards.dump(value)).join(", ");
            return `GameState(Player[${player}], Center[${center}], Computer[${computer}])`;
        }

        phase(): Phase {
            if (this.computerCards.length === HAND_SIZE && this.playerCards.length === HAND_SIZE) {
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
        }
    }

    class MCTNode {
        static exploration = 1.41;
        wins: number;
        simulations: number;
        parent: MCTNode;
        subnodes: { [card: number]: MCTNode }

        constructor(parent: MCTNode) {
            this.wins = 0;
            this.simulations = 0;
            this.parent = parent;
            this.subnodes = {};
        }

        bestOptionToExploit(options: Array<Card>, flipWins: boolean): Card {
            if (options.length === 0) {
                throw "no options, but we were still asked for options";
            }
            let bestOption = options[0];
            let bestScore = this.scoreExploit(options[0], flipWins);

            for (let i = 1; i < options.length; i++) {
                let score = this.scoreExploit(options[i], flipWins);
                if (score > bestScore) {
                    bestOption = options[i];
                    bestScore = score;
                }
            }

            return bestOption;
        }

        bestOptionToExplore(options: Array<Card>, flipWins: boolean): Card {
            if (options.length === 0) {
                throw "no options, but we were still asked for options";
            }
            let bestOption = options[0];
            let totalSimulations = 0;
            for (let i = 0; i < options.length; i++) {
                totalSimulations += this.subnode(options[i]).simulations;
            }

            let bestScore = this.scoreExplore(totalSimulations, options[0], flipWins);

            for (let i = 1; i < options.length; i++) {
                let score = this.scoreExplore(totalSimulations, options[i], flipWins);
                if (score > bestScore) {
                    bestOption = options[i];
                    bestScore = score;
                }
            }

            return bestOption;
        }

        subnode(card: Card): MCTNode {
            var c;
            if ((c = this.subnodes[card]) === undefined) {
                this.subnodes[card] = c = new MCTNode(this);
            }
            return c;
        }

        scoreExplore(totalSimulations: number, option: Card, flipWins: boolean) {
            let node = this.subnode(option);
            let exploitation;
            if (node.simulations > 0) {
                exploitation = (flipWins ? node.simulations - node.wins : node.wins) / node.simulations;
            } else {
                exploitation = 0;
            }

            let exploration;
            if (node.simulations > 0 && totalSimulations > 0) {
                exploration = MCTNode.exploration * Math.sqrt(Math.log(totalSimulations) / node.simulations);
            } else {
                exploration = 10; // you're heavily encouraged to explore each node once
            }

            return exploration + exploitation;
        }

        scoreExploit(option: Card, flipWins: boolean) {
            let node = this.subnode(option);
            if (node.simulations > 0) {
                return (flipWins ? node.simulations - node.wins : node.wins) / node.simulations;
            } else {
                return 0;
            }
        }

        win() {
            this.wins++;
            this.simulations++;

            // backpropagate too
            if (this.parent == null) {
                return;
            }
            this.parent.win();
        }

        lose() {
            this.simulations++;

            // backpropagate too
            if (this.parent == null) {
                return;
            }
            this.parent.lose();
        }

        dump() { this.dumpIndent("") }

        dumpIndent(indent: string) {
            console.log(indent + `Wins: ${this.wins}`);
            console.log(indent + `Simulations: ${this.simulations}`);
            console.log(indent + `Subnodes:`);
            for (var i = 0; i < CARDS.length; i++) {
                if (this.subnode(i).simulations > 0) {
                    console.log(indent + '- ' + Cards.dump(i));
                    this.subnode(i).dumpIndent("  " + indent);;
                }
            }
        }
    }
}

module ui {
    export class Vec2 {
        x: number; 
        y: number;
        
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
        
        static duplicate(vec: Vec2): Vec2 {
            return new Vec2(vec.x, vec.y);
        }
        
        static eq(v1: Vec2, v2: Vec2) {
            return v1.x === v2.x && v1.y === v2.y;
        }

        static distance(v1: Vec2, v2: Vec2): number {
            return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
        }
    }

    class SingleGameUIState {
        // the current poker game
        game: poker.GameState;

        // the current position (X and Y) of each card
        cardUiPos : Array<Vec2>;

        // the target position (X and Y) of each card
        cardUiTarPos : Array<Vec2>; 

        // the scale of each card in the UI
        cardUiScale: Array<number>;

        // the target scale of each card
        cardUiTarScale: Array<number>;

        // if false, then that card is not part of the current game
        cardUiPresent: Array<boolean>; 

        // if there's a callback here, the card will get bigger when you wiggle your mouse on it
        cardInteract: Array<(card: poker.Card) => void>;

        // the card, if any, under the mouse. (-1 if no card is under the mouse)
        mouseCard: poker.Card;

        // how many ticks until the AI may move again
        ticksForAiMove : number;

        constructor(game: poker.GameState) {
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

        calculateMouseCard(mousePosition: Vec2) {
            for (var i = 0; i < poker.CARDS.length; i++) {
                if (this.cardInteract[i] == null) { continue; }
                if (this.inCard(i, mousePosition)) {
                    this.mouseCard = i;
                    return;
                }
            }
            this.mouseCard = -1;
        }

        tick(adjustedMousePosition : Vec2, nThink: number) {
            this.applyGameLogic();

            this.calculateMouseCard(adjustedMousePosition);
            for (var i = 0; i < poker.CARDS.length; i++) {
                if (!this.cardUiPresent[i]) { continue; }

                // move towards target
                var dist = Vec2.distance(this.cardUiPos[i], this.cardUiTarPos[i]);
                if (dist < 0.4) {
                    // then just snap to target
                    this.cardUiPos[i] = Vec2.duplicate(this.cardUiTarPos[i]);
                } else {
                    // speed along!
                    this.cardUiPos[i] = new Vec2(
                        this.cardUiPos[i].x * 0.8 + this.cardUiTarPos[i].x * 0.2,
                        this.cardUiPos[i].y * 0.8 + this.cardUiTarPos[i].y * 0.2
                    );
                }

                // adjust scale based on mouse
                if (i === this.mouseCard) {
                    this.cardUiScale[i] = Math.min(this.cardUiScale[i] + 0.04, 1.2);
                } else {
                    this.cardUiScale[i] = Math.max(this.cardUiScale[i] - 0.01, 1.0);
                }
            }

            if (this.game.phase() === poker.Phase.ComputerTurn) {
                this.ticksForAiMove--;
                
                if (this.ticksForAiMove < 0) {
                    this.game.computerMakeMove();
                } else {
                    this.game.think(nThink);
                }
            }
            // TODO: Track a ticky time limit for player move too

            this.applyGameLogic();
        }

        // true if the mouse is considered to be over the given card
        inCard(card: number, adjustedMousePosition: Vec2): boolean {
            if (!this.cardUiPresent[card]) { return false; }
            if (Vec2.distance(this.cardUiPos[card], adjustedMousePosition) > 0.5) { return false; }
            return true;
        }

        mouseDown(adjustedMousePosition : Vec2) {
            this.applyGameLogic();

            this.calculateMouseCard(adjustedMousePosition);

            if (this.mouseCard !== -1) {
                this.cardInteract[this.mouseCard](this.mouseCard);
            }

            this.applyGameLogic();
        }

        // Calculates where things belong on the screen and stuff based on current game state.
        // It is a felony to actually change the game or UI state within this function as you have no idea how many times it will be called during a given frame.
        applyGameLogic() {
            for (let i = 0; i < poker.CARDS.length; i++) {
                this.cardInteract[i] = null;
                this.cardUiPresent[i] = false;
            }

            switch (this.game.phase()) {
                case poker.Phase.PlayerTurn:
                    for (let i = 0; i < this.game.centerCards.length; i++) {
                        let slot = this.game.centerCards[i];

                        let lthis = this;
                        this.cardInteract[slot] = (card) => {
                            lthis.game.playerTake(card);
                            lthis.ticksForAiMove = TICKS_TO_THINK;
                        }
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
            for (let i = 0; i < this.game.playerCards.length; i++) {
                this.moveCardTo(this.game.playerCards[i], new Vec2(1 + i + 0.5, 0.5));
            }

            var leftMargin = 2 + poker.HAND_SIZE;
            var rightMargin = leftMargin + poker.CENTER_SIZE;
            for (let i = 0; i < this.game.centerCards.length; i++) {
                this.moveCardTo(this.game.centerCards[i], new Vec2((leftMargin + rightMargin) /2 - this.game.centerCards.length/2 + i + 0.5, 0.5));
            }

            for (let i = 0; i < this.game.computerCards.length; i++) {
                this.moveCardTo(this.game.computerCards[i], new Vec2((4 + poker.HAND_SIZE + poker.CENTER_SIZE + poker.HAND_SIZE - this.game.computerCards.length) + i + 0.5, 0 + 0.5));
            }
        }

        moveCardTo(card: poker.Card, vec: Vec2) {
            this.cardUiPresent[card] = true;
            this.cardUiTarPos[card] = vec;
            if (this.cardUiPos[card] == undefined) {
                this.cardUiPos[card] = vec;
            }
        }
    }

    class GameView {
        ui: SingleGameUIState;

        // the absolute extent, top-left
        externalTopLeft: Vec2;
        // the absolute extent, size
        externalSize: Vec2;

        // target for absolute extent (1)
        tarExternalTopLeft: Vec2;
        // target for absolute extent (2)
        tarExternalSize : Vec2;

        // for aspect ratio reasons, we may not use the whole absolute extent
        // so corrected for aspect ratio, the top left
        adjustedExternalTopLeft(): Vec2 {
            var centerX = this.externalTopLeft.x + this.externalSize.x / 2;
            var centerY = this.externalTopLeft.y + this.externalSize.y / 2;

            var aExtSize = this.adjustedExternalSize();

            return new Vec2(centerX - aExtSize.x / 2, centerY - aExtSize.y / 2);
        }

        // for aspect ratio reasons, we may not use the whole absolute extent
        // so corrected for aspect ratio, the size
        adjustedExternalSize(): Vec2 {
            var iSize = this.internalSize();
            var scf = this.sizeConversionFactor();
            return new Vec2(iSize.x * scf, iSize.y * scf);
        }

        // the size of the internal coordinate space. this is calculated based on the poker hand size
        internalSize(): Vec2 {
            return new Vec2(poker.HAND_SIZE + poker.CENTER_SIZE + poker.HAND_SIZE + 5, 1);
        }

        // the external size of one x or one y in the internal space
        sizeConversionFactor(): number {
            var iSize = this.internalSize();
            return Math.max(Math.min(this.externalSize.x / iSize.x, this.externalSize.y / iSize.y), 1);
        }

        constructor(ui: SingleGameUIState, topLeft: Vec2, size: Vec2) {
            this.ui = ui;

            this.externalTopLeft = topLeft;
            this.externalSize = size;

            this.tarExternalTopLeft = topLeft;
            this.tarExternalSize = size;
        }

        externalToInternal(external: Vec2): Vec2 {
            var aetl = this.adjustedExternalTopLeft();
            var scf = this.sizeConversionFactor();
        
            return new Vec2((external.x - aetl.x)/scf, (external.y - aetl.y)/scf);
        }

        internalToExternal(internal: Vec2): Vec2 {
            var aetl = this.adjustedExternalTopLeft();
            var scf = this.sizeConversionFactor();

            return new Vec2(aetl.x + scf * internal.x, aetl.y + scf * internal.y);
        }

        tick(mousePosition: Vec2, nThink: number) {
            var imouse = this.externalToInternal(mousePosition);

            let dist;
            dist = Vec2.distance(this.externalTopLeft, this.tarExternalTopLeft);
            if (dist < 16) {
                // then just snap to target
                this.externalTopLeft = Vec2.duplicate(this.tarExternalTopLeft);
            } else {
                // speed along!
                this.externalTopLeft = new Vec2(
                    this.externalTopLeft.x * 0.8 + this.tarExternalTopLeft.x * 0.2,
                    this.externalTopLeft.y * 0.8 + this.tarExternalTopLeft.y * 0.2
                );
            }

            dist = Vec2.distance(this.externalSize, this.tarExternalSize);
            if (dist < 16) {
                // then just snap to target
                this.externalSize = Vec2.duplicate(this.tarExternalSize);
            } else {
                // speed along!
                this.externalSize = new Vec2(
                    this.externalSize.x * 0.8 + this.tarExternalSize.x * 0.2,
                    this.externalSize.y * 0.8 + this.tarExternalSize.y * 0.2
                );
            }

            this.ui.tick(imouse, nThink);
        }

        moveTo(topLeft: Vec2, size : Vec2) {
            this.tarExternalTopLeft = topLeft;
            this.tarExternalSize = size;
        }

        mouseDown(mousePosition: Vec2) {
            var imouse = this.externalToInternal(mousePosition);

            this.ui.mouseDown(imouse);
        }

        draw(canvas: HTMLCanvasElement) {
            var ctx = canvas.getContext("2d");

            ctx.lineWidth = 2.0;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "24px segoe ui";

            var scf = this.sizeConversionFactor();
            var cardRadius = 0.4 * scf;

            for (let i = 0; i < poker.CARDS.length; i++) {
                if (!this.ui.cardUiPresent[i]) { continue; }

                var cardSite = this.ui.cardUiPos[i];
                var externalCardSite = this.internalToExternal(cardSite);

                switch (poker.Cards.suit(i)) {
                    case poker.Suit.Sou: ctx.strokeStyle = "#0f0"; break;
                    case poker.Suit.Man: ctx.strokeStyle = "#f00"; break;
                    case poker.Suit.Pin: ctx.strokeStyle = "#00f"; break;
                    default: ctx.strokeStyle = "#000"; break;
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
        }
    }

    const THINKS_PER_TICK = 100;
    const TICKS_TO_THINK = 50;
    export class MultiGameAdmin {
        element: HTMLCanvasElement;
        timerToken: number;
        dimensions: Vec2;
        mouseXy: Vec2;

        views: Array<GameView>;

        constructor(element: HTMLCanvasElement) {
            this.element = element;
            this.dimensions = new Vec2(0, 0);

            this.views = [];
            this.mouseXy = new Vec2(0, 0);

            this.fixDimensions();
        }

        fixDimensions() {
            var dims = this.bodyDimensions();

            if (dims.x !== this.dimensions.x || dims.y !== this.dimensions.y) {
                this.element.width = dims.x;
                this.element.height = dims.y;
                this.dimensions = dims;
            }
        }

        bodyDimensions(): Vec2 {
            var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            return new Vec2(w * SCALING, h * SCALING);
        }

        addGame(gs: poker.GameState) {
            var dims = this.dimensions;
            // TODO: Start it at the position of the last currently running game if views is nonempty
            this.views.push(new GameView(new SingleGameUIState(gs), new Vec2(0, 0), new Vec2(dims.x, dims.y)))
        }

        start() {
            var lthis = this;

            for (let i = 0; i < 1; i++) {
                this.addGame(poker.GameState.random());
            }

            requestAnimationFrame(() => lthis.draw());

            this.element.addEventListener('mousemove', (e) => {
                lthis.mouseXy = new ui.Vec2(e.clientX * SCALING, e.clientY * SCALING);
            });

            this.element.addEventListener('mousedown', (e) => {
                lthis.mouseXy = new ui.Vec2(e.clientX * SCALING, e.clientY * SCALING);
                lthis.mouseDown();
            });
        }

        tick() {
            // TODO: Dispose of views that have completed games.
            this.positionViews();

            let nThinkers = 0;
            for (var i = 0; i < this.views.length; i++) {
                if (this.views[i].ui.game.phase() == poker.Phase.ComputerTurn) {
                    nThinkers++;
                }
            }
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].tick(this.mouseXy, Math.floor(THINKS_PER_TICK / Math.max(nThinkers, 1)));
            }
        }

        mouseDown() {
            for (var i = 0; i < this.views.length; i++) { this.views[i].mouseDown(this.mouseXy); }
        }

        draw() {
            var lthis = this;

            this.tick();
            this.element.getContext('2d').clearRect(0, 0, this.element.width, this.element.height);

            for (var i = 0; i < this.views.length; i++) { this.views[i].draw(this.element); }

            requestAnimationFrame(() => lthis.draw());

            var ctx = this.element.getContext('2d');
            ctx.beginPath();
            ctx.arc(this.mouseXy.x, this.mouseXy.y, 4, 0, 360);
            ctx.stroke();
        }

        positionViews() {
            var dims = this.dimensions;
            var vertSlice = dims.y / Math.max(this.views.length, 1);
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].moveTo(new Vec2(0, vertSlice * i), new Vec2(dims.x, vertSlice));
            }
        }
    }
}

window.onload = () => {
    var el = document.getElementById('gamezone');
    var greeter = new ui.MultiGameAdmin(el as HTMLCanvasElement);
    greeter.start();
    window.addEventListener("resize", (e) => greeter.fixDimensions());
};
