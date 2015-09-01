'use strict';

(function () {

	function CreateController ($scope, $location, $rootScope, createService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.createService = createService;
		this.$rootScope.lobbyMessages = [];

		// Declare variables
		$scope.userReady = false;

	}

	CreateController.prototype = {
			toggleUserReady: function () {
				console.log("Toggle ready");
			},
			callSendMessage: function () {
				this.createService.sendMessage();
			}
	}

	CreateController.$inject = ['$scope', '$location', '$rootScope', 'gridWarsApp.create.service'];


	angular.module('gridWarsApp.create.module').controller('gridWarsApp.create.controller', CreateController);
}());
