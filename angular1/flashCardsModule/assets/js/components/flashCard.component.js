(function (app) {

    app.component('flashCard', {
        templateUrl: 'templates/flash-card.template.html',
        controller: flashCardController,
        controllerAs: 'vm',
        bindings: {
            cardData: '<',
            instanceId: '<',
            index: '<'
        }
    });

    flashCardController.$inject = ["purchasePremiumService", "flashCardsService", "translatorService"];
    function flashCardController(purchasePremiumService, flashCardsService, translatorService) {
        let vm = this;

        if (vm.cardData.blocked === "true")
            vm.cardData.blocked = true;

        vm.unlockText = translatorService.getLang() == 'ru' ? 'Разблокировать всё' : 'Unlock All';

        vm.isPremium = purchasePremiumService.isPremium();
        vm.showOffer = ($event) => {
            if (window.ga)
                window.ga.trackEvent(`IAP: клик на заблокированный элемент в FlashCards`, window.appname);

            purchasePremiumService.showOffer(
                flashCardsService.getPrice(),
                $event,
                flashCardsService.getBaseRouteState(vm.instanceId)
            );
        };
    }

})(angular.module('flash-cards'));