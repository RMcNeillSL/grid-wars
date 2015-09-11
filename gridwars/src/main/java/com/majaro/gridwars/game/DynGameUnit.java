package com.majaro.gridwars.game;

import com.majaro.gridwars.game.Const.GameUnit;

public class DynGameUnit extends GameUnit implements DynGameObject {
	
	// Player link
	private Player playerRef = null;

	// Core building object variables
	protected int cellX = 0;
	protected int cellY = 0;
	protected String instanceId = "";
	
	// Constructor
	public DynGameUnit(GameUnit sourceUnit) {
		
		// Call super
		super(sourceUnit);
		
	}

	// DynGameObject interface methods
	public String getInstanceId() {
		return this.instanceId;
	}
	
}
