(function(module) {
try {
  module = angular.module('elseisTemplates');
} catch (e) {
  module = angular.module('elseisTemplates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/templates/elseisVimeoTranscript.tpl.html',
    '<div class=embed-container><iframe id=player1 src="{{elseisVimeoTranscriptCtrl.transcriptConfig.videoUrl+\'?api=1&player_id=player1&portrait=0&color=333&title=0&badge=0\' | trusted}}" frameborder=0 webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><section class="etTranscriptDisplay etRow"><aside class="span_3_of_12 flt-left"><header><h3 class=etLangTitle>Subtitles and transcript</h3></header><main class=etLangSelection><span class=etLangDesc>Select Language</span> <span class=etLangOption ng-repeat="option in elseisVimeoTranscriptCtrl.transcriptLangOptions" ng-click="elseisVimeoTranscriptCtrl.selectedLang = option.id" ng-style=" {\'font-weight\' : elseisVimeoTranscriptCtrl.selectedLang == option.id ? \' bold\' : \'inherit\' }">{{option.id}}</span></main></aside><article class="span_9_of_12 flt-right etTranscriptContent"><div class=etParagraph ng-repeat="paragraph in elseisVimeoTranscriptCtrl.transcriptLangOptions[elseisVimeoTranscriptCtrl.selectedLang].transcript"><div class="etParagraphTime span_2_of_12 flt-left"><span ng-bind="paragraph.time | milisecondsToDateTime | date:\'mm:ss\'"></span></div><p class="etParagraphText span_10_of_12 flt-right"><span ng-repeat="textFragment in paragraph.fragments" ng-click=elseisVimeoTranscriptCtrl.player.seekTo(textFragment.startTime) ng-style=" {\'text-decoration\' : (textFragment.startTime < elseisVimeoTranscriptCtrl.player.currentTime+0.5 &&\n' +
    '                textFragment.endTime > elseisVimeoTranscriptCtrl.player.currentTime-0.5 )? \' underline\' : \'inherit\' }" ng-bind-html="textFragment.text | sanitize"></span></p></div></article></section>');
}]);
})();
