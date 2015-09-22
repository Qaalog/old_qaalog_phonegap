qaalog.controller('browseProduct', ['$scope','network', 'page', 'config', 'device', 'httpAdapter', '$timeout', 'search', 'menu', 'pager',
  function($scope, network, page, config, device, httpAdapter, $timeout, search, menu, pager) {
    
    $scope.imgPrefix = network.servisePath+'GetCroppedImage?i=';
    $scope.imgSufix = '&w=768&h=347';
    $scope.productList = [];
    
    var settings = { name:        'browseProduct'
                   , title:       'Browse Product'
                   , back:        true
                   , menu:        true
                   , groupTitle:  true
                   , swipeHeader: true
                   };

    page.onShow(settings,function(data) {
      console.log('browseProduct',data);
      
      if (typeof $scope.unwatch === 'function') {
        $scope.unwatch();
      }
      
      $scope.currentParams = data.params;
      $scope.currentData = data;
      
      page.setTitle($scope.currentParams.name);
      page.setGroupTitle(data.item.listName);
      
      var upperLoaderOnToggle = function(state) {
        $scope.miniLoaderUpVisiable = state;
      };
      
      $scope.pagerOptions = { scope:               $scope
                            , ajaxMethod:          data.ajaxMethod || 'getFavouriteProducts'
                            , itemClass:           'grouped-prod-wrap'
                            , listName:            'productList'
                            , marginRule:          {value:1,type:'em'}
                            , upperLoaderOnToggle: upperLoaderOnToggle
                            };
                            
     if (!data.ajaxMethod || data.ajaxMethod === 'getFavouriteProducts') {
       $scope.pagerOptions.properties = {currentLike: 1};
     }
     
     $scope.unwatch = $scope.$watch('productList',function(){
          if ($scope.productList.length === 0) {
             page.showNoResult();
          } else {
            page.hideNoResult();
          }
        });
                            
                
      if ($scope.currentData.state) {
        $timeout(function(){
          pager.loadState($scope.currentData.state,$scope.pagerOptions);
          delete $scope.currentData.state;
        },200);
        return true;
      }
      
      
      
      pager.startPager($scope.pagerOptions);
      
      
    });

    $scope.$on('freeMemory',function(){
      if (typeof $scope.unwatch === 'function') {
        $scope.unwatch();
      }

      $scope.productList = [];
    });
    
     $scope.showProductDetail = function(item) {
      item = item || {};
      item.db = $scope.currentParams.db;
      page.show('productDetail',item);
    };
    
    $scope.getFavouriteProducts = function(pagerOptions,callback) {
      callback = callback || function(){};
      var data = { catalogDB:   $scope.currentParams.db
                 , mr:          pagerOptions.maxRows || 75
                 , sr:          pagerOptions.startRow || 1
                 , uid:         network.getUserId()
                 };
      network.get('GetFavouriteProducts', data, function(result, response){
        if(result) {
          page.hideLoader();
          callback(httpAdapter.convert(response));
          if (response.length < (pagerOptions.maxRows || 75) ) {
            $scope.loadDownHidden = true;
          } else {
            $scope.loadDownHidden = false;
          }
        } else {

        }
      });
    };
    
    $scope.getProductFromCategory = function(pagerOptions,callback) {
      callback = callback || function(){};
      var data = { catalogDB:  $scope.currentParams.db
                 , pc:         $scope.currentParams.pcs
                 , pcv:        $scope.currentParams.pcvs
                 , mr:         pagerOptions.maxRows
                 , sr:         pagerOptions.startRow
                 };
      network.get('GetTreeLevelChildrenProducts', data, function(result, response){
        if(result) {
          if (response.length === 1) {
            $scope.showProductDetail(response[0]);
            $timeout(function(){
              page.navigatorPop();
            },500);
          }
          callback(httpAdapter.convert(response));
          if (response.length < (pagerOptions.maxRows || 75) ) {
            $scope.loadDownHidden = true;
          } else {
            $scope.loadDownHidden = false;
          }
          page.hideLoader();
        } else {
          
        }
      });
    };
    
    $scope.toogleLikes = function(item,index) {
      console.log(item);
      if (item.currentLike === undefined) item.currentLike = 0;
      item.likes = (item.currentLike > 0) 
          ? --item.likes : ++item.likes;
          
      item.currentLike = (item.currentLike === 0) ? 1 : 0;
      var data = { catalogDB: $scope.currentParams.db
                 , uid:       network.getUserId()
                 , pid:       item.id
                 , on:        item.currentLike
                 , glat:      ''
                 , glong:     ''
                 };
      network.get('ToggleEndorsementProduct',data,function(response){
        
      });
      
      if (!$scope.currentData.ajaxMethod || $scope.currentData.ajaxMethod === 'GetFavouriteProducts') {
        $scope.productList.splice(index,1);
        if ($scope.productList.length === 0) $scope.productList = [];
      }
      
    };
    
  }]);