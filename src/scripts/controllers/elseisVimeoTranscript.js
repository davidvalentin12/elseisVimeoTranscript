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
          self.vimeoPlayer.addEvent('play', self.playerLunched);
          self.vimeoPlayer.addEvent('pause', self.playerPaused);
          self.vimeoPlayer.addEvent('finish', self.playerPaused);
          self.vimeoPlayer.addEvent('playProgress', self.updatePlayerTime);
        });

        self.playerPaused = function playerPaused(){
          console.log("paused");
          self.player.isPlaying = false;
          $scope.$digest();
        };
        self.playerLunched = function playerLunched(){
          console.log("played");
          self.player.isPlaying = true;
          $scope.$digest();
        };
        self.player = {
          seekTo: function(seconds) {
            self.vimeoPlayer.api('seekTo', seconds);
            self.player.currentTime = seconds;
          },
          play: function(){
            self.vimeoPlayer.api('play');
            self.player.isPlaying = true;
          },
          pause: function(){
            self.vimeoPlayer.api('pause');
            self.player.isPlaying = false;
          },
          paused: function(){
            return self.vimeoPlayer.api('paused');
          },
          isPlaying : false,
          currentTime: 0
        };
        self.updatePlayerTime = function updatePlayerTime(data) {
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