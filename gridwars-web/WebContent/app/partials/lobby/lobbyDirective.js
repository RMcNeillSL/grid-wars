'use strict';

angular.module('gridWarsApp.lobby.module').directive('gwaLobby', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.lobby.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/lobby/lobby.html'
	};
});