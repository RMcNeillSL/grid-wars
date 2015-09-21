CONSTANTS = {

	// Misc constants
	SOCKET_SERVER : "ws://" + window.location.host + ":8080/",

	// ******************* SOCKET ON EVENTS ****************** //
	SOCKET_REC_CONNECT					: "connect",
	SOCKET_REC_DISCONNECT				: "disconnect",

	// Server lobby socket on events
	SOCKET_REC_SERVER_LOBBY_UPDATE		: "updateServerLobby",
	SOCKET_REC_REFRESH_GAME_LOBBY		: "refreshGameLobby",

	// Game lobby socket on events
	SOCKET_REC_CHAT_MESSAGE				: "gameLobbyMessage",
	SOCKET_REC_USER_JOINED_GAME_LOBBY	: "userJoinedGameLobby",
	SOCKET_REC_GAME_CONFIG				: "gameConfig",
	SOCKET_REC_LOBBY_USER_LIST			: "lobbyUserList",
	SOCKET_REC_MAP_CHANGE_ERROR			: "mapChangeError",
	SOCKET_REC_TOGGLE_USER_READY		: "toggleUserReady",
	SOCKET_REC_CHANGE_USER_COLOUR		: "changeUserColour",
	SOCKET_REC_CHANGE_USER_TEAM			: "changeUserTeam",
	SOCKET_REC_GAME_INIT				: "gameInitialising",
	SOCKET_REC_LEADER_CHANGED			: "leaderChanged",
	SOCKET_REC_USER_LEFT_GAME_LOBBY		: "userLeftLobby",
	SOCKET_REC_LEFT_LOBBY				: "leftLobby",
	SOCKET_REC_ROOM_DELETED				: "roomDeleted",
	
	// Game socket on events
	SOCKET_REC_GAME_JOIN				: "gameJoin",
	SOCKET_REC_ACTUAL_GAME_INIT			: "gameInit",
	SOCKET_REC_GAME_START				: "gameStart",
	SOCKET_REC_GAMEPLAY_RESPONSE		: "gameplayResponse",

	// ***************** SOCKET EMIT EVENTS ****************** //
	SOCKET_SEND_TEST_MESSAGE			: "sendTestMessage",

	// Server lobby socket emit events
	SOCKET_SEND_JOIN_SERVER_LOBBY 		: "joinServerLobby",
	SOCKET_SEND_REFRESH_GAME_LOBBY 		: "refreshGameLobby",
	SOCKET_SEND_LEAVE_SERVER_LOBBY 		: "leaveServerLobby",
	SOCKET_SEND_GET_SERVERS				: "getServerList",

	// Game lobby socket emit events
	SOCKET_SEND_JOIN_GAME_LOBBY			: "joinGameLobby",
	SOCKET_SEND_CHAT_MESSAGE			: "sendMessage",
	SOCKET_SEND_GET_NEW_CONFIG			: "getNewConfig",
	SOCKET_SEND_GET_NEW_USER_LIST		: "getNewUserList",
	SOCKET_SEND_UPDATE_GAME_CONFIG		: "updateGameConfig",
	SOCKET_SEND_USER_TOGGLE_READY		: "userToggleReady",
	SOCKET_SEND_USER_CHANGE_COLOUR		: "userChangeColour",
	SOCKET_SEND_USER_CHANGE_TEAM		: "userChangeTeam",
	SOCKET_SEND_GAME_INIT				: "startGameInitialisation",
	SOCKET_SEND_CHANGE_LOBBY_LEADER		: "changeLobbyLeader",
	SOCKET_SEND_LEAVE_GAME_LOBBY		: "leaveLobby",
	
	// Game socket emit events
	SOCKET_SEND_JOIN_GAME				: "joinGame",
	SOCKET_SEND_ACTUAL_GAME_INIT		: "initGame",
	SOCKET_SEND_START_GAME				: "startGame",
	SOCKET_SEND_GAMEPLAY_REQUEST		: "gameplayRequest",
	SOCKET_SEND_GAME_COMPLETE			: "gameCompleted",

	// Core properties
	GAME_NAME : "gridwars-engine",
	TILE_WIDTH : 100,
	TILE_HEIGHT : 100,
	GAME_BUILDINGS : [],
	GAME_UNITS : [],

	// Directory locations
	ROOT_SPRITES_LOC : "app/assets/",

	// Loaded image(.png) names
	SPRITE_TURRET : "sprite_turret_anim",
	SPRITE_TANK : "sprite_tank_anim",
	SPRITE_TANK_TRACKS : "sprite_tank_tracks",
	PARTICLE_YELLOW_SHOT : "particle_yellow_shot",

	// Explosion and impact decal images
	EXPLOSION_DAMAGE_TIMEOUT : 500,
	SPRITE_IMPACT_DECALS : "impact_decals",
	SPRITE_EXPLOSION_A : "sprite_explosion_a",
	SPRITE_EXPLOSION_B : "sprite_explosion_b",
	SPRITE_EXPLOSION_C : "sprite_explosion_c",
	SPRITE_EXPLOSION_D : "sprite_explosion_d",
	DEBRIS_TANK : "",
	
	// Camera constants
	CAMERA_SPRITE : "camera",
	CAMERA_VELOCITY : 5,

	// Map tile image references
	MAP_TILE_PLACEMENT 			: "tile_build",
	MAP_TILE_A 					: "map_tile_a",
	ROCK_TILE_A 				: "rock_tile_a",
	ROCK_TILE_B	 				: "rock_tile_b",
	EDGE_ROCKS_TOP				: "edgeRocksTop",
	EDGE_ROCKS_RIGHT			: "edgeRocksRight",
	EDGE_ROCKS_BOTTOM			: "edgeRocksBottom",
	EDGE_ROCKS_LEFT				: "edgeRocksLeft",
	CORNER_ROCKS_TOP_LEFT		: "cornerRocksTopLeft",
	CORNER_ROCKS_TOP_RIGHT 		: "cornerRocksTopRight",
	CORNER_ROCKS_BOTTOM_LEFT 	: "cornerRocksBottomLeft",
	CORNER_ROCKS_BOTTOM_RIGHT	: "cornerRocksBottomRight",

	// Colour variation arrays
	COLOUR_ : {
		"TURRET" : [{ COLOUR : "blue", BASE : 0, TOP : 1, CHARGE : [1,2,3,4,5], COOL : [5,4,3,2,1], FIREANDCOOL : [6,7,8,9,10,11,12,1] },
	                { COLOUR : "red", BASE : 13, TOP : 14, CHARGE : [14,15,16,17,18], COOL : [18,17,16,15,14], FIREANDCOOL : [19,20,21,22,23,24,25,14] },
	                { COLOUR : "purple", BASE : 26, TOP : 27, CHARGE : [27,28,29,30,31], COOL : [31,30,29,28,27], FIREANDCOOL : [32,33,34,35,36,37,38,27] },
	                { COLOUR : "green", BASE : 39, TOP : 40, CHARGE : [40,41,42,43,44], COOL : [44,43,42,41,40], FIREANDCOOL : [45,46,47,48,49,50,51,40] },
	                { COLOUR : "yellow", BASE : 52, TOP : 53, CHARGE : [53,54,55,56,57], COOL : [57,56,55,54,53], FIREANDCOOL : [58,59,60,61,62,63,64,53] },
	                { COLOUR : "cyan", BASE : 65, TOP : 66, CHARGE : [66,67,68,69,70], COOL : [70,69,68,67,66], FIREANDCOOL : [71,72,73,74,75,76,77,66] } ],
	    "TANK" :   [{ COLOUR : "blue", BODY : 0, TURRET : 1, FIRE : [2,3,4,5,1] },
	              	{ COLOUR : "red", BODY : 6, TURRET : 7, FIRE : [8,9,10,11,7] },
	              	{ COLOUR : "purple", BODY : 12, TURRET : 13, FIRE : [14,15,16,17,13] },
	              	{ COLOUR : "green", BODY : 18, TURRET : 19, FIRE : [20,21,22,23,19] },
	              	{ COLOUR : "yellow", BODY : 24, TURRET : 25, FIRE : [26,27,28,29,25] },
	              	{ COLOUR : "cyan", BODY : 30, TURRET : 31, FIRE : [32,33,34,35,31] } ],
	}
}