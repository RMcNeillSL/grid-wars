'use strict';

(function() {

	function ServersController($scope, $location, $rootScope, serversService) {
		this.$scope = $scope;
		this.serversService = serversService;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$scope.servers = [];
		this.loadServers();
	}

	ServersController.prototype = {
		loadServers : function() {
			var self = this;

			var updateServers = function(response) {
				self.$scope.servers = response;
			};

			this.serversService.getServers(updateServers);
		}
	}

	ServersController.$inject = [ '$scope', '$location', '$rootScope',
			'gridWarsApp.servers.service' ];

	angular.module('gridWarsApp.servers.module').controller(
			'gridWarsApp.servers.controller', ServersController);
}());
