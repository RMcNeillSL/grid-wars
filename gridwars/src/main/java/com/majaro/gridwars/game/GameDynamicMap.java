package com.majaro.gridwars.game;

import java.util.ArrayList;

import org.codehaus.jackson.map.annotate.JsonView;

public class GameDynamicMap {
	
	// Define local classes
	private class DynamicCell {
		private int cellX;
		private int cellY;
		private DynGameBuilding gameObject;
		public DynamicCell(int cellX, int cellY, DynGameBuilding gameObject) {
			this.cellX = cellX;
			this.cellY = cellY;
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
	
	
	// Constructors
	public GameDynamicMap(GameStaticMap staticMap) {
		
		// Construct cells for map
		this.width = staticMap.getWidth();
		this.height = staticMap.getHeight();
		this.cells = new ArrayList<DynamicCell>();
		
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
		for (DynamicCell cell : this.cells) {
			if (cell.cellX == cellX && cell.cellY == cellY) {
				return cell.isCellObstructed();
			}
		}
		return true;
	}
	
}
