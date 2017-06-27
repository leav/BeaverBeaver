var GAUGE_INCREASE_INTERVAL = 100;
var GAUGE_MAX = 15;
var HOLD_THRESHOLD = 6;

var main = function(game){}

main.prototype = {
    preload: function(){
        console.log('state: main')
    },

    create: function(){
        beaver.beaverLeft.keyAttack.onDown.add(this.onKeyDown, this, 0, beaver.beaverLeft, "attack");
        beaver.beaverLeft.keyBite.onDown.add(this.onKeyDown, this, 0, beaver.beaverLeft, "bite");
        beaver.beaverLeft.keyPush.onDown.add(this.onKeyDown, this, 0, beaver.beaverLeft, "push");

        beaver.beaverRight.keyAttack.onDown.add(this.onKeyDown, this, 0, beaver.beaverRight, "attack");
        beaver.beaverRight.keyBite.onDown.add(this.onKeyDown, this, 0, beaver.beaverRight, "bite");
        beaver.beaverRight.keyPush.onDown.add(this.onKeyDown, this, 0, beaver.beaverRight, "push");

        beaver.beaverLeft.keyAttack.onUp.add(this.onKeyUp, this, 0, beaver.beaverLeft, "attack");
        beaver.beaverLeft.keyBite.onUp.add(this.onKeyUp, this, 0, beaver.beaverLeft, "bite");
        beaver.beaverLeft.keyPush.onUp.add(this.onKeyUp, this, 0, beaver.beaverLeft, "push");

        beaver.beaverRight.keyAttack.onUp.add(this.onKeyUp, this, 0, beaver.beaverRight, "attack");
        beaver.beaverRight.keyBite.onUp.add(this.onKeyUp, this, 0, beaver.beaverRight, "bite");
        beaver.beaverRight.keyPush.onUp.add(this.onKeyUp, this, 0, beaver.beaverRight, "push");

        //this.time.events.loop(1500, this.phaseChange, this);
    },

    update: function(){
        //beaver.trunkTop.angle = - beaver.MAX_TRUNK_TOP_ANGLE * beaver.getPos();
        if (beaver.getWinner()) {
            if (beaver.beaverLeft.currentAction) {
                this[beaver.beaverLeft.currentAction + "End"](beaver.beaverLeft);
            }
            if (beaver.beaverRight.currentAction) {
                this[beaver.beaverRight.currentAction + "End"](beaver.beaverRight);
            }
            this.removeKeys();
            this.game.state.start("gameover", false);
        }
    },

    render: function(){
        //this.game.debug.text("countLeft = " + beaver.beaverLeft.biteCount + " countRight = " + beaver.beaverRight.biteCount, 32, 32);
    },

    shutdown: function(){
        this.removeKeys();
    },

    removeKeys: function() {
        beaver.beaverLeft.keyAttack.onDown.remove(this.onKeyDown);
        beaver.beaverLeft.keyBite.onDown.remove(this.onKeyDown);
        beaver.beaverLeft.keyPush.onDown.remove(this.onKeyDown);

        beaver.beaverRight.keyAttack.onDown.remove(this.onKeyDown);
        beaver.beaverRight.keyBite.onDown.remove(this.onKeyDown);
        beaver.beaverRight.keyPush.onDown.remove(this.onKeyDown);

        beaver.beaverLeft.keyAttack.onUp.remove(this.onKeyUp);
        beaver.beaverLeft.keyBite.onUp.remove(this.onKeyUp);
        beaver.beaverLeft.keyPush.onUp.remove(this.onKeyUp);

        beaver.beaverRight.keyAttack.onUp.remove(this.onKeyUp);
        beaver.beaverRight.keyBite.onUp.remove(this.onKeyUp);
        beaver.beaverRight.keyPush.onUp.remove(this.onKeyUp);
    },

    onKeyDown: function(key, actor, action, number) {
        if (actor.currentKey != null && actor.currentKey != key) return;
        if (actor.stunGauge > 0) return;
        if (!key.isDown) return;

        actor.currentKey = key;

        if (number == undefined) {
            number = 0;
        }
        if (number >= HOLD_THRESHOLD) {
            // Idle.
            if (actor.currentAction == null && actor.readyAction == null) {
                actor.readyAction = action;
                this.readyStart(actor, action);
            }
            // Ready.
            if (actor.readyAction != null) {
                if (actor.readyAction == action) {

                } else {
                    this.readyEnd(actor.readyAction);
                    actor.readyAction = action;
                    this.readyStart(actor, action);
                }
            }
            // Action.
            if (actor.currentAction != null) {
                this[actor.currentAction + "End"](actor);
                actor.currentAction = null;
                actor.readyAction = action;
                this.readyStart(actor, action);
            }
            // Ready hold on all circumstances.
            this.readyHold(actor, action);
        }
        this.time.events.add(GAUGE_INCREASE_INTERVAL, this.onKeyDown, this, key, actor, action, number + 1);
    },

    onKeyUp: function(key, actor, action) {
        if (actor.currentKey != null && actor.currentKey != key) return;
        actor.currentKey = null;
        if (actor.stunGauge > 0) {
            console.log("breaking stun stunGauge = ", actor.stunGauge);
            this.breakStun(actor);
            actor.stunGauge--;
            if (actor.stunGauge <= 0) {
                this.stunEnd(actor);
            }
            return;
        }
        // Idle.
        if (actor.currentAction == null && actor.readyAction == null) {
            actor.currentAction = action;
            this[action + "Start"](actor);
            this[action](actor);
        }
        // Ready.
        else if (actor.readyAction != null) {
            if (actor.readyAction != action) {
                actor.actionGauge = 0;
            }
            this.readyEnd(actor, actor.readyAction);
            actor.readyAction = null;
            actor.currentAction = action;
            this[action + "Start"](actor);
            this[action](actor);
        }
        // Any action.
        else if (actor.currentAction != null) {
            if (actor.currentAction != action) {
                actor.actionGauge = 0;
                this[actor.currentAction + "End"](actor);
                actor.currentAction = action;
                this[action + "Start"](actor);
            }
        }
        // Trigger action on all circumstances.
        this[action](actor);
        actor.actionGauge--;
        if (actor.actionGauge <= 0) {
            actor.actionGauge = 0;
        }
    },

    readyStart: function(actor, action) {
        actor.actionGauge = 0;
        console.log(actor.name + " readyStart " + action);
        actor.readyStart();
    },

    readyHold: function(actor, action) {
        actor.actionGauge++;
        if (actor.actionGauge > GAUGE_MAX) {
            actor.actionGauge = GAUGE_MAX;
        }
        console.log(actor.name + " readyHold " + action + " actionGauge = " + actor.actionGauge);
        actor.readyAction = action;
        actor.currentAction = null;
        actor.readyHold();
    },

    readyEnd: function(actor, action) {
        console.log(actor.name + " readyEnd " + action);
        actor.readyEnd();
    },

    attackStart: function(actor) {
        console.log(actor.name + " attackStart");
        actor.attackStart();
    },

    attack: function(actor) {
        console.log(actor.name + " attack");
        actor.attack();
        if (actor.other.currentAction == "push") {
            this.stun(actor.other, actor.actionGauge > 0 ? 30 : 10);
            return;
        }
    },

    attackEnd: function(actor) {
        console.log(actor.name + " attackEnd");
        actor.attackEnd();
    },

    biteStart: function(actor) {
        console.log(actor.name + " biteStart");
        actor.biteStart();
    },

    bite: function(actor) {
        console.log(actor.name + " bite");
        if (actor.other.currentAction == "attack") {
            this.stun(actor.other, 5);
        }
        if (actor.other.currentAction == "push") {
            console.log("bite failed because other side is pushing!");
            actor.bite(false);
        } else {
            actor.bite(true);
            actor.biteCount += actor.actionGauge > 0 ? 3 : 1;
            if (actor.biteCount > beaver.tree.BITE_LIMIT) {
                actor.biteCount = beaver.tree.BITE_LIMIT
            }
            if (actor.isLeft) {
                beaver.tree.biteCountLeft = actor.biteCount;
            } else {
                beaver.tree.biteCountRight = actor.biteCount;
            }
        }
    },

    biteEnd: function(actor){
        console.log(actor.name + " biteEnd");
        actor.biteEnd();
    },

    pushStart: function(actor){
        console.log(actor.name + " pushStart");
        actor.pushStart();
    },

    push: function(actor) {
        console.log(actor.name + " push beaver.tree.pushCount = " + beaver.tree.pushCount);
        var success = true;
        if (actor.isLeft) {
            if (beaver.tree.leftLevel() < 2 && beaver.tree.pushCount >= 0) {
                console.log("left level not enough: " + beaver.tree.leftLevel());
                success = false;
            }
        } else {
            if (beaver.tree.rightLevel() < 2 && beaver.tree.pushCount <= 0) {
                console.log("right level not enough: " + beaver.tree.rightLevel());
                success = false;
            }
        }
        actor.push(success);
        if (!success) {
            return;
        }
        beaver.tree.pushCount += (5 + actor.biteCount) * actor.sign * (actor.actionGauge > 0 ? 3 : 1);
        if (beaver.tree.pushCount > beaver.tree.PUSH_LIMIT) {
            beaver.tree.pushCount = beaver.tree.PUSH_LIMIT;
        }
        beaver.tree.tilt();
    },

    pushEnd: function(actor){
        console.log(actor.name + " pushEnd");
        actor.pushEnd();
    },

    breakStun: function(actor, gauge) {
        actor.breakStun();
    },

    stun: function(actor, gauge) {
        if (actor.currentAction) {
            this[actor.currentAction + "End"](actor);
            actor.stunStart();
        }
        actor.stun();
        actor.stunGauge += gauge;
        actor.currentAction = null;
        actor.readyAction = null;
        actor.actionGauge = null;
    },

    stunEnd: function(actor) {
        actor.stunEnd();
    },

};

