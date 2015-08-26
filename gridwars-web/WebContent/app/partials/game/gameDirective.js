'use strict';

angular.module('gridWarsApp.game.module').directive('gwaGame', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.game.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/game/game.html'
	};
});