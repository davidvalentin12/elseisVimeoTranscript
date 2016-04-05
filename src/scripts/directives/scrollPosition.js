(function () {
  'use strict';


  angular.module('scrollPosition', [
  ]).directive('scrollPosition', function($window, $document) {
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
  });

}());
