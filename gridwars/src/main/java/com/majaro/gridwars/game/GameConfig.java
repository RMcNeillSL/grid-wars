package com.majaro.gridwars.game;

public class GameConfig {
	
	// Define local enumerands
	private enum E_GameType { FREE_FOR_ALL, TEAM_ALLIANCE }
	
	// Define private variables
	private GameMap mapId;
	private int maxPlayers;
	private E_GameType gameType;
	
	public GameConfig() {
		
	}

//	public void updateFromGameConfigReq(GameConfigReq gameConfigReq) {
//		if (gameConfigReq.mapId > 0 && gameConfigReq.mapId < 2)
//	}
	
}
