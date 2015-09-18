'use strict';

(function() {
	function ResultsController($scope, $location, $rootScope) {
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$rootScope.pageName = "Results";
		this.$rootScope.positions = ["First", "Second", "Third", "Fourth"];
	}

	ResultsController.prototype = {
		leaveResults : function() {
			this.changeView("servers");
		},
		changeView : function(path) {
			this.$location.path(path);
		}
	}

	ResultsController.$inject = [ '$scope', '$location', '$rootScope' ];

	angular.module('gridWarsApp.results.module').controller(
			'gridWarsApp.results.controller', ResultsController);
}());
