package com.majaro.gridwars.game;

import java.util.ArrayList;

import org.codehaus.jackson.map.annotate.JsonView;

public class GameDynamicMap {
	
	// Define local classes
	private class DynamicCell {
		private int cellX;
		private int cellY;
		private DynGameBuilding gameObject;
		public DynamicCell(int cellX, int cellY) {
			this.cellX = cellX;
			this.cellY = cellY;
		}
		public DynamicCell(int cellX, int cellY, DynGameBuilding gameObject) {
			this(cellX, cellY);
			this.gameObject = gameObject;
		}
		public boolean isCellObstructed() {
			return !(gameObject == null);
		}
	}
	
	
	// Map cell information
	private int width = 0;
	private int height = 0;
	private ArrayList<DynamicCell> cells;
	
	// Game state arrays
	private ArrayList<DynGameBuilding> gameBuildings;
	private ArrayList<DynGameUnit> gameUnits;
	
	// Constructors
	public GameDynamicMap(GameStaticMap staticMap, ArrayList<DynGameBuilding> gameBuildings, ArrayList<DynGameUnit> gameUnits) {
		
		// Construct cells for map
		this.width = staticMap.getWidth();
		this.height = staticMap.getHeight();
		this.cells = new ArrayList<DynamicCell>();
		
		// Save references to buildings and units
		this.gameBuildings = gameBuildings;
		this.gameUnits = gameUnits;
		
		// Populate dynamic cell contents
		int colIndex = 0; int rowIndex = 0;
		int[] staticCells = staticMap.getCells();
		for (int index = 0; index < staticCells.length; index ++) {
			
			// Fill cell contents
			this.cells.add(new DynamicCell(colIndex, rowIndex, null));
			
			// Manage transition to next row
			colIndex ++;
			if (colIndex >= this.width) {
				colIndex = 0;
				rowIndex ++;
			}
			
		}
		
	}
	
	
	// Check cell has no obstruction
	public boolean isCellObstructed(Coordinate coord, int futureTurnCount, DynGameUnit[] ignoreUnits) {
		
		// Declare local variables
		Coordinate[] coords = null;
		
		// Search through 'locked' cells
		for (DynamicCell cell : this.cells) {
			if (cell.cellX == coord.getCol() &&
					cell.cellY == coord.getRow() &&
					cell.isCellObstructed()) {
				return true;
			}
		}
		
		// Search through buildings
		for (DynGameBuilding building : this.gameBuildings) {
			coords = building.getCoordinates();
			for (int index = 0; index < coords.length; index ++) {
				if (coords[index] != null && coords[index].getCol() == coord.getCol() && coords[index].getRow() == coord.getRow()) {
					return true;
				}
			}
		}
		
		// Search through units -- ignore for now as units can travel over eachother
		if (futureTurnCount >= 0) {
			boolean shouldIgnoreUnit = false;
			for (DynGameUnit unit : this.gameUnits) {
				if (unit.getWaypoint(futureTurnCount).equals(coord)) {
					shouldIgnoreUnit = false;
					for (DynGameUnit ignoreUnit : ignoreUnits) {
						shouldIgnoreUnit = true;
						break;
					}
					if (shouldIgnoreUnit) { return true; }
				}
			}
		}
		
		// Return empty
		return false;
	}
	public boolean isCellObstructed(Coordinate coord) {
		return this.isCellObstructed(coord, -1, new DynGameUnit[0]);
	}
	
}
