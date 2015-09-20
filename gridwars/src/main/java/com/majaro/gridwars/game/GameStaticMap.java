package com.majaro.gridwars.game;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.apiobjects.GameplayConfig;
import com.majaro.gridwars.apiobjects.GameplayConfig.Views.Summary;

public class GameStaticMap {
	
	// Core static-map variables
	private String mapId = "";
	private String mapName = "";
	private int maxPlayers = 0;
	private int width = 0;
	private int height = 0;
	private int[] cells;
	private Coordinate[] spawnCoords;
	
	// Cell values
	// 
	// 0  - dirt
	// 1  - grass
	// 
	
	// Constructor	
	public GameStaticMap(String mapId, String mapName, int maxPlayers, int width, int height, int[] cells, Coordinate[] spawnCoords) {
		this.mapId = mapId;
		this.mapName = mapName;
		this.maxPlayers = maxPlayers;
		this.width = width;
		this.height = height;
		this.cells = cells;
		this.spawnCoords = spawnCoords;
	}

	// Check cell has no obstruction
	public boolean isCellObstructed(int cellX, int cellY) {
		if (cellX + cellY * this.width < cells.length) {
			int cellValue = this.cells[cellX + cellY * this.width];
			if (cellValue == 0 || cellValue == 1) {
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
		return this.maxPlayers;
	}
	@JsonView(GameStaticMap.Views.Summary.class)
	public Coordinate[] getSpawnCoords() {
		return spawnCoords;
	}
	public int getWidth() {
		return width;
	}
	public int getHeight() {
		return height;
	}
	public int[] getCells() {
		return cells;
	}

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
}
