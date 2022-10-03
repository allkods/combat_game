module.exports=function(req,res,next){
    var path=req.url.replace(/\//g, ",0056my25sep,");
    if(req.isAuthenticated()){
        if(req.user.type=='user'){
            res.redirect('/');
        }else if(req.user.type=='admin'){
           next();
        } 
    }else{
        res.redirect(`/login/${path}`);
    }
   }