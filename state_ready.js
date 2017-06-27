var ready = function(game){};

ready.prototype = {
    preload: function(){
        console.log('state: ready');
    },

    create: function(){
        this.group = this.add.group();

        var keymap = this.game.add.image(0, 0, "keymap", 0, this.group);

        this.prompts = {};
        var promptLeft = this.add.text(beaver.beaverLeft.x, this.game.height * 0.75, "", null, this.group);
        promptLeft.anchor.set(0.5);
        this.prompts[beaver.beaverLeft.name] = promptLeft;

        var promptRight = this.add.text(beaver.beaverRight.x, this.game.height  * 0.75, "", null, this.group);
        promptRight.anchor.set(0.5);
        this.prompts[beaver.beaverRight.name] = promptRight;

        this.readies = {};

        beaver.beaverLeft.reset();
        beaver.beaverRight.reset();
        beaver.tree.reset();

        beaver.beaverLeft.keyBite.onUp.add(this.ready, this, 0, beaver.beaverLeft);
        beaver.beaverLeft.keyAttack.onUp.add(this.ready, this, 0, beaver.beaverLeft);
        beaver.beaverLeft.keyPush.onUp.add(this.ready, this, 0, beaver.beaverLeft);

        beaver.beaverRight.keyBite.onUp.add(this.ready, this, 0, beaver.beaverRight);
        beaver.beaverRight.keyAttack.onUp.add(this.ready, this, 0, beaver.beaverRight);
        beaver.beaverRight.keyPush.onUp.add(this.ready, this, 0, beaver.beaverRight);

        beaver.beaverLeft.biteCount = 0;
        beaver.beaverRight.biteCount = 0;
    },

    update: function() {
        if (this.readies[beaver.beaverLeft.name] && this.readies[beaver.beaverRight.name]) {
            this.time.events.add(500, this.game.state.start, this.game.state, "main", false);
            //this.game.state.start("main", false);
        }
    },

    shutdown: function() {
        this.group.destroy();
        beaver.beaverLeft.keyBite.onUp.remove(this.ready);
        beaver.beaverLeft.keyAttack.onUp.remove(this.ready);
        beaver.beaverLeft.keyPush.onUp.remove(this.ready);
        beaver.beaverRight.keyBite.onUp.remove(this.ready);
        beaver.beaverRight.keyAttack.onUp.remove(this.ready);
        beaver.beaverRight.keyPush.onUp.remove(this.ready);
    },

    ready: function(key, actor) {
        this.readies[actor.name] = true;
        //this.prompts[actor.name].text = "Ready!";
        actor.shake(32);
        beaver.playRandom(beaver.audioPushes);
    },
};

