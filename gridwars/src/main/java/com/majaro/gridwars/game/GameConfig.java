package com.majaro.gridwars.game;

import com.majaro.gridwars.game.Constants.E_GameType;

public class GameConfig {
	
	// Define private variables
	private GameStaticMap map;
	private int maxPlayers = 2;
	private E_GameType gameType;
	private int startingCash = 10000;
	private int gameSpeed = 100;
	private int unitHealth = 100;
	private int buildingHealth = 100;
	private int turretHealth = 100;
	private boolean randomCrates = false;
	private boolean redeployableMCV = false;


	// Constructors
	public GameConfig(GameStaticMap map, E_GameType gameType) {
		this.map = map;
		this.gameType = gameType;
	}
	
	
	// Update game config
	public void updateGameConfig(GameStaticMap map, int maxPlayers, E_GameType gameType, int startingCash, 
			int gameSpeed, int unitHealth, int buildingHealth, int turretHealth, boolean randomCrates, boolean redeployableMCV) {
		if (map != null) { this.map = map; }
		if (maxPlayers > 1) { this.maxPlayers = maxPlayers; }
		if (gameType != E_GameType.UNDEFINED) { this.gameType = gameType; }
		if (startingCash != -1) { this.startingCash = startingCash; }
		if (gameSpeed != -1) { this.gameSpeed = gameSpeed; }
		if (unitHealth != -1) { this.unitHealth = unitHealth; }
		if (buildingHealth != -1) { this.buildingHealth = buildingHealth; }
		if (turretHealth != -1) { this.turretHealth = turretHealth; }
		this.randomCrates = randomCrates;
		this.redeployableMCV = redeployableMCV;
	}


	// Getter methods
	public String getMapId() { return this.map.getMapId(); }
	public int getMaxPlayers() { return this.maxPlayers; }
	public int getMapMaxPlayers() { return this.map.getMaxPlayers(); }
	public String getMapName() { return this.map.getMapName(); }
	public E_GameType getGameType() { return this.gameType; }
	public int getStartingCash() { return this.startingCash; }
	public int getGameSpeed() {	return this.gameSpeed; }
	public int getUnitHealth() { return this.unitHealth; }
	public int getBuildingHealth() { return this.buildingHealth; }
	public int getTurretHealth() { return this.turretHealth; }
	public boolean isRandomCrates() { return this.randomCrates; }
	public boolean isRedeployableMCV() { return this.redeployableMCV; }


	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
