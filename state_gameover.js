var gameover = function(game){};

gameover.prototype = {
    preload: function(){
        console.log('state: gameover');
    },

    create: function(){
        var winner = beaver.getWinner();
        this.winner = winner;

        winner.win();
        this.time.events.add(500, winner.other.lose, winner.other);

        beaver.tree.fall();

        var stateGameover = this;
        var done = function(){
            if (!beaver.tree.isFalling()) {
                stateGameover.game.state.start("ready", false);
                beaver.playRandom(beaver.audioPushes);
            }
        };
        beaver.beaverLeft.keyBite.onUp.add(done);
        beaver.beaverRight.keyBite.onUp.add(done);
        beaver.beaverLeft.keyAttack.onUp.add(done);
        beaver.beaverRight.keyAttack.onUp.add(done);
        beaver.beaverLeft.keyPush.onUp.add(done);
        beaver.beaverRight.keyPush.onUp.add(done);
    },

    shutdown: function() {
        this.winner.winEnd();
        this.winner.other.loseEnd();
        beaver.beaverLeft.keyBite.onUp.removeAll();
        beaver.beaverRight.keyBite.onUp.removeAll();
        beaver.beaverLeft.keyAttack.onUp.removeAll();
        beaver.beaverRight.keyAttack.onUp.removeAll();
        beaver.beaverLeft.keyPush.onUp.removeAll();
        beaver.beaverRight.keyPush.onUp.removeAll();
    }
};

