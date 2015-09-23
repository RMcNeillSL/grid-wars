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
	public boolean isCellObstructed(int cellX, int cellY) {
		
		// Declare local variables
		boolean isObstructed = false;
		Coordinate coord = null;
		Coordinate[] coords = null;
		
		// Search through 'locked' cells
		for (DynamicCell cell : this.cells) {
			if (cell.cellX == cellX && cell.cellY == cellY) {
				isObstructed = cell.isCellObstructed();
				break;
			}
		}
		
		// Search through buildings
		for (DynGameBuilding building : this.gameBuildings) {
			coords = building.getCoordinates();
			for (int index = 0; index < coords.length; index ++) {
				if (coords[index] != null && coords[index].getCol() == cellX && coords[index].getRow() == cellY) {
					isObstructed = true;
					break;
				}
			}
		}
		
		// Search through units -- ignore for now as units can travel over eachother
		
		// Return empty
		return isObstructed;
	}
	public boolean isCellObstructed(Coordinate coordinate) {
		return this.isCellObstructed(coordinate.getCol(), coordinate.getRow());
	}
	
}
