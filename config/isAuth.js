module.exports=function(req,res,next){
    if(req.isAuthenticated()){
        if(req.user.type=='user'){
            return next();
        }else if(req.user.type=='admin'){
            res.redirect('/admin');
        } 
    }else{
        res.redirect(`/`);
    }
   }