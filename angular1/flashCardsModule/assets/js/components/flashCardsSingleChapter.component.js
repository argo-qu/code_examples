(function (app) {

    app.component('flashCardsSingleChapter', {
        templateUrl: 'templates/flash-cards-single-chapter.template.html',
        controller: flashCardsSingleChapterController,
        controllerAs: 'vm',
        bindings: {
            instanceId: '<'
        }
    });

    flashCardsSingleChapterController.$inject = ["flashCardsService", "$state", "$ionicScrollDelegate", "$timeout", "$location"];
    function flashCardsSingleChapterController(flashCardsService, $state, $ionicScrollDelegate, $timeout, $location) {
        let vm = this,
            data = flashCardsService.getInstanceData(vm.instanceId);

        vm.spinnerActive = true;

        $timeout(() => {
            vm.cardsList = data.chapters[$state.params.chapter].terms;
            vm.cardsList.forEach( (item, index) => {
                if ( index >= data.chapters[$state.params.chapter].blocked_from )
                    item.blocked = true;
            })
        });

        $timeout(() => {
            vm.loaded = true;
            vm.spinnerActive = false;
        }, 500);        

        vm.anchoredTermIndex = $state.params.termIndex;
        if (vm.anchoredTermIndex !== null) {
            $timeout(() => {
                $location.hash(`flash-card-${vm.anchoredTermIndex}`);
                $ionicScrollDelegate.anchorScroll(true);
            });
        }
    }

})(angular.module('flash-cards'));