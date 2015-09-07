package com.majaro.gridwars.apiobjects;

public class BindSocketRequest {
	
	private String user;
	
	public BindSocketRequest() { }
	public BindSocketRequest(String user) {
		this.user = user;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

}
