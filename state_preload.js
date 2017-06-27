var preload = function(game){};

preload.prototype = {
    preload: function(){
        console.log('state: preload');

        this.load.spritesheet("beaver", "assets/images/beaver.png", 445, 307).
            image('background', 'assets/images/background.png').
            image('bar', 'assets/images/bar.png').
            image('bar2', 'assets/images/bar2.png').
            image('block', 'assets/images/block.png').
            image('logo', 'assets/images/logo.png').
            image('keymap', 'assets/images/keymap.png').
            image("question_mark", "assets/images/text_qustionmark.png").
            spritesheet('fire', 'assets/images/fire.png', 150, 194).
            spritesheet("press", "assets/images/text_press.png", 210, 49).
            spritesheet("win", "assets/images/text_win.png", 178, 84)

        this.audioBites = [];
        for (var i = 1; i <= 4; i++) {
            this.load.audio('bite' + i, 'assets/audio/bite' + i + '.wav');
            this.audioBites.push('bite' + i)
        }

        this.load.audio('attack', 'assets/audio/attack.wav');
        this.load.audio('aowu01', 'assets/audio/aowu01.wav');
        this.load.audio('aowu02', 'assets/audio/aowu02.wav');
        this.load.audio('aowu03', 'assets/audio/aowu03.wav');
        this.load.audio('aowu04', 'assets/audio/aowu04.wav');
        this.load.audio('aowu05', 'assets/audio/aowu05.wav');
        this.load.audio('aowu06', 'assets/audio/aowu06.wav');
        this.load.audio('aowu08', 'assets/audio/aowu08.wav');
        this.load.audio('prepare1', 'assets/audio/prepare1.wav');
        this.load.audio('prepare2', 'assets/audio/prepare2.wav');
        this.load.audio('dizzy', 'assets/audio/failed_dizzy.wav');

        this.audioAttacks = ['attack', 'aowu05'];
        this.audioPushes = ['aowu02', 'aowu04', 'aowu06'];

        var top = ["top", "bottom"];
        var left = ["left", "right"];
        var maxLevel = 6;
        for (var topI = 0; topI < 2; topI++) {
            for (var leftI = 0; leftI < 2; leftI++) {
                for (var level = 0; level <= maxLevel; level++) {
                    var key = "trunk_" + top[topI] + "_" + left[leftI] + "_" + level;
                    var path = "assets/images/trunk_L" + (level + 1) + "_01_0" + (topI * 2 + leftI + 1) + ".png";
                    this.load.image(key, path)
                }
            }
        }
    },

    create: function(){
        console.log("this.load.hasLoaded = " + this.load.hasLoaded)
        // Images.

        beaver.background = this.add.image(this.game.width / 2, this.game.height / 2, 'background');
        beaver.background.anchor.setTo(0.5, 0.5);

        beaver.tree = new Tree(this.game);

        beaver.beaverLeft = new Beaver(this.game, "left", this.game.width * 0.25, this.game.height * 0.95, beaver.tree);
        beaver.beaverRight = new Beaver(this.game, "right", this.game.width * 0.75, this.game.height * 0.95, beaver.tree);

        beaver.beaverLeft.other = beaver.beaverRight;
        beaver.beaverRight.other = beaver.beaverLeft;

        beaver.getWinner = function() {
            var pos = this.tree.getTilt();
            if (Math.abs(pos) >= 1) {
                if (pos < 0) {
                    return beaver.beaverRight;
                } else {
                    return beaver.beaverLeft;
                }
            }
            return null;
        };

        // Audios.

        beaver.audioBites = [];
        for (var i = 0; i < this.audioBites.length; i++) {
            beaver.audioBites.push(this.add.audio(this.audioBites[i]));
        }

        beaver.audioAttacks = [];
        for (var i = 0; i < this.audioAttacks.length; i++) {
            beaver.audioAttacks.push(this.add.audio(this.audioAttacks[i]));
        }

        beaver.audioPushes = [];
        for (var i = 0; i < this.audioPushes.length; i++) {
            beaver.audioPushes.push(this.add.audio(this.audioPushes[i]));
        }

        beaver.audioPrepare1 = this.add.audio("prepare1");
        beaver.audioPrepare2 = this.add.audio("prepare2");
        beaver.audioPrepare3 = this.add.audio("aowu03");

        beaver.audioWin = this.add.audio("aowu08");

        beaver.audioStun = this.add.audio("dizzy");

        var state = this;
        beaver.playRandom = function(audios) {
            audios[state.rnd.integerInRange(0, audios.length - 1)].play()
        };

        // Keys.

        beaver.beaverLeft.addKeys(Phaser.Keyboard.F, Phaser.Keyboard.D, Phaser.Keyboard.S);
        beaver.beaverRight.addKeys(Phaser.Keyboard.J, Phaser.Keyboard.K, Phaser.Keyboard.L);

        this.game.state.start("title", false);
    }
};