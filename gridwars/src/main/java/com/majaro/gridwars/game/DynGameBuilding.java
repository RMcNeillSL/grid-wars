package com.majaro.gridwars.game;

import java.util.ArrayList;

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
	protected Coordinate coordinate = null;
	protected String instanceId = "";
	
	// Production building coordiantes
	private Coordinate deployCoordinate;
	
	// Constructor
	public DynGameBuilding(String instanceId, GameBuilding sourceBuilding, Player playerRef, Coordinate coordinate) {
		
		// Call super
		super(sourceBuilding);
		
		// Save source
		this.source = sourceBuilding;
		
		// Save passed values
		this.playerRef = playerRef;
		this.coordinate = coordinate;
		this.instanceId = instanceId;
		
		// Calculate deploy coordiante
		this.setDeployCoordinate();
	}

	// State methods
	public boolean isDead() { return (this.health < 0); }
	
	// Deploying item coordinates
	private void setDeployCoordinate() {

		// Set default deploy coordinate
		this.deployCoordinate = null;
		
		// Construct deploy coordinates for relevant production buildings
		if (this.source.identifier == "HUB") { this.deployCoordinate = new Coordinate(this.coordinate.getCol() + 1, this.coordinate.getRow() - 1); }
	}
	public Coordinate getDeployCoordinate() { return this.deployCoordinate; }
	
	// Setter methods
	public void updateCoordinate(Coordinate newCoordinate) { this.coordinate = newCoordinate; }
	public void takeDamage(int damageAmount) { this.health = this.health - damageAmount; }
	
	// Overriden getters
	@Override
	public int getHealth() { return this.health; }
	@Override
	public int getCost() { return this.cost; }
	@Override
	public int getPower() { return this.power; }

	// Unique getters for dynamic values
	public Player getOwner() { return this.playerRef; }
	public Coordinate getCoordinate() { return this.coordinate; }
	public Coordinate[] getCoordinates() {
		ArrayList<Coordinate> coordinates = new ArrayList<Coordinate>();
		for (int yCount = 0; yCount < this.getHeightCellCount(); yCount ++) {
			for (int xCount = 0; xCount < this.getWidthCellCount(); xCount ++) {
				coordinates.add(new Coordinate(this.getCoordinate().getCol() + xCount, this.getCoordinate().getRow() + yCount));
			}
		}
		return coordinates.toArray(new Coordinate[coordinates.size()]);
	}
	
	// Unique getters for values from super objects
	public int getMaxHealth() { return super.health; }
	public int getMaxCost() { return super.cost; }
	public int getMaxPower() { return super.power; }

	// DynGameObject interface methods
	public String getInstanceId() {
		return this.instanceId;
	}
	
	// Debugging methods
	public String toString() {
		String superResult = super.toString();
		return superResult + " " + this.instanceId;
	}
	
}
