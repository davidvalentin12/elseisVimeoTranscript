(function () {
  'use strict';


  angular.module('elseisVimeoTranscript', [
  ]);

}());

(function() {
  'use strict';

  angular.module('elseisVimeoTranscript')
      .controller('elseisVimeoTranscriptCtrl', ["$scope", "$http", "$rootScope", "$sce", function($scope, $http, $rootScope, $sce) {
        var self = this,
            iframe = $('#player1')[0];

        self.vimeoPlayer = $f(iframe);
        self.playerTime  = 0;

        // When vimero player is ready
        self.vimeoPlayer.addEvent('ready', function() {
          //Add needed player events here
          self.vimeoPlayer.addEvent('playProgress', self.updatePlayerTime);
        });

        self.player = {
          seekTo: function(seconds){
            self.vimeoPlayer.api('seekTo', seconds);
            self.player.currentTime = seconds;

          },
          currentTime: 0
        };
        self.updatePlayerTime = function updatePlayerTime(data) {
          self.player.currentTime = data.seconds;
          $scope.$digest();
        };





        //should go into a service TODO

        self.getParagraphs = function getParagraphs() {
          $http.get('_data/elseisTranscriptData.json').then(function(response) {
            self.transcriptData = response.data;
          });
        };
        self.getParagraphs();


      }]);
}());
(function() {
  'use strict';
  angular.module('elseisVimeoTranscript')
      .directive('elseisVimeoTranscript', function() {
        return {
          restrict: 'A',
          controller: 'elseisVimeoTranscriptCtrl',
          controllerAs : 'elseisVimeoTranscriptCtrl',
          bindToController : true,
          templateUrl: 'src/templates/elseisVimeoTranscript.tpl.html',
          link: function(scope, element, attributes) {


          }
        };
      });

}());
