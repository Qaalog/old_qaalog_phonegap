qaalog.controller('menu',['$scope','page','menu','share','device','$timeout',function($scope,page,menu,share,device,$timeout){
    
    var closeMenu;
    $scope.STYLE_LIST = 1;
    $scope.STYLE_GRID = 0;
    $scope.isIOS = device.isIOS;
    $scope.listStyle = $scope.STYLE_GRID;
    $scope.sortSelected = 'A';
    
    var settings = { name: 'menu'
                   , title: 'menu'
                   , back: true
                   };
    page.onShow(settings,function(params) {
      page.setTitle(params.title);
      $scope.menuType = params.menuType || 'main';
      page.hideLoader();
      
    });

  menu.setShareShow = function(value) {
    $scope.isShareShow = value;
  };
    
    
    $scope.showCatalogInfo = function(outside) {
      page.show('catalogInfo',menu.getParams());
      if (!outside) page.navigatorPop();
    };

    menu.showCatalogInfo = $scope.showCatalogInfo;
    
    $scope.toggleViewStyle = function(style) {
      $scope.listStyle = style;
      menu.onChangeViewStyle(style);
      closeMenu();
    };
    
    $scope.showFavorites = function() {
      var data = { params: menu.getParams()
                 , item: {listName: 'Favorites'}
                 };
      page.show('browseProduct',data);
      page.navigatorPop();
    };
    
    $scope.showNearMe = function() {
      
    };
    
    $scope.sort = function(type) {
      $scope.sortSelected = type;
      menu.sort(type);
      closeMenu();
    };
    
    $scope.changeCatalog = function() {
      page.show('catalog',{refresh: true});
      $timeout(function(){
        page.navigatorPop();
      });
    };
    
    $scope.loveIt = function() {
      
    };

    $scope.share = function() {
      share.exec();
    };


    closeMenu = function() {
      page.goBack();
    };
    
    menu.setIsSortable = function(isSortable){
      $scope.isSortable = isSortable;
    };
    
    menu.setListViewChangeEnabled = function(listViewChangeEnabled){
      $scope.listViewChangeEnabled = listViewChangeEnabled;
    };

    menu.hideChangeCatalog = function() {
      $scope.hideChangeCatalog = true;
    };
    
}]);

