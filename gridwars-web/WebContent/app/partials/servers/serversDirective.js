'use strict';

angular.module('gridWarsApp.servers.module').directive('gwaServers', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.servers.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/servers/servers.html'
	};
});