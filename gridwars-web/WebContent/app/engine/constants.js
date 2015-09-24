CONSTANTS = {

	// Misc constants
	SOCKET_SERVER : "ws://" + window.location.host + ":8080/",

	
	// ******************* SOCKET ON EVENTS ****************** //
	
	// Core disconnect and reconnect events
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
	
	// Testing emit event
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

	
	// ***************** CURSOR SPRITES AND IDS ****************** //
	
	// Sprite file and frame sequences
	SPRITE_CURSORS : "sprite_cursors",
	CURSOR_SPRITE_NORMAL 				: [0],
	CURSOR_SPRITE_NORMAL_ENEMY 			: [1],
	CURSOR_SPRITE_INVALID 				: [2],
	CURSOR_SPRITE_ATTACK 				: [10,11,12,13,14,15,16,15,14,13,12,11],
	CURSOR_SPRITE_FORCE_ATTACK 			: [3,4,5,6,7,8,9,8,7,6,5,4],
	CURSOR_SPRITE_MOVE 					: [19,18,17,18,19,20],
	CURSOR_SPRITE_MOVE_CLICK 			: [22,23,24,25,26,27,21],
	
	// Cursor form ids
	CURSOR_NORMAL 						: "cursor_normal",
	CURSOR_NORMAL_ENEMY 				: "cursor_normal_enemy",
	CURSOR_INVALID 						: "cursor_invalid",
	CURSOR_ATTACK 						: "cursor_attack",
	CURSOR_FORCE_ATTACK 				: "cursor_force_attack",
	CURSOR_MOVE 						: "cursor_move",
	CURSOR_MOVE_CLICK 					: "cursor_move_click",

	// Core properties
	GAME_NAME : "gridwars-engine",
	GAME_SCREEN_WIDTH: 1400,
	GAME_SCREEN_HEIGHT: 700,
	TILE_WIDTH : 100,
	TILE_HEIGHT : 100,
	GAME_BUILDINGS : [],
	GAME_UNITS : [],

	// Directory locations
	ROOT_SPRITES_LOC : "app/assets/",
	
	// Game frame sprites
	MINI_MAP : "mini_map",
	MINI_MAP_BUTTONS : "mini_map_buttons",
	UNIT_DETAILS : "unit_details",
	TANK_ICON : "tank_icon",
	TURRET_ICON : "turret_icon",
	
	// Minimaps
	MINIMAP_MAJARO : "minimap_majaro",
	
	// Game frame properties
	MINI_MAP_WIDTH : 377,
	MINI_MAP_HEIGHT : 365,
	UNIT_DETAILS_WIDTH : 274,
	UNIT_DETAILS_HEIGHT : 226,
	
	// Loaded image(.png) names
	SPRITE_HUB : "sprite_hub_anim",
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
	MAP_TILE_SPRITESHEET		: "map_tiles",
	MAP_BASE_DIRT				: 0,
	MAP_BASE_GRASS				: 1,
	MAP_BASE_WATER				: 2,
	MAP_BASE_ROCK				: 3,

	MAP_DETAIL_ROCKS_EDGE		: 8,
	MAP_DETAIL_ROCKS_CORNER		: 9,
	MAP_DETAIL_ROCKS_A			: 10,
	MAP_DETAIL_ROCKS_B			: 11,
	MAP_DETAIL_ROCKS_C			: 12,
	MAP_DETAIL_ROCKS_D			: 13,
	MAP_DETAIL_ROCKS_E			: 14,
	MAP_DETAIL_ROCKS_ICORNER	: 15,

	MAP_DETAIL_WATER_TOP		: 16,
	MAP_DETAIL_WATER_RIGHT		: 17,
	MAP_DETAIL_WATER_BOTTOM		: 18,
	MAP_DETAIL_WATER_LEFT		: 19,
	MAP_DETAIL_WATER_BR			: 20,
	MAP_DETAIL_WATER_TR			: 21,
	MAP_DETAIL_WATER_BL			: 22,
	MAP_DETAIL_WATER_TL			: 23,

	MAP_DETAIL_SHORE_BOTTOM		: 24,
	MAP_DETAIL_SHORE_LEFT		: 25,
	MAP_DETAIL_SHORE_TOP		: 26,
	MAP_DETAIL_SHORE_RIGHT		: 27,
	MAP_DETAIL_SHORE_BR			: 28,
	MAP_DETAIL_SHORE_TR			: 29,
	MAP_DETAIL_SHORE_BL			: 30,
	MAP_DETAIL_SHORE_TL			: 31,

	MAP_DETAIL_GRASS_TOP		: 32,
	MAP_DETAIL_GRASS_RIGHT		: 33,
	MAP_DETAIL_GRASS_BOTTOM		: 34,
	MAP_DETAIL_GRASS_LEFT		: 35,
	MAP_DETAIL_GRASS_BR			: 36,
	MAP_DETAIL_GRASS_TR			: 37,
	MAP_DETAIL_GRASS_BL			: 38,
	MAP_DETAIL_GRASS_TL			: 39,

	MAP_DETAIL_ROAD_VERT		: 40,
	MAP_DETAIL_ROAD_HORI		: 41,
	MAP_DETAIL_ROAD_VERT_JUNCT	: 42,
	MAP_DETAIL_ROAD_HORI_JUNCT	: 43,
	MAP_DETAIL_ROAD_VERT_END	: 44,
	MAP_DETAIL_ROAD_HORI_END	: 45,

	MAP_DETAIL_SHORE_ITR		: 48,
	MAP_DETAIL_SHORE_IBR		: 49,
	MAP_DETAIL_SHORE_IBL		: 50,
	MAP_DETAIL_SHORE_ITL		: 51,

	MAP_DETAIL_GRASS_IBR		: 52,
	MAP_DETAIL_GRASS_ITR		: 53,
	MAP_DETAIL_GRASS_ITL		: 54,
	MAP_DETAIL_GRASS_IBL		: 55,

	// Colour variation arrays
	COLOUR_ : {
		
		// Tank production building - opens up tank hanger doors - shows platform gradually getting lighter (rising)
		"HUB" :    [{ COLOUR : "blue", 		HUB : 11, 	SHADOW : 0,	OPEN : 10,	CLOSED : 19, 	OPENING : [12,13,14,15,16,17,18,19],	CLOSING : [19,18,17,16,15,14,13,12], 	RISE : [0,1,2,3,4,5,6,7,8,9],	SINK : [9,8,7,6,5,4,3,2,1,0] },
	                { COLOUR : "red", 		HUB : 21, 	SHADOW : 0, OPEN : 20, 	OPENING : [22,23,24,25,26,27,28,29], 	RISE : [0,1,2,3,4,5,6,7,8,9] },
	                { COLOUR : "purple", 	HUB : 31, 	SHADOW : 0, OPEN : 30, 	OPENING : [32,33,34,35,36,37,38,39], 	RISE : [0,1,2,3,4,5,6,7,8,9] },
	                { COLOUR : "green", 	HUB : 41, 	SHADOW : 0, OPEN : 40, 	OPENING : [42,43,44,45,46,47,48,49], 	RISE : [0,1,2,3,4,5,6,7,8,9] },
	                { COLOUR : "yellow", 	HUB : 51, 	SHADOW : 0, OPEN : 50, 	OPENING : [52,53,54,55,56,57,58,59], 	RISE : [0,1,2,3,4,5,6,7,8,9] },
	                { COLOUR : "cyan", 		HUB : 61, 	SHADOW : 0, OPEN : 60, 	OPENING : [62,63,64,65,66,67,68,69], 	RISE : [0,1,2,3,4,5,6,7,8,9] } ],
	    
	    // Turret defence - charges 4 lights - four lights fade out - fires with muzzleflash and recoil while lights fade out
		"TURRET" : [{ COLOUR : "blue", 		BASE : 0, 	TOP : 1, 		CHARGE : [1,2,3,4,5], 		COOL : [5,4,3,2,1], 		FIREANDCOOL : [6,7,8,9,10,11,12,1] },
	                { COLOUR : "red", 		BASE : 13, 	TOP : 14, 		CHARGE : [14,15,16,17,18], 	COOL : [18,17,16,15,14], 	FIREANDCOOL : [19,20,21,22,23,24,25,14] },
	                { COLOUR : "purple", 	BASE : 26, 	TOP : 27, 		CHARGE : [27,28,29,30,31], 	COOL : [31,30,29,28,27], 	FIREANDCOOL : [32,33,34,35,36,37,38,27] },
	                { COLOUR : "green", 	BASE : 39, 	TOP : 40, 		CHARGE : [40,41,42,43,44], 	COOL : [44,43,42,41,40], 	FIREANDCOOL : [45,46,47,48,49,50,51,40] },
	                { COLOUR : "yellow", 	BASE : 52, 	TOP : 53, 		CHARGE : [53,54,55,56,57], 	COOL : [57,56,55,54,53], 	FIREANDCOOL : [58,59,60,61,62,63,64,53] },
	                { COLOUR : "cyan", 		BASE : 65, 	TOP : 66, 		CHARGE : [66,67,68,69,70], 	COOL : [70,69,68,67,66], 	FIREANDCOOL : [71,72,73,74,75,76,77,66] } ],
	                
	    // Tank unit - shoots cannon with slight recoil and muzzleflash
	    "TANK" :   [{ COLOUR : "blue", 		BODY : 0, 	TURRET : 1, 	FIRE : [2,3,4,5,1] },
	              	{ COLOUR : "red", 		BODY : 6, 	TURRET : 7, 	FIRE : [8,9,10,11,7] },
	              	{ COLOUR : "purple", 	BODY : 12, 	TURRET : 13, 	FIRE : [14,15,16,17,13] },
	              	{ COLOUR : "green", 	BODY : 18, 	TURRET : 19, 	FIRE : [20,21,22,23,19] },
	              	{ COLOUR : "yellow", 	BODY : 24, 	TURRET : 25, 	FIRE : [26,27,28,29,25] },
	              	{ COLOUR : "cyan", 		BODY : 30, 	TURRET : 31, 	FIRE : [32,33,34,35,31] } ],
	}
}