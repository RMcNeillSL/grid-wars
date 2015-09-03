package com.majaro.gridwars.dao;

import com.majaro.gridwars.entities.User;

public interface EntityManagerInterface {
	int authenticate(String usernameAttempt, String passwordAttempt);
	int register(String newUsername, String newPassword);
	User getUser(int userId);
}
