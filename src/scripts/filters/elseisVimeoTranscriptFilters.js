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