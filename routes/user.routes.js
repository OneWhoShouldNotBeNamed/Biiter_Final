module.exports = function(app) {
 
    const user = require('../controller/user.controller.js');
   var IsAuth= require('../Auth/IsAuth.js');
    // Register New users
    app.post('/user/register',user.register);
 
    // Add Beats
     app.post('/user/addbeat', IsAuth,user.addBeats);
 
    //Retrieve all beats
    app.get('/user/', user.allBeats);

    //User Login
    app.post('/user/login', user.login);
    
    // Find the Users based on Name
    app.get('/user/:find', IsAuth ,user.findByName);
    
    // followUser
    app.post('/user/follow',IsAuth, user.follow);
/*
    // followUser
    app.post('/user/unfollow',IsAuth, user.unfollowUser);*/
    
   
}