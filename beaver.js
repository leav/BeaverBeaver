/**
 * This method clears the current State, calling its shutdown callback. The process also removes any active tweens,
 * resets the camera, resets input, clears physics, removes timers and if set clears the world and cache too.
 *
 * @method Phaser.StateManager#clearCurrentState
 */
Phaser.StateManager.prototype.clearCurrentState = function () {

    if (this.current)
    {
        if (this.onShutDownCallback)
        {
            this.onShutDownCallback.call(this.callbackContext, this.game);
        }

        // this.game.tweens.removeAll();

        this.game.camera.reset();

        this.game.input.reset(true);

        this.game.physics.clear();

        this.game.time.removeAll();

        this.game.scale.reset(this._clearWorld);

        if (this.game.debug)
        {
            this.game.debug.reset();
        }

        if (this._clearWorld)
        {
            this.game.tweens.removeAll(); // only remove tweens on clear world

            this.game.world.shutdown();

            if (this._clearCache === true)
            {
                this.game.cache.destroy();
            }
        }
    }
};


var Beaver = function (game, name, x, y, tree) {
    Phaser.Group.call(this, game);

    this.name = name;
    this.position.set(x, y);
    this.initX = x;
    this.isLeft = (x < game.width / 2);
    this.sign = (this.isLeft ? 1 : -1);

    //this.sprite = game.add.group(this);//game.add.image(0, 0, "beaver", 0, this);
    //this.sprite.anchor.setTo(0.5, 0.9);
    //if (this.isLeft) {
    //    this.sprite.scale.x *= -1;
    //}

    this.group = game.add.group(this);//game.add.image(0, 0, "beaver", 0, this);
    //this.group.anchor.setTo(0.5, 0.9);
    if (this.isLeft) {
        this.group.scale.x *= -1;
    }

    this.sprite = game.add.image(0, 0, "beaver", 0, this.group);
    this.sprite.anchor.setTo(0.5, 0.9);
    //if (this.isLeft) {
    //    this.sprite.scale.x *= -1;
    //}

    this.sprite.fire = game.add.image(0, 0, "fire", 0, this.group);
    this.sprite.fire.anchor.setTo(0.5, 0.9);
    this.sprite.fire.moveDown();
    this.sprite.fire.scale.set(1.5);
    this.sprite.fire.x = 40;
    this.sprite.fire.animations.add("fire");
    this.sprite.fire.animations.play("fire", 12, true);
    this.sprite.fire.opacity = 0;


    this.sprite.animations.add("attack", [30, 31, 32, 33]);
    this.sprite.animations.add("bite", [26, 27, 28, 29]);
    this.sprite.animations.add("idle", [4, 5, 6, 7, 8, 9]);
    this.sprite.animations.add("lose", [20, 21, 22, 23, 24, 25]);
    this.sprite.animations.add("push", [10, 11, 12]);
    this.sprite.animations.add("ready", [13]);
    this.sprite.animations.add("ready_blink", [14, 15, 16, 14]);
    this.sprite.animations.add("ready_red", [17, 18, 19]);
    this.sprite.animations.add("stunned", [0, 1, 2, 3]);



    this.imageQuestion = game.add.image(0, -game.height / 2, "question_mark");
    this.add(this.imageQuestion);
    this.imageQuestion.anchor.setTo(0.5, 0.5);
    this.imageQuestion.visible = false;


    this.imageWin = game.add.image(0, -game.height / 2, "win", 0, this);
    this.imageWin.anchor.setTo(0.5, 0.5);
    this.imageWin.animations.add("win");
    this.imageWin.animations.play("win", 6, true);
    this.imageWin.visible = false;

    this.debugText = game.add.text(0, - game.height * 0.75, "", null, this);
    this.debugText.anchor.setTo(0.5, 0.5);

    this.tree = tree;

    this.reset();
    this.idle();
};
Beaver.prototype = Object.create(Phaser.Group.prototype);
Beaver.prototype.constructor = Beaver;

Beaver.prototype.reset = function() {
    this.resetCounts();
    this.currentKey = null;
    this.readyAction = null;
    this.actionGauge = 0;
    this.currentAction = null;
    this.actionIsReadied = false;
    this.stunGauge = 0;
    this.stunSuccess = false;
};

Beaver.prototype.resetCounts = function() {
    this.attackCount = 0;
    this.biteCount = 0;
    this.pushCount = 0;
};

Beaver.prototype.addKeys = function(bite, push, attack) {
    this.keyBite = this.game.input.keyboard.addKey(bite);
    this.keyPush = this.game.input.keyboard.addKey(push);
    this.keyAttack = this.game.input.keyboard.addKey(attack)
};

Beaver.prototype.biteLevel = function() {
    return Math.floor(this.biteCount / beaver.tree.BITE_LIMIT * beaver.tree.trunkMaxLevel);
};

Beaver.prototype.attackStart = function() {
    this.sprite.animations.play("attack", 16, false);
    this.attackTween = this.game.add.tween(this.group).to(
        { x: 60 * this.sign, y: 50 },
        250,
        Phaser.Easing.Linear.None,
        true);
};

Beaver.prototype.attack = function() {
    this.shake(12);
    beaver.playRandom(beaver.audioAttacks);
};

Beaver.prototype.attackEnd = function() {
    if (this.attackTween) {
        this.attackTween.stop(true);
    }
    this.group.x = 0;
    this.group.y = 0;
    this.sprite.animations.stop();
    this.idle();
};

Beaver.prototype.biteStart = function() {
    this.group.x = (80 + this.biteLevel() * 8) * this.sign;
    this.group.y = 10;
    this.sprite.animations.play("bite", 16, false);
};

Beaver.prototype.bite = function(success) {
    this.group.x = (80 + this.biteLevel() * 8) * this.sign;
    this.group.y = 10;
    this.sprite.animations.play("bite", 16, false);
    this.imageQuestion.visible = !success;
    if (success) {
        beaver.playRandom(beaver.audioBites);
    }
};

Beaver.prototype.biteEnd = function() {
    this.group.x = 0;
    this.group.y = 0;
    this.sprite.animations.stop();
    this.imageQuestion.visible = false;
    this.idle();
};

Beaver.prototype.pushStart = function() {
    this.scale.set(0.9);
    this.group.x = (25 + Math.abs(beaver.tree.getTilt()) * 40) * this.sign;
    this.sprite.animations.play("push", 8, false);
};

Beaver.prototype.push = function(success) {
    this.group.x = (25 + Math.abs(beaver.tree.getTilt()) * 40) * this.sign;
    this.sprite.animations.play("push", 8, false);
    this.imageQuestion.visible = !success;
    beaver.playRandom(beaver.audioPushes);
};

Beaver.prototype.pushEnd = function() {
    this.scale.set(1.0);
    this.group.x = 0;
    this.group.y = 0;
    this.sprite.animations.stop();
    this.imageQuestion.visible = false;
    this.idle();
};

Beaver.prototype.readyStart = function() {
    this.scale.set(0.9);
    this.group.x = -60 * this.sign;
    this.group.y = 0;
    //this.spriteReadyBlink.visible = true;
    //this.spriteReadyBlink.play("ready_blink", 12, false);
    this.sprite.animations.play("ready_blink", 30, false);
    this.sprite.fire.animations.play("ready_red", 12, true);
    beaver.audioPrepare1.play();
};

Beaver.prototype.readyHold = function() {
    if (this.sprite.animations.currentAnim.isFinished) {
        if (this.actionGauge == GAUGE_MAX) {
            this.sprite.animations.play("ready_red", 30, false);
        } else {
            this.sprite.animations.play("ready", 6, false);
        }
    }
    beaver.audioPrepare2.play();
    this.shake(8);
};

Beaver.prototype.readyEnd = function() {
    this.scale.set(1.0);
    this.group.x = 0;
    this.group.y = 0;
    this.sprite.animations.stop();
    //beaver.audioPrepare3.play();
};

Beaver.prototype.idle = function() {
    this.sprite.animations.play("idle", 6, true);
};

Beaver.prototype.stunStart = function() {
    beaver.audioStun.play();
};

Beaver.prototype.breakStun = function() {
    this.shake(12);
};

Beaver.prototype.stun = function() {
    this.sprite.animations.play("stunned", 6, true);
};

Beaver.prototype.stunEnd = function() {
    this.sprite.animations.stop();
    this.idle();
};

Beaver.prototype.lose = function() {
    this.group.x = 20 * this.sign;
    this.sprite.animations.play("lose", 6, true);
};

Beaver.prototype.loseEnd = function() {
    this.group.x = 0;
    this.idle();
};

Beaver.prototype.win = function() {
    this.idle();
    this.imageWin.visible = true;
    beaver.audioWin.play();
};

Beaver.prototype.winEnd = function() {
    this.idle();
    this.imageWin.visible = false;
};

Beaver.prototype.shake = function(power) {
    this.shakePower = power;
};

Beaver.prototype.showText = function(text, duration) {
    if (duration == undefined) {
        duration = 500;
    }
    var text = this.game.add.text(0, -this.game.height * 0.35, text, null, this);
    text.anchor.setTo(0.5, 0.5);
    var tween = this.game.add.tween(text).to(
        { y: -this.game.height * 0.5, alpha: 0.0 },
        duration,
        Phaser.Easing.Linear.None,
        true);
    tween.onComplete.add(function(){text.destroy();}, this)
};

Beaver.prototype.update = function() {
    i = this.children.length;
    while (i--)
    {
        this.children[i].update();
    }

    if (this.shakePower) {
        this.x = this.initX + this.game.rnd.integerInRange(0, this.shakePower);
        this.shakePower = this.shakePower * 4 / 5;
    }

    this.sprite.fire.alpha = this.actionGauge / GAUGE_MAX;

    //this.debugText.text = "Bite: " + this.biteCount + " / " + this.;
};

Tree = function(game) {
    Phaser.Group.call(this, game);

    var tree = this;


    this.trunkTop = game.add.group();
    this.trunkTop.position.set(this.game.width / 2, this.game.height * 0.72);
    this.trunkTopLeft = this.game.add.image(0, 0, this.getKey("top", "left", 0), 0, this.trunkTop);
    this.trunkTopLeft.level = 0;
    this.trunkTopLeft.anchor.setTo(1.0, 1.0);
    this.trunkTopRight = this.game.add.image(0, 0, this.getKey("top", "right", 0), 0, this.trunkTop);
    this.trunkTopRight.level = 0;
    this.trunkTopRight.anchor.setTo(0, 1.0);

    this.trunkBottom = game.add.group();
    this.trunkBottom.position.set(this.game.width / 2, this.game.height * 0.72);
    this.trunkBottomLeft = this.game.add.image(0, 0, this.getKey("bottom", "left", 0), 0, this.trunkBottom);
    this.trunkBottomLeft.level = 0;
    this.trunkBottomLeft.anchor.setTo(1.0, 0.0);
    this.trunkBottomRight = this.game.add.image(0, 0, this.getKey("bottom", "right", 0), 0, this.trunkBottom);
    this.trunkBottomRight.level = 0;
    this.trunkBottomRight.anchor.setTo(0, 0.0);

    this.trunkMaxLevel = 6;
    this.trunkTop.update = function() {
        var leftLevel = tree.leftLevel();
        var rightLevel = tree.rightLevel();
        if (tree.trunkTopLeft != leftLevel) {
            tree.trunkTopLeft.level = leftLevel;
            tree.trunkTopLeft.loadTexture(tree.getKey("top", "left", leftLevel))
        }
        if (tree.trunkTopRight != rightLevel) {
            tree.trunkTopRight.level = rightLevel;
            tree.trunkTopRight.loadTexture(tree.getKey("top", "right", rightLevel))
        }
        if (tree.trunkBottomLeft != leftLevel) {
            tree.trunkBottomLeft.level = leftLevel;
            tree.trunkBottomLeft.loadTexture(tree.getKey("bottom", "left", leftLevel))
        }
        if (tree.trunkBottomRight != rightLevel) {
            tree.trunkBottomRight.level = rightLevel;
            tree.trunkBottomRight.loadTexture(tree.getKey("bottom", "right", rightLevel))
        }
    };

    //this.trunkBottom = this.game.add.image(this.game.width / 2, this.game.height * 0.72 - 1, "trunk_bottom");
    //this.trunkBottom.anchor.setTo(0.5, 535 / 676);
    //this.trunkTop = this.game.add.image(this.game.width / 2, this.game.height * 0.72 , "trunk_top");
    //this.trunkTop.anchor.setTo(0.5, 535 / 676);

    this.bar2 = game.add.image(this.game.width / 2, this.game.height * 0.08, "bar2");
    this.bar2.anchor.setTo(0.5, 0.5);
    this.bar2.mask = game.add.graphics(0, 0);
    this.bar2.addChild(this.bar2.mask);

    //this.bar2.mask.drawRect(-this.bar2.width / 2, -this.bar2.height / 2, this.bar2.width, this.bar2.height);

    this.bar2.update = function() {
        var leftRatio = tree.biteCountLeft  / tree.BITE_LIMIT;
        var rightRatio = tree.biteCountRight / tree.BITE_LIMIT;
        var scale = (1 - leftRatio + 1 - rightRatio) / 2;
        var x = this.width / 2 * (1 - leftRatio);
        this.mask.clear();
        this.mask.beginFill(0xffffff);
        this.mask.drawRect(-x, -this.height / 2, this.width * scale, this.height);
    };

    this.bar = game.add.image(this.game.width / 2, this.game.height * 0.08, "bar");
    this.bar.anchor.setTo(0.5, 0.5);

    this.bar.block = game.add.image(0, 0, "block");
    this.bar.addChild(this.bar.block);
    this.bar.block.anchor.setTo(0.5, 0.5);
    this.bar.update = function() {
        this.block.x = (this.width - this.block.width) / 2 * beaver.tree.getTilt();
    };

    this.BITE_LIMIT = 120;
    this.PUSH_LIMIT = 1000;

    this.TRUNK_TOP_FALLEN_ANGLE = 100;
    this.TRUNK_TOP_TILT_ANGLE = 30;

    this.reset();
};

Tree.prototype = Object.create(Phaser.Group.prototype);
Tree.prototype.constructor = Tree;

Tree.prototype.reset = function() {
    this.biteCountLeft = 0;
    this.biteCountRight = 0;
    this.pushCount = 0;
    this.trunkTop.angle = 0;
};

Tree.prototype.fall = function() {
    this.tween = this.game.add.tween(this.trunkTop).to(
        { angle: this.TRUNK_TOP_FALLEN_ANGLE * this.getTilt() },
        2400,
        Phaser.Easing.Bounce.Out,
        true);
};

Tree.prototype.getKey = function(top, left, level) {
    return "trunk_" + top + "_" + left + "_" + level;
}

Tree.prototype.getTilt = function() {
    return this.pushCount / this.PUSH_LIMIT;
};

Tree.prototype.isFalling = function() {
    return this.tween && this.tween.isRunning;
};

Tree.prototype.leftLevel = function() {
    return Math.floor(this.biteCountLeft / this.BITE_LIMIT * this.trunkMaxLevel);
};

Tree.prototype.rightLevel = function() {
    return Math.floor(this.biteCountRight / this.BITE_LIMIT * this.trunkMaxLevel);
};

Tree.prototype.tilt = function() {
    this.trunkTop.angle = this.TRUNK_TOP_TILT_ANGLE * this.getTilt();
};

