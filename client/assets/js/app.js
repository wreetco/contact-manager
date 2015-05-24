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
					// test fixtures
					var contacts = [
						{
							first_name: "Chase",
							last_name: "Higgins",
							email: "chase@wreet.co",
							subject: "Website Development",
							create_date: "05/23/2015",
							message: "Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu.",
							assigned: false,
							id: "fldkj3324"
						},
						{
							first_name: "Jon",
							last_name: "Cron",
							email: "jon@wreet.co",
							subject: "Mobile App Development",
							create_date: "05/22/2015",
							message: "Yo dude I need you to make me a mobile app.",
							assigned: false,
							id: "r0923jwed"
						},
						{
							first_name: "Customer",
							last_name: "McTesting",
							email: "test@lolfactory.com",
							subject: "Consulting",
							create_date: "05/18/2015",
							message: "I just want to look into having someone review our company's code base. ",
							assigned: "Chase",
							id: "flkfds93s"
						}
					];
					// end test fixtures
					if (params.assigned !== false) {
						var assigned_contacts = [];
						for (var i = 0; i < contacts.length; i++) {
							if (contacts[i].assigned == params.assigned) {
								assigned_contacts.push(contacts[i]);	
							}
						}
						contacts = assigned_contacts;
					}
					else if (params.assigned === false) {
						// only return open contacts	
						var unassigned = [];
						for (var j = 0; j < contacts.length; j++) {
							if (contacts[j].assigned == params.assigned) {
								unassigned.push(contacts[j]);	
							}
						}
						contacts = unassigned;
					}
					// end params.assigned handling
					
					
					callback(contacts);
				}, // end getContacts method
				
				setSelectedContact: function(contact_id, contacts) {
					for (var i = 0; i < contacts.length; i++) {
						if (contacts[i].id == contact_id)
							return contacts[i];
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
