define([ 'knockout', 'jquery', 'viewModels/Player', 'json2' ], function(ko, $,
		Player) {
	'use strict';

	var ViewModel = function ViewModel() {
		this.players = ko.observableArray();
		this.activePlayers = ko.observableArray();
		this.inActivePlayers = ko.observableArray();
		this.challenges = ko.observableArray();
		this.player = ko.observable();
		this.challenger = null;
		this.challenged = null;
		this.resultContestant = ko.observable();
		this.resultContestantOb = ko.observable();
		this.challengeView = ko.observableArray();
		
		this.challengerScore =  ko.observable("");
		this.challengedScore =  ko.observable("");
		
		this.playersWithChallenge = ko.observableArray();
		
		self = this;

		this.showProfile = function(player) {
			// this.player = id;
			this._loadDetailedPlayer(player);

		}.bind(this);
		
		
		this.contestantSelected = function(MV){
			$.ajax({
				url : "ladder/rest/challenges?active=true&contestantID=" + self.resultContestant(),
				type : 'get',
				success : function(activeGame) {
					self.challengeView([activeGame]);
				}
			});
			
		}.bind(this);

		this.createChallenge = function(formElement) {
			var challenge = {
				'challenger' : this.challenger,
				'challenged' : this.challenged,
				'expiryDate' : this.expiryDate
			};

			var json = JSON.stringify(challenge);

			$.ajax({
				url : "ladder/rest/challenge",
				type : 'post',
				data : json,
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				success : function(msg) {
					alert(msg);
				},
				error : function(msg) {
					alert(msg.responseText);

				}
			});
		}.bind(this);
		
		this.deleteChallenge = function(formElement) {
			var json = JSON.stringify(self.challengeView()[0]);
			console.log(json);
			$.ajax({
				url : "ladder/rest/challenges/delete/" + self.challengeView()[0].challengeID,
				type : 'delete',
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				success : function(msg) {
					alert(msg);
					
				}
			});
		}.bind(this);
		
		// Create result entry and submit it using challengeView
		this.createResult = function(MV) {
			var self3 = self;
			var json = JSON.stringify(self.challengeView()[0]);
			// Submit challenge
			$.ajax({
				url : "ladder/rest/result",
				type : 'post',
				data : json,
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				success : function(msg) {
					console.log("got here");
					
				}
			});
			
		}.bind(this);
		
		this.refresh = function(){
			self._loadPlayers();
		}

		this._loadData();
		self._loadActivePlayers(true);
		self._loadActivePlayers(false);

		setInterval(this._loadData, 5000);
	};
	ViewModel.prototype = {
		_loadPlayers : function() {

			var self = this;

			$.ajax({
				url : "ladder/rest/players",
				context : document.body
			}).done(function(data) {

				self.players(data);
			});
		},
		_loadChallenges : function() {

			var self = this;

			$.ajax({
				url : "ladder/rest/challenges",
				context : document.body
			}).done(function(data) {

				self.challenges(data);
			});
		},
		_loadDetailedPlayer : function(player) {

			var self = this;

			$.ajax({
				url : "ladder/rest/player/" + player.id,
				context : document.body
			}).done(function(data) {
				console.log(data);
				self.player(data);
			});

		},
		_loadActivePlayers : function(active){
			var self = this;
			$.ajax({
				url : "ladder/rest/players?active="+ active,
				context : document.body
			}).done(function(data) {
				
				if(active){
					self.activePlayers(data);
				}else{
					self.inActivePlayers(data);
				};
			});
		},
		_loadData : function() {
			self._loadPlayers();
			self._loadChallenges();
			
			
			
		}
	};

	return ViewModel;
});