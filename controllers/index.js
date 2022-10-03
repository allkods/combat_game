const Token=require('../modules/Token');

module.exports=function(app){

    app.get('/',(req,res)=>{
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        if(req.user){


            var token=JSON.stringify(Math.random())+JSON.stringify(Math.random())+JSON.stringify(Math.random());

        Token.findOne({ id: req.user.id }, (err, data) => {
            if(data){

                Token.updateOne({id:req.user.id},{$set:{token:token}},{new:true},function(err,data){
        
                    res.render("home", { token:token,user:JSON.stringify(req.user) });

               });

            }else{

                 Token({
                    id: req.user.id,
                    token: token
                }).save((err, data) => {
        
                    res.render("home", { token:token,user:JSON.stringify(req.user) });
                });

            }
        });



        }else{
            res.render('index',{csrfToken:req.csrfToken(),msg:req.flash('myerror')});
        }
        
    });

    // app.get('/home',isAuth,(req,res)=>{
    //     res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');

        
    // });
}