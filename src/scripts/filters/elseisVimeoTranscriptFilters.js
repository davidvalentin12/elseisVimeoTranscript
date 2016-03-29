(function () {
  'use strict';


  angular.module('elseisVimeoTranscript')
      .filter('sanitize', ['$sce', function ($sce) {
        return function (htmlCode) {
          return $sce.trustAsHtml(htmlCode);
        }

      }])
      .filter('trusted', ['$sce', function ($sce) {
        return function(url) {
          return $sce.trustAsResourceUrl(url);
        };
      }])
      .filter('milisecondsToDateTime', [function() {
        return function(miliseconds) {
          return new Date(1970, 0, 1).setSeconds(miliseconds/1000);
        };
      }]);

}());