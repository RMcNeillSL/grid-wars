package com.majaro.gridwars.apiobjects;

public class MessageRequest {
	private String message;
	private String user;
	
	public MessageRequest() { }
	
	public MessageRequest(String user, String message) {
		super();
		this.message = message;
		this.setUser(user);
	}
	
	public String getMessage() {
		return message;
	}
	
	public void setMessage(String message) {
		this.message = message;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}
}
