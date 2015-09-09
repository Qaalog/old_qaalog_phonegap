qaalog.controller('catalogInfo',['$scope','page','network','httpAdapter',function($scope,page,network,httpAdapter){
    
    
    var settings = { name:   'catalogInfo'
                   , title:  'Catalog Information'
                   , back:   true
                   , menu:   true
                   };

    page.onShow(settings,function(params) {
      $scope.currentParams = params;
      console.log($scope.currentParams);
      page.hideLoader();
    });
    
}]);


