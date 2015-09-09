package com.majaro.gridwars.game;

import java.util.ArrayList;
import java.util.Arrays;

import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;
import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.game.Const.E_GameplayResponseCode;
import com.majaro.gridwars.game.Const.GameBuilding;
import com.majaro.gridwars.game.Const.GameObject;

public class Engine extends Thread {
	
	// Core game variables
	private boolean isRunning = false;
	private GameStaticMap staticMap;
	private GameDynamicMap dynamicMap;
	private Player[] players;

	
	// Constructors
	
	public Engine(GameConfig gameConfig, ArrayList<LobbyUser> connectedUsers, GameStaticMap gameMap) {
		
		// Construct map objects
		this.staticMap = gameMap;
		this.dynamicMap = new GameDynamicMap(staticMap);
		
		// Construct user objects
		this.players = new Player[connectedUsers.size()];
		for (int index = 0; index < connectedUsers.size(); index ++) {
			this.players[index] = new Player(connectedUsers.get(index));
		}
		
	}
	
	
	// Game flow methods
	
	public void start() {
		
		// Mark engine as running
		this.isRunning = true;
		
	}
	
	
	// Game request methods (more specific functionality for each request type)
	
	private GameplayResponse processBuildingPlaceRequest(Player player, GameBuilding[] sourceBuildings, int col, int row) {
		
		// Set default result
		GameplayResponse response = null;
		boolean validConstruction = true;
		
		// Check each object in turn
		for (GameBuilding sourceBuilding : sourceBuildings) {

			// Check all cells required for building are free in the static map -- currently a single cell
			if (validConstruction && this.staticMap.isCellObstructed(col, row)) {
				validConstruction = false;
				response = new GameplayResponse(E_GameplayResponseCode.STATIC_MAP_OBSTRUCTION);
			}

			// Check all cells required for building are free in the dynamic map -- currently a single cell
			if (validConstruction && this.dynamicMap.isCellObstructed(col, row)) {
				validConstruction = false;
				response = new GameplayResponse(E_GameplayResponseCode.DYNAMIC_MAP_OBSTRUCTION);
			}

			// Check user is at appropriate technology level
			if (validConstruction && !player.playerHasTechLevel(sourceBuildings[0])) {
				validConstruction = false;
				response = new GameplayResponse(E_GameplayResponseCode.DYNAMIC_MAP_OBSTRUCTION);
			}

			// Check user has appropriate funds
			if (validConstruction && !player.playerHasCash(sourceBuildings[0])) {
				validConstruction = false;
				response = new GameplayResponse(E_GameplayResponseCode.INSUFFICIENT_FUNDS);
			}
			
		}

		// Construct valid response
		if (validConstruction) {
			response = new GameplayResponse(E_GameplayResponseCode.NEW_BUILDING);
			for (GameBuilding sourceBuilding : sourceBuildings) {
				response.addCoord(col, row);
				response.addSource(sourceBuilding);
			}
		}

		System.out.println(response);
		
		// Return calculated result
		return response;
	}
	
	
	// Game request method
	
	public GameplayResponse processGameplayRequest(GameplayRequest gameplayRequest, int userId) {

		// Declare (and initialise) variables
		GameplayResponse gameplayResponse = null;
		Player sender = this.getPlayerFromUserId(userId);

		// Check minimum processing conditions
		if (sender != null) {

			// Log received request for debugging
			System.out.println(gameplayRequest.toString());

			// Determine which request was sent 
			switch (gameplayRequest.getRequestCode()) {
		        case NEW_BUILDING:  
		        	GameBuilding[] sourceBuildings = Const.getGameBuildingArrayFromGameObjectArrayList(gameplayRequest.getSource());
		        	int cellX = gameplayRequest.getTargetCellX();
		        	int cellY = gameplayRequest.getTargetCellY();
		        	gameplayResponse = this.processBuildingPlaceRequest(sender, sourceBuildings, cellX, cellY);
		        	break;
		        default:
		        	gameplayResponse = new GameplayResponse();
		        	break;
		    }
			
		}
		
		// Return failed response
		if (gameplayResponse == null) { gameplayResponse = new GameplayResponse(); }
		return gameplayResponse;
	}
	
	
	// Utility methods
	
	private Player getPlayerFromUserId(int userId) {
		for (Player player : this.players) {
			if (player.getPlayerId() == userId) {
				return player;
			}
		}
		return null;
	}
	
}
