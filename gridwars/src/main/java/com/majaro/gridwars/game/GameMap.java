package com.majaro.gridwars.game;

import org.codehaus.jackson.map.annotate.JsonView;

public class GameMap {
	
	private String mapId = "";
	private String mapName = "";
	private int maxPlayers = 0;
	
	public GameMap(String mapId, String mapName, int maxPlayers) {
		this.mapId = mapId;
		this.mapName = mapName;
		this.maxPlayers = maxPlayers;
	}
	
	@JsonView(GameMap.Views.Summary.class)
	public String getMapId() {
		return this.mapId;
	}
	
	@JsonView(GameMap.Views.Summary.class)
	public String getMapName() {
		return this.mapName;
	}
	
	public int getMaxPlayers() {
		return this.maxPlayers;
	}

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
