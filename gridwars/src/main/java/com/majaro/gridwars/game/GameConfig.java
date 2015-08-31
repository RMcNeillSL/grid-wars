package com.majaro.gridwars.game;

import com.majaro.gridwars.game.Constants.E_GameType;

public class GameConfig {
	
	// Define private variables
	private GameMap map;
	private int maxPlayers;
	private E_GameType gameType;
	
	public GameConfig(GameMap map, E_GameType gameType) {
		this.map = map;
		this.gameType = gameType;
	}
	
	// Update game config
	public void updateGameConfig(GameConfig sourceGameConfig) {
		
	}
	
	// Getter methods
	public String getMapId() { return this.map.getMapId(); }
	public int getMaxPlayers() { return this.maxPlayers; }
	public int getMapMaxPlayers() { return this.map.getMaxPlayers(); }
	public E_GameType getGameType() { return this.gameType; }

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
