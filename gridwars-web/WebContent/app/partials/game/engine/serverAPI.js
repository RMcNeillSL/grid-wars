function ServerAPI(gameConfig) {

	// Save passed config
	this.gameConfig = gameConfig;
	
	// Create core variables
	this.players = [];
	
	// Create this reference
	var self = this;
	
	// Private methods
	this.getMapBuildingState = function() {
		
		// Generate static map using source map
		var resultMap = []; // -1 - unowned obstruction, 0 - unoccupied, 1-n player owned obstruction
		for (var index = 0; index < self.gameConfig.map.length; index ++) {
			if (self.gameConfig.map[index] in [0]) {
				resultMap.push(0);
			} else {
				resultMap.push(-1);
			}
		}
		
		// Generate player detail for map
		for (var playerIndex = 0; playerIndex < self.players.length; playerIndex ++) {
			
		}
		
	}
	

//	var gameConfig = {
//		map : {
//			name : "Random Name",
//			width : 8,
//			height : 6,
//			map : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
//		},
//		maxPlayers : 2,
//		gameType : "FREE_FOR_ALL"
//	};
	
}

