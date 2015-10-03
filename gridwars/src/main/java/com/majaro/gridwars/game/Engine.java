package com.majaro.gridwars.game;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;
import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.game.AttackPairList.AttackPair;
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
		public ArrayList<Coordinate> calculatePath(Coordinate startCoord, Coordinate endCoord, double acceptableDistance) {
			
			// Make sure required info is valid
			if (startCoord != null && endCoord != null) {
				
				// Debug information
				System.out.println("Starting coordinate for pathfinding: (" + startCoord.getCol() + "," + startCoord.getRow() + ")");
				System.out.println("Ending coordinate for pathfinding: (" + endCoord.getCol() + "," + endCoord.getRow() + ")");
				if (this.staticMapRef.isCellObstructed(startCoord)) { System.out.println("Start point is marked as an obstructed cell on static map."); }
				if (this.staticMapRef.isCellObstructed(endCoord)) { System.out.println("End point is marked as an obstructed cell on static map."); }
				if (this.dynamicMapRef.isCellObstructed(startCoord)) { System.out.println("Start point is marked as an obstructed cell on dynamic map."); }
				if (this.dynamicMapRef.isCellObstructed(endCoord)) { System.out.println("End point is marked as an obstructed cell on dynamic map."); }

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
						String debugPath = "";
						for (AStarCell cell : path) {
							formattedResult.add(0, cell.coord);
							debugPath = debugPath + "(" + Integer.toString(cell.coord.getCol()) + "," + Integer.toString(cell.coord.getRow()) + ") ";
						}
						System.out.println("Calculated path: " + debugPath);
						return formattedResult;
					}
				} else {
					System.out.println("Unable to calculate path between start and end.");
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
	private AttackPairList pursueAttackPairs;
	private AttackPairList holdGroundAttackPairs;
	
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
		this.pursueAttackPairs = new AttackPairList(this.buildings, this.units);
		this.holdGroundAttackPairs = new AttackPairList(this.buildings, this.units);

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
			gameplayResponse.addCoord(startTankFactoryCoordinate);
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

			// UNIT: Run building finished
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

			// DEFENCE: Run building finished
			else if (purchaseRequest.getSourceObject() instanceof GameDefence) {

				// Construct new unit
				Coordinate deployCoord = new Coordinate(0, 0);
				DynGameDefence newDefence = new DynGameDefence(purchaseRequest.getObjectId(),
						(GameDefence)purchaseRequest.getSourceObject(), player, deployCoord);
				
				// Construct response object
				if (newDefence != null) {
					this.buildings.add(newDefence);
					finishedBuildResponse = new GameplayResponse(E_GameplayResponseCode.BUILDING_PURCHASE_FINISHED);
					finishedBuildResponse.addSource(purchaseRequest.getSourceObject().getIdentifier());
					finishedBuildResponse.addTarget(purchaseObjectId);
					finishedBuildResponse.addMisc(player.getPlayerName());
					finishedBuildResponse.addCoord(deployCoord);
				}
			}

			// BUILDING: Run building finished
			else if (purchaseRequest.getSourceObject() instanceof GameBuilding) {

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
		GameplayResponse[] waypointUpdateResponse = null;
		boolean validConstruction = true;

		// Declare local working variables
		GameBuilding sourceBuilding = null;
		
		// Declare waypoint amending variables
		ArrayList<DynGameUnit> waypointInterruptedUnits = new ArrayList<DynGameUnit>();
		ArrayList<DynGameUnit> newWaypointInterruptedUnits = null;
		Coordinate unitWaypointEnd = null;
		
		// Check each object in turn
		for (int index = 0; index < sourceBuildings.length; index ++) {
			
			// Create working references
			sourceBuilding = sourceBuildings[index];

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
			
			// Make sure building was purchases by player
			
			// Search for units which may need waypoint paths updating with new building placement
			newWaypointInterruptedUnits = this.getInterruptedWaypointUnits(coord);
			waypointInterruptedUnits.addAll(newWaypointInterruptedUnits);
		}

		// Construct valid response
		if (validConstruction) {
			
			// Define variables for construction
			DynGameBuilding newBuilding = null;
			
			// Search for each building in turn
			for (String instanceId : instanceIds) {

				// Find game building
				newBuilding = this.getGameBuildingFromInstanceId(instanceId);
				
				// Update coordinates of building
				if (newBuilding != null) {
					if (newBuildingResponse == null) { newBuildingResponse = new GameplayResponse(E_GameplayResponseCode.NEW_BUILDING); }
					newBuilding.updateCoordinate(coord);
					newBuildingResponse.addCoord(coord); // -- need to calculate for multiBuilding structures later e.g. walls
					newBuildingResponse.addSource(newBuilding.getIdentifier());
					newBuildingResponse.addTarget(newBuilding.getInstanceId());
					newBuildingResponse.addMisc(player.getPlayerName());
				}
			}
			
			// Update effected unit waypoint paths
			for (DynGameUnit effectedUnit : waypointInterruptedUnits) {
				unitWaypointEnd = effectedUnit.getWaypointEndCoordinate();
				if (unitWaypointEnd != null) {
					waypointUpdateResponse = this.processWaypointPathCoordsRequest(player, effectedUnit, unitWaypointEnd);
					for (GameplayResponse response : waypointUpdateResponse) {
						responseList.add(response);
					}
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
				if (sourceUnit != null) 	{ attackResponse.addSource(sourceUnit.getInstanceId());			sourceCoord = sourceUnit.getCoordinate();	 	}
				if (sourceBuilding != null) { attackResponse.addSource(sourceBuilding.getInstanceId());		sourceCoord = sourceBuilding.getCoordinate(); 	}
				if (targetUnit != null) 	{ attackResponse.addTarget(targetUnit.getInstanceId());			targetCoord = targetUnit.getCoordinate();		targetId = targetUnit.getInstanceId(); }
				if (targetBuilding != null) { attackResponse.addTarget(targetBuilding.getInstanceId());		targetCoord = targetBuilding.getCoordinate();	targetId = targetBuilding.getInstanceId(); }
				responseList.add(attackResponse);
				
				// Check if movement to bring target in range is needed (only if specified to attack by player)
				if (player != null) {
					if (sourceUnit != null && sourceCoord.distanceTo(targetCoord) > sourceUnit.getRange() / Const.cellSize) {
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

				// Add new items to attack pair array
				if ((sourceUnit != null || sourceBuilding != null) && targetId != null) {
					if (sourceUnit != null && player != null) 	{ this.pursueAttackPairs.add(sourceUnit.getInstanceId(), targetId); }
					if (sourceBuilding != null && player == null) { this.holdGroundAttackPairs.add(sourceBuilding.getInstanceId(), targetId); }
					if (sourceUnit != null && player == null) { this.holdGroundAttackPairs.add(sourceUnit.getInstanceId(), targetId); }
				}
			}
		}

		// Return calculated result
		return responseList.toArray(new GameplayResponse[responseList.size()]);
	}
	
	private GameplayResponse[] processWaypointPathCoordsRequest(Player player, DynGameUnit[] sourceUnits, Coordinate[] coordinates) {

		// Set default result
		ArrayList<GameplayResponse> responseList = new ArrayList<GameplayResponse>();
		GameplayResponse waypointResponse = null;
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
			
			// Remove any currently listed pursue attacks for the unit
			this.pursueAttackPairs.removeAttacker(unitRef.getInstanceId());
			
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
			waypointResponse = new GameplayResponse(E_GameplayResponseCode.WAYPOINT_PATH_COORDS);
			for (DynGameUnit unit : sourceUnits) {
				unitWaypoints = unit.getWaypoints();
				if (unitWaypoints != null) {
					for (Coordinate coord : unitWaypoints) {
						waypointResponse.addCoord(coord);
						waypointResponse.addSource(unit.getInstanceId());
					}
				} else {
					waypointResponse.addCoord(unit.getCoordinate());
					waypointResponse.addSource(unit.getInstanceId());
				}
			}
			responseList.add(waypointResponse);
		}
		
		// Return calculated result
		return responseList.toArray(new GameplayResponse[responseList.size()]);
	}
	
	private GameplayResponse[] processWaypointPathCoordsRequest(Player player, DynGameUnit sourceUnit, Coordinate coordinate) {
		DynGameUnit[] unitsArray = new DynGameUnit[1];
		Coordinate[] coordinates = new Coordinate[1];
		unitsArray[0] = sourceUnit;
		coordinates[0] = coordinate;
		return this.processWaypointPathCoordsRequest(player, unitsArray, coordinates);
	}
	
	private GameplayResponse[] processWaypointUpdateUnitCellRequest(Player player, DynGameUnit[] sourceUnits, Coordinate[] newCoordinates) {

		// Set default result
		GameplayResponse updateCellResponse = null;
		GameplayResponse clearAttackResponse = null;
		ArrayList<GameplayResponse> responseList = new ArrayList<GameplayResponse>();
		GameplayResponse[] objectAttackResponse = null;

		// Declare variables to hold current attack pairs
		DynGameUnit[] pursueUnits = null;
		DynGameUnit[] holdGroundUnits = null;
		DynGameDefence[] holdGroundDefences = null;
		
		// Declare working variables
		DynGameUnit unitRef = null;												// Holds reference to unit currently moving
		ArrayList<Coordinate> path = null;										// Waypoint path for any enemy which has locked on to current unit and needs updating its location
		String targetId = null;													// Holds Id of target of currently moving unit
		DynGameUnit targetUnit = null;											// Holds referece to unit currently targeted by moving unit
		DynGameBuilding targetBuilding = null;									// Holds referece to building currently targeted by moving unit
		Coordinate targetCoord = null;											// Holds the coordinate of the object targeted by currently moving unit
		
		// Declare arrays hold instanceIds of objects halting their attack
		ArrayList<String> removeInstanceIds = new ArrayList<String>();
		ArrayList<String> targetIds = new ArrayList<String>();
		ArrayList<String> sourceIds = new ArrayList<String>();
		
		// Declare arrays to hold instance Ids of object starting an attack
		String[] buildingsToAttack = null;
		String[] unitsToAttack = null;
		
		// Process each unit update inturn
		for (int index = 0; index < Math.min(sourceUnits.length, newCoordinates.length); index ++) {
			
			// Set new references
			unitRef = sourceUnits[index];
			
			// Determine units or defences currently locked onto moved unit
			pursueUnits = this.pursueAttackPairs.getUnitsAttackingInstance(sourceUnits[index].getInstanceId());
			holdGroundUnits = this.holdGroundAttackPairs.getUnitsAttackingInstance(sourceUnits[index].getInstanceId());
			holdGroundDefences = this.holdGroundAttackPairs.getDefencesAttackingInstance(sourceUnits[index].getInstanceId());
			
			// Update cell of unit
			unitRef.updateCoordinate(newCoordinates[index]);
			
			// -- DEFENCE [holdGround] : unassignment and reassignment of targets
			
				// Check if any defences need to be unassigned from attacking moving unit
				if (holdGroundDefences != null && holdGroundDefences.length > 0) {
					removeInstanceIds.clear();
					for (DynGameDefence defence : holdGroundDefences) {
						if (unitRef.getCoordinate().distanceTo(defence.getCoordinate()) > defence.getRange() / Const.cellSize) {
							removeInstanceIds.add(defence.getInstanceId());
						}
					}
					for (String instanceId : removeInstanceIds) {
						if (clearAttackResponse == null) { clearAttackResponse = new GameplayResponse(E_GameplayResponseCode.OBJECT_ATTACK_OBJECT); }
						clearAttackResponse.addSource(instanceId);
						clearAttackResponse.addTarget("");
						this.holdGroundAttackPairs.removeAttacker(instanceId);
					}
				}
				
				// Check if unit has entered attacking range of any idle defences
				buildingsToAttack = this.getIdleDefencesRangeOverUnit(unitRef);
				if (buildingsToAttack.length > 0) {
					targetIds.clear();
					for (int targetIndex = 0; targetIndex < buildingsToAttack.length; targetIndex ++) { targetIds.add(unitRef.getInstanceId()); }
					objectAttackResponse = this.processObjectAttackObjectRequest(null, buildingsToAttack, targetIds.toArray(new String[targetIds.size()]));
					for (GameplayResponse response : objectAttackResponse) { responseList.add(response); }
				}
			
			// -- UNIT [holdGround] : remove any attackers out of range and add new target in range
			
				// Check if any units are holding ground and need their target removed
				if (holdGroundUnits != null && holdGroundUnits.length > 0) {
					removeInstanceIds.clear();
					for (DynGameUnit unit : holdGroundUnits) {
						if (unitRef.getCoordinate().distanceTo(unit.getCoordinate()) > unit.getRange() / Const.cellSize) {
							removeInstanceIds.add(unit.getInstanceId());
						}
					}
					for (String instanceId : removeInstanceIds) {
						if (clearAttackResponse == null) { clearAttackResponse = new GameplayResponse(E_GameplayResponseCode.OBJECT_ATTACK_OBJECT); }
						clearAttackResponse.addSource(instanceId);
						clearAttackResponse.addTarget("");
						this.holdGroundAttackPairs.removeAttacker(instanceId);
					}
				}
				
				// Check to see if unit has entered range of any idle units
				unitsToAttack = this.getIdleUnitsRangeOverUnit(unitRef);
				if (unitsToAttack.length > 0) {
					targetIds.clear();
					for (int targetIndex = 0; targetIndex < unitsToAttack.length; targetIndex ++) { targetIds.add(unitRef.getInstanceId()); }
					objectAttackResponse = this.processObjectAttackObjectRequest(null, unitsToAttack, targetIds.toArray(new String[targetIds.size()]));
					for (GameplayResponse response : objectAttackResponse) { responseList.add(response); }
				}
				
			
			// -- UNIT [pursue] : pursue attacking updating waypoint paths to get to target
			
				// Check if unit was involved in an attack pair as target - update source waypoints
				if (pursueUnits != null && pursueUnits.length > 0) {
					for (DynGameUnit attackUnitRef : pursueUnits) {
						path = this.aStarPathFinder.calculatePath(attackUnitRef.getCoordinate(), unitRef.getCoordinate(), attackUnitRef.getRange() / Const.cellSize);
						if (path != null) {
							if (updateCellResponse == null) { updateCellResponse = new GameplayResponse(E_GameplayResponseCode.WAYPOINT_PATH_COORDS); }
							for (Coordinate coord : path) {
								updateCellResponse.addCoord(coord);
								updateCellResponse.addSource(attackUnitRef.getInstanceId());
							}
						}
					}
				}
				
			// SELF [holdGround] : provide a new target for moving unit if they do not already have one
				
				// Make sure unit has no pursue attack
				if (this.pursueAttackPairs.getSourceAttacks(unitRef.getInstanceId()) == null) {
					
					// Check if target is out of range and remove item
					targetId = this.holdGroundAttackPairs.getSourceAttacks(unitRef.getInstanceId());
					if (targetId != null) {
						targetCoord = null;
						targetUnit = this.getGameUnitFromInstanceId(targetId);
						targetBuilding = this.getGameBuildingFromInstanceId(targetId);
						if (targetUnit != null) { targetCoord = targetUnit.getCoordinate(); }
						if (targetBuilding != null) { targetCoord = targetBuilding.getCoordinate(); }
						if (targetCoord != null) {
							if (unitRef.getCoordinate().distanceTo(targetCoord) > unitRef.getRange() / Const.cellSize) {
								if (clearAttackResponse == null) { clearAttackResponse = new GameplayResponse(E_GameplayResponseCode.OBJECT_ATTACK_OBJECT); }
								clearAttackResponse.addSource(unitRef.getInstanceId());
								clearAttackResponse.addTarget("");
								this.holdGroundAttackPairs.removeAttacker(unitRef.getInstanceId());
							}
						}
					}
					
					// Check if new targets are now in range
					unitsToAttack = this.getUnitsInUnitRange(unitRef, true);
					if (unitsToAttack.length > 0) {
						sourceIds.clear(); sourceIds.add(unitRef.getInstanceId());
						objectAttackResponse = this.processObjectAttackObjectRequest(null, sourceIds.toArray(new String[sourceIds.size()]), unitsToAttack);
						for (GameplayResponse response : objectAttackResponse) { responseList.add(response); }
					} else {
						buildingsToAttack = this.getBuildingsInUnitRange(unitRef, false, true);
						if (buildingsToAttack.length > 0) {
							sourceIds.clear(); sourceIds.add(unitRef.getInstanceId());
							objectAttackResponse = this.processObjectAttackObjectRequest(null, sourceIds.toArray(new String[sourceIds.size()]), buildingsToAttack);
							for (GameplayResponse response : objectAttackResponse) { responseList.add(response); }
						}
					}
				}
		}
		
		// Add custom responses if they were constructed
		if (clearAttackResponse != null) 	{ responseList.add(clearAttackResponse); }
		if (updateCellResponse != null) 	{ responseList.add(updateCellResponse); }
		
		// Return calculated response as array
		return responseList.toArray(new GameplayResponse[responseList.size()]);
	}
	
	private GameplayResponse[] processDamageRequest(Player player, String[] instanceIds, int damageAmount, ArrayList<String> miscStrings) {

		// Set default result
		ArrayList<GameplayResponse> responseList = new ArrayList<GameplayResponse>();
		GameplayResponse damageResponse = null;
		GameplayResponse[] defenceAttackResponse = null;
		boolean validConstruction = true;
		
		// Declare working variables
		DynGameDefence attackingDefence = null;
		String[] attackingDefences = null;
		String[] unitsInAttackRange = null;
		ArrayList<String> sourceIdsPendingAttack = new ArrayList<String>();
		ArrayList<String> targetIdsPendingAttack = new ArrayList<String>();
		
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
			damageResponse = new GameplayResponse(E_GameplayResponseCode.DAMAGE_OBJECT);
			if (sourceUnits.length > 0) {
				for (DynGameUnit targetUnit : sourceUnits) {
					damageResponse.addSource(targetUnit.getInstanceId());
					damageResponse.addTarget(Integer.toString(targetUnit.getHealth()));
					damageResponse.addMisc(killer.getPlayerName());
				}
			}
			if (sourceBuildings.length > 0) {
				for (DynGameBuilding sourceBuilding : sourceBuildings) {
					damageResponse.addSource(sourceBuilding.getInstanceId());
					damageResponse.addTarget(Integer.toString(sourceBuilding.getHealth()));
					damageResponse.addMisc(killer.getPlayerName());
				}
			}
			responseList.add(damageResponse);
		}
		
		// Clean up all units which have now been destroyed
		for (DynGameUnit targetUnit : sourceUnits) {
			if (targetUnit.getHealth() <= 0) {

				// Record all turrets attacking destroyed object and clear out any attacking pairs 
				attackingDefences = this.pursueAttackPairs.getAttackSources(targetUnit.getInstanceId());
				this.pursueAttackPairs.removeEither(targetUnit.getInstanceId());
				
				// Generate new targets
				for (String defenceInstanceId : attackingDefences) {
					attackingDefence = this.getGameDefenceFromInstanceId(defenceInstanceId);
					if (attackingDefence != null) {
						unitsInAttackRange = this.getUnitsInDefenceRange(attackingDefence);
						if (unitsInAttackRange.length > 0) {
							sourceIdsPendingAttack.add(attackingDefence.getInstanceId());
							targetIdsPendingAttack.add(unitsInAttackRange[0]);
						}
					}
				}
				
				// Destroy unit and give cash to the destroyer
				int awardedMoney = (int)Math.floor(targetUnit.getCost() * 1.2);
				killer.addPlayerCash(awardedMoney);
				this.destroyGameObject(targetUnit);
			}
		}

		// Clean up all buildings which have now been destroyed
		for (DynGameBuilding targetBuilding : sourceBuildings) {
			if (targetBuilding.getHealth() <= 0) {
				this.pursueAttackPairs.removeEither(targetBuilding.getInstanceId());
				int awardedMoney = (int)Math.floor(targetBuilding.getCost() * 1.2);
				killer.addPlayerCash(awardedMoney);
				System.out.println("A TURRET WAS KILLED BY " + killer.getPlayerName() + " THEY WERE AWARDED $" + awardedMoney);
				this.destroyGameObject(targetBuilding);
			}
		}
		
		// Run request for all new attack source/target pairs
		if (sourceIdsPendingAttack.size() > 0 &&
				targetIdsPendingAttack.size() > 0) {
			defenceAttackResponse = this.processObjectAttackObjectRequest(player, 
					sourceIdsPendingAttack.toArray(new String[sourceIdsPendingAttack.size()]), 
					targetIdsPendingAttack.toArray(new String[targetIdsPendingAttack.size()]));
			for (int index = 0; index < defenceAttackResponse.length; index ++) {
				responseList.add(defenceAttackResponse[index]);
			}
		}

		// Return calculated result
		return responseList.toArray(new GameplayResponse[responseList.size()]);
	}

	private GameplayResponse processUserLeaveGame (Player sender) {		//ROB
		GameplayResponse destroyBuildingResponse = new GameplayResponse(E_GameplayResponseCode.DESTROY_OBJECT);

		for (DynGameBuilding building : buildings) {
			if (building.getOwner().getPlayerId() == sender.getPlayerId()) {
				destroyBuildingResponse.addSource(building.getInstanceId());
			}
		}
		for (DynGameUnit unit : units) {
			if (unit.getOwner().getPlayerId() == sender.getPlayerId()) {
				destroyBuildingResponse.addSource(unit.getInstanceId());
			}
		}
		return destroyBuildingResponse;
	}

	private GameplayResponse[] sellBuilding(Player player, DynGameBuilding building) {

		// Set default result
		GameplayResponse destroyBuildingResponse = null;
		GameplayResponse updateFundsResponse = null;
		ArrayList<GameplayResponse> responseList = new ArrayList<GameplayResponse>();
		boolean validConstruction = true;
		
		// Check building exists
		if (building == null) {
			validConstruction = false;
		}
		
		// Check player owns building
		if (validConstruction && !building.getOwner().getPlayerName().equals(player.getPlayerName())) {
			validConstruction = false;
		}
		
		// Generate valid result
		if (validConstruction) {
			
			// Alter player funds based on building health and cost / Destroy building
			player.addPlayerCash((int)(building.getCost() * building.getHealth() * 1.0 / building.getMaxHealth()));
			String destroyedInstanceId = building.getInstanceId();
			this.destroyGameObject(building);
			
			// Generate funds alteration response
			updateFundsResponse = new GameplayResponse(E_GameplayResponseCode.SELL_BUILDING);
			updateFundsResponse.addSource(Integer.toString(player.getPlayerCash()));
			updateFundsResponse.flagForSenderOnly();
			responseList.add(updateFundsResponse);
			
			// Generate destroy building response
			destroyBuildingResponse = new GameplayResponse(E_GameplayResponseCode.DESTROY_OBJECT);
			destroyBuildingResponse.addSource(destroyedInstanceId);
			responseList.add(destroyBuildingResponse);
		}

		// Return calculated result
		return responseList.toArray(new GameplayResponse[responseList.size()]);
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
				case SELL_BUILDING:
					gameplayResponseArray = this.sellBuilding(sender, 
		        			this.getGameBuildingFromInstanceId(gameplayRequest.getSourceString()[0]));
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
		        	gameplayResponseArray = this.processWaypointPathCoordsRequest(sender,
		        			this.getGameUnitsFromInstanceIds(gameplayRequest.getSourceString(), false), 
		        			coordinates.toArray(new Coordinate[coordinates.size()]));
		        	break;
		        case WAYPOINT_UPDATE_UNIT_CELL:
		        	Coordinate[] coordinate = new Coordinate[1];
		        	coordinate[0] = new Coordinate(gameplayRequest.getTargetCellX(), gameplayRequest.getTargetCellY());
		        	gameplayResponseArray = this.processWaypointUpdateUnitCellRequest(sender, 
		        			this.getGameUnitsFromInstanceIds(gameplayRequest.getSourceString(), false),
		        			coordinate);
		        	break;
		        case DAMAGE_OBJECT:
		        	gameplayResponseArray = this.processDamageRequest(sender,
		        			gameplayRequest.getSourceString(), 
		        			Integer.parseInt(gameplayRequest.getTargetString()[0]),
		        			gameplayRequest.getMisc());
		        	break;
		        case PLAYER_LEAVE_GAME:
		        	gameplayResponse = this.processUserLeaveGame(sender);
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

	private String[] getIdleDefencesRangeOverUnit(DynGameUnit targetUnit) {
		
		// Define working variables
		ArrayList<String> buildingsToAttack = new ArrayList<String>();
		DynGameDefence defence = null;
		
		// Locate all defences whose range covers unit
		for (int buildingIndex = 0; buildingIndex < this.buildings.size(); buildingIndex ++) {
			if (this.buildings.get(buildingIndex) instanceof DynGameDefence) {
				defence = (DynGameDefence)this.buildings.get(buildingIndex);
				if (!this.pursueAttackPairs.isAttacking(defence.getInstanceId()) &&
						!this.holdGroundAttackPairs.isAttacking(defence.getInstanceId()) &&
						!defence.getOwner().getPlayerName().equals(targetUnit.getOwner().getPlayerName()) &&
						targetUnit.getCoordinate().distanceTo(defence.getCoordinate()) <= defence.getRange() / Const.cellSize ) {
					buildingsToAttack.add(defence.getInstanceId());
				}
			}
		}
		
		// Return calculated answer
		return buildingsToAttack.toArray(new String[buildingsToAttack.size()]);
	}

	private String[] getIdleUnitsRangeOverUnit(DynGameUnit targetUnit) {
		
		// Define working variables
		ArrayList<String> unitsToAttack = new ArrayList<String>();
		DynGameUnit unit = null;
		
		// Locate all defences whose range covers unit
		for (int unitIndex = 0; unitIndex < this.units.size(); unitIndex ++) {
			unit = (DynGameUnit)this.units.get(unitIndex);
			if (!this.pursueAttackPairs.isAttacking(unit.getInstanceId()) &&
					!this.holdGroundAttackPairs.isAttacking(unit.getInstanceId()) &&
					!unit.getOwner().getPlayerName().equals(targetUnit.getOwner().getPlayerName()) &&
					targetUnit.getCoordinate().distanceTo(unit.getCoordinate()) <= unit.getRange() / Const.cellSize ) {
				unitsToAttack.add(unit.getInstanceId());
			}
		}
		
		// Return calculated answer
		return unitsToAttack.toArray(new String[unitsToAttack.size()]);
	}

	private String[] getUnitsInDefenceRange(DynGameDefence defence) {
		ArrayList<String> attackUnits = new ArrayList<String>();
		for (DynGameUnit unit : this.units) {
			if (!unit.getOwner().getPlayerName().equals(defence.getOwner().getPlayerName()) &&
					unit.getCoordinate().distanceTo(defence.getCoordinate()) <= defence.getRange() / Const.cellSize) {
				attackUnits.add(unit.getInstanceId());
			}
		}		
		return attackUnits.toArray(new String[attackUnits.size()]);
	}

	private String[] getBuildingsInUnitRange(DynGameUnit unitRef, boolean defencesOnly, boolean onlyFirst) {
		ArrayList<String> buildingsInRange = new ArrayList<String>();
		for (DynGameBuilding building : this.buildings) {
			if (building instanceof DynGameDefence || !defencesOnly) {
				if (!unitRef.getOwner().getPlayerName().equals(building.getOwner().getPlayerName()) &&
						unitRef.getCoordinate().distanceTo(building.getCoordinate()) <= unitRef.getRange() / Const.cellSize) {
					if (building instanceof DynGameDefence) {
						buildingsInRange.add(0, building.getInstanceId());
					} else {
						buildingsInRange.add(building.getInstanceId());
					}
					if (onlyFirst) { break; }
				}
			}
		}		
		return buildingsInRange.toArray(new String[buildingsInRange.size()]);
	}

	private String[] getUnitsInUnitRange(DynGameUnit unitRef, boolean onlyFirst) {
		ArrayList<String> unitsInRange = new ArrayList<String>();
		for (DynGameUnit unit : this.units) {
			if (!unitRef.getOwner().getPlayerName().equals(unit.getOwner().getPlayerName()) &&
					unitRef.getCoordinate().distanceTo(unit.getCoordinate()) <= unitRef.getRange() / Const.cellSize) {
				unitsInRange.add(unit.getInstanceId());
				if (onlyFirst) { break; }
			}
		}		
		return unitsInRange.toArray(new String[unitsInRange.size()]);
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
