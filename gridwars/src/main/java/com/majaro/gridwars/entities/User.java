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
	
	public String bytesToHex(byte[] in) {
	    final StringBuilder builder = new StringBuilder();
	    for(byte b : in) {
	        builder.append(String.format("%02x", b));
	    }
	    return builder.toString();
	}
	
	public boolean validateCredentials(String passAttempt) {
		passAttempt += salt;
		String hashedPassAttempt = null;
		
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			md.update(passAttempt.getBytes("UTF-8"));
			byte[] digest = md.digest();
			hashedPassAttempt = bytesToHex(digest);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}

		return hashedPassAttempt.equals(password);
	}

	public static class Views {
		public static class Details extends Summary {
		}

		public static class Summary {
		}
	}
}
