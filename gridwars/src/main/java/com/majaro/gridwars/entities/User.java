package com.majaro.gridwars.entities;

import java.security.MessageDigest;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.codehaus.jackson.map.annotate.JsonView;

@Entity
@Table(name = "Users")
public class User {
	@Id
	private int userId;
	private String username;
	private String password;
	private String salt;

	@JsonView(User.Views.Summary.class)
	public int getId() {
		return userId;
	}

	@JsonView(User.Views.Summary.class)
	public String getUsername() {
		return username;
	}
	
	public boolean validateCredentials(String passAttempt) {
		passAttempt += salt;
		String hashedPassAttempt = null;
		
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			md.update(passAttempt.getBytes("UTF-8"));
			byte[] digest = md.digest();
			hashedPassAttempt = new String(digest, "UTF-8");
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}

		return hashedPassAttempt == password;
	}

	public static class Views {
		public static class Details extends Summary {
		}

		public static class Summary {
		}
	}
}
