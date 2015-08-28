package com.majaro.gridwars.api;

import javax.ws.rs.Path;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.websocket.server.PathParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.AuthRequest;
import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.RegRequest;
import com.majaro.gridwars.core.RequestProcessor;
import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;

@Produces("application/json")
@Path("/")
public class REST {
	private final static RequestProcessor requestProcessor = new RequestProcessor();
	
	@Context private HttpServletRequest request;
	
	@POST
	@Path("/auth")
	// If session already authenticated, skips the authentication
	// otherwise tries to authenticate the user with provided credentials
	// if successful returns 200 (ok), 409 (conflict) if user already logged in
	// and 401 if incorrect credentials were provided.
	public Response Authenticate(AuthRequest authRequest) {
		String sessionId = request.getSession(true).getId();
		
		if(!requestProcessor.isSessionAuthenticated(sessionId)) {
			int authResponse = requestProcessor.authenticate(sessionId, authRequest);
			return Response.status(authResponse).build();
		} else {
			return Response.status(200).build();
		}
	}
	
	@POST
	@Path("/register")
	// attempts to create a user with the provided credentials
	// if the user already exists then returns 400 (bad request)
	// if successful returns 200 (ok)
	// else returns 500 (server error)
	public Response Register(RegRequest regRequest) {
		int response = requestProcessor.register(regRequest);
		return Response.status(response).build();
	}
	
	@GET
	@Path("/testauth")
	public Response TestAuth() {
		if(checkAuth()) {
			return Response.ok().build();
		}
		
		return Response.status(401).build();
	}
	
	@POST
	@Path("/logout")
	// Does not return anything, if the user is logged in
	// the user is logged out else nothing happens.
	public Response LogOut() {
		String sessionId = request.getSession(true).getId();
		
		if(checkAuth()) {
			requestProcessor.LogOut(sessionId);
			return Response.ok().build();
		}
		
		return Response.status(401).build();
	}
	
	private boolean checkAuth() {
		String sessionId = request.getSession(true).getId();
		return requestProcessor.isSessionAuthenticated(sessionId);
	}
	
	@GET
	@Path("/game/new")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response GameNew() {
		String sessionId = request.getSession(true).getId();
		int responseCode = requestProcessor.newGame(sessionId);
		if (responseCode == 200) {
			return Response.ok().build();
		} else {
			return Response.status(500).build();
		}
	}

	@GET
	@Path("/game/list")
	@JsonView(GameLobby.Views.Summary.class)
	public Response GameList() {
		ArrayList<GameLobby> gameLobbys = requestProcessor.listGames();
		return Response.ok(gameLobbys).build();
	}
	
	@GET
	@Path("/game/join{lobbyId}")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response GameJoin(@PathParam("lobbyId") int lobbyId) {
		int responseCode = requestProcessor.joinGame(lobbyId);
		if (responseCode == 200) {
			return Response.ok().build();
		} else {
			return Response.status(500).build();
		}
	}

	@GET
	@Path("/game/start")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response GameStart() {
		int responseCode = requestProcessor.startGame();
		if (responseCode == 200) {
			return Response.ok().build();
		} else {
			return Response.status(500).build();
		}
	}
	
}
