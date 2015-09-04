'use strict';

(function() {

	function GameController() {

		// Create game config object
		var gameConfig = {
			map : {
				name : "Random Name",
				width : 8,
				height : 6,
				map : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
			},
			maxPlayers : 2,
			gameType : "FREE_FOR_ALL"
		};

		// Define core game phaser variable
		var phaserGame = new Engine(gameConfig);

		// Define server interface object
		var serverAPI = new ServerAPI();

	}

	angular.module('gridWarsApp.game.module').controller(
			'gridWarsApp.game.controller', GameController);
}());
