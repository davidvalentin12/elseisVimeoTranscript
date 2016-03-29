(function(module) {
try {
  module = angular.module('dvm.templates');
} catch (e) {
  module = angular.module('dvm.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/templates/elseisVimeoTranscript.tpl.html',
    '<header class=logo><div class=etCenter><img src=src/images/firma.png></div></header><div class=embed-container><iframe id=player1 src="https://player.vimeo.com/video/76979871?api=1&player_id=player1&portrait=0&color=333&title=0&badge=0" frameborder=0 webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><section class="etTranscriptDisplay etRow"><aside class="span_3_of_12 flt-left"><header><h3 class=etLangTitle>Subtitles and transcript</h3></header><main class=etLangSelection><span class=etLangDesc>Select Language</span> <span class=etLangOption ng-repeat="lang in [\'English\', \'Spanish\']">{{lang}}</span></main></aside><article class="span_9_of_12 flt-right etTranscriptContent"><div class=etParagraph ng-repeat="paragraph in elseisVimeoTranscriptCtrl.transcriptData"><div class="etParagraphTime span_2_of_12 flt-left"><span ng-bind=paragraph.time></span></div><p class="etParagraphText span_10_of_12 flt-right"><span ng-repeat="textFragment in paragraph.fragments" ng-click=elseisVimeoTranscriptCtrl.player.seekTo(textFragment.startTime) ng-style=" {\'text-decoration\' : (textFragment.startTime < elseisVimeoTranscriptCtrl.player.currentTime+1 &&\n' +
    '                textFragment.endTime > elseisVimeoTranscriptCtrl.player.currentTime+1 )? \' underline\' : \'inherit\' }">{{textFragment.text}}</span></p></div></article></section>');
}]);
})();
