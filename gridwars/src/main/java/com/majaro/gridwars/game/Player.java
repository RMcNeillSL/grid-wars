package com.majaro.gridwars.game;

import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.game.Const.E_TechLevel;
import com.majaro.gridwars.game.Const.GameObject;

public class Player {
	
	// Core player variables
	private int playerId = 0;
	private String playerName = "";
	private E_TechLevel techLevel = E_TechLevel.TECH_01;
	private int cash = 0;
	
	// Constructor
	public Player(LobbyUser lobbyUser) {
		
		// Set default variables
		this.techLevel = E_TechLevel.TECH_01;
		
		// Populate core variables from lobby user
		this.playerId = lobbyUser.getLinkedUser().getId();
		this.playerName = lobbyUser.getLinkedUser().getUsername();
		
	}
	
	// Common checking functions
	public boolean playerHasTechLevel(GameObject gameBuilding) {
		return gameBuilding.validFromTechLevel(this.techLevel);
	}
	public boolean playerHasCash(GameObject gameBuilding) {
		return (this.cash >= gameBuilding.getCost());
	}
	
	// Getters
	public int getPlayerId() { return this.playerId; }
	public String getPlayerName() { return this.playerName; }
	
}
