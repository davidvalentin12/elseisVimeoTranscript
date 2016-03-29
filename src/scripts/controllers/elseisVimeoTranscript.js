(function() {
  'use strict';

  angular.module('elseisVimeoTranscript')
      .controller('elseisVimeoTranscriptCtrl', function($scope, $http, $rootScope, $sce) {
        var self = this,
            iframe = $('#player1')[0];

        self.vimeoPlayer = $f(iframe);
        self.playerTime = 0;

        // When vimero player is ready
        self.vimeoPlayer.addEvent('ready', function() {
          //Add needed player events here
          self.vimeoPlayer.addEvent('playProgress', self.updatePlayerTime);
        });

        self.player = {
          seekTo: function(seconds) {
            self.vimeoPlayer.api('seekTo', seconds);
            self.player.currentTime = seconds;

          },
          currentTime: 0
        };
        self.updatePlayerTime = function updatePlayerTime(data) {
          console.log(data.seconds);
          self.player.currentTime = data.seconds;
          $scope.$digest();
        };


        self.transcriptLangOptions = {};
        self.selectedLang = self.transcriptConfig.defaultLang;
        angular.forEach(self.transcriptConfig.langOptions, function(langOption) {
          $http.get(langOption.transcriptUrl).then(function(response) {
            self.transcriptLangOptions[langOption.lang] = {
              id: langOption.lang,
              transcript: response.data
            };
          });
        });


      });
}());