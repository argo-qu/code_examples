(function (app) {

    const defaultContainerName = 'flash_cards';

    app.provider('flashCardsService', flashCardsServiceProvider);

    flashCardsServiceProvider.$inject = ["$stateProvider", "translatorServiceProvider"];
    function flashCardsServiceProvider($stateProvider, translatorServiceProvider) {
        let provider = this;

        provider.init = init;

        ///////////////////

        chapterPageController.$inject = ["$scope", "$state", "$ionicNavBarDelegate", "$ionicHistory"];
        function chapterPageController($scope, $state, $ionicNavBarDelegate, $ionicHistory) {
            try {
                $scope.title = provider.instances[provider.currentInstanceId].data.chapters[$state.params.chapter].title;
            } catch (error) {
                console.log('Cant set title for chapter', error);
            }
        }

        function init(container, instanceId, baseRouteState, baseRouteUrl, baseView, rateAppConfig, appPrice = 0.99) {
            if (typeof instanceId === 'string' &&
                typeof baseRouteState === 'string' &&
                typeof baseView === 'string' &&
                typeof baseRouteUrl === 'string')  {

                if (typeof provider.instances !== 'object' )
                    provider.instances = {};

                provider.appPrice = appPrice;
                provider.instances[instanceId] = {
                    baseRouteState,
                    baseRouteUrl,
                    rateAppConfig,
                    baseView
                };

                provider.currentInstanceId = instanceId;

                try {
                    getDataFromContainer(container);
                } catch (error) {
                    console.log('It seems that flash-cards data loading was failed with', error);
                }

                try {
                    setRoutes();
                } catch (error) {
                    console.log('It seems that routes setting was failed with', error);
                }
            } else {
                console.log('Wrong parameters to init flashCardsProvider!');
            }
        }
        
        function getDataFromContainer(container) {
            if (typeof container !== 'string')
                container = defaultContainerName;

            let lang = translatorServiceProvider.$get().getLang();
            let fullContainerName = `${container}_${lang}`;

            if (window[fullContainerName] instanceof Object) {
                if (typeof provider.instances[provider.currentInstanceId].data !== 'object')
                    provider.instances[provider.currentInstanceId].data = {};

                provider.instances[provider.currentInstanceId].data = angular.copy(window[fullContainerName]);

                if (!(provider.instances[provider.currentInstanceId].data.chapters instanceof Array)) {
                    provider.instances[provider.currentInstanceId].data.chapters = Object.keys(provider.instances[provider.currentInstanceId].data.chapters).map(function (key) { return provider.instances[provider.currentInstanceId].data.chapters[key]; });
                }

            } else {
                console.log(`Cant load flash cards content!\n${fullContainerName}`);
            }
        }
        
        function setRoutes() {
            $stateProvider
                .state(provider.instances[provider.currentInstanceId].baseRouteState, {
                    url: provider.instances[provider.currentInstanceId].baseRouteUrl,
                    views: {
                        [provider.instances[provider.currentInstanceId].baseView] : {
                            template: `<ion-view cache-view="true" 
                                                 view-title="${provider.instances[provider.currentInstanceId].data.title}">                                                                                        
                                            <flash-cards-chapters instance-id="'${provider.currentInstanceId}'"></flash-cards-chapters>
                                       </ion-view>`,
                        }
                    }
                });

            $stateProvider
                .state( `${provider.instances[provider.currentInstanceId].baseRouteState}-chapter`, {
                    url: `${provider.instances[provider.currentInstanceId].baseRouteUrl}/:chapter`,
                    views: {
                        [provider.instances[provider.currentInstanceId].baseView] : {
                            template: `<ion-view cache-view="true"
                                                 view-title="{{::title}}">
                                            <flash-cards-single-chapter instance-id="'${provider.currentInstanceId}'"></flash-cards-single-chapter>
                                       </ion-view>`,
                            controller: chapterPageController
                        }
                    },
                    params: {
                        termIndex: null
                    }
                });
        }


        provider.$get = function createFlashCardsServiceInstance($state) {
            return new flashCardsService($state);
        };

        provider.$get.$inject = ["$state"];

        function flashCardsService($state) {
            this.getPrice = () => {
                return provider.appPrice;
            };

            this.getAllInstances = () => {
                return provider.instances;
            };

            this.getInstanceData = (instanceId) => {
                if (provider.instances[instanceId] !== undefined && provider.instances[instanceId].data !== undefined)
                    return provider.instances[instanceId].data;
                else
                    return null;
            };

            this.getBaseRouteState = (instanceId) => {
                return provider.instances[instanceId].baseRouteState;
            };

            this.getChapterContentUrl = (instanceId, index) => {
                return `${$state.href(provider.instances[instanceId].baseRouteState)}/${index}`;
            }
        }
    }

})(angular.module('flash-cards'));