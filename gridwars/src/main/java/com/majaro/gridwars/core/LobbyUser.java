package com.majaro.gridwars.core;

import com.majaro.gridwars.entities.User;

public class LobbyUser {
	
	private int factionId = 0;
	private int playerNumber;
	private String playerColour;
	private int playerTeam;
	private boolean ready = false;
	private User linkedUser = null;
	
	public LobbyUser(User linkedUser, int playerNumber, String playerColour, int playerTeam) {
		this.linkedUser = linkedUser;
		this.playerNumber = playerNumber;
		this.playerColour = playerColour;
		this.playerTeam = playerTeam;
	}

	public int getFactionId() {
		return factionId;
	}

	public void setFactionId(int factionId) {
		this.factionId = factionId;
	}

	public int getPlayerNumber() {
		return playerNumber;
	}

	public void setPlayerNumber(int playerNumber) {
		this.playerNumber = playerNumber;
	}

	public String getPlayerColour() {
		return playerColour;
	}

	public void setPlayerColour(String playerColour) {
		this.playerColour = playerColour;
	}

	public int getPlayerTeam() {
		return playerTeam;
	}

	public void setPlayerTeam(int playerTeam) {
		this.playerTeam = playerTeam;
	}

	public boolean isReady() {
		return ready;
	}

	public void setReady(boolean ready) {
		this.ready = ready;
	}

	public User getLinkedUser() {
		return linkedUser;
	}

	public void setLinkedUser(User linkedUser) {
		this.linkedUser = linkedUser;
	}
}