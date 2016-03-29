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
