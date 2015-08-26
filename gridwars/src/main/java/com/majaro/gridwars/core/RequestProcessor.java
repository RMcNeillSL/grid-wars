package com.majaro.gridwars.core;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;

import org.joda.time.DateTime;

import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;

public class RequestProcessor {

	private ArrayList<Session> activeSessions;
	private static final String PERSISTENCE_UNIT = "gridwars";
	private final EntityManager dao;
	private Thread sessionCleanUpThread;
	private Runnable sessionCleanUp;
	
	public RequestProcessor() {
		 this.activeSessions = new ArrayList<Session>();
		 this.dao = new EntityManager(PERSISTENCE_UNIT);
		 initialiseSessionCleanUp();
	}
	
	private void initialiseSessionCleanUp() {
		 this.sessionCleanUp = new Runnable() {
			public void run() {
				while(true) {
					if(activeSessions.size() > 0) {
						Iterator<Session> sessionIter = activeSessions.iterator();
						
						while (sessionIter.hasNext()) {
							Session session = sessionIter.next();
							
							if(session.getSessionExpiry().isBeforeNow())
							{
								sessionIter.remove();
							}
						}
					}
					
					try {
						Thread.sleep(30000);
					} catch (InterruptedException e) {
						System.out.println(e.getMessage());
					}
				}
			}
		 };
		 
		 this.sessionCleanUpThread = new Thread(sessionCleanUp);
		 this.sessionCleanUpThread.start();
	}
	
	private void addNewSession(String sessionId, int userId) {
		Session session = new Session(sessionId, userId);
		this.activeSessions.add(session);
	}
	
	public User getUser(String sessionId) {
		int userId = -1;
		
		for(Session s : activeSessions) {
			if(s.getSessionId() == sessionId) {
				userId = s.getUserId();
				break;
			}
		}
		
		return dao.getUser(userId);
	}
	
	public boolean isSessionAuthenticated(String sessionId) {
		boolean authenticated = false;
		
		for(Session s : activeSessions) {
			if(s.getSessionId() == sessionId) {
				s.extendSessionExpiry();
				authenticated = true;
				break;
			}
		}
				
		return authenticated;
	}
	
	public boolean authenticate(String sessionId, AuthRequest authRequest) {
		int userId = dao.Authenticate(authRequest.getUsernameAttempt(), authRequest.getPasswordAttempt());
		
		if(userId > -1) {
			addNewSession(sessionId, userId);
		}
		
		return userId > -1; 
	}
}
