package com.majaro.gridwars.core;

import org.joda.time.DateTime;

import com.majaro.gridwars.entities.User;

public class Session {
	private String sessionId;
	private DateTime sessionExpiry;
	private String socketSessionId = null;
	private User user;
	private static final int MINUTES_UNTIL_TIMEOUT = 15;
	
	public Session(String sessionId, User user) {
		this.sessionId = sessionId;
		this.user = user;
		this.sessionExpiry = new DateTime();
		this.sessionExpiry = this.sessionExpiry.plusMinutes(MINUTES_UNTIL_TIMEOUT);
	}
	
	public void bindSocketSessionId(String socketSessionId) {
//		if (this.socketSessionId == null) {
			this.socketSessionId = socketSessionId;
//		}
	}
	
	public String getSocketSessionId() {
		return this.socketSessionId;
	}
	
	public String getSessionId() {
		return this.sessionId;
	}
	
	public User getUser() {
		return this.user;
	}
	
	public DateTime getSessionExpiry() {
		return this.sessionExpiry;
	}
	
	public void extendSessionExpiry() {
		this.sessionExpiry = new DateTime();
		this.sessionExpiry = this.sessionExpiry.plusMinutes(MINUTES_UNTIL_TIMEOUT);
	}
}
