package com.majaro.gridwars.game;

import java.util.ArrayList;

import com.majaro.gridwars.game.Const.GameUnit;

public class DynGameUnit extends GameUnit implements DynGameObject {
	
	// Player link
	private Player playerRef = null;
	private GameUnit source = null;

	// Core building object variables
	protected Coordinate coordinate = null;
	protected String instanceId = "";
	protected ArrayList<Coordinate> waypoints = null;
	
	// Constructor
	public DynGameUnit(String instanceId, GameUnit sourceUnit, Player playerRef, Coordinate coordinate) {
		
		// Call super
		super(sourceUnit);
		
		// Save source
		this.source = sourceUnit;
		
		// Save passed values
		this.playerRef = playerRef;
		this.coordinate = coordinate;
		this.waypoints = new ArrayList<Coordinate>();
		this.instanceId = instanceId;
	}
	
	// State methods
	public boolean isDead() { return (this.health < 0); }
	
	// Waypoint methods
	public boolean doesUnitWaypointEnterCoord(Coordinate coord) {
		for (int index = 0; index < this.waypoints.size(); index++) {
			if (this.waypoints.get(index).equals(coord)) {
				return true;
			}
		}
		return false;
	}
	public Coordinate getWaypointEndCoordinate() {
		if (this.waypoints.size() > 0) {
			return this.waypoints.get(this.waypoints.size()-1);
		} else {
			return null;
		}
	}
	public void clearWaypoints() { this.waypoints.clear(); }
	public void setWaypoints(ArrayList<Coordinate> waypoints) { this.waypoints = waypoints; }
	public Coordinate getWaypoint(int futureState) {
		if (this.waypoints.size() < futureState) {
			return this.waypoints.get(futureState);
		} else {
			return null;
		}
	}
	public Coordinate[] getWaypoints() {
		if (this.waypoints == null) {
			return null;
		} else {
			return this.waypoints.toArray(new Coordinate[this.waypoints.size()]);
		}
	}
	
	// Setter methods
	public void updateCoordinate(Coordinate newCoordinate) { this.coordinate = newCoordinate; }
	public void takeDamage(int damageAmount) { this.health = this.health - damageAmount; }
	
	// Getter methods
	public Player getOwner() { return this.playerRef; }
	public Coordinate getCoordinate() { return this.coordinate; }

	// DynGameObject interface methods
	public String getInstanceId() {
		return this.instanceId;
	}
	
}
