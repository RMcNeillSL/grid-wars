package com.majaro.gridwars.game;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;

import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;
import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.game.Const.E_GameplayResponseCode;
import com.majaro.gridwars.game.Const.GameBuilding;
import com.majaro.gridwars.game.Const.GameDefence;
import com.majaro.gridwars.game.Const.GameObject;
import com.majaro.gridwars.game.Const.GameUnit;

public class Engine extends Thread {
	
	// A* pathfinder class
	private class AStarPathFinder {
		
		// Cells containing information on costs
		private class AStarCell {
			private double moveToCost = 0.0;		// Cost of movement from starting cell
			private double mDistanceCost = 0.0;		// Cost of travelling to target using manhattan method
			private Coordinate coord = null; 		// Coordinate cell represents
			private AStarCell parentCell = null; 	// Cell the current cell branched from
			public AStarCell(AStarCell parentCell, Coordinate coord, double moveToCost, double mDistanceCost) {
				this.parentCell = parentCell;
				this.coord = coord;
				this.moveToCost = moveToCost;
				this.mDistanceCost = mDistanceCost;
			}
			public boolean isCoord(Coordinate compareCoord) {
				return (this.coord.getCol() == compareCoord.getCol() &&
						this.coord.getRow() == compareCoord.getRow());
			}
			public double score() { return this.mDistanceCost + this.moveToCost; }
			public ArrayList<AStarCell> getPathToSource() {
				AStarCell currentCell = this;
				ArrayList<AStarCell> result = new ArrayList<AStarCell>();
				while (currentCell != null) {
					result.add(currentCell);
					currentCell = currentCell.parentCell;
				}
				return result;
			}
			public boolean isNeighbour(AStarCell compareCell) {
				return (compareCell != null &&
						( (Math.abs(compareCell.coord.getCol() - this.coord.getCol()) == 1 && Math.abs(compareCell.coord.getRow() - this.coord.getRow()) == 0) ||
						  (Math.abs(compareCell.coord.getCol() - this.coord.getCol()) == 0 && Math.abs(compareCell.coord.getRow() - this.coord.getRow()) == 1) ) );
			}
		}
		
		// References to engine objects
		private GameStaticMap staticMapRef = null;
		private GameDynamicMap dynamicMapRef = null;
		
		// Constructor
		public AStarPathFinder(GameStaticMap staticMapRef, GameDynamicMap dynamicMapRef) {
			this.staticMapRef = staticMapRef;
			this.dynamicMapRef = dynamicMapRef;
		}
		
		// Path finding methods
		public ArrayList<Coordinate> calculatePath(Coordinate startCoord, Coordinate endCoord) {
			
			// Make sure required info is valid
			if (startCoord != null && endCoord != null) {
				
				// Debug information
				System.out.println("Starting coordinate for pathfinding: (" + startCoord.getCol() + "," + startCoord.getRow() + ")");
				System.out.println("Ending coordinate for pathfinding: (" + endCoord.getCol() + "," + endCoord.getRow() + ")");

				// Define (and initialise) working variables
				boolean isPathPossible = true;
				AStarCell currentCell = null;
				AStarCell possibleNeighbourCell = null;
				AStarCell tempHoldCell = null;
				ArrayList<AStarCell> neighbourCells = new ArrayList<AStarCell>();

				// Declare working cell list, processed cell list, and unprocessed cell list
				ArrayList<AStarCell> processedCells = new ArrayList<AStarCell>();
				ArrayList<AStarCell> cellsToProcess = new ArrayList<AStarCell>();
				ArrayList<AStarCell> unprocessedCells = new ArrayList<AStarCell>();

				// Populate unprocessed cell list, removing the starting cell at the end (may not be present)
				Coordinate currentCoord = null;
				for (int row = 0; row < this.staticMapRef.getHeight(); row ++) {
					for (int col = 0; col < this.staticMapRef.getWidth(); col ++) {
						if (!this.staticMapRef.isCellObstructed(col, row) &&
							!this.dynamicMapRef.isCellObstructed(col, row)) {
							currentCoord = new Coordinate(col, row);
							tempHoldCell = new AStarCell(null, currentCoord, 99999, this.mCostToCell(currentCoord, endCoord));
							if (tempHoldCell.coord.getCol() == startCoord.getCol() && tempHoldCell.coord.getRow() == startCoord.getRow()) {
								currentCell = tempHoldCell;
								cellsToProcess.add(currentCell);
							} else {
								unprocessedCells.add(tempHoldCell);
							}
						}
					}
				}
				
				// Main A Star search loop
				while (isPathPossible &&										// Check path is still possible
						currentCell != null && cellsToProcess != null			// Check objects are assigned
						&& !currentCell.isCoord(endCoord)) {					// Check there are still cells to process
					
					// Select next current cell from list
					currentCell = cellsToProcess.get(0);
					for (int index = 1; index < cellsToProcess.size(); index ++) {
						if (currentCell.score() > cellsToProcess.get(index).score()) {
							currentCell = cellsToProcess.get(index);
						}
					}
					
					// Search for neighbouring cells for future processing
					neighbourCells.clear();
					for (int index = 0; index < unprocessedCells.size(); index ++) {
						possibleNeighbourCell = unprocessedCells.get(index);
						if (possibleNeighbourCell != null &&
								currentCell.isNeighbour(possibleNeighbourCell) &&
								!this.staticMapRef.isCellObstructed(possibleNeighbourCell.coord) &&
								!this.dynamicMapRef.isCellObstructed(possibleNeighbourCell.coord)) {
							tempHoldCell = unprocessedCells.get(index);
							tempHoldCell.moveToCost = currentCell.moveToCost;
							neighbourCells.add(tempHoldCell);
						}
					}
					
					// Remove all cells which have been added to neighbours
					cellsToProcess.addAll(neighbourCells);
					for (int index = 0; index < neighbourCells.size(); index ++) {
						tempHoldCell = neighbourCells.get(index);
						unprocessedCells.remove(tempHoldCell);
						tempHoldCell.parentCell = currentCell;
					}
					
					// Add to processed cell list and remove from working cell list
					processedCells.add(currentCell);
					cellsToProcess.remove(currentCell);
				}

				// Generate final path
				if (currentCell != null) {
					
					// Calculate path
					ArrayList<AStarCell> path = currentCell.getPathToSource();
					
					// Return path if final cell was target
					if (currentCell.isCoord(endCoord)) {
						ArrayList<Coordinate> formattedResult = new ArrayList<Coordinate>();
						for (AStarCell cell : path) {
							formattedResult.add(0, cell.coord);
						}
						return formattedResult;
					}
				}

			}
			
			// Return failed value
			return null;
		}
		private double mCostToCell(Coordinate fromCoord, Coordinate toCoord) {
			double deltaX = toCoord.getCol() - fromCoord.getCol();
			double deltaY = toCoord.getRow() - fromCoord.getRow();
			return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
		}
		
	}

	// Engine state variables
	private boolean isRunning = false;
	
	// Map variables
	private GameStaticMap staticMap;
	private GameDynamicMap dynamicMap;
	
	// Player variables
	private Player[] players;

	// In-game object lists
	private ArrayList<DynGameBuilding> buildings;
	private ArrayList<DynGameUnit> units;
	
	// Path finding object
	private AStarPathFinder aStarPathFinder;
	
	
	// Constructors
	
	public Engine(GameConfig gameConfig, ArrayList<LobbyUser> connectedUsers, GameStaticMap gameMap) {
		
		// Construct user objects
		this.players = new Player[connectedUsers.size()];
		for (int index = 0; index < connectedUsers.size(); index ++) {
			this.players[index] = new Player(connectedUsers.get(index), gameConfig.getStartingCash());
		}
		
		// Initialise in-game object lists
		this.buildings = new ArrayList<DynGameBuilding>();
		this.units = new ArrayList<DynGameUnit>();

		// Construct map objects
		this.staticMap = gameMap;
		this.dynamicMap = new GameDynamicMap(staticMap, this.buildings, this.units);
		
		// Initialise pathfinder object
		this.aStarPathFinder = new AStarPathFinder(this.staticMap, this.dynamicMap);
		
	}
	
	
	// Game flow methods
	
	public void start() {
		
		// Mark engine as running
		this.isRunning = true;
		
	}
	
	
	// Game request methods (more specific functionality for each request type)
	
	@SuppressWarnings("unused")
	private GameplayResponse[] processBuildingPlaceRequest(Player player, GameBuilding[] sourceBuildings, Coordinate coord) {

		// Declare response variables
		ArrayList<GameplayResponse> responseList = new ArrayList<GameplayResponse>();
		GameplayResponse newBuildingResponse = null;
		GameplayResponse waypointUpdateResponse = null;
		boolean validConstruction = true;
		
		// Declare waypoint ammending variables
		ArrayList<DynGameUnit> waypointInterruptedUnits = new ArrayList<DynGameUnit>();
		ArrayList<DynGameUnit> newWaypointInterruptedUnits = null;
		Coordinate unitWaypointEnd = null;
		
		// Check each object in turn
		for (GameBuilding sourceBuilding : sourceBuildings) {

			// Check all cells required for building are free in the static map -- currently a single cell
			if (validConstruction && this.staticMap.isCellObstructed(coord)) {
				validConstruction = false;
				newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.STATIC_MAP_OBSTRUCTION);
			}
			
			// Check all cells required for building are free in the static map -- currently a single cell
			if (validConstruction && !this.staticMap.isCellInBounds(coord)) {
				validConstruction = false;
				newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.OUT_OF_MAP_BOUNDS);
			}

			// Check all cells required for building are free in the dynamic map -- currently a single cell
			if (validConstruction && this.dynamicMap.isCellObstructed(coord)) {
				validConstruction = false;
				newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.DYNAMIC_MAP_OBSTRUCTION);
			}

			// Check user is at appropriate technology level
			if (validConstruction && !player.playerHasTechLevel(sourceBuildings[0])) {
				validConstruction = false;
				newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.DYNAMIC_MAP_OBSTRUCTION);
			}

			// Check user has appropriate funds
			if (validConstruction && !player.playerHasCash(sourceBuildings[0])) {
				validConstruction = false;
				newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.INSUFFICIENT_FUNDS);
				newBuildingResponse.addTarget(player.getPlayerName());
				newBuildingResponse.addSource(Integer.toString(player.getPlayerCash()));
			}
			
			// Search for units which may need waypoint paths updating with new building placement
			newWaypointInterruptedUnits = this.getInterruptedWaypointUnits(coord);
			waypointInterruptedUnits.addAll(newWaypointInterruptedUnits);
		}

		// Construct valid response
		if (validConstruction) {
			
			// Define variables for construction
			DynGameBuilding newBuilding = null;
			
			// Create game object(s)
			for (GameBuilding sourceBuilding : sourceBuildings) {
				newBuilding = null;
				if (sourceBuilding instanceof GameDefence) {
					newBuilding = new DynGameDefence(this.generateInstanceId(player), (GameDefence)sourceBuilding, player, coord); // -- need to calculate for multiBuilding structures later e.g. walls
				} else if (sourceBuilding instanceof GameBuilding) {
					newBuilding = new DynGameBuilding(this.generateInstanceId(player), sourceBuilding, player, coord); // -- need to calculate for multiBuilding structures later e.g. walls
				} 
				if (newBuilding != null) { this.buildings.add(newBuilding); }
			}
			
			// Update effected unit waypoint paths
			for (DynGameUnit effectedUnit : waypointInterruptedUnits) {
				unitWaypointEnd = effectedUnit.getWaypointEndCoordinate();
				if (unitWaypointEnd != null) {
					waypointUpdateResponse = this.processWaypointPathCoordsRequest(player, effectedUnit, unitWaypointEnd);
					if (waypointUpdateResponse != null) {
						responseList.add(waypointUpdateResponse);
					}
				}
			}
			
			// Generate response object for new buildings
			if (newBuilding == null) {
				newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.SERVER_ERROR);
			} else {
				newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.NEW_BUILDING);
				for (GameBuilding sourceBuilding : sourceBuildings) {
					newBuildingResponse.addCoord(coord); // -- need to calculate for multiBuilding structures later e.g. walls
					newBuildingResponse.addSource(newBuilding.getIdentifier());
					newBuildingResponse.addTarget(newBuilding.getInstanceId());
					newBuildingResponse.addMisc(player.getPlayerName());
				}
			}
			
		}
		
		// Add newBuildingResponse to result list
		if (newBuildingResponse != null) {
			responseList.add(newBuildingResponse);
		}

		// Return calculated result
		return responseList.toArray(new GameplayResponse[responseList.size()]);
	}

	private GameplayResponse processDefenceAttackRequest(Player player, DynGameDefence[] sourceDefences, int col, int row) {

		// Set default result
		GameplayResponse response = null;
		boolean validConstruction = true;
		
//		// Check each object in turn
//		for (DynGameDefence sourceDefence : sourceDefences) {
//			
//		}

		// Construct valid response
		if (validConstruction) {
			response = new GameplayResponse(E_GameplayResponseCode.DEFENCE_ATTACK_XY);
			for (DynGameDefence sourceDefence : sourceDefences) {
				response.addCoord(col, row);
				response.addSource(sourceDefence.getInstanceId());
			}
		}

		// Return calculated result
		return response;
	}
	
	private GameplayResponse processWaypointPathCoordsRequest(Player player, DynGameUnit[] sourceUnits, Coordinate coordinate) {

		// Set default result
		GameplayResponse response = null;
		boolean validConstruction = true;
		ArrayList<Coordinate> path = null;	

		// Check each object in turn
		for (DynGameUnit sourceUnit : sourceUnits) {
			
			// Run pathfinding search
			path = this.aStarPathFinder.calculatePath(sourceUnit.getCoordinate(), coordinate);
			
			// Link path to unit
			sourceUnit.setWaypoints(path);
			
			// Only run this loop once for now
			break;
		}

		// Construct valid response
		if (validConstruction) {
			response = new GameplayResponse(E_GameplayResponseCode.WAYPOINT_PATH_COORDS);
			for (DynGameUnit sourceUnit : sourceUnits) {
				if (path != null) {
					for (Coordinate coord : path) {
						response.addCoord(coord);
						response.addSource(sourceUnit.getInstanceId());
					}
				}
			}
		}

		// Return calculated result
		return response;
	}
	
	private GameplayResponse processWaypointPathCoordsRequest(Player player, DynGameUnit sourceUnit, Coordinate coordinate) {
		DynGameUnit[] unitsArray = new DynGameUnit[1];
		unitsArray[0] = sourceUnit;
		return this.processWaypointPathCoordsRequest(player, unitsArray, coordinate);
	}
	
	private void processWaypointUpdateUnitCellRequest(Player player, DynGameUnit[] sourceUnits, Coordinate[] newCoordinates) {
		
		// Declare working variables
		DynGameUnit unitRef = null;
		Coordinate coordRef = null;
		
		// Process each unit update inturn
		for (int index = 0; index < Math.min(sourceUnits.length, newCoordinates.length); index ++) {
			
			// Set new references
			unitRef = sourceUnits[index];
			coordRef = newCoordinates[index];
			
			// Update cell of unit
			unitRef.updateCoordinate(coordRef);
		}
	}
	
	private GameplayResponse processDamageRequest(Player player, String[] instanceIds, int damageAmount, ArrayList<String> miscStrings) {

		// Set default result
		GameplayResponse response = null;
		boolean validConstruction = true;
		
		// Check if id's refer to units
		DynGameUnit[] sourceUnits = this.getGameUnitsFromInstanceIds(instanceIds, false);
		DynGameBuilding[] sourceBuildings = this.getGameBuildingsFromInstanceIds(instanceIds, false);		

		// Calculate killer
		Player killer = this.getPlayerFromPlayerId(miscStrings.get(0));

		// Check each object in turn
		if (sourceUnits.length > 0) {
			for (DynGameUnit sourceUnit : sourceUnits) {
				
				// Reduce health of unit by passed amount
				sourceUnit.takeDamage(damageAmount);
				
				// Only run this loop once for now
				break;
			}
		}
		
		// Check each building in turn
		if (sourceBuildings.length > 0) {
			for (DynGameBuilding sourceBuilding : sourceBuildings) {
				
				// Reduce health of unit by passed amount
				sourceBuilding.takeDamage(damageAmount);
				
				// Only run this loop once for now
				break;
				
			}
		}
		
		// Construct valid response
		if (validConstruction) {
			response = new GameplayResponse(E_GameplayResponseCode.DAMAGE_OBJECT);
			if (sourceUnits.length > 0) {
				for (DynGameUnit targetUnit : sourceUnits) {
					response.addSource(targetUnit.getInstanceId());
					response.addTarget(Integer.toString(targetUnit.getHealth()));
					response.addMisc(killer.getPlayerName());
				}
			}
			if (sourceBuildings.length > 0) {
				for (DynGameBuilding sourceBuilding : sourceBuildings) {
					response.addSource(sourceBuilding.getInstanceId());
					response.addTarget(Integer.toString(sourceBuilding.getHealth()));
					response.addMisc(killer.getPlayerName());
				}
			}
		}
		
		// Clean up all units and buildings which have now been destroyed
		for (DynGameUnit targetUnit : sourceUnits) {
			if (targetUnit.getHealth() == 0) {
				this.destroyGameObject(targetUnit);
				killer.addPlayerCash((int)Math.floor(targetUnit.getCost() * 1.2));
			}
		}
		
		for (DynGameBuilding targetBuilding : sourceBuildings) {
			if (targetBuilding.getHealth() == 0) {
				this.destroyGameObject(targetBuilding);
				killer.addPlayerCash((int)Math.floor(targetBuilding.getCost() * 1.2));
			}
		}

		// Return calculated result
		return response;
	}

	private GameplayResponse processDebugPlacementRequest(Player player, GameUnit[] sourceUnits, int col, int row) {

		// Set default result
		GameplayResponse response = null;
		boolean validConstruction = true;
		
		// Construct result object
		DynGameUnit newUnit = new DynGameUnit(this.generateInstanceId(player), (GameUnit)sourceUnits[0], player, col, row);
		
		if (newUnit != null) {
			// Check user has appropriate funds
			if (validConstruction && !player.playerHasCash(newUnit)) {
				validConstruction = false;
				response = new GameplayResponse(E_GameplayResponseCode.INSUFFICIENT_FUNDS);
				response.addTarget(player.getPlayerName());
				response.addSource(Integer.toString(player.getPlayerCash()));
			}
			
			if (validConstruction) {
				response = new GameplayResponse(E_GameplayResponseCode.DEBUG_PLACEMENT);
				response.addCoord(col, row);
				response.addSource(newUnit.getIdentifier());
				response.addTarget(newUnit.getInstanceId());
				response.addMisc(player.getPlayerName());
				if (newUnit != null) { this.units.add(newUnit); }
			}
		}

		// Return calculated result
		return response;
	}
	
	
	// Game request method

	public GameplayResponse[] processGameplayRequest(GameplayRequest gameplayRequest, int userId) {

		// Declare (and initialise) variables
		Player sender = this.getPlayerFromUserId(userId);
		GameplayResponse gameplayResponse = null;
		GameplayResponse[] gameplayResponseArray = null;
		ArrayList<GameplayResponse> gameplayResponseList = new ArrayList<GameplayResponse>();

		// Check minimum processing conditions
		if (sender != null) {
			
			// Log received request for debugging
			System.out.println(gameplayRequest.toString());

			// Determine which request was sent 
			switch (gameplayRequest.getRequestCode()) {
		        case NEW_BUILDING:  
		        	gameplayResponseArray = this.processBuildingPlaceRequest(sender, 
		        			Const.getGameBuildingArrayFromGameObjectArrayList(gameplayRequest.getSource()), 
		        			new Coordinate(gameplayRequest.getTargetCellX(), 
		        					gameplayRequest.getTargetCellY()));
		        	break;
		        case DEFENCE_ATTACK_XY:
		        	gameplayResponse = this.processDefenceAttackRequest(sender, 
		        			this.getGameDefencesFromInstanceIds(gameplayRequest.getSourceString(), false), 
		        			gameplayRequest.getTargetCellX(), 
		        			gameplayRequest.getTargetCellY());
		        	break;
		        case WAYPOINT_PATH_COORDS:
		        	gameplayResponse = this.processWaypointPathCoordsRequest(sender, 
		        			this.getGameUnitsFromInstanceIds(gameplayRequest.getSourceString(), false), 
		        			new Coordinate(gameplayRequest.getTargetCellX(), gameplayRequest.getTargetCellY()));
		        	break;
		        case WAYPOINT_UPDATE_UNIT_CELL:
		        	gameplayResponse = null;
		        	Coordinate[] coordinates = new Coordinate[1];
		        	coordinates[0] = new Coordinate(gameplayRequest.getTargetCellX(), gameplayRequest.getTargetCellY());
		        	this.processWaypointUpdateUnitCellRequest(sender, 
		        			this.getGameUnitsFromInstanceIds(gameplayRequest.getSourceString(), false),
		        			coordinates);
		        	break;
		        case DAMAGE_OBJECT:
		        	gameplayResponse = this.processDamageRequest(sender,
		        			gameplayRequest.getSourceString(), 
		        			Integer.parseInt(gameplayRequest.getTargetString()[0]),
		        			gameplayRequest.getMisc());
		        	break;
		        case DEBUG_PLACEMENT:
		        	gameplayResponse = this.processDebugPlacementRequest(sender, 
		        			Const.getGameUnitArrayFromGameObjectArrayList(gameplayRequest.getSource()),
		        			gameplayRequest.getTargetCellX(), 
		        			gameplayRequest.getTargetCellY());
		        	break;
			    default:
			    	gameplayResponse = new GameplayResponse();
			        break;
			}
			
		}
		
		// Add single response object to output list
		if (gameplayResponse != null) {
			gameplayResponseList.add(gameplayResponse);
		}
		
		// Add array response objects to output list
		if (gameplayResponseArray != null && gameplayResponseArray.length > 0) {
			for (int index = 0; index < gameplayResponseArray.length; index ++) {
				gameplayResponseList.add(gameplayResponseArray[index]);
			}
		}
		
		// Log result array to the screen
		for (GameplayResponse response : gameplayResponseList) {
			System.out.println(response);
		}
		
		// Return current response
		return gameplayResponseList.toArray(new GameplayResponse[gameplayResponseList.size()]);

	}
	
	
	// Utility methods

	private ArrayList<DynGameUnit> getInterruptedWaypointUnits(Coordinate coord) {
		
		// Declare/Initialise variables
		ArrayList<DynGameUnit> resultUnits = new ArrayList<DynGameUnit>();
		
		// Search for units which enter this coordinate
		for (DynGameUnit gameUnit : this.units) {
			if (gameUnit.doesUnitWaypointEnterCoord(coord)) {
				resultUnits.add(gameUnit);
			}
		}
		
		// Return calculated list
		return resultUnits;
		
	}
	
	private void destroyGameObject(GameObject targetGameObject) {

		// Check and process unit type
		if (targetGameObject instanceof DynGameUnit) {
			this.units.remove(targetGameObject);
		}

		// Check and process unit type
		if (targetGameObject instanceof DynGameBuilding) {
			this.buildings.remove(targetGameObject);
		}
		
	}

	private DynGameBuilding getGameBuildingFromInstanceId(String instanceId) {
		for (DynGameBuilding dynGameBuilding : this.buildings) {
			if (dynGameBuilding.getInstanceId().equals(instanceId)) {
				return dynGameBuilding;
			}
		}
		return null;
	}
	
	private DynGameBuilding[] getGameBuildingsFromInstanceIds(String[] instanceIds, boolean keepErroneous) {
		if (instanceIds == null) {
			return new DynGameBuilding[0];
		} else {
			DynGameBuilding searchBuilding;
			ArrayList<DynGameBuilding> gameBuildings = new ArrayList<DynGameBuilding>();
			for (String instanceId : instanceIds) {
				searchBuilding = this.getGameBuildingFromInstanceId(instanceId);
				if (keepErroneous || searchBuilding != null) {
					gameBuildings.add(searchBuilding);
				}
			}
			return gameBuildings.toArray(new DynGameBuilding[gameBuildings.size()]);
		}
	}
	
	private DynGameUnit getGameUnitFromInstanceId(String instanceId) {
		for (DynGameUnit dynGameUnit : this.units) {
			if (dynGameUnit.getInstanceId().equals(instanceId)) {
				return dynGameUnit;
			}
		}
		return null;
	}

	private DynGameUnit[] getGameUnitsFromInstanceIds(String[] instanceIds, boolean keepErroneous) {
		if (instanceIds == null) {
			return new DynGameUnit[0];
		} else {
			DynGameUnit searchUnit;
			ArrayList<DynGameUnit> gameUnits = new ArrayList<DynGameUnit>();
			for (String instanceId : instanceIds) {
				searchUnit = this.getGameUnitFromInstanceId(instanceId);
				if (keepErroneous || searchUnit != null) {
					gameUnits.add(searchUnit);
				}
			}
			return gameUnits.toArray(new DynGameUnit[gameUnits.size()]);
		}
	}
	
	private DynGameDefence getGameDefenceFromInstanceId(String instanceId) {
		DynGameBuilding dynGameBuilding = getGameBuildingFromInstanceId(instanceId);
		if (dynGameBuilding instanceof DynGameDefence) {
			return (DynGameDefence)dynGameBuilding;
		} else {
			return null;
		}
	}

	private DynGameDefence[] getGameDefencesFromInstanceIds(String[] instanceIds, boolean keepErroneous) {
		if (instanceIds == null) {
			return new DynGameDefence[0];
		} else {
			DynGameDefence searchDefence;
			ArrayList<DynGameDefence> gameDefences = new ArrayList<DynGameDefence>();
			for (String instanceId : instanceIds) {
				searchDefence = this.getGameDefenceFromInstanceId(instanceId);
				if (keepErroneous || searchDefence != null) {
					gameDefences.add(searchDefence);
				}
			}
			return gameDefences.toArray(new DynGameDefence[gameDefences.size()]);
		}
	}
	
	private String generateInstanceId(Player player) {
		
		// Setup variables
		SecureRandom random = new SecureRandom();
		boolean instanceIdReserved = true;
		String instanceId = null;
		
		// Repeatedly generate new Id until a free one is found
		while (instanceIdReserved) {
			
			// Setup attemptId and reserved boolean
			instanceIdReserved = false;
			instanceId = new BigInteger(130, random).toString(32);
			
			// Check against buildings
			for (DynGameBuilding dynGameBuilding : this.buildings) {
				if (dynGameBuilding.getInstanceId().equals(instanceId)) {
					instanceIdReserved = true;
				}
			}
			
			// Check against units
			for (DynGameUnit dynGameUnit : this.units) {
				if (dynGameUnit.getInstanceId().equals(instanceId)) {
					instanceIdReserved = true;
				}
			}
		}
		
		// Return generated Id
		return instanceId;
	}

	private Player getPlayerFromUserId(int userId) {
		for (Player player : this.players) {
			if (player.getPlayerId() == userId) {
				return player;
			}
		}
		return null;
	}
	
	private Player getPlayerFromPlayerId(String playerId) {
		for (Player player : this.players) {
			if (player.getPlayerName().equals(playerId)) {
				return player;
			}
		}
		return null;
	}
	
}
