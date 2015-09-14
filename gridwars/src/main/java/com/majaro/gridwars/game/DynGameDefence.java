package com.majaro.gridwars.game;

import com.majaro.gridwars.game.Const.GameDefence;

public class DynGameDefence extends DynGameBuilding {

	// Hidden (inherited) variables
	private int range;
	private int damage;

	// Player link
	private Player playerRef = null;
	
	// Core building object variables
	private int cellX = 0;
	private int cellY = 0;
	
	// Constructor
	public DynGameDefence(String instanceId, GameDefence sourceDefence, Player playerRef, int cellX, int cellY) {
		
		// Call super
		super(instanceId, sourceDefence, playerRef, cellX, cellY);
		
		// Save passed values
		this.playerRef = playerRef;
		this.cellX = cellX;
		this.cellY = cellY;
		
		// Inherited variables
		this.range = sourceDefence.getRange();
		this.damage = sourceDefence.getDamage();
		
	}
	
	// Overriden getters
	public int getRange() { return this.range; }
	public int getDamage() { return this.damage; }

	// Unique getters for dynamic values
	public Player getOwner() { return this.playerRef; }
	
	// Unique getters for values from super objects
//	public int getMaxRange() { return super.range; }
//	public int getMaxDamage() { return super.damage; }
	
}
