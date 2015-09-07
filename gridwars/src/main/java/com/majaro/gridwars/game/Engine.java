package com.majaro.gridwars.game;

import java.util.ArrayList;

import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;
import com.majaro.gridwars.core.LobbyUser;

public class Engine extends Thread {
	
	// Core game variables
	private boolean isRunning = false;
	private GameStaticMap staticMap;
	private GameDynamicMap dynamicMap;

	
	// Constructors
	
	public Engine(GameConfig gameConfig, ArrayList<LobbyUser> connectedUsers, GameStaticMap gameMap) {
		
		this.staticMap = gameMap;
		this.dynamicMap = new GameDynamicMap(staticMap);
		
	}
	
	
	// Game flow methods
	
	public void start() {
		
		// Mark engine as running
		this.isRunning = true;
		
	}
	
	
	// Game request method
	
	public GameplayResponse processGameplayRequest(GameplayRequest gameplayRequest) {
		
		
		// Return failed response
		return new GameplayResponse();
	}

}
