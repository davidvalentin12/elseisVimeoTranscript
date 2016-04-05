(function () {
  'use strict';


  angular.module('elseisVimeoTranscript', [
      'scrollPosition',
    'elseisTemplates'
  ]);

}());

(function() {
  'use strict';

  angular.module('elseisVimeoTranscript')
      .controller('elseisVimeoTranscriptCtrl', ["$anchorScroll", "$scope", "$http", "$location", "$sce", function($anchorScroll, $scope, $http, $location, $sce) {
        var self = this,
            iframe = angular.element( document.querySelector( '#player1' ) )[0];
        self.vimeoPlayer = $f(iframe);
        self.playerTime = 0;
        self.videoFixed=false;
        self.autoScroll=false;
        // When vimero player is ready
        self.vimeoPlayer.addEvent('ready', function() {
          //Add needed player events here
          self.vimeoPlayer.addEvent('play', self.playerLunched);
          self.vimeoPlayer.addEvent('pause', self.playerPaused);
          self.vimeoPlayer.addEvent('finish', self.playerPaused);
          self.vimeoPlayer.addEvent('playProgress', self.updatePlayerTime);
        });

        self.playerPaused = function playerPaused(){
          self.player.isPlaying = false;
          $scope.$digest();
        };
        self.playerLunched = function playerLunched(){
          self.player.isPlaying = true;
          $scope.$digest();
        };
        self.player = {
          seekTo: function(seconds) {
            self.vimeoPlayer.api('seekTo', seconds);
            self.player.currentTime = seconds*1000;
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
          self.player.currentTime = data.seconds*1000;
          if(self.videoFixed && self.autoScroll){
            self.scrollToFragment(parseInt(data.seconds));
          }
          $scope.$digest();
        };

        self.scrollToFragment = function scrollToFragment(id){
          var newHash = 'scrollTo' + id;
          if ($location.hash() !== newHash) {
            $location.hash(newHash);
          } else {
            $anchorScroll();
          }
          $scope.$digest();
        };
        self.activateFixedMode = function(){
          if(self.videoFixed){
            self.videoFixed=false;

            $location.hash('scrollTop');

            $anchorScroll();
          }else{
            self.videoFixed=true;
          }
        };


        self.transcriptLangOptions = {};
        self.selectedLang = self.transcriptConfig.defaultLang;
        angular.forEach(self.transcriptConfig.langOptions, function(langOption) {
          $http.get(langOption.transcriptUrl).then(function(response) {
            self.transcriptLangOptions[langOption.lang] = {
              id: langOption.lang,
              ES: langOption.langES,
              EN: langOption.langEN,
              transcript: response.data
            };
          });
        });

        self.transcriptFontSize = 100;
        self.plusFontSize = function plusFontSize(){
          if(self.transcriptFontSize<205) {
            self.transcriptFontSize += 15;
          }
        };
        self.minusFontSize = function minusFontSize(){
          if(self.transcriptFontSize>75){
            self.transcriptFontSize -= 15;
          }
        };

        self.transcriptHeaderOffSet= parseInt(self.transcriptConfig.headerHeight)+60;

      }]).run(['$anchorScroll', function($anchorScroll) {
        $anchorScroll.yOffset = 500;
      }]);
}());
(function() {
  'use strict';
  angular.module('elseisVimeoTranscript')
      .directive('elseisVimeoTranscript', function() {
        return {
          restrict: 'A',
          controller: 'elseisVimeoTranscriptCtrl',
          controllerAs: 'elseisVimeoTranscriptCtrl',
          bindToController: true,
          templateUrl: 'src/templates/elseisVimeoTranscript.tpl.html',
          scope: {
            transcriptConfig: '='
          },
          link: function(scope, element, attributes) {
          }
        };
      });

}());

(function () {
  'use strict';


  angular.module('scrollPosition', [
  ]).directive('scrollPosition', ["$window", "$document", function($window, $document) {
    return {
      scope: {
        scroll: '=scrollPosition'
      },
      link: function(scope, element, attrs) {
        var windowEl = angular.element($window);
        var handler = function() {
          scope.scroll = $document[0].body.scrollTop;
        };
        windowEl.on('scroll', scope.$apply.bind(scope, handler));
        handler();
      }
    };
  }]);

}());

(function () {
    'use strict';


    angular.module('elseisVimeoTranscript')
        .filter('sanitize', ['$sce', function ($sce) {
            return function (htmlCode) {
                return $sce.trustAsHtml(htmlCode);
            }
        }])
        .filter('trusted', ['$sce', function ($sce) {
            return function (url) {
                return $sce.trustAsResourceUrl(url);
            };
        }])
        .filter('milisecondsToDateTime', [function () {
            return function (miliseconds) {
                return new Date(1970, 0, 1).setSeconds(miliseconds / 1000);
            };
        }])
        .filter('verticalSlashToSpace', [function () {
            return function (text) {
                if (text) {
                    return text.replace('|', ' ');
                }
            };
        }]).filter('milisecondsToSeconds', [function () {
            return function (miliseconds) {
                return parseInt(miliseconds/1000);
            };
        }]);
}());