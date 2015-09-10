package com.majaro.gridwars.game;

import java.util.ArrayList;
import java.util.Arrays;

import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;
import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.game.Const.E_GameplayResponseCode;
import com.majaro.gridwars.game.Const.GameBuilding;
import com.majaro.gridwars.game.Const.GameDefence;
import com.majaro.gridwars.game.Const.GameObject;

public class Engine extends Thread {

	// Engine state variables
	private boolean isRunning = false;
	
	// Map variables
	private GameStaticMap staticMap;
	private GameDynamicMap dynamicMap;
	
	// Player variables
	private Player[] players;

	// In-game object lists
	private ArrayList<DynGameBuilding> buildings;
	
	
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
		
		// Initialise in-game object lists
		this.buildings = new ArrayList<DynGameBuilding>();
		
	}
	
	
	// Game flow methods
	
	public void start() {
		
		// Mark engine as running
		this.isRunning = true;
		
	}
	
	
	// Game request methods (more specific functionality for each request type)
	
	@SuppressWarnings("unused")
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
			
			// Define variables for construction
			DynGameBuilding newBuilding = null;
			
			// Create game object(s)
			for (GameBuilding sourceBuilding : sourceBuildings) {
				newBuilding = null;
				if (sourceBuilding instanceof GameBuilding) {
					newBuilding = new DynGameBuilding(sourceBuilding, player, col, row); // -- need to calculate for multiBuilding structures later e.g. walls
				} else if (sourceBuilding instanceof GameDefence) {
					newBuilding = new DynGameDefence((GameDefence)sourceBuilding, player, col, row); // -- need to calculate for multiBuilding structures later e.g. walls
				}
				if (newBuilding != null) { this.buildings.add(newBuilding); }
			}
			
			// Generate response object
			if (newBuilding == null) {
				response = new GameplayResponse(E_GameplayResponseCode.SERVER_ERROR);
			} else {
				response = new GameplayResponse(E_GameplayResponseCode.NEW_BUILDING);
				for (GameBuilding sourceBuilding : sourceBuildings) {
					response.addCoord(col, row); // -- need to calculate for multiBuilding structures later e.g. walls
					response.addSource(sourceBuilding);
				}
			}
			
		}

		// Return calculated result
		return response;
	}
	
	private GameplayResponse processDefenceAttackRequest(Player player, GameDefence[] sourceDefences, int col, int row) {

		// Set default result
		GameplayResponse response = null;
		
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
			
			// Define and initialise working variables
			GameBuilding[] sourceBuildings;
			int cellX;
			int cellY;

			// Log received request for debugging
			System.out.println(gameplayRequest.toString());

			// Determine which request was sent 
			switch (gameplayRequest.getRequestCode()) {
	        case NEW_BUILDING:  
	        	gameplayResponse = this.processBuildingPlaceRequest(sender, 
	        			Const.getGameBuildingArrayFromGameObjectArrayList(gameplayRequest.getSource()), 
	        			gameplayRequest.getTargetCellX(), 
	        			gameplayRequest.getTargetCellY());
	        	break;
	        case DEFENCE_ATTACK_XY:
	        	gameplayResponse = this.processDefenceAttackRequest(sender, 
	        			Const.getGameDefenceArrayFromGameObjectArrayList(gameplayRequest.getSource()), 
	        			gameplayRequest.getTargetCellX(), 
	        			gameplayRequest.getTargetCellY());
	        	break;
		    default:
		    	gameplayResponse = new GameplayResponse();
		        break;
		    }
			
		}

		// Output response
		System.out.println(gameplayResponse);
		
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
