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
					$http.post('http://localhost:3000/api/v1/contacts', {search_params: params, api_token: "78bb831366f4defd38ba3a1d414986e2"})
					.success(function(data, status, headers, config) {
						contacts = angular.fromJson(data);
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
				}, // end setSelectedContact method
				
				newContact: function(new_contact, callback) {
					// add a contact to this account, ah yeah
					$http.post('http://localhost:3000/api/v1/contacts/new', {contact: new_contact, api_token: "78bb831366f4defd38ba3a1d414986e2"})
					.success(function(data, status, headers, config) {
						// this bodes well...
						callback(data);
					}).
					error(function(data, status, headers, config) {
						console.log('Request failed: ' + status);
					});
				} // end newContact method
				
			};
		}) // end contactservice
	
		.factory('AccountService', function($http) {
		
		})
		// end accountservice
	
		.factory('TagService', function($http) {
			return {
				getAccountTags: function(callback) {
					// get all tags for all contacts in the account, used in the sidebar mostly
					$http.post('http://localhost:3000/api/v1/accounts/tags', {api_token: "78bb831366f4defd38ba3a1d414986e2"})
					.success(function(data, status, headers, config) {
						callback(angular.fromJson(data));
					})
					.error(function(data, status, headers, config) {
						console.log('Request failed: ' + status);
					});
				}, // end getAccountTags method
				
				removeAccountTag: function(tag_id, callback) {
					// remove tag_id from the tag_ids of account
					$http.post('http://localhost:3000/api/v1/accounts/tags/remove', {api_token: "78bb831366f4defd38ba3a1d414986e2", tag_id: tag_id})
					.success(function(data, status, headers, config) {
						callback(angular.fromJson(data));
					})
					.error(function(data, status, headers, config) {
						console.log('Request failed: ' + status);
					});
				}, // end removeAccountTag method
				
				addTagtoContact: function(tag_text, contact_id, callback) {
					// do it, add the tag
					var params = {
						api_token: "78bb831366f4defd38ba3a1d414986e2",
						tag_text: tag_text,
						contact_id: contact_id
					}
					$http.post('http://localhost:3000/api/v1/contacts/tags/add', params)
					.success(function(data, status, headers, config) {
						callback(angular.fromJson(data));
					})
					.error(function(data, status, headers, config) {
						console.log('Request failed: ' + status);
					});
				} // end addtagtocontact method
				
			}; // end return
		})
		// end tagservice
	
		// controllers
		.controller('AppCtrl', function($scope, $rootScope, ContactService, TagService) {
			// some of our "models"
			$scope.contacts = []; // init empty list
			$scope.selected_contact = {};
			$scope.tags = [];
			// methods
			$scope.getContacts = function(params) {	
				ContactService.getContacts(params, function(contacts) {
					$scope.contacts = contacts;
					$scope.selected_contact = $scope.contacts[0];
				});
			}; // end getContacts
		
			$scope.selectContact = function(contact_id) {
				$scope.selected_contact = ContactService.setSelectedContact(contact_id, $scope.contacts);
			}; // end selectcontact
		
			$scope.getAccountTags = function() {
				TagService.getAccountTags(function(tags) {
					$scope.tags = tags;
				});
			}; // end getAccount tags method
		
			$scope.removeAccountTag = function(tag_id) {
				TagService.removeAccountTag(tag_id, function(resp) {
					// remove callback
				});
			}; // end removeAccountTag method
		
			$scope.new_tag = {};
			$scope.addTagtoContact = function() {
				var contact_id = $scope.selected_contact._id.$oid;
				TagService.addTagtoContact($scope.new_tag.tag, contact_id, function(resp) {
					console.log(resp);
				});
			}; // end addTagtoContact method
		
			$scope.new_contact = {email:{}, phone_numbers: {}, social_accounts: {}, source: "WCM"}; // what we will ng-model too 
			$scope.newContact = function() {
				// add a new contact to the account
				// first name, last name and email are required
				if (!$scope.new_contact.first_name || !$scope.new_contact.last_name || !$scope.new_contact.email.email_address) {
					alert('NO!');
					return 0;
				}
				// let's hit the contact service with this
				ContactService.newContact($scope.new_contact, function(resp) {
					console.log(resp);
				});
			}; 
		
			// initializers
			if ($scope.contacts.length < 1)
				$scope.getContacts({});
			if ($scope.tags.length < 1)
				$scope.getAccountTags();
			if (typeof($rootScope.AppCtrl) == "undefined")
				$rootScope.AppCtrl = $scope;
		}) // end end AppCtrl
	
		// end module
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider, $rootScope) {
		// handle states
		// we have bound the AppCtrl controller to $rootScope: $rootScope.AppCtrl		
		$urlProvider
		// wanna see some hacks?
		.when('/contacts/:assignment', function($rootScope) {
			// get the url param
			var assigned = location.hash.split('/')[2];
			var params = {
				assigned: assigned
			}; // end params
			// now we can get our contacts setup
			$rootScope.$state.go('contacts', {}, {location: false}).then(function() {
				$rootScope.AppCtrl.getContacts(params);	
			});
		}) // end assignment
    .when('/contacts/tag/:tag_name', function($rootScope) {
			// use the account tag list to come up with a list of all 
			// contacts that match :tag_name param
			var tag = location.hash.split('/')[3];
			var params = {
				tag: tag
			}; // end params
			// now we can get our contacts setup
			$rootScope.$state.go('contacts', {}, {location: false}).then(function() {
				$rootScope.AppCtrl.getContacts(params);	
			});
		}) // end tags
		; // end states
		
    $urlProvider.otherwise('/contacts');

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
