const notAuth = require('../config/notAuth');
module.exports = (app,passport) => {


app.post(`/login`,notAuth,(req, res, next) => {
    passport.authenticate('local-login',{
        successRedirect: '/',
        failureRedirect: `/`,
        failureFlash: true
      })(req,res,next);
});

    app.get('/logout',function(req,res){
        req.logout();
        res.redirect('/');
    });
}