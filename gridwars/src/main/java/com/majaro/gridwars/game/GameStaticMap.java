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
	
	// Cell values
	// 
	// 0  - dirt
	// 1  - grass
	// 
	
	// Constructor	
	public GameStaticMap(String mapId, String mapName, int maxPlayers, int width, int height, int[] cells) {
		this.mapId = mapId;
		this.mapName = mapName;
		this.maxPlayers = maxPlayers;
		this.width = width;
		this.height = height;
		this.cells = cells;
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
