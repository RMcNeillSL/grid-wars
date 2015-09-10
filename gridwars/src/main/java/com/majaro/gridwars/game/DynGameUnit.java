package com.majaro.gridwars.game;

import com.majaro.gridwars.game.Const.GameUnit;

public class DynGameUnit extends GameUnit implements DynGameObject {
	
	// Player link
	private Player playerRef = null;
	
	// Constructor
	public DynGameUnit(GameUnit sourceUnit) {
		
		// Call super
		super(sourceUnit);
		
	}

	// DynGameObject interface methods
	public String getObjectId() {
		return null;
	}
	
}
