'use strict';

describe('Inventory Controller', function() {
  var scope, ctrl, user, $rootScope;

  beforeEach(module('habitrpg'));
  beforeEach(inject(function($rootScope, $controller){
    user = {
      user: {
        stats: {gp: 0},
        items: {eggs: {'Cactus': 1}, hatchingPotions: {'Base': 1}, food: {'Meat': 1}, pets: {}},
      }
    };
    window.habitrpgShared.wrap(user.user);
    var mockWindow = {
      confirm: function(msg){
        return true;
      }
    };
    scope = $rootScope.$new();
    $rootScope.Content = window.habitrpgShared.content;
    ctrl = $controller('InventoryCtrl', {$scope: scope, User: user, $window: mockWindow});
  }));

  it('starts without any item selected', function(){
    expect(scope.selectedEgg).to.eql(null);
    expect(scope.selectedPotion).to.eql(null);
    expect(scope.selectedFood).to.eql(undefined);
  });

  it('chooses an egg', function(){
    scope.chooseEgg('Cactus');
    expect(scope.selectedEgg.key).to.eql('Cactus');
  });

  it('chooses a potion', function(){
    scope.choosePotion('Base');
    expect(scope.selectedPotion.key).to.eql('Base');
  });

  it('hatches a pet', function(){
    scope.chooseEgg('Cactus');
    scope.choosePotion('Base');
    expect(user.user.items.eggs).to.eql({'Cactus': 0});
    expect(user.user.items.hatchingPotions).to.eql({'Base': 0});
    expect(user.user.items.pets).to.eql({'Cactus-Base': 5});
    expect(scope.selectedEgg).to.eql(null);
    expect(scope.selectedPotion).to.eql(null);
  });

  it('sells an egg', function(){
    scope.chooseEgg('Cactus');
    scope.sellInventory();
    expect(user.user.items.eggs).to.eql({'Cactus': 0});
    expect(user.user.stats.gp).to.eql(3);
  });

  it('sells a potion', function(){
    scope.choosePotion('Base');
    scope.sellInventory();
    expect(user.user.items.hatchingPotions).to.eql({'Base': 0});
    expect(user.user.stats.gp).to.eql(2);
  });

  it('sells food', function(){
    scope.chooseFood('Meat');
    scope.sellInventory();
    expect(user.user.items.food).to.eql({'Meat': 0});
    expect(user.user.stats.gp).to.eql(1);
  });
});