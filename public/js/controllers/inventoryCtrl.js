habitrpg.controller("InventoryCtrl", ['$rootScope', '$scope', 'User', 'API_URL', '$http',
  function($rootScope, $scope, User, API_URL, $http) {

    var user = User.user;

    // convenience vars since these are accessed frequently

    $scope.selectedEgg = null; // {index: 1, name: "Tiger", value: 5}
    $scope.selectedPotion = null; // {index: 5, name: "Red", value: 3}
    $scope.petCount = _.size(User.user.items.pets);
    $scope.totalPets = _.size($scope.Items.eggs) * _.size($scope.Items.hatchingPotions);

    var countItems = function(items) {
      return _.reduce(items,function(m,v){return m+v;},0);
    }
    $scope.$watch('user.items.pets', function(pets){ $scope.petCount = countItems(pets); });
    $scope.$watch('user.items.eggs', function(eggs){ $scope.eggCount = countItems(eggs); });
    $scope.$watch('user.items.hatchingPotions', function(pots){ $scope.potCount = countItems(pots); });

    $scope.chooseEgg = function(egg){
      if ($scope.selectedEgg && $scope.selectedEgg.name == egg) {
        return $scope.selectedEgg = null; // clicked same egg, unselect
      }
      var eggData = _.findWhere(window.habitrpgShared.items.items.eggs, {name:egg});
      if (!$scope.selectedPotion) {
        $scope.selectedEgg = eggData;
      } else {
        $scope.hatch(eggData, $scope.selectedPotion);
      }
    }

    $scope.choosePotion = function(potion){
      if ($scope.selectedPotion && $scope.selectedPotion.name == potion) {
        return $scope.selectedPotion = null; // clicked same egg, unselect
      }
      // we really didn't think through the way these things are stored and getting passed around...
      var potionData = _.findWhere(window.habitrpgShared.items.items.hatchingPotions, {name:potion});
      if (!$scope.selectedEgg) {
        $scope.selectedPotion = potionData;
      } else {
        $scope.hatch($scope.selectedEgg, potionData);
      }
    }

    $scope.chooseFood = function(food){
      $scope.selectedFood = $scope.Items.food[food];
    }

    $scope.sellInventory = function() {
      // TODO DRY this
      if ($scope.selectedEgg) {
        user.items.eggs[$scope.selectedEgg.name]--;
        User.setMultiple({
          'items.eggs': user.items.eggs,
          'stats.gp': User.user.stats.gp + $scope.selectedEgg.value
        });
        $scope.selectedEgg = null;
      } else if ($scope.selectedPotion) {
        user.items.hatchingPotions[$scope.selectedPotion.name]--;
        User.setMultiple({
          'items.hatchingPotions': user.items.hatchingPotions,
          'stats.gp': User.user.stats.gp + $scope.selectedPotion.value
        });
        $scope.selectedPotion = null;
      } else if ($scope.selectedFood) {
        user.items.food[$scope.selectedFood.name]--;
        User.setMultiple({
          'items.food': user.items.food,
          'stats.gp': User.user.stats.gp + $scope.selectedFood.value
        });
        $scope.selectedFood = null;
      }

    }

    $scope.ownedItems = function(inventory){
      return _.pick(inventory, function(v,k){return v>0;});
    }

    $scope.hatch = function(egg, potion){
      var pet = egg.name+"-"+potion.name;
      if (user.items.pets[pet])
        return alert("You already have that pet, hatch a different combo.");

      var setObj = {};
      setObj['items.pets.' + pet] = 5;
      setObj['items.eggs.' + egg.name] = user.items.eggs[egg.name] - 1;
      setObj['items.hatchingPotions.' + potion.name] = user.items.hatchingPotions[potion.name] - 1;

      User.setMultiple(setObj);

      alert("Your egg hatched! Visit your stable to equip your pet.");

      $scope.selectedEgg = null;
      $scope.selectedPotion = null;
    }

    $scope.buy = function(type, item){
      var gems = User.user.balance * 4;
      if(gems < item.value) return $rootScope.modals.buyGems = true;
      var string = (type == 'hatchingPotion') ? 'hatching potion' : type; // give hatchingPotion a space
      var message = "Buy this " + string + " with " + item.value + " of your " + gems + " Gems?"
      if(confirm(message)){
        $http.post(API_URL + '/api/v1/market/buy?type=' + type, item)
          .success(function(data){
            User.user.items = data.items;
          });
      }
    }

    $scope.choosePet = function(egg, potion){
      var pet = egg + '-' + potion;

      // Feeding Pet
      if ($scope.selectedFood) {
        if (confirm('Feed ' + pet + ' a ' + $scope.selectedFood.name + '?')) {
          var setObj = {};
          var userPets = user.items.pets;
          userPets[pet] += ($scope.selectedFood.target == potion ? 50 : 2);
          if (userPets[pet] >= 150) {
            userPets[pet] = 0;
            setObj['items.mounts.' + pet] = true;
          }
          setObj['items.pets.' + pet] = userPets[pet];
          setObj['items.food.' + $scope.selectedFood.name] = user.items.food[$scope.selectedFood.name] - 1;
          User.setMultiple(setObj);
          $scope.selectedFood = null;
        }

      // Selecting Pet
      } else {
        var userCurrentPet = User.user.items.currentPet;
        if(userCurrentPet && userCurrentPet == pet){
          User.user.items.currentPet = null;
        }else{
          User.user.items.currentPet = pet;
        }
        User.set('items.currentPet', User.user.items.currentPet);
      }
    }

    $scope.chooseMount = function(egg, potion) {
      var mount = egg + '-' + potion;
      User.set('items.currentMount', (user.items.currentMount == mount) ? null : mount);
    }

  }
]);