package com.majaro.gridwars.game;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.apiobjects.GameplayConfig;
import com.majaro.gridwars.apiobjects.GameplayConfig.Views.Summary;

public class GameStaticMap {
	
	// Core static-map variables
	private String mapId = "";
	private String mapName = "";
	private int width = 0;
	private int height = 0;
	private int[] cells;
	private Coordinate[] spawnCoordinates;
	
	// Cell values
	// 
	// 0 - dirt
	// 1 - centre rocks 1
	// 2 - centre rocks 2
	// 3 - edge rocks
	// 4 - corner rocks
	// 
	
	// Constructor	
	public GameStaticMap(String mapId, String mapName, int width, int height, int[] cells, Coordinate[] spawnCoordinates) {
		this.mapId = mapId;
		this.mapName = mapName;
		this.width = width;
		this.height = height;
		this.cells = cells;
		this.spawnCoordinates = spawnCoordinates;
	}

	// Check cell has no obstruction
	public boolean isCellObstructed(int cellX, int cellY) {
		if (cellX + cellY * this.width < cells.length) {
			int cellValue = this.cells[cellX + cellY * this.width];
			if (cellValue == 0) {
				return false;
			}
		}
		return true;
	}
	public boolean isCellInBounds(Coordinate coordinate) {
		return (coordinate.getRow() >= 0 && coordinate.getRow() < this.width) && (coordinate.getCol() >= 0 && coordinate.getCol() < this.height);
	}
	public boolean isCellObstructed(Coordinate coordinate) {
		return this.isCellObstructed(coordinate.getCol(), coordinate.getRow());
	}
	
	// Getters for summary view
	@JsonView(GameStaticMap.Views.Summary.class)
	public String getMapId() {
		return this.mapId;
	}
	@JsonView(GameStaticMap.Views.Summary.class)
	public String getMapName() {
		return this.mapName;
	}
	@JsonView(GameStaticMap.Views.Summary.class)
	public int getMaxPlayers() {
		return this.spawnCoordinates.length;
	}
	public Coordinate[] getSpawnCoordinates() {
		return this.spawnCoordinates;
	}
	public int getWidth() {
		return this.width;
	}
	public int getHeight() {
		return this.height;
	}
	public int[] getCells() {
		return this.cells;
	}

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
}
