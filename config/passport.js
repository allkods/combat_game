const LocalStrategy=require('passport-local').Strategy;
const User=require('../modules/UserModule');

module.exports=function(passport){
  passport.use('local-login',new LocalStrategy({usernameField:'name'},(name,done)=>{
    User.findOne({ name: name }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false,{message:'nameerr'}); }
      
        return done(null,user);
      });
        
}));

      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
       
      passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
          done(err, user);
        });
      });

 }