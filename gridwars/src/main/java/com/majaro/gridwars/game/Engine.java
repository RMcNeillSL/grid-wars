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
import com.majaro.gridwars.game.Const.E_TechLevel;
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
		public ArrayList<Coordinate> calculatePath(Coordinate startCoord, Coordinate endCoord, double acceptableDistance) {
			
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
							!this.dynamicMapRef.isCellObstructed(new Coordinate(col, row))) {
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
				while (isPathPossible &&											// Check path is still possible
						currentCell != null && cellsToProcess != null &&			// Check objects are assigned
						!currentCell.isCoord(endCoord) &&							// Check there are still cells to process
						!(acceptableDistance >= currentCell.mDistanceCost) ) {		// Allow breaking if the distance left is within acceptable distance			
					
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
					if (currentCell.isCoord(endCoord) ||
							acceptableDistance >= currentCell.mDistanceCost) {
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
		public ArrayList<Coordinate> calculatePath(Coordinate startCoord, Coordinate endCoord) {
			return this.calculatePath(startCoord, endCoord, 0);
		}
		private double mCostToCell(Coordinate fromCoord, Coordinate toCoord) {
			double deltaX = toCoord.getCol() - fromCoord.getCol();
			double deltaY = toCoord.getRow() - fromCoord.getRow();
			return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
		}
		
	}

	// Attack pair objects
	private class AttackPair {
		private String sourceInstanceId = null;
		private String targetInstanceId = null;
		public AttackPair(String sourceInstanceId, String targetInstanceId) {
			this.sourceInstanceId = sourceInstanceId;
			this.targetInstanceId = targetInstanceId;
		}
		public boolean containsInstanceId(String checkInstanceId) {
			return (checkInstanceId.equals(this.sourceInstanceId) ||
					checkInstanceId.equals(this.targetInstanceId));
		}
	}
	
	// User specified waypoints
	
	
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
	private ArrayList<AttackPair> attackPairs;
	
	// Path finding object
	private AStarPathFinder aStarPathFinder;
	
	
	// Constructors
	
	public Engine(GameConfig gameConfig, ArrayList<LobbyUser> connectedUsers, GameStaticMap gameMap) {
		
		// Construct user objects
		this.players = new Player[connectedUsers.size()];
		for (int index = 0; index < connectedUsers.size(); index ++) {
			this.players[index] = new Player(connectedUsers.get(index), gameConfig.getStartingCash(), gameMap.getSpawnCoordinates()[index]);
		}
		
		// Initialise in-game object lists
		this.buildings = new ArrayList<DynGameBuilding>();
		this.units = new ArrayList<DynGameUnit>();
		this.attackPairs = new ArrayList<AttackPair>();

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
	
	public GameplayResponse setupGameSpawns() {
		
		// Declare response object
		GameplayResponse gameplayResponse = new GameplayResponse(E_GameplayResponseCode.SETUP_SPAWN_OBJECTS);
		
		// Declare working variables
		Coordinate spawnCoordinate = null;
		DynGameBuilding newBuilding = null;
		Coordinate startTankFactoryCoordinate = null;
		
		// Generate source building objects
		GameBuilding startTankFactory = (GameBuilding)Const.getGameObjectFromString("HUB");
		
		// Move through all player spawns adding buildings and object around spawn
		for (Player player : this.players) {
			
			// Save convenient reference to spawn coordiante
			spawnCoordinate = player.getSpawnCoordinate();
			startTankFactoryCoordinate = new Coordinate(spawnCoordinate.getCol(), spawnCoordinate.getRow());
			
			// Generate and add new building to response for player
			newBuilding = new DynGameBuilding(this.generateInstanceId(player), startTankFactory, player, startTankFactoryCoordinate);
			gameplayResponse.addCoord(spawnCoordinate);
			gameplayResponse.addSource(newBuilding.getIdentifier());
			gameplayResponse.addTarget(newBuilding.getInstanceId());
			gameplayResponse.addMisc(player.getPlayerName());
			this.buildings.add(newBuilding);
		}

		// Return constructed response object
		return gameplayResponse;
	}
	
	
	// Game request methods (more specific functionality for each request type)
	
	private GameplayResponse processPurchaseRequest(Player player, GameObject sourceObject) {

		// Declare response variables
		GameplayResponse purchaseResponse = null;
		boolean validPurchase = true;

		// Check user is at appropriate technology level
		if (validPurchase && !player.playerHasTechLevel(sourceObject)) {
			validPurchase = false;
			purchaseResponse = new GameplayResponse(E_GameplayResponseCode.DYNAMIC_MAP_OBSTRUCTION);
		}

		// Check user has appropriate funds
		if (validPurchase && !player.playerHasCash(sourceObject)) {
			validPurchase = false;
			purchaseResponse = new GameplayResponse(E_GameplayResponseCode.INSUFFICIENT_FUNDS);
			purchaseResponse.addSource(Integer.toString(player.getPlayerCash()));
			purchaseResponse.addTarget(player.getPlayerName());
		}
		
		// Check production is not already in progress
		if (validPurchase && player.buildingInProgress(sourceObject)) {
			validPurchase = false;
			if (sourceObject instanceof GameUnit) { purchaseResponse = new GameplayResponse(E_GameplayResponseCode.UNIT_BUILDING_INPROGRESS); }
			else if (sourceObject instanceof GameDefence) { purchaseResponse = new GameplayResponse(E_GameplayResponseCode.DEFENCE_BUILDING_INPROGRESS); }
			else if (sourceObject instanceof GameBuilding) { purchaseResponse = new GameplayResponse(E_GameplayResponseCode.BUILDING_BUILDING_INPROGRESS); }
		}
		
		// Proceed to purchase object
		if (validPurchase) {
			
			// Add purchase request to users purchase queue
			PurchaseRequest purchase = player.purchaseGameObject(sourceObject, this.generateInstanceId(player));
			
			// Start timer running
			purchase.buildTimeStart();
			
			// Construct response
			purchaseResponse = new GameplayResponse(E_GameplayResponseCode.PURCHASE_OBJECT);
			purchaseResponse.addSource(sourceObject.getIdentifier());
			purchaseResponse.addTarget(purchase.getObjectId());
		}
		
		// Mark any result as specific to player
		if (purchaseResponse != null) {
			purchaseResponse.flagForSenderOnly();
		}
		
		// Return calculated result
		return purchaseResponse;
	}
	
	private GameplayResponse processBuildFinishedRequest(Player player, String purchaseObjectId) {

		// Declare response variables
		GameplayResponse finishedBuildResponse = null;
		boolean validUnitBuildComplete = true;
		
		// Get purchase object for player
		PurchaseRequest purchaseRequest = player.getPurchaseRequestFromId(purchaseObjectId);

		// Check if purchase is still pending
		if (validUnitBuildComplete && !purchaseRequest.buildComplete(3000)) {
			validUnitBuildComplete = false;
			finishedBuildResponse = new GameplayResponse(E_GameplayResponseCode.PURCHASE_PENDING);
		}
		
		// Construct valid purchase complete response object
		if (validUnitBuildComplete) {

			// UNITS: Run building finished
			if (purchaseRequest.getSourceObject() instanceof GameUnit) {

				// Locate hub to deploy from
				DynGameBuilding deployHub = this.getPlayerDeployHub(player);
				
				// Make sure deploy hub was identified
				if (deployHub != null) {
					
					// Construct new unit
					Coordinate deployCoord = deployHub.getDeployCoordinate();
					DynGameUnit newUnit = new DynGameUnit(purchaseRequest.getObjectId(),
							(GameUnit)purchaseRequest.getSourceObject(), player, deployCoord);
					
					// Construct response object
					if (newUnit != null) {
						this.units.add(newUnit);
						finishedBuildResponse = new GameplayResponse(E_GameplayResponseCode.UNIT_PURCHASE_FINISHED);
						finishedBuildResponse.addSource(purchaseRequest.getSourceObject().getIdentifier());
						finishedBuildResponse.addTarget(purchaseObjectId);
						finishedBuildResponse.addMisc(player.getPlayerName());
						finishedBuildResponse.addCoord(deployCoord);
					}
				}
			}

			// BUILDINGS: Run building finished
			if (purchaseRequest.getSourceObject() instanceof GameBuilding) {

				// Construct new unit
				Coordinate deployCoord = new Coordinate(0, 0);
				DynGameBuilding newBuilding = new DynGameBuilding(purchaseRequest.getObjectId(),
						(GameBuilding)purchaseRequest.getSourceObject(), player, deployCoord);
				
				// Construct response object
				if (newBuilding != null) {
					this.buildings.add(newBuilding);
					finishedBuildResponse = new GameplayResponse(E_GameplayResponseCode.BUILDING_PURCHASE_FINISHED);
					finishedBuildResponse.addSource(purchaseRequest.getSourceObject().getIdentifier());
					finishedBuildResponse.addTarget(purchaseObjectId);
					finishedBuildResponse.addMisc(player.getPlayerName());
					finishedBuildResponse.addCoord(deployCoord);
				}
			}
			
			// Remove player purchase record from array
			player.removePlayerPurchaseObject(purchaseRequest.getObjectId());
		}
		
		// Return calculated result
		return finishedBuildResponse;
	}
	
	@SuppressWarnings("unused")
	private GameplayResponse[] processBuildingPlaceRequest(Player player, GameBuilding[] sourceBuildings, String[] instanceIds, Coordinate coord) {

		// Declare response variables
		ArrayList<GameplayResponse> responseList = new ArrayList<GameplayResponse>();
		GameplayResponse newBuildingResponse = null;
		GameplayResponse waypointUpdateResponse = null;
		boolean validConstruction = true;

		// Declare local working variables
		GameBuilding sourceBuilding = null;
		String instanceId = null;
		
		// Declare waypoint amending variables
		ArrayList<DynGameUnit> waypointInterruptedUnits = new ArrayList<DynGameUnit>();
		ArrayList<DynGameUnit> newWaypointInterruptedUnits = null;
		Coordinate unitWaypointEnd = null;
		
		// Check each object in turn
		for (int index = 0; index < sourceBuildings.length; index ++) {
			
			// Create working references
			sourceBuilding = sourceBuildings[index];
			instanceId = instanceIds[index];

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
			
			// Make sure building was purchases by player
			
			// Search for units which may need waypoint paths updating with new building placement
			newWaypointInterruptedUnits = this.getInterruptedWaypointUnits(coord);
			waypointInterruptedUnits.addAll(newWaypointInterruptedUnits);
		}

		// Construct valid response
		if (validConstruction) {
			
			// Define variables for construction
			DynGameBuilding newBuilding = null;
			
			// Create game object(s)
			for (int index = 0; index < sourceBuildings.length; index ++) {
				newBuilding = null;
				if (sourceBuildings[index] instanceof GameDefence) {
					newBuilding = new DynGameDefence(instanceIds[index], (GameDefence)sourceBuildings[index], player, coord); // -- need to calculate for multiBuilding structures later e.g. walls
				} else if (sourceBuildings[index] instanceof GameBuilding) {
					newBuilding = new DynGameBuilding(instanceIds[index], sourceBuildings[index], player, coord); // -- need to calculate for multiBuilding structures later e.g. walls
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
				newBuildingResponse.addCoord(coord); // -- need to calculate for multiBuilding structures later e.g. walls
				newBuildingResponse.addSource(newBuilding.getIdentifier());
				newBuildingResponse.addTarget(newBuilding.getInstanceId());
				newBuildingResponse.addMisc(player.getPlayerName());
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
	
	private GameplayResponse[] processObjectAttackObjectRequest(Player player, String[] sourceIds, String[] targetIds) {

		// Set default result
		ArrayList<GameplayResponse> responseList = new ArrayList<GameplayResponse>();
		GameplayResponse attackResponse = null;
		GameplayResponse waypointResponse = null;
		boolean validConstruction = true;
		
		// Declare working variables
		DynGameUnit sourceUnit = null;
		DynGameBuilding sourceBuilding = null;
		DynGameUnit targetUnit = null;
		DynGameBuilding targetBuilding = null;
		Coordinate sourceCoord = null;
		Coordinate targetCoord = null;
		String sourceId = null;
		String targetId = null;
		
		// Run checks ...
		
		// Run through all attack requests
		for (int index = 0; index < sourceIds.length; index ++) {
			
			// Create reference to source objects
			sourceUnit = this.getGameUnitFromInstanceId(sourceIds[index]);
			sourceBuilding = this.getGameBuildingFromInstanceId(sourceIds[index]);
			
			// Create reference to target objects
			targetUnit = this.getGameUnitFromInstanceId(targetIds[index]);
			targetBuilding = this.getGameBuildingFromInstanceId(targetIds[index]);
			
			// Add attack request to response
			if ( (sourceUnit != null || sourceBuilding != null) &&
				 (targetUnit != null || targetBuilding != null) ) {
				
				// Process response for attck
				attackResponse = new GameplayResponse(E_GameplayResponseCode.OBJECT_ATTACK_OBJECT);
				if (sourceUnit != null) 	{ attackResponse.addSource(sourceUnit.getInstanceId());			sourceCoord = sourceUnit.getCoordinate();		sourceId = sourceUnit.getInstanceId(); }
				if (sourceBuilding != null) { attackResponse.addSource(sourceBuilding.getInstanceId());		sourceCoord = sourceBuilding.getCoordinate();	sourceId = sourceBuilding.getInstanceId(); }
				if (targetUnit != null) 	{ attackResponse.addTarget(targetUnit.getInstanceId());			targetCoord = targetUnit.getCoordinate();		targetId = targetUnit.getInstanceId(); }
				if (targetBuilding != null) { attackResponse.addTarget(targetBuilding.getInstanceId());		targetCoord = targetBuilding.getCoordinate();	targetId = targetBuilding.getInstanceId(); }
				responseList.add(attackResponse);
				
				// Add new items recorded attack pair array
				if (sourceCoord != null) { this.attackPairs.add(new AttackPair(sourceId, targetId)); }
				
				// Check if movement to bring target in range is needed
				double deltaX = (double)(sourceCoord.getCol() - targetCoord.getCol());
				double deltaY = (double)(sourceCoord.getRow() - targetCoord.getRow());
				double distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
				if (sourceUnit != null && distance > sourceUnit.getRange() / Const.cellSize) {
					ArrayList<Coordinate> path = this.aStarPathFinder.calculatePath(sourceCoord, targetCoord, sourceUnit.getRange() / Const.cellSize);
					if (path != null) {
						waypointResponse = new GameplayResponse(E_GameplayResponseCode.WAYPOINT_PATH_COORDS);
						for (Coordinate coord : path) {
							waypointResponse.addCoord(coord);
							waypointResponse.addSource(sourceUnit.getInstanceId());
						}
						responseList.add(waypointResponse);
					}
				}
				
			}
		}

		// Return calculated result
		return responseList.toArray(new GameplayResponse[responseList.size()]);
	}
	
	private GameplayResponse processWaypointPathCoordsRequest(Player player, DynGameUnit[] sourceUnits, Coordinate[] coordinates) {

		// Set default result
		GameplayResponse response = null;
		boolean validConstruction = true;
		
		// Declare working variables
		ArrayList<Coordinate[]> waypointPaths = new ArrayList<Coordinate[]>();
		ArrayList<Coordinate> newUnitPath = null;
		DynGameUnit unitRef = null;
		Coordinate coordRef = null;
		
		// Check each object in turn
		for (int index = 0; index < Math.min(sourceUnits.length, coordinates.length); index ++) {
			
			// Save references
			unitRef = sourceUnits[index];
			coordRef = coordinates[index];
			
			// Run pathfinding search
			newUnitPath = this.aStarPathFinder.calculatePath(unitRef.getCoordinate(), coordRef);
			if (newUnitPath == null) {
				waypointPaths.add(null);
			} else {
				waypointPaths.add(newUnitPath.toArray(new Coordinate[newUnitPath.size()]));
			}
			
			// Link path to unit
			unitRef.setWaypoints(newUnitPath);
		}

		// Construct valid response - list all units and their waypoint nodes
		if (validConstruction) {
			Coordinate[] unitWaypoints = null;
			response = new GameplayResponse(E_GameplayResponseCode.WAYPOINT_PATH_COORDS);
			for (DynGameUnit unit : sourceUnits) {
				unitWaypoints = unit.getWaypoints();
				if (unitWaypoints != null) {
					for (Coordinate coord : unitWaypoints) {
						response.addCoord(coord);
						response.addSource(unit.getInstanceId());
					}
				} else {
					response.addCoord(unit.getCoordinate());
					response.addSource(unit.getInstanceId());
				}
			}
		}

		// Return calculated result
		return response;
	}
	
	private GameplayResponse processWaypointPathCoordsRequest(Player player, DynGameUnit sourceUnit, Coordinate coordinate) {
		DynGameUnit[] unitsArray = new DynGameUnit[1];
		Coordinate[] coordinates = new Coordinate[1];
		unitsArray[0] = sourceUnit;
		coordinates[0] = coordinate;
		return this.processWaypointPathCoordsRequest(player, unitsArray, coordinates);
	}
	
	private GameplayResponse processWaypointUpdateUnitCellRequest(Player player, DynGameUnit[] sourceUnits, Coordinate[] newCoordinates) {

		// Set default result
		GameplayResponse response = null;
		
		// Declare working variables
		DynGameUnit unitRef = null;
		Coordinate coordRef = null;
		DynGameUnit[] attackingUnits = null;
		DynGameUnit attackUnitRef = null;
		ArrayList<Coordinate> path = null;		
		
		// Process each unit update inturn
		for (int index = 0; index < Math.min(sourceUnits.length, newCoordinates.length); index ++) {
			
			// Set new references
			unitRef = sourceUnits[index];
			coordRef = newCoordinates[index];
			
			// Check if unit was involved in an attack pair as target - update source waypoints
			attackingUnits = this.getUnitsAttackingInstance(sourceUnits[index].getInstanceId());
			if (attackingUnits != null && attackingUnits.length > 0) {
				for (int attackIndex = 0; attackIndex < attackingUnits.length; attackIndex ++) {
					attackUnitRef = attackingUnits[attackIndex];
					path = this.aStarPathFinder.calculatePath(attackUnitRef.getCoordinate(), unitRef.getCoordinate(), attackUnitRef.getRange() / Const.cellSize);
					if (path != null) {
						if (response == null) { response = new GameplayResponse(E_GameplayResponseCode.WAYPOINT_PATH_COORDS); }
						for (Coordinate coord : path) {
							response.addCoord(coord);
							response.addSource(attackUnitRef.getInstanceId());
						}
					}
				}
			}
			
			// Update cell of unit
			unitRef.updateCoordinate(coordRef);
		}
		
		return response;
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
				this.removeFromAttackPairs(targetUnit.getInstanceId());
				this.destroyGameObject(targetUnit);
				killer.addPlayerCash((int)Math.floor(targetUnit.getCost() * 1.2));
			}
		}
		
		for (DynGameBuilding targetBuilding : sourceBuildings) {
			if (targetBuilding.getHealth() == 0) {
				this.removeFromAttackPairs(targetBuilding.getInstanceId());
				this.destroyGameObject(targetBuilding);
				killer.addPlayerCash((int)Math.floor(targetBuilding.getCost() * 1.2));
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
		ArrayList<Coordinate> coordinates = new ArrayList<Coordinate>();

		// Check minimum processing conditions
		if (sender != null) {
			
			// Log received request for debugging
			System.out.println(gameplayRequest.toString());

			// Determine which request was sent 
			switch (gameplayRequest.getRequestCode()) {
				case PURCHASE_OBJECT:
		        	gameplayResponse = this.processPurchaseRequest(sender, 
		        			Const.getGameObjectFromString(gameplayRequest.getSourceString()[0]));
					break;
				case PURCHASE_FINISHED:
		        	gameplayResponse = this.processBuildFinishedRequest(sender, 
		        			gameplayRequest.getSourceString()[0]);
		        	break;
		        case NEW_BUILDING:  
		        	gameplayResponseArray = this.processBuildingPlaceRequest(sender, 
		        			Const.getGameBuildingArrayFromGameObjectArrayList(gameplayRequest.getSource()),
		        			gameplayRequest.getTargetString(),
		        			new Coordinate(gameplayRequest.getTargetCellX(), 
		        					gameplayRequest.getTargetCellY()));
		        	break;
		        case DEFENCE_ATTACK_XY:
		        	gameplayResponse = this.processDefenceAttackRequest(sender, 
		        			this.getGameDefencesFromInstanceIds(gameplayRequest.getSourceString(), false), 
		        			gameplayRequest.getTargetCellX(), 
		        			gameplayRequest.getTargetCellY());
		        	break;
		        case OBJECT_ATTACK_OBJECT:
		        	gameplayResponseArray = this.processObjectAttackObjectRequest(sender,
		        			gameplayRequest.getSourceString(),
		        			gameplayRequest.getTargetString());
		        	break;
		        case WAYPOINT_PATH_COORDS:
		        	for (int coordIndex = 0; (coordIndex+1) < gameplayRequest.getTargetString().length; coordIndex += 2) {
		        		coordinates.add(new Coordinate(Integer.parseInt(gameplayRequest.getTargetString()[coordIndex]),
		        				Integer.parseInt(gameplayRequest.getTargetString()[coordIndex+1])));
		        	}
		        	gameplayResponse = this.processWaypointPathCoordsRequest(sender,
		        			this.getGameUnitsFromInstanceIds(gameplayRequest.getSourceString(), false), 
		        			coordinates.toArray(new Coordinate[coordinates.size()]));
		        	break;
		        case WAYPOINT_UPDATE_UNIT_CELL:
		        	Coordinate[] coordinate = new Coordinate[1];
		        	coordinate[0] = new Coordinate(gameplayRequest.getTargetCellX(), gameplayRequest.getTargetCellY());
		        	gameplayResponse = this.processWaypointUpdateUnitCellRequest(sender, 
		        			this.getGameUnitsFromInstanceIds(gameplayRequest.getSourceString(), false),
		        			coordinate);
		        	break;
		        case DAMAGE_OBJECT:
		        	gameplayResponse = this.processDamageRequest(sender,
		        			gameplayRequest.getSourceString(), 
		        			Integer.parseInt(gameplayRequest.getTargetString()[0]),
		        			gameplayRequest.getMisc());
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
	
	private DynGameUnit[] getUnitsAttackingInstance(String instanceId) {
		ArrayList<DynGameUnit> attackingUnits = new ArrayList<DynGameUnit>();
		DynGameUnit attackingUnit = null;
		for (int index = 0; index < this.attackPairs.size(); index ++) {
			if (this.attackPairs.get(index).targetInstanceId.equals(instanceId)) {
				attackingUnit = this.getGameUnitFromInstanceId(this.attackPairs.get(index).sourceInstanceId);
				if (attackingUnit != null) {
					attackingUnits.add(attackingUnit);
				}
			}
		}
		return attackingUnits.toArray(new DynGameUnit[attackingUnits.size()]);
	}
	
	private void removeFromAttackPairs(String instanceId) {
		ArrayList<AttackPair> removeList = new ArrayList<AttackPair>();
		for (int index = 0; index < this.attackPairs.size(); index ++) {
			if (this.attackPairs.get(index).containsInstanceId(instanceId)) {
				removeList.add(this.attackPairs.get(index));
			}
		}
		for (int index = 0; index < removeList.size(); index ++) {
			this.attackPairs.remove(removeList.get(index));
		}
	}
	
	private DynGameBuilding getPlayerDeployHub(Player player) {
		
		// Look through buildings to find deploy hub
		for (DynGameBuilding building : this.buildings) {
			if (building.playerRef == player) {
				return building;
			}
		}
		
		// Return no hub found
		return null;
		
	}

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
