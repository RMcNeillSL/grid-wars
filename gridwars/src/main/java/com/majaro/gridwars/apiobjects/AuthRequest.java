package com.majaro.gridwars.apiobjects;

public class AuthRequest {
	private String usernameAttempt;
	private String passwordAttempt;
	
	public String getUsernameAttempt() {
		return usernameAttempt;
	}
	
	public void setUsernameAttempt(String usernameAttempt) {
		this.usernameAttempt = usernameAttempt;
	}
	
	public String getPasswordAttempt() {
		return passwordAttempt;
	}
	
	public void setPasswordAttempt(String passwordAttempt) {
		this.passwordAttempt = passwordAttempt;
	}
}
