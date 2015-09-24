package com.majaro.gridwars.game;

import java.util.ArrayList;

import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.game.Const.E_TechLevel;
import com.majaro.gridwars.game.Const.GameObject;

public class Player {
	
	// Core player variables
	private int playerId = 0;
	private String playerName = "";
	private E_TechLevel techLevel = E_TechLevel.TECH_01;
	private int cash = 0;
	private Coordinate spawnCoordinate = null;
	private ArrayList<PurchaseRequest> purchaseQueue = null;
	
	// Constructor
	public Player(LobbyUser lobbyUser, int startingCash, Coordinate spawnCoordinate) {
		
		// Set default variables
		this.techLevel = E_TechLevel.TECH_01;
		this.cash = startingCash;
		
		// Populate core variables from lobby user
		this.playerId = lobbyUser.getLinkedUser().getId();
		this.playerName = lobbyUser.getLinkedUser().getUsername();
		
		// Save spawn coordinates
		this.spawnCoordinate = spawnCoordinate;
		
		// Create purchase queue array
		this.purchaseQueue = new ArrayList<PurchaseRequest>();
	}
	
	// Purchase request methods
	public PurchaseRequest purchaseGameObject(GameObject sourceObject, String objectId) {
		PurchaseRequest purchaseRequest = new PurchaseRequest(sourceObject, objectId);
		this.purchaseQueue.add(purchaseRequest);
		return purchaseRequest;
	}
	public PurchaseRequest getPurchaseRequestFromId(String objectId) {
		for (int index = 0; index < this.purchaseQueue.size(); index ++) {
			if (this.purchaseQueue.get(index).getObjectId().equals(objectId)) {
				return this.purchaseQueue.get(index);
			}
		}
		return null;
	}
	public void removePlayerPurchaseObject(String objectId) {
		PurchaseRequest purchaseRequest = this.getPurchaseRequestFromId(objectId);
		this.purchaseQueue.remove(purchaseRequest);
	}
	public boolean buildingInProgress(GameObject sourceObject) {
		for (int index = 0; index < this.purchaseQueue.size(); index ++) {
			if (this.purchaseQueue.get(index).getSourceObject().getClass().equals(sourceObject.getClass())) {
				return true;
			}
		}
		return false;
	}
	
	// Common checking functions
	public boolean playerHasTechLevel(GameObject gameBuilding) {
		return gameBuilding.validFromTechLevel(this.techLevel);
	}
	public boolean playerHasCash(GameObject gameBuilding) {
		boolean hasCash = this.cash >= gameBuilding.getCost();
		if(hasCash) {
			removePlayerCash(gameBuilding.getCost());
		}
		return hasCash;
	}
	
	// Getters
	public int getPlayerId() { return this.playerId; }
	public String getPlayerName() { return this.playerName; }
	public int getPlayerCash() { return this.cash; }
	public Coordinate getSpawnCoordinate() { return this.spawnCoordinate; }
	
	// Setters
	public int addPlayerCash(int cash) {
		this.cash = this.cash + cash;
		return this.cash;
	}
	public int removePlayerCash(int cash) {
		this.cash = this.cash - cash;
		return this.cash;
	}
	
}
