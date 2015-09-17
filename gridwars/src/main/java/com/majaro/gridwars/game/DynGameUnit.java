package com.majaro.gridwars.game;

import com.majaro.gridwars.game.Const.GameBuilding;
import com.majaro.gridwars.game.Const.GameUnit;

public class DynGameUnit extends GameUnit implements DynGameObject {
	
	// Player link
	private Player playerRef = null;
	private GameUnit source = null;

	// Core building object variables
	protected Coordinate coordinate = null;
	protected String instanceId = "";
	
	// Constructor
	public DynGameUnit(String instanceId, GameUnit sourceUnit, Player playerRef, int cellX, int cellY) {
		
		// Call super
		super(sourceUnit);
		
		// Save source
		this.source = sourceUnit;
		
		// Save passed values
		this.playerRef = playerRef;
		this.coordinate = new Coordinate(cellX, cellY);	
		this.instanceId = instanceId;		
	}
	
	// Setter methods
	public void updateCoordinate(Coordinate newCoordinate) { this.coordinate = newCoordinate; }
	
	// Getter methods
	public Coordinate getCoordinate() { return this.coordinate; }

	// DynGameObject interface methods
	public String getInstanceId() {
		return this.instanceId;
	}
	
}
