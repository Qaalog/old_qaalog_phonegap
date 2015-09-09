qaalog.controller('main',['$rootScope','$scope','page','search','network','config','$timeout','pager','menu','share','device',
  function($rootScope,$scope,page,search,network,config,$timeout,pager,menu,share,device){
    
    $scope.isIOS = device.isIOS;
    console.log($scope.isIOS());
    $scope.imgPrefix = network.servisePath+'GetResizedImage?i=';
    var imgSize = Math.floor(device.emToPx(16));
    $scope.imgSufix = '&w='+imgSize+'&h='+imgSize;
    
    $scope.activePage = {};
    //$scope.activePage[config.startPage] = true;
    $scope.title = config.defaultTitle;
    $scope.currentPage = config.startPage;
    $scope.resultVisiable = false;
    $scope.isLoaderVisiable = false;
    $scope.noResultVisiable = false;
    $scope.searchResult = {};
    $scope.activeView = {};
    $scope.tabs = [{name: 'list', value: 'list'},{name: 'browse', value: 'browse'}];
    $scope.catalogTitleVisiable = true;
    $scope.noResultText = 'No results found';
    $scope.resultsTitle = 'Results for ';


    page.setHeaderVisiable = function(value){
      $scope.headerIsHidden = !value;
    };

    page.setPageScrollable = function(value){
      if (!value) {
        $scope.scrollType = {'overflow-y': 'hidden'};
      } else {
        $scope.scrollType = '';
      }

    };
    
    page.setStatusbarHidden = function(value) {
        $scope.isStatusbarHidden = value;
    };

    page.setCatalogTitleVisiable = function(value){
      $scope.catalogTitleVisiable = value;
    };

    page.setResultsTitle = function(title){
      $scope.resultsTitle = title;
    };

    page.setNoResultText = function(text){
      $scope.noResultText = text;
    };

    page.hideBackBtn = function(){
      $scope.canBack = false;
    };

    page.hideMenu = function(){
      $scope.menuAvailable = false;
      $scope.tabsAvailable = false;
    };
    page.hideSearch = function(){
      $scope.canSearch = false;
    };

    page.setTabsVisiable = function(value){
      $scope.tabsAvailable = value;
    };
    
    page.setTitle = function(title) {
      $scope.title = title;
    };
    
    page.setExtendedImage = function(image) {
      $scope.extendedImage = image;
    };
    
    $scope.onBack = function() {
      console.log('GO BACK');
      $scope.resultVisiable = false;
      return page.goBack();
    };
    
    page.goBack = function() {
    //  network.stopAllHttpRequests();
      network.setAbortBlock(true);
      window.stop();
      page.hideNoResult();
      var oldPage = page.navigatorPop();
      console.log('OLD PAGE',oldPage);
      if (oldPage) {
        
        if (oldPage.callback) {
          oldPage.callback(oldPage.params);
          return true;
        }
        
        $scope.resultVisiable = oldPage.params.resultVisiable;
        
        page.show(oldPage.name,oldPage.params,true);
        return true;
      } else {
        return false;
      }
    };
    
    document.addEventListener("backbutton", function(event){
      $scope.$apply(function(){
        if(!$scope.onBack()){
          navigator.app = navigator.app || {};
          navigator.app.exitApp();
        };
      });
    }, false);
    
    document.addEventListener('keyup', function(event){
      if (event.keyCode === 27) {
        $rootScope.$broadcast('escapePressed');
      }
    }, false);
    
    page.show = function(pageId,params,isBack) {
      $rootScope.$broadcast('freeMemory');
      page.showLoader();
      page.hideNoResult();
      params = params || {};
      $scope.stopSearching();
      if (!isBack) {
        params.isBack = false;
        
        var state =  pager.saveState();
        if (state) {
          page.addToCurrentParams({'state': state});
        }
        
        page.addToCurrentParams({'resultVisiable': $scope.resultVisiable});
        page.navigatorPush();
        $scope.resultVisiable = false;
      } else {
        params.isBack = true;
      }
      pager.stopPager();
      $scope.activePage = {};
      $scope.activePage[pageId] = true;
      $scope.currentPage = pageId;
      
      if (pageId !== 'menu') {
        menu.setIsSortable(false);
        menu.setListViewChangeEnabled(false);
      }
      
      page.runOnShow(pageId,params,isBack);
      $timeout(function(){
        page.setHeaderHeight(document.getElementsByTagName('header')[0].getBoundingClientRect().height);
      });
    };


    
    page.applyParams = function(params,isBack){
      console.log('PARAMS >>>' ,params);
      params = params || {};
      $scope.canSearch = params.search;
      $scope.canBack = params.back;
      $scope.canShare = params.share;
      $scope.menuAvailable = params.menu;
      $scope.tabsAvailable = params.tabs;
      if (!isBack) {
        $scope.isHeaderExtended = params.extendedHeader;
      }
      $scope.isGroupTitleVisiable = params.groupTitle;
      $scope.title = params.title || config.defaultTitle;
      if (params.swipeHeader) {
        page.startSwipeHeader();
      } else {
        page.stopSwipeHeader();
      }
    };
    
    page.toggleSearchIcon = function(state) {
      $scope.canSearch = state;
    };
    
    page.toggleShareIcon = function(state) {
      $scope.canShare = state;
    };
    
    page.setGroupTitle = function(title) {
      $scope.groupTitle = title;
    };
    
    page.hideExtendedHeader = function() {
      $scope.isHeaderExtended = false;
    };

    $scope.$watch('activeView',function(newValue, oldValue){
      console.log(newValue, oldValue);
      if (Object.keys(newValue)[0] === 'list' 
              && Object.keys(oldValue)[0] !== 'detail'
              && Object.keys(oldValue)[0] !== 'related') {
        page.showExtendedHeader();
      }
    });
    page.showExtendedHeader = function(force) {
      
      if (Object.keys($scope.activePage)[0] === 'products' && Object.keys($scope.activeView)[0] === 'list') {
        if (force) {
          $scope.isHeaderExtended = true;
          return true;
        }

        page.tryExtendedHeader();
      }

    };
    
    page.setTabs = function(tabs){
      $scope.tabs = tabs;
    };
    
    page.setTab = function(view){
      $scope.changeView(view);
    };
    
    $scope.changeView = function(view){
      $scope.activeView = {};
      $scope.activeView[view] = true;
      page.onTabChange(view);
    };
    
    var startSearchingFlag = false;
    $scope.startSearching = function() {
      $scope.searchModel = {};
      $scope.isSearchPanelVisiable = true;
      page.hideExtendedHeader();
      $timeout(function(){
        document.getElementById('search-input').focus();
      });
      if (!startSearchingFlag) {
        page.navigatorPush($scope.stopSearching);
        startSearchingFlag = true;
      }
    };

    search.stopSearching = function(){
      $scope.isSearchPanelVisiable = false;
      $scope.tips = [];
      document.getElementById('search-input').blur();
      startSearchingFlag = false;
    };
    
    $scope.stopSearching = search.stopSearching;
    
    $scope.onSearchChange = function() {
      var data = { catalogDB: network.getCatalogDB()
                 , searchTerm: $scope.searchModel.value
                 , maxRows: 3
                 };
      
      network.get('SearchAutocomplete',data,function(result,response){
        if (result) {
          $scope.tips = response;
          console.log(response);
        } else {
        
        }
      });
    };

    $scope.stopBlurSearching = function(value) {
      console.log('$scope.searchModel.value',value);
      if (!value) {
        $scope.stopSearching();
        page.navigatorPop();
      }
    };
    
    $scope.completeSearchValue = function(tip) {
      $scope.searchModel = $scope.searchModel || {};
      $scope.searchModel.value = tip;
      $scope.tips = [];
      $scope.onSearch();
      $scope.stopSearching();
    };
    
    $scope.onSearch = function(event) {
      if (!event || event.keyCode === 13) {
        page.showLoader();
        page.navigatorPop();
        search.onSearch($scope.searchModel.value);
        $scope.isSearchPanelVisiable = false;
        $scope.resultVisiable = true;
        $scope.stopSearching();
      }
    };
    
    search.setSearchCount = function(count) {
        $scope.searchModel.count = count;
    };
    
    $scope.showMenu = function() {
      var pageName = Object.keys($scope.activePage)[0];
      
      var data = { menuType: (pageName === 'productDetail') ? 'detail' : 'main'
                 , title: $scope.title
                 };
      page.show('menu',data);
    };
    
    $scope.share = function() {
      share.exec();
    };
    
    page.showLoader = function() {
      $scope.isLoaderVisiable = true;
    };
    
    page.hideLoader = function(){
      $scope.isLoaderVisiable = false;
    };
    
    page.showNoResult = function(text) {
      $scope.noResultVisiable = true;
      if (text) {
        page.setNoResultText(text);
        return true;
      };
      page.setNoResultText('Nothing found');
    };
    
    page.hideNoResult = function(){
      $scope.noResultVisiable = false;
    };

    device.setIsLoaded = function(isLoaded) {
      $scope.isLoaded = isLoaded;
      console.log($scope.isLoaded);
    };

    $scope.goToCatalogInfo = function() {
      if ($scope.menuAvailable) {
        menu.showCatalogInfo(true);
      }
    };

    $timeout(function(){
      page.show(config.startPage,{},false);
    });
    
}]);


