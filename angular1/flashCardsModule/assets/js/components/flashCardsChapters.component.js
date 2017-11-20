(function (app) {

    app.component('flashCardsChapters', {
        templateUrl: 'templates/flash-cards-chapters.template.html',
        controller: flashCardsChaptersController,
        controllerAs: 'vm',
        bindings: {
            instanceId: '<'
        }
    });

    flashCardsChaptersController.$inject = ["flashCardsService", "$state"];
    function flashCardsChaptersController(flashCardsService, $state) {
        let vm = this,
            data = flashCardsService.getInstanceData(vm.instanceId);

        vm.chapters = data.chapters;
        vm.allTerms = [];

        prepareTermsForSearch();

        vm.generateUrl = generateUrl;
        vm.openTerm = openTerm;
        vm.openChapter = openChapter;

        /////////////////////////////

        function generateUrl(index) {
            return flashCardsService.getChapterContentUrl(vm.instanceId, index);
        }

        function prepareTermsForSearch() {
            vm.chapters.forEach( (chapter, chapterTndex) => {
                let terms = angular.copy(chapter.terms);

                terms.forEach( (term, termIndex) => {
                    term.chapter = chapterTndex;
                    term.index = termIndex;
                });

                vm.allTerms = vm.allTerms.concat(terms);
            });
        }

        function openChapter(chapter) {
            let state = `${flashCardsService.getBaseRouteState(vm.instanceId)}-chapter`;

            $state.go(state, { chapter });
        }

        function openTerm(term) {
            let state = `${flashCardsService.getBaseRouteState(vm.instanceId)}-chapter`;

            $state.go(state, {
                chapter: term.chapter,
                termIndex: term.index
            });
        }
    }

})(angular.module('flash-cards'));