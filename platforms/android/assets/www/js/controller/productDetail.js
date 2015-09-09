qaalog.controller('productDetail',['$scope','page','network','httpAdapter','$timeout','share','device',
  function($scope,page,network,httpAdapter,$timeout,share,device){
    
    var getProductDetails;
    var getFavoritesConfig;
    var getCrossSellingsInfo;
    var updateProductDetail;
    var onTabChange;
    
    $scope.imgPrefix = network.servisePath+'GetResizedImage?i=';
    var imgHeight = Math.floor(device.emToPx(20));
    $scope.imgSufix = '&w=768&h=347'//+imgHeight;
    $scope.imgGallerySufix = '&w=768&h=495';
    
    
    var settings = { name:      'productDetail'
                   , title:     'Product Detail'
                   , back:      true
                   , share:     true
                   , menu:      true
                   , tabs:      true
                   };
                   
    page.onShow(settings,function(params) {
      page.setTabs([{name: 'detail', value: 'details'},{name: 'related', value: 'related'}]);
      page.onTabChange = onTabChange;
      $scope.currentParams = params;
      console.log('params detail',params);
      $scope.galleryIndex = 0;
      updateProductDetail(params);

      page.setTab(params.tab || 'detail');


      if (typeof $scope.escapeListenerOff === 'function') {
        $scope.escapeListenerOff();
      }
      
      $scope.escapeListenerOff = $scope.$on('escapePressed',function(){
        $scope.$apply(function(){
          if ($scope.galleryStarted) {
            $scope.stopGallery();
            page.navigatorPop();
          }
        });
      });


    });

    $scope.$on('freeMemory',function(){
      $scope.productDetails = [];
      $scope.crossSellingInfo = {};
      $scope.crossSellingInfo.relatedList = [];
    });
    
    onTabChange = function(view) {
      page.toggleShareIcon(false);
      switch (view) {
        case 'detail':
          page.hideNoResult();
          page.toggleShareIcon(true);
          $scope.detailSwitch = false;
          page.addToCurrentParams({'tab':'detail'});
          break;
        case 'related':
          $scope.detailSwitch = true;
          page.addToCurrentParams({'tab':'related'});
          if ($scope.crossSellingInfo.relatedList.length === 0) {
            page.showNoResult();
          }
          break;
      }
    };

    $scope.dialPhoneNumber = function(number) {
      number = number.replace(/\s+/g,'');
      console.log('DIAL',number);

      if (device.isIOS()) {
          window.open('tel:' + number);
          return false;
      }

      window.plugins = window.plugins || {};

      if (window.plugins.webintent) {
        window.plugins.webintent.startActivity({
            action: window.plugins.webintent.ACTION_CALL,
            url: 'tel:' + number
          },
          function (e) {
            console.log(e);
          },

          function (e) {
            console.log(e);
          });
          return false;
      }

      window.open('tel:' + number,'_system');

    };
    
    $scope.showProductDetails = function(item) {
      var data = { db: $scope.currentParams.db
                 , id: item.id
                 };
      updateProductDetail(data);
      page.setTab('detail');
      app.wrapper.scrollTop = 0;
     // page.onTabChange('detail');
    };

    $scope.showMap = function(address) {
      network.getAddressLink(address, function(path){
        console.log('MAPS PATH', path);
        window.open(path,'_system');
      });
    };
    
    updateProductDetail = function(params) {
      getProductDetails(params,function(productDetails) {
        $scope.productDetails = productDetails;
        var list = productDetails.list;
        page.setTitle(productDetails.description.productName);
        $scope.productDetailsList = {};
        
        $timeout(function(){
          for (var i in productDetails.list) {
            var item = productDetails.list[i];
            
            $scope.productDetailsList[item.name.toLowerCase()] = item.value;
            if (item.name.toLowerCase() === 'url') {
              $scope.productDetailsList.URLName = item.value.match(/http.?:\/\/(.+?)\//)[1];
            }
          }
          
          $scope.productDetails.list = [];
          console.log(list);
          for (var i in list) {
            var item = list[i];
            if (item.name.toLowerCase() !== 'price_1' && item.name.toLowerCase() !== 'url' 
                    && item.name.toLowerCase() !== 'telefone' && item.name.toLowerCase() !== 'email'
                    && item.name.toLowerCase() !== 'morada') {
                $scope.productDetails.list.push(item);
            }
          }
          var data = { text:    $scope.currentParams.productDescription
                     , subject: $scope.currentParams.groupName
                     , image:   $scope.currentParams.image
                     , link:    $scope.productDetailsList.url
                     };
          share.setParams(data);
        });
        
        
        var data = { db: params.db
                   , id: productDetails.description.id
                   };
        getFavoritesConfig(data,function(favorites){
          $scope.favoritesConfig = favorites;
          $scope.favoritesConfig.likes = $scope.favoritesConfig.e;
        });
        getCrossSellingsInfo(data,function(info){
          $scope.crossSellingInfo = info;
          for (var i in $scope.crossSellingInfo.relatedList) {
            var item = $scope.crossSellingInfo.relatedList[i];
            for (var n in item.ch) {
              var data = item.ch[n];
              $scope.crossSellingInfo.relatedList[i][data.name.toLowerCase()] = data.value;
            }
          }
          console.log($scope.crossSellingInfo);
        });
      });
    };
    
    getProductDetails = function(params,callback) {
      callback = callback || function(){};
      var data = { catalogDB: params.db
                 , pid:  params.id || ''
                 , phid: params.productId || ''
                 , uid:  network.getUserId() || ''
                 , glat: ''
                 , glong: ''
                 };
      
      network.get('GetProductDetail',data,function(result, response){
        if (result) {
          page.hideLoader();
          callback(httpAdapter.convert(response));
        } else {
          
        }
      });
    };
    
    getFavoritesConfig = function(params,callback) {
      callback = callback || function(){};
      var data = { catalogDB: params.db
                 , uid:  network.getUserId()
                 , pid: params.id
                 };
      
      network.get('IsProductFavoriteEndorsed',data,function(result, response){
        if (result) {
          callback(response);
        } else {
          
        }
      });
    };
    
    getCrossSellingsInfo = function(params,callback) {
      callback = callback || function(){};
      var data = { catalogDB: params.db
                 , uid: network.getUserId()
                 , pid: params.id
                 };
                 
      network.get('GetCrossSellingAndEquivalentProducts',data,function(result, response){
        if (result) {
          page.hideNoResult();
          if (response.length < 1) {
            page.hideLoader();
            page.showNoResult();
            return false;
          }
          callback(httpAdapter.convert(response));
        } else {
          
        }
      });
    };
    
    $scope.galleryIndex = 0;
    var leftPic, rightPic, straightPic;
    
    
    $scope.startGallery = function() {
      $scope.galleryIndex = $scope.galleryIndex || 0;
      page.setHeaderVisiable(false);
      page.setPageScrollable(false);
      
      if (device.isIOS()) {
          StatusBar.hide();
          page.setStatusbarHidden(true);
      }
      
      $scope.galleryStarted = true;
      page.navigatorPush($scope.stopGallery);
    };
    
    $scope.navigateGallery = function(direction,index) {
      var LEFT = 0;
      var RIGHT = 1;
     // if ($scope.galleryStarted) {
        var galleryLength = $scope.productDetails.gallery.length;
        if (galleryLength < 2) {
           page.navigatorPop();
          $scope.stopGallery();
          return false;
        }
        
        $scope.galleryIndex = (index !== undefined) ? index : $scope.galleryIndex;
        if (direction === LEFT) {
          $scope.galleryIndex--;
        };
        
        if (direction === RIGHT) {
          $scope.galleryIndex++;
        }
                
        if ($scope.galleryIndex > galleryLength - 1) {
          $scope.galleryIndex = galleryLength - 1;
        }
        
        if ($scope.galleryIndex < 0) {
          $scope.galleryIndex = 0;
        }

        //$scope.productDetails.description.image = $scope.productDetails.gallery[$scope.galleryIndex].image;
        
        
        return false;
      //}
    };

    $scope.navigateStopedGallery = function(index) {
      $scope.renderStarted = true;
      $scope.galleryIndex = index;
      //$scope.productDetails.description.image = $scope.productDetails.gallery[$scope.galleryIndex].image;
      $timeout(function(){
        $scope.renderStarted = false;
      });
    };
    
    $scope.swipeGalleryExit = function() {
      $scope.stopGallery();
      page.navigatorPop();
    };
    
    $scope.stopGallery = function() {
      page.setHeaderVisiable(true);
      page.setPageScrollable(true);
      
      if (device.isIOS()) {
          StatusBar.show();
          page.setStatusbarHidden(false);
      }
      
      $scope.galleryStarted = false;
    };
    var timeoutId;
    $scope.showCloseBtn = function(value) {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      $scope.galleryCloseButtonShow = true;
      timeoutId = window.setTimeout(function(){
        console.log('close');
        $scope.$apply(function(){
           $scope.galleryCloseButtonShow = false;
        });
        timeoutId = false;
      },2000);
    };
    
    $scope.openLink = function(url) {
      url = url.split('##')[0];
      window.open(url,'_system');
    };
    
    
    $scope.toogleLikes = function() {
      $scope.productDetails.description.likes = ($scope.favoritesConfig.likes > 0) 
          ? --$scope.productDetails.description.likes : ++$scope.productDetails.description.likes;
          
      $scope.favoritesConfig.likes = ($scope.favoritesConfig.likes === 0) ? 1 : 0;
      var data = { catalogDB: $scope.currentParams.db
                 , uid:       network.getUserId()
                 , pid:       $scope.productDetails.description.id
                 , on:        $scope.favoritesConfig.likes
                 , glat:      ''
                 , glong:     ''
                 };
      network.get('ToggleEndorsementProduct',data,function(response){
        
      });
      
      
    };
    
}]);