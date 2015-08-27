package com.majaro.gridwars.entities;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Random;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.GameLobby;

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
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public void setPassword(String newPass) {
		salt = generateSalt();
		newPass += salt;
		password = SHA512Hash(newPass);
	}
	
	private String generateSalt() {
		SecureRandom random = new SecureRandom();
		salt = new BigInteger(130, random).toString(16);
    }
	
	private String bytesToHex(byte[] in) {
	    final StringBuilder builder = new StringBuilder();
	    for(byte b : in) {
	        builder.append(String.format("%02x", b));
	    }
	    return builder.toString();
	}
	
	private String SHA512Hash(String input) {
		input += salt;
		String hashedPassAttempt = null;
		
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			md.update(input.getBytes("UTF-8"));
			byte[] digest = md.digest();
			hashedPassAttempt = bytesToHex(digest);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
		return hashedPassAttempt;
	}
	
	public boolean validateCredentials(String passAttempt) {
		return SHA512Hash(passAttempt).equals(password);
	}

	public static class Views {
		public static class Details extends Summary {
		}

		public static class Summary {
		}
	}
}
