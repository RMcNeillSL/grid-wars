package com.majaro.gridwars.game;

public class GameMap {
	
	private String mapId = "";
	private String mapName = "";
	private int maxPlayers = 0;
	
	public GameMap(String mapId, String mapName, int maxPlayers) {
		this.mapName = mapName;
		this.maxPlayers = maxPlayers;
	}

}
