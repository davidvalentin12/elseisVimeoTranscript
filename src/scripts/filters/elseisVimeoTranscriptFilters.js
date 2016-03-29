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
      }]);

}());