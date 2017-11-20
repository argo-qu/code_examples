(function (app) {

    app.component('flashCardFilter', {
        templateUrl: 'templates/flash-card-filter.template.html',
        controller: flashCardFilterController,
        controllerAs: 'vm',
        bindings: {
            list: '<',
            instanceId: '<'
        }
    });

    const translateId = 'flash-cards-filter';
    flashCardFilterController.$inject = ["translatorService", "$timeout"];
    function flashCardFilterController(translatorService, $timeout) {
        let vm = this;

        vm.searchString = "";
        vm.focused = false;
        vm.hidden = true;        

        vm.search = search;
        vm.focus = focus;
        vm.unfocus = unfocus;
        vm.cancel = cancel;
        vm.clearSearch = clearSearch;        

        window.matchMedia("(orientation: portrait)")
            .addListener(() => {
                (vm.focused) ? focus() : unfocus();
            });

        $timeout(() => {
            vm.hidden = false;
        }, 300);

        loadTranslations();

        //////////////////////

        function search() {
            vm.list.forEach( (item, index) => {
                document.getElementById(`flash-card-${index}`).style.display = itemMatches(item) ? "block" : "none";
            });

            function itemMatches(item) {
                let words  = vm.searchString.toLowerCase().split(' '),
                    matches = true,
                    keywordMatches = false;

                words.forEach(word => {
                    if (word !== "" && word !== " ") {
                        matches &= item.title.toLowerCase().indexOf(word) !== -1;

                        if (item.keywords instanceof Array)
                            item.keywords.forEach(keyword => {
                                if (keyword.toLowerCase().indexOf(word) !== -1)
                                    keywordMatches = true;
                            })
                    }
                });

                return matches || keywordMatches;
            }
        }

        function focus() {
            vm.focused = true;
        }

        function unfocus() {
            vm.focused = false;
            document.activeElement.blur();
        }

        function cancel() {
            vm.clearSearch();
            unfocus();

            $timeout(() => {
                try {
                    cordova.plugins.Keyboard.close();
                } catch (error) {
                    console.log('Plugin "ionic-plugin-keyboard" is not installed');
                }
            }, 400);
        }

        function clearSearch() {
            vm.searchString = "";
            vm.search();
            $timeout(() => {
                unfocus();
            });
        }

        function loadTranslations() {
            if (translatorService.isSpecificTranslationLoaded(translateId)) {
                vm.placeholder = translatorService.translateSpecific('placeholder', false, translateId);
                vm.closeText = translatorService.translateSpecific('closeText', false, translateId);
            }
            else
                translatorService.loadSpecificTranslations('translations/search', translateId)
                    .then(() => {
                        vm.placeholder = translatorService.translateSpecific('placeholder', false, translateId);
                        vm.closeText = translatorService.translateSpecific('closeText', false, translateId);
                    });
        }

    }

})(angular.module('flash-cards'));