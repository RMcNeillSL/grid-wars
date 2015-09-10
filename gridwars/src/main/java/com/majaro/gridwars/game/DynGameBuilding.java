package com.majaro.gridwars.game;

import com.majaro.gridwars.game.Const.GameBuilding;

public class DynGameBuilding extends GameBuilding implements DynGameObject {

	// Hidden (inherited) variables
	protected int health = super.health;
	protected int cost = super.cost;
	protected int power = super.power;

	// Refence objects
	protected Player playerRef = null;
	protected GameBuilding source = null;
	
	// Core building object variables
	protected int cellX = 0;
	protected int cellY = 0;
	
	// Constructor
	public DynGameBuilding(GameBuilding sourceBuilding, Player playerRef, int cellX, int cellY) {
		
		// Call super
		super(sourceBuilding);
		
		// Save source
		this.source = sourceBuilding;
		
		// Save passed values
		this.playerRef = playerRef;
		this.cellX = cellX;
		this.cellY = cellY;		
	}
	
	// Overriden getters
	@Override
	public int getHealth() { return this.health; }
	@Override
	public int getCost() { return this.cost; }
	@Override
	public int getPower() { return this.power; }

	// Unique getters for dynamic values
	public Player getOwner() { return this.playerRef; }
	
	// Unique getters for values from super objects
	public int getMaxHealth() { return super.health; }
	public int getMaxCost() { return super.cost; }
	public int getMaxPower() { return super.power; }

	// DynGameObject interface methods
	public String getObjectId() {
		return null;
	}
	
}
