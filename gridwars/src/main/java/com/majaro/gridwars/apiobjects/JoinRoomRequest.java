package com.majaro.gridwars.apiobjects;

public class JoinRoomRequest {
	private String user;
	private String lobbyId;
	
	public JoinRoomRequest() { }
	
	public JoinRoomRequest(String user, String lobbyId) {
		super();
		this.user = user;
		this.lobbyId = lobbyId;
	}
	
	public String getLobbyId() {
		return lobbyId;
	}

	public void setLobbyId(String lobbyId) {
		this.lobbyId = lobbyId;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}
}
