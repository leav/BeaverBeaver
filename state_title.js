var title = function(game){};

title.prototype = {
    preload: function(){
        console.log('state: title');
    },

    create: function(){
        beaver.tree.bar.visible = false;
        beaver.tree.bar2.visible = false;

        this.logo = this.add.image(this.game.width / 2, this.game.height * 0.4, "logo");
        this.logo.anchor.setTo(0.5, 0.5);
        this.press = this.add.image(this.game.width / 2, this.game.height * 0.6, "press");
        this.press.anchor.setTo(0.5, 0.5);
        this.press.animations.add("press");
        this.press.animations.play("press", 6, true);

        var keyboard = this.input.keyboard;
        var game = this.game;
        keyboard.onUpCallback = function() {
            keyboard.onUpCallback = null;
            beaver.audioWin.play();
            game.state.start("ready", false);
        }
    },

    shutdown: function() {
        this.logo.destroy();
        this.press.destroy();
        beaver.tree.bar.visible = true;
        beaver.tree.bar2.visible = true;
    }
};

