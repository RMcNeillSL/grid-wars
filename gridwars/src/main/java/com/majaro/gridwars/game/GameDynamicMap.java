package com.majaro.gridwars.game;

import org.codehaus.jackson.map.annotate.JsonView;

public class GameDynamicMap {
	
	private String mapId = "";
	private String mapName = "";
	private int maxPlayers = 0;
	
	public GameDynamicMap(String mapId, String mapName, int maxPlayers) {
		this.mapId = mapId;
		this.mapName = mapName;
		this.maxPlayers = maxPlayers;
	}
	
}
