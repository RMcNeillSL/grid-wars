package com.majaro.gridwars.core;

import org.joda.time.DateTime;

public class Session {
	private String sessionId;
	private DateTime sessionExpiry;
	private int userId;
	private static final int MINUTES_UNTIL_TIMEOUT = 1;
	
	public Session(String sessionId, int userId) {
		this.sessionId = sessionId;
		this.userId = userId;
		this.sessionExpiry = new DateTime();
		this.sessionExpiry = this.sessionExpiry.plusMinutes(MINUTES_UNTIL_TIMEOUT);
	}
	
	public String getSessionId() {
		return this.sessionId;
	}
	
	public int getUserId() {
		return this.userId;
	}
	
	public DateTime getSessionExpiry() {
		return this.sessionExpiry;
	}
	
	public void extendSessionExpiry() {
		this.sessionExpiry = new DateTime();
		this.sessionExpiry = this.sessionExpiry.plusMinutes(MINUTES_UNTIL_TIMEOUT);
	}
}
