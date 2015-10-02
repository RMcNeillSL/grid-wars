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
	
	
	// ***************** MOUSE CONSTANTS ****************** //
	
	// Mouse scrolling values
	CURSOR_SCROLL_REDUCTION				: 10,
	
	// Mouse scrolling cursors
	CURSOR_SCROLL_UP					: 0,
	CURSOR_SCROLL_DOWN					: 1,
	CURSOR_SCROLL_LEFT					: 2,
	CURSOR_SCROLL_RIGHT					: 3,
	CURSOR_SCROLL_DIAG_LU				: 4,
	CURSOR_SCROLL_DIAG_LD				: 5,
	CURSOR_SCROLL_DIAG_RU				: 6,
	CURSOR_SCROLL_DIAG_RD				: 7,

	
	// ***************** CURSOR SPRITES AND IDS ****************** //
	
	// Sprite file and frame sequences
	SPRITE_CURSORS 						: "sprite_cursors",
	CURSOR_SPRITE_NORMAL 				: [0],
	CURSOR_SPRITE_NORMAL_ENEMY 			: [1],
	CURSOR_SPRITE_INVALID 				: [2],
	CURSOR_SPRITE_ATTACK 				: [10,11,12,13,14,15,16,15,14,13,12,11],
	CURSOR_SPRITE_FORCE_ATTACK 			: [3,4,5,6,7,8,9,8,7,6,5,4],
	CURSOR_SPRITE_MOVE 					: [19,18,17,18,19,20],
	CURSOR_SPRITE_MOVE_CLICK 			: [22,23,24,25,26,27,21],
	CURSOR_SPRITE_SCROLL_UP				: [28],
	CURSOR_SPRITE_SCROLL_RIGHT			: [29],
	CURSOR_SPRITE_SCROLL_DOWN			: [30],
	CURSOR_SPRITE_SCROLL_LEFT			: [31],
	CURSOR_SPRITE_SCROLL_DIAG_RD		: [32],
	CURSOR_SPRITE_SCROLL_DIAG_LD		: [33],
	CURSOR_SPRITE_SCROLL_DIAG_LU		: [34],
	CURSOR_SPRITE_SCROLL_DIAG_RU		: [35],
	
	// Cursor form ids
	CURSOR_NORMAL 						: "cursor_normal",
	CURSOR_NORMAL_ENEMY 				: "cursor_normal_enemy",
	CURSOR_INVALID 						: "cursor_invalid",
	CURSOR_ATTACK 						: "cursor_attack",
	CURSOR_FORCE_ATTACK 				: "cursor_force_attack",
	CURSOR_MOVE 						: "cursor_move",
	CURSOR_MOVE_CLICK 					: "cursor_move_click",
	CURSOR_SCROLL_UP					: "cursor_move_up",
	CURSOR_SCROLL_RIGHT					: "cursor_move_right",
	CURSOR_SCROLL_DOWN					: "cursor_move_down",
	CURSOR_SCROLL_LEFT					: "cursor_move_left",
	CURSOR_SCROLL_DIAG_RD				: "cursor_move_diag_rd",
	CURSOR_SCROLL_DIAG_LD				: "cursor_move_diag_ld",
	CURSOR_SCROLL_DIAG_LU				: "cursor_move_diag_lu",
	CURSOR_SCROLL_DIAG_RU				: "cursor_move_diag_ru",

	// Core properties
	GAME_NAME 							: "gridwars-engine",
	GAME_SCREEN_WIDTH					: 1000,
	GAME_SCREEN_HEIGHT					: 800,
	TILE_WIDTH 							: 100,
	TILE_HEIGHT 						: 100,
	GAME_BUILDINGS 						: [],
	GAME_UNITS 							: [],

	// Directory locations
	ROOT_SPRITES_LOC 					: "app/assets/",
	
	// Game frame sprites
	MINI_MAP 							: "mini_map",
	MINI_MAP_BUTTONS 					: "mini_map_buttons",
	UNIT_DETAILS 						: "unit_details",
	UNIT_DETAILS_BUTTONS 				: "unit_details_buttons",
	TANK_ICON 							: "tank_icon",
	TURRET_ICON 						: "turret_icon",
	
	// Minimaps
	MINIMAP_MAJARO 						: "minimap_majaro",
	MINIMAP_HUNTING_GROUND 				: "minimap_hunting_ground",
	
	// Loaded image(.png) names
	SPRITE_HUB 							: "sprite_hub_anim",
	SPRITE_TURRET 						: "sprite_turret_anim",
	SPRITE_TANK 						: "sprite_tank_anim",
	SPRITE_TANK_TRACKS 					: "sprite_tank_tracks",
	PARTICLE_YELLOW_SHOT 				: "particle_yellow_shot",

	// Explosion and impact decal images
	EXPLOSION_DAMAGE_TIMEOUT 			: 500,
	SPRITE_IMPACT_DECALS 				: "impact_decals",
	SPRITE_EXPLOSION_A 					: "sprite_explosion_a",
	SPRITE_EXPLOSION_B 					: "sprite_explosion_b",
	SPRITE_EXPLOSION_C 					: "sprite_explosion_c",
	SPRITE_EXPLOSION_D 					: "sprite_explosion_d",
	DEBRIS_TANK 						: "",

	// Camera constants
	CAMERA_SPRITE 						: "camera",
	CAMERA_SPEED 						: 10,
	
	// Fog of war sprites and key frames
	MAP_TILE_FOG_OF_WAR					: "fog_of_war",
	MAP_FOW_VISIBLE						: -1,
	MAP_FOW_FULL						: 0,
	MAP_FOW_SIDE_ONE					: 1,				// -
	MAP_FOW_CORNER_OUTER				: 2,				// -
	MAP_FOW_CORNER_INNER_ONE			: 3,				// -
	MAP_FOW_CORNER_INNER_TWO			: 4,
	MAP_FOW_CORNER_INNER_THREE			: 5,
	MAP_FOW_CORNER_INNER_FOUR			: 6,
	MAP_FOW_ALONE						: 7,				// -
	MAP_FOW_SIDE_TWO					: 8,				// -
	MAP_FOW_SIDE_THREE					: 9,				// -
	
	// Fog of war tile states
	MAP_FOW_FOGS 				: [{	frame:	0,	angle:	0,		surrounding: [0, 0, 0,   0, 0, 0,   0, 0, 0] },
	             				   
	             				   {	frame:	1,	angle:	0,		surrounding: [0, 0, 0,   0, 0, 0,   2, 1, 2] },
	             				   {	frame:	1,	angle:	-90,	surrounding: [0, 0, 2,   0, 0, 1,   0, 0, 2] },
	             				   {	frame:	1,	angle:	180,	surrounding: [2, 1, 2,   0, 0, 0,   0, 0, 0] },
	             				   {	frame:	1,	angle:	90,		surrounding: [2, 0, 0,   1, 0, 0,   2, 0, 0] },
	             				   
	             				   {	frame:	2,	angle:	0,		surrounding: [0, 0, 2,   0, 0, 1,   2, 1, 1] },
	             				   {	frame:	2,	angle:	90,		surrounding: [2, 0, 0,   1, 0, 0,   1, 1, 2] },
	             				   {	frame:	2,	angle:	180,	surrounding: [1, 1, 2,   1, 0, 0,   2, 0, 0] },
	             				   {	frame:	2,	angle:	-90,	surrounding: [2, 1, 1,   0, 0, 1,   0, 0, 2] },
	             				   
	             				   {	frame:	3,	angle:	0,		surrounding: [0, 0, 0,   0, 0, 0,   0, 0, 1] },
	             				   {	frame:	3,	angle:	90,		surrounding: [0, 0, 0,   0, 0, 0,   1, 0, 0] },
	             				   {	frame:	3,	angle:	180,	surrounding: [1, 0, 0,   0, 0, 0,   0, 0, 0] },
	             				   {	frame:	3,	angle:	-90,	surrounding: [0, 0, 1,   0, 0, 0,   0, 0, 0] },

	             				   {	frame:	7,	angle:	0,		surrounding: [2, 1, 2,   1, 0, 1,   2, 1, 2] },
	             				   
	             				   {	frame:	8,	angle:	0,		surrounding: [2, 1, 2,   0, 0, 0,   2, 1, 2] },
	             				   {	frame:	8,	angle:	90,		surrounding: [2, 0, 2,   1, 0, 1,   2, 0, 2] },
	             				   
	             				   {	frame:	9,	angle:	0,		surrounding: [2, 1, 1,   0, 0, 1,   2, 1, 1] },
	             				   {	frame:	9,	angle:	90,		surrounding: [2, 0, 2,   1, 0, 1,   1, 1, 1] },
	             				   {	frame:	9,	angle:	180,	surrounding: [1, 1, 2,   1, 0, 0,   1, 1, 2] },
	             				   {	frame:	9,	angle:	-90,	surrounding: [1, 1, 1,   1, 0, 1,   2, 0, 2] }],

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
	
	// Hud last minute sprites
	HINT_SELL					: "hint_sell",
	DETAILS_DIALOG				: "details_dialog",

	// Heads Up Display sprites
	HUD : { 
		MAP_CONTROL		: {
			WIDTH 		: 377,
			HEIGHT 		: 365,
			MINIMAP		: { LEFT : 0.2328,	TOP : 0.0757,	WIDTH : 0.7041,	HEIGHT : 0.7197 },
			CASH		: { LEFT : 0.6737,	TOP : 0.8922,	WIDTH : 0.2706,	HEIGHT : 0.0630 },
			BUILDING	: { LEFT : 0.1724,	TOP : 0.8712,	WIDTH : 0.1353,	HEIGHT : 0.0767,	UNSELECTED : 52,	SELECTED : 53,	A_BUILDING : "building_building",	A_READY : "building_ready",	BUILDING : [54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,53], 	READY : 77 },
			DEFENCE 	: { LEFT : 0.3210,	TOP : 0.8712,	WIDTH : 0.1353,	HEIGHT : 0.0767,	UNSELECTED : 26,	SELECTED : 27,	A_BUILDING : "building_defence",	A_READY : "defence_ready",	BUILDING : [28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,27],	READY :	51 },
			UNIT		: { LEFT : 0.4721,	TOP : 0.8712,	WIDTH : 0.1353,	HEIGHT : 0.0767,	UNSELECTED : 0,		SELECTED : 1,	A_BUILDING : "building_unit",		A_READY : "unit_ready",		BUILDING : [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,1], 			READY : 25 }
		},
		OBJECT_CONTROL	: {
			WIDTH 		: 274,
			HEIGHT 		: 226,
			ICON		: { LEFT : 0.4627,	TOP : 0.2178,	WIDTH : 0.3650,	HEIGHT : 0.5310 },
			NAME 		: { LEFT : 0.1350,	TOP : 0.1372,	WIDTH : 0.7445,	HEIGHT : 0.0619 },
			HEALTH 		: { LEFT : 0.1095,	TOP : 0.2566,	WIDTH : 0.2555,	HEIGHT : 0.3097 },
			SELL 		: { LEFT : 0.3139,	TOP : 0.7743,	WIDTH : 0.1314,	HEIGHT : 0.1681,	UNSELECTED : 0,		SELECTED : 1 },
			STOP		: { LEFT : 0.4635,	TOP : 0.7743,	WIDTH : 0.1314,	HEIGHT : 0.1681,	UNSELECTED : 3,		SELECTED : 4 }
		}
	},
	
	// Colour variation arrays
	COLOUR : {
		
		// Tank production building - opens up tank hanger doors - shows platform gradually getting lighter (rising)
		"HUB" :    [{ COLOUR : "blue", 		HUB : 11, 	SHADOW : 0,	OPEN : 10,	CLOSED : 19, 	OPENING : [12,13,14,15,16,17,18,19],	CLOSING : [19,18,17,16,15,14,13,12], 	RISE : [0,1,2,3,4,5,6,7,8,9],	SINK : [9,8,7,6,5,4,3,2,1,0], ICON : "tank_hub_icon_blue" },
	                { COLOUR : "red", 		HUB : 21, 	SHADOW : 0, OPEN : 20,	CLOSED : 29, 	OPENING : [22,23,24,25,26,27,28,29], 	CLOSING : [29,28,27,26,25,24,23,22],	RISE : [0,1,2,3,4,5,6,7,8,9], 	SINK : [9,8,7,6,5,4,3,2,1,0], ICON : "tank_hub_icon_red"  },
	                { COLOUR : "purple", 	HUB : 31, 	SHADOW : 0, OPEN : 30, 	CLOSED : 39,	OPENING : [32,33,34,35,36,37,38,39], 	CLOSING : [39,38,37,36,35,34,33,32],	RISE : [0,1,2,3,4,5,6,7,8,9],  	SINK : [9,8,7,6,5,4,3,2,1,0], ICON : "tank_hub_icon_purple"  },
	                { COLOUR : "green", 	HUB : 41, 	SHADOW : 0, OPEN : 40, 	CLOSED : 49,	OPENING : [42,43,44,45,46,47,48,49], 	CLOSING : [49,48,47,46,45,44,43,42],	RISE : [0,1,2,3,4,5,6,7,8,9], 	SINK : [9,8,7,6,5,4,3,2,1,0], ICON : "tank_hub_icon_green"  },
	                { COLOUR : "yellow", 	HUB : 51, 	SHADOW : 0, OPEN : 50, 	CLOSED : 59,	OPENING : [52,53,54,55,56,57,58,59], 	CLOSING : [59,58,57,56,55,54,53,52], 	RISE : [0,1,2,3,4,5,6,7,8,9], 	SINK : [9,8,7,6,5,4,3,2,1,0], ICON : "tank_hub_icon_yellow"  },
	                { COLOUR : "cyan", 		HUB : 61, 	SHADOW : 0, OPEN : 60, 	CLOSED : 69,	OPENING : [62,63,64,65,66,67,68,69], 	CLOSING : [69,68,67,66,65,64,63,62], 	RISE : [0,1,2,3,4,5,6,7,8,9], 	SINK : [9,8,7,6,5,4,3,2,1,0], ICON : "tank_hub_icon_cyan"  } ],
	    
	    // Turret defence - charges 4 lights - four lights fade out - fires with muzzleflash and recoil while lights fade out
		"TURRET" : [{ COLOUR : "blue", 		BASE : 0, 	TOP : 1, 		CHARGE : [1,2,3,4,5], 		COOL : [5,4,3,2,1], 		FIREANDCOOL : [6,7,8,9,10,11,12,1], 	 ICON : "turret_icon_blue" },
	                { COLOUR : "red", 		BASE : 13, 	TOP : 14, 		CHARGE : [14,15,16,17,18], 	COOL : [18,17,16,15,14], 	FIREANDCOOL : [19,20,21,22,23,24,25,14], ICON : "turret_icon_red" },
	                { COLOUR : "purple", 	BASE : 26, 	TOP : 27, 		CHARGE : [27,28,29,30,31], 	COOL : [31,30,29,28,27], 	FIREANDCOOL : [32,33,34,35,36,37,38,27], ICON : "turret_icon_purple" },
	                { COLOUR : "green", 	BASE : 39, 	TOP : 40, 		CHARGE : [40,41,42,43,44], 	COOL : [44,43,42,41,40], 	FIREANDCOOL : [45,46,47,48,49,50,51,40], ICON : "turret_icon_green" },
	                { COLOUR : "yellow", 	BASE : 52, 	TOP : 53, 		CHARGE : [53,54,55,56,57], 	COOL : [57,56,55,54,53], 	FIREANDCOOL : [58,59,60,61,62,63,64,53], ICON : "turret_icon_yellow" },
	                { COLOUR : "cyan", 		BASE : 65, 	TOP : 66, 		CHARGE : [66,67,68,69,70], 	COOL : [70,69,68,67,66], 	FIREANDCOOL : [71,72,73,74,75,76,77,66], ICON : "turret_icon_cyan" } ],
	                
	    // Tank unit - shoots cannon with slight recoil and muzzleflash
	    "TANK" :   [{ COLOUR : "blue", 		BODY : 0, 	TURRET : 1, 	FIRE : [2,3,4,5,1], 		ICON: "tank_icon_blue" },
	              	{ COLOUR : "red", 		BODY : 6, 	TURRET : 7, 	FIRE : [8,9,10,11,7], 		ICON: "tank_icon_red" },
	              	{ COLOUR : "purple", 	BODY : 12, 	TURRET : 13, 	FIRE : [14,15,16,17,13],	ICON: "tank_icon_purple" },
	              	{ COLOUR : "green", 	BODY : 18, 	TURRET : 19, 	FIRE : [20,21,22,23,19], 	ICON: "tank_icon_green" },
	              	{ COLOUR : "yellow", 	BODY : 24, 	TURRET : 25, 	FIRE : [26,27,28,29,25], 	ICON: "tank_icon_yellow" },
	              	{ COLOUR : "cyan", 		BODY : 30, 	TURRET : 31, 	FIRE : [32,33,34,35,31], 	ICON: "tank_icon_cyan" }]
	},
	
	// Method to calculate constant item type given object identifier
	getObjectType : function(identifier) {
		for (var buildingIndex = 0; buildingIndex < CONSTANTS.GAME_BUILDINGS.length; buildingIndex ++) {
			if (identifier == CONSTANTS.GAME_BUILDINGS[buildingIndex].identifier) {
				if (CONSTANTS.GAME_BUILDINGS[buildingIndex].damage) {
					return "DEFENCE";
				} else {
					return "BUILDING";
				}
			}
		}
		for (var unitIndex = 0; unitIndex < CONSTANTS.GAME_UNITS.length; unitIndex ++) {
			if (identifier == CONSTANTS.GAME_UNITS[unitIndex].identifier) {
				return "UNIT";
			}
		}
		return "UNKNOWN";
	}
}