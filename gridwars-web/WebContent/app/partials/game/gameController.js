'use strict';

(function () {
	
	function GameController () {
		
		// Define core game phaser variable
		var phaserGame = new Phaser.Game(800, 600, Phaser.AUTO, CONSTANTS.GAME_NAME, { preload: preload, create: create, update: update });

		// Define core phaser objects
		var mapRender = null;
		var explosionManager = null;
		
		// Define core phaser object arrays
		
		// Define sprite groups
		var mapGroup = null;
		var turretGroup = null;
		
		// Define test variables
		var test_turret;
		var test_turret_2;
		var test_turret_3;
		var test_turret_4;
		var test_tank;
		
		var test_map = {name: "Random Name",
				width: 8,
				height: 6,
				map: [0, 0, 0, 0, 0, 0, 0, 0,
				      0, 0, 0, 0, 0, 0, 0, 0,
				      0, 0, 0, 0, 0, 0, 0, 0,
				      0, 0, 0, 0, 0, 0, 0, 0,
				      0, 0, 0, 0, 0, 0, 0, 0,
				      0, 0, 0, 0, 0, 0, 0, 0]};
		
		function preload() {
			
			// Load sprite sheets
			phaserGame.load.spritesheet(CONSTANTS.SPRITE_TURRET, CONSTANTS.ROOT_SPRITES_LOC + 'turret.png', 100, 100, 13);
			phaserGame.load.spritesheet(CONSTANTS.SPRITE_TANK, CONSTANTS.ROOT_SPRITES_LOC + 'tank.png', 100, 100, 7);
			phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_A, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionA.png', 128, 128, 10);
			phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_B, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionB.png', 128, 128, 10);
		    
		    // Load tile images
			phaserGame.load.spritesheet(CONSTANTS.SPRITE_IMPACT_DECALS, CONSTANTS.ROOT_SPRITES_LOC + 'impactDecals.png', 50, 50, 4);
			phaserGame.load.image(CONSTANTS.MAP_TILE_A, CONSTANTS.ROOT_SPRITES_LOC + 'mapTileA.png');
			phaserGame.load.image(CONSTANTS.MAP_TILE_B, CONSTANTS.ROOT_SPRITES_LOC + 'mapTileB.png');
		    
		    // Load particles
			phaserGame.load.image(CONSTANTS.PARTICLE_YELLOW_SHOT, CONSTANTS.ROOT_SPRITES_LOC + 'p_yellowShot.png');

		}
		
		function create() {
			
			// Create sprite groups
			mapGroup = phaserGame.add.group();
			turretGroup = phaserGame.add.group();
			
			// Construct explosion manager
			explosionManager = new ExplosionManager(phaserGame);
			
			// Construct map renderer
			mapRender = new MapRenderer(phaserGame, mapGroup, test_map);

			// Construct test objects
			test_turret = new Turret(phaserGame, mapGroup, turretGroup, mapRender.ColRowToXY(0, 3), 100, 100, explosionManager.requestExplosion);
			test_turret_2 = new Turret(phaserGame, mapGroup, turretGroup, mapRender.ColRowToXY(0, 2), 100, 100, explosionManager.requestExplosion);
			test_turret_3 = new Turret(phaserGame, mapGroup, turretGroup, mapRender.ColRowToXY(3, 5), 100, 100, explosionManager.requestExplosion);
			test_turret_4 = new Turret(phaserGame, mapGroup, turretGroup, mapRender.ColRowToXY(5, 2), 100, 100, explosionManager.requestExplosion);
//			test_tank = new Tank();
			
			// Add key listener for keypress
			phaserGame.input.keyboard.addCallbacks(this, null, null, function(char) {
				test_turret.rotateAndShoot(phaserGame.input.mousePointer.x, phaserGame.input.mousePointer.y);
				test_turret_2.rotateAndShoot(phaserGame.input.mousePointer.x, phaserGame.input.mousePointer.y);
				test_turret_3.rotateAndShoot(phaserGame.input.mousePointer.x, phaserGame.input.mousePointer.y);
				test_turret_4.rotateAndShoot(phaserGame.input.mousePointer.x, phaserGame.input.mousePointer.y);
			});
			
			turretGroup.sort();
			
		}
		
		function update() {
			
			// Render map
			mapRender.renderMap();
			
			// Render test turrets
			test_turret.update();
			test_turret_2.update();
			test_turret_3.update();
			test_turret_4.update();
			
		}
		
	}
	GameController.prototype = {
			login: function () {
				
			}
	}

	angular.module('gridWarsApp.game.module').controller('gridWarsApp.game.controller', GameController);
}());
