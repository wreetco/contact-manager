(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
    .config(config)	
    .run(run)
	
		// factories 
		.factory('ContactService', function($http) {
			return {
				getContacts: function(params, callback) {
					var contacts = [];
					// handle parameters
					
					$http.post('http://localhost:3000/api/v1/contacts', {search_params: params, api_token: "78bb831366f4defd38ba3a1d414986e2"}).
					success(function(data, status, headers, config) {
						contacts = angular.fromJson(data);
						console.log(contacts);
						callback(contacts);
					}).
					error(function(data, status, headers, config) {
						console.log('Request failed: ' + status);
					});
				}, // end getContacts method
				
				setSelectedContact: function(contact_id, contacts) {
					for (var i = 0; i < contacts.length; i++) {
						if (contacts[i]._id.$oid == contact_id) {
							return contacts[i];
						}
					}
					// we don't wanna be here
					return false;
				} // end setSelectedContact method
				
			};
		})
	
		// controllers
		.controller('OpenContactsCtrl', function($scope, ContactService) {
			$scope.contacts = []; // init empty list
			$scope.selected_contact = {};
			$scope.getOpenContacts = function() {
				var params = {
					assigned: "Chase"
				};
				ContactService.getContacts(params, function(contacts) {
					$scope.contacts = contacts;
					$scope.selected_contact = $scope.contacts[0];
				});
			};
		
			$scope.selectContact = function(contact_id) {
				$scope.selected_contact = ContactService.setSelectedContact(contact_id, $scope.contacts);
			}; // end selectcontact
			$scope.getOpenContacts();
		}) // end OpenContactsCtrl controller
	
		.controller('UnassignedContactsCtrl', function($scope, ContactService) {
			$scope.contacts = []; // init empty list
			$scope.selected_contact = {};
			$scope.getUnassignedContacts = function() {
				ContactService.getContacts({assigned:false}, function(contacts) {
					$scope.contacts = contacts;
					$scope.selected_contact = $scope.contacts[0];
				});
			};
		
			$scope.selectContact = function(contact_id) {
				$scope.selected_contact = ContactService.setSelectedContact(contact_id, $scope.contacts);
			}; // end selectcontact
			$scope.getUnassignedContacts();
		}) // end unassignedContacts controller

	
		// end module
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/open');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

})();
