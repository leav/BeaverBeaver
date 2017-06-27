var beaver = {};

var game = new Phaser.Game(520, 520, Phaser.AUTO);
game.state.add("preload", preload);
game.state.add("title", title);
game.state.add("ready", ready);
game.state.add("main", main);
game.state.add("gameover", gameover);

game.state.start("preload");