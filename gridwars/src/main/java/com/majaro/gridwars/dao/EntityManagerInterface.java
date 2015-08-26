package com.majaro.gridwars.dao;

import com.majaro.gridwars.entities.User;

public interface EntityManagerInterface {
	User getUser(String id);
}
