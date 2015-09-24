package com.majaro.gridwars.game;

import java.util.Timer;

import com.majaro.gridwars.game.Const.GameObject;

public class PurchaseRequest {
	
	// Identify purchase
	private GameObject sourceObject = null;
	private String objectId = null;
	
	// Record purchase time
	private long startTime = 0;
	
	// Constructor
	public PurchaseRequest(GameObject sourceObject, String objectId) {
		
		// Save passed values
		this.sourceObject = sourceObject;
		this.objectId = objectId;
	}
	
	// Timer methods
	public void buildTimeStart() { this.startTime = System.currentTimeMillis(); }
	public boolean buildComplete(long DesiredTime) { return (System.currentTimeMillis() - this.startTime >= DesiredTime); }
	
	// Getters
	public GameObject getSourceObject() { return this.sourceObject; }
	public String getObjectId() { return this.objectId; }
}
