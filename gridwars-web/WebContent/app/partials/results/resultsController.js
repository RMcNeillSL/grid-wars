'use strict';

(function() {
	function ResultsController($scope, $location, $rootScope) {
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$rootScope.pageName = "Results";
		/*this.$rootScope.playerResults = [{
			position:1,
			player:"TestUser",
			feedback:"Congratulations you finished in first place!"
		},
		{
			position:2,
			player:"TestUser2",
			feedback:"So close, but second place is still good."
		},
		{
			position:3,
			player:"TestUser3",
			feedback:"Third place, better luck next time."
		},
		{
			position:4,
			player:"TestUser4",
			feedback:"You really jobbed that up!"
		}];*/
		this.$rootScope.positions = ["First", "Second", "Third", "Fourth"];
	}

	ResultsController.prototype = {
		changeView : function(path) {
			console.log(path);
			this.$location.path(path);
		}
	}

	ResultsController.$inject = [ '$scope', '$location', '$rootScope' ];

	angular.module('gridWarsApp.results.module').controller(
			'gridWarsApp.results.controller', ResultsController);
}());
