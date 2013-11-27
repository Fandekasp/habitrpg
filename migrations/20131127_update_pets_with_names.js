// Update the pets in the db:
// from: 'Dragon-Red': 5
// to:   'Dragon-Red': {'name': '', 'growth': 5}

db.users.find({'items.pets':{$exists: true}}).forEach(function(user){
    Object.keys(user.items.pets).forEach( function(pet) {
        var key = 'items.pets.' + pet,
            obj = {};
        obj[key] = {'name': '', 'growth': user.items.pets[pet]};
        db.users.update({_id: user._id}, { $set: obj });
    });
})
