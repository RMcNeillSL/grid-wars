package com.majaro.gridwars.api;

import javax.ws.rs.Path;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.apiobjects.AuthRequest;
import com.majaro.gridwars.apiobjects.GameJoinResponse;
import com.majaro.gridwars.apiobjects.RegRequest;
import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.RequestProcessor;
import com.majaro.gridwars.game.GameStaticMap;

@Produces("application/json")
@Path("/")
public class REST {
	
	// TODO: Look at injection or inversion of control (inject at startup hook)
	private RequestProcessor requestProcessor = RequestProcessor.getInstance();
	private final Response unauthResponse = Response.status(401).build();

	@Context
	private HttpServletRequest request;

	@POST
	@Path("/auth")
	// If session already authenticated, skips the authentication
	// otherwise tries to authenticate the user with provided credentials
	// if successful returns 200 (ok), 409 (conflict) if user already logged in
	// and 401 if incorrect credentials were provided.
	public Response Authenticate(AuthRequest authRequest) {
		String sessionId = request.getSession(true).getId();
		String authResponse = "";
		authResponse = requestProcessor.authenticate(sessionId, authRequest);
		if(authRequest.getUsernameAttempt().toUpperCase().equals(authResponse.toUpperCase())) {
			return Response.ok(authResponse).build();
		} else {
			return Response.status(Integer.parseInt(authResponse)).build();
		}
//		if (!requestProcessor.isSessionAuthenticated(sessionId)) {
//			authResponse = requestProcessor.authenticate(sessionId, authRequest);
//			if(authRequest.getUsernameAttempt().toUpperCase().equals(authResponse.toUpperCase())) {
//				return Response.ok(authResponse).build();
//			} else {
//				return Response.status(Integer.parseInt(authResponse)).build();
//			}
//		} else {
//			return Response.ok().build();
//		}
	}

	@POST
	@Path("/checkauth")
	// Checks to see if the current users session is authenticated and returns username of logged in user.
	public Response IsAuthenticated() {
		String sessionId = request.getSession(true).getId();
		String user = null;
		if (requestProcessor.isSessionAuthenticated(sessionId)) {
			user = requestProcessor.getUserFromRESTSessionId(sessionId).getUsername();
		}
		return Response.ok(user).build();
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

	@POST
	@Path("/logout")
	// Does not return anything, if the user is logged in
	// the user is logged out else nothing happens.
	public Response LogOut() {
		String sessionId = request.getSession(true).getId();

		if (checkAuth()) {
			requestProcessor.LogOut(sessionId);
			return Response.ok().build();
		}

		return unauthResponse;
	}

	private boolean checkAuth() {
		String sessionId = request.getSession(true).getId();
		return requestProcessor.isSessionAuthenticated(sessionId);
	}

	@POST
	@Path("/game/new")
	@JsonView(GameJoinResponse.Views.Summary.class)
	public Response GameNew() {
		if (checkAuth()) {
			String sessionId = request.getSession(true).getId();
			GameJoinResponse gameJoinResponse = requestProcessor.newGame(sessionId);
			if (gameJoinResponse != null) {
				return Response.ok(gameJoinResponse).build();
			} else {
				return Response.status(500).build();
			}
		}

		return unauthResponse;
	}

	@GET
	@Path("/game/list")
	@JsonView(GameLobby.Views.Summary.class)
	public Response GameList() {
		if (checkAuth()) {
			ArrayList<GameLobby> gameLobbys = requestProcessor.listGames();
			return Response.ok(gameLobbys).build();
		}

		return unauthResponse;
	}

	@GET
	@Path("/game/maps")
	@JsonView(GameStaticMap.Views.Summary.class)
	public Response MapList() {
		if (checkAuth()) {
			ArrayList<GameStaticMap> gameMaps = requestProcessor.listGameMaps();
			return Response.ok(gameMaps).build();
		}
		return unauthResponse;
	}

	@POST
	@Path("/game/join")
	@JsonView(GameJoinResponse.Views.Summary.class)
	public Response GameJoin(String lobbyId) {
		if (checkAuth()) {
			String sessionId = request.getSession(true).getId();
			GameJoinResponse gameJoinResponse = requestProcessor.joinGame(lobbyId, sessionId);
			if (gameJoinResponse != null) {
				return Response.ok(gameJoinResponse).build();
			} else {
				return Response.status(500).build();
			}
		}

		return unauthResponse;
	}

	@GET
	@Path("/user/game")
	@JsonView(GameJoinResponse.Views.Summary.class)
	public Response GetUserGame() {
		if (checkAuth()) {
			String sessionId = request.getSession(true).getId();
			GameJoinResponse gameJoinResponse = requestProcessor.getUsersGame(sessionId);
			if (gameJoinResponse != null) {
				return Response.ok(gameJoinResponse).build();
			} else {
				return Response.status(500).build();
			}
		}
		return unauthResponse;
	}

}
