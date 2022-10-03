const express=require('express');
const app=express();


const passport=require('passport');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const csrf=require('csurf');
const csrfProtection=csrf({cookie:true});
const flash=require('connect-flash');
const User=require('./modules/UserModule');
require('./config/passport')(passport);

const mongoose=require('mongoose');
mongoose.connect("replace_this_with_mongoDB_connection_url_string");


// const socket=require('socket.io');
const WebSocket = require('ws');
const http = require('http');

app.use(express.urlencoded({limit:'50mb',extended:true}));
// app.use(bodyParser.json({limit:'50mb',extended:true}));
app.use(express.json());

app.use(cookieParser('ssdfsdfsdg4f6dsfadsf56'));
app.use(session({
  secret:'ssdfsdfsdg4f6dsfadsf56',
  resave:true,
  saveUninitialized:true
}));

app.use(flash());

app.use(csrfProtection);

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
   
    // handle CSRF token errors here
    res.status(403)
    res.send('unauthorised access');
  });


  app.use(passport.initialize());
  app.use(passport.session());

     //global variables
 app.use((req,res,next)=>{
  res.locals.success_msg= req.flash('success_msg');
  res.locals.error= req.flash('error');
  res.locals.message= req.flash('message');
  next();
});



//setting up view engine
app.set('view engine','ejs');


//setting up static path
var options={
  etag:true,
  maxAge:3600000,
  redirect:true,
  setHeaders:function(res,path,stat){
    res.set({
      'x-timestamt': Date.now()
    });
  }
}
app.use(express.static(`./public`));

//setting port number
const port=process.env.PORT || 8080;

//setting up server
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const sockets=[];
function toRoom(room,data){
  sockets.forEach(element => {
     if(Array.prototype.indexOf.call(element['rooms'], room) !== -1){
       element.send(data);
     }
  });

}

function toRoomBroadcast(room,ws,data){
  sockets.forEach(element => {
     if(Array.prototype.indexOf.call(element['rooms'], room) !== -1 && element !== ws){
       element.send(data);
     }
  });

}

server.listen(port);


//general routes
const index = require('./controllers/index');
const login = require('./controllers/login');

app.post('/signup',(req,res)=>{

  const { name } = req.body;
  if(name == ''){
    req.flash('myerror',true);
    res.redirect('/');
    return;
  }

  new User({
    name: name
  }).save(function (err, done) {
    if (err) throw err;
    req.login(done, function (err) {
      res.redirect('/');
  });
    
});

})


index(app);
login(app,passport);



const Token=require('./modules/Token');
const Room=require('./modules/RoomModule');


server.on('upgrade', function upgrade(request, socket, head) {
  // This function is not defined on purpose. Implement it with your own logic.
  var url=request.url;
  url=url.replace("/", "");
  url=url.split(",.sep.,");
  if(url[0]) var token=url[0];
  if(url[1]) var id=url[1];
  Token.findOne({ id: id,token:token }, (err, data) => {
    if(data){
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    }else{
      socket.destroy();
    }

  });
});



function getRandom(min,max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

wss.on('connection', function connection(ws) {
  ws['rooms']=[];
  ws['soc_id']=Math.random();
  sockets.push(ws);
  
  ws.on('message', function incoming(msg){
    var data=JSON.parse(msg);
    var match=data[0];

    if(match === 'createroom'){
      var user=data[1];

      var room_id=getRandom(100000,999999).toString();
    // var result=checkRoom(room_id);
    Room.findOne({"players.id":user._id},(err,data)=>{
      if(data !== null){
  
        ws.send(JSON.stringify( ["message","you are already in a room"] ));
      
      }else{

        Room.find({},(err,data)=>{
     
          for(var i=0; i<data.length; i++){
            if(data[i].room_id == room_id){
              room_id=getRandom(100000,999999).toString();
              i=0;
            }
          }
    
    
    
          Room.findOneAndUpdate(
          {
            created_by:user._id
          },
          {
            $set:{
              room_id:room_id,
              players:[{id:user._id,name:user.name,character:"",status:"not ready",soc_id:ws['soc_id']}],
              stat:"inactive",
              date:Date.now()
            }
          },
          {
            upsert:true,
            new:true
          },
          (err,room)=>{
            ws['rooms'].push(room_id);
            // Auth.to(room_id).emit("room_created",user,JSON.stringify(room));
            toRoom(room_id,JSON.stringify(["room_created",user,room]));
          }
          );
    
        });

      }
    });


    }
    else if(match === 'joinroom'){
      var user=data[1];
      var roomid=data[2];

      Room.findOne({"players.id":user._id},(err,data)=>{
        if(data !== null){
          ws.send(JSON.stringify( ["message","you are already in a room"] ));
        }else{
    
          Room.find({room_id:roomid},(err,data)=>{
    
            if(data.length === 0){
      
              ws.send(JSON.stringify( ["message","no such room exist !"] ));
        
            }else if(data[0].players.length === 0 ){
        
              ws.send(JSON.stringify( ["message","no such room exist !"] ));
        
            }else if(data[0].players.length === 4){
              ws.send(JSON.stringify( ["message","room is full...."] ));
            }else if(data[0].stat === 'active'){
              ws.send(JSON.stringify( ["message","room is closed, game has started"] ));
            }else{

              ws['rooms'].push(roomid);
        
              Room.findOneAndUpdate({
                room_id:roomid
              },
              {
                $push:{players:{
                  id:user._id,
                  name:user.name,
                  character:"",
                  status:"not ready",
                  soc_id:ws['soc_id']
                }
              }
            },
            {
              new:true
            },
            (err,room)=>{
              toRoom(roomid,JSON.stringify(["room_created",user,room]));
            });
            
              
            }
        
          });
    
    
        }
        
        });

    }
    else if(match === 'leaveroom'){
      var user=data[1];
      var roomid=data[2];
      
      var node=Array.prototype.indexOf.call(ws['rooms'], roomid);
      if(node !== -1) ws['rooms'].splice(node,1);

      Room.findOneAndUpdate({
        room_id:roomid
      },
      {
        $pull:{players:{
          id:user._id
        }
      }
    },
    {
      new:true
    },
    (err,room)=>{
      if(room.created_by === user._id){

        toRoom(roomid,JSON.stringify(["room_closed"]));
      }else{

        toRoom(roomid,JSON.stringify(["room_created",user,room]));
      }
    });

    }
    else if(match === 'start'){
      var user=data[1];
      var roomid=data[2];


      Room.find({room_id:roomid},(err,data)=>{
        if(data.length === 0){
    
          ws.send(JSON.stringify( ["message","no such room exist !"] ));

        }else if(data[0].players.length === 0 ){
    
          ws.send(JSON.stringify( ["message","no such room exist !"] ));
    
        }else if(data[0].players.length === 1 ){
    
          ws.send(JSON.stringify( ["message","you cannot start the game alone !"] ));
    
        }else{
          Room.findOneAndUpdate({
            room_id:roomid
          },
          {
            $set:{stat:"active"}
          },
          {
            new:true
          },
          (err,room)=>{
            toRoom(roomid,JSON.stringify(["proceed",room]));
          }
          );
        }
      });

    }
    else if(match === 'charselec'){
      var user=data[1];
      var roomid=data[2];
      var charname=data[3];

      Room.findOne({room_id:roomid } ,(err,data)=>{

        if(err) return;
    
        if(data === null) return;
    
        for(var i=0; i<data.players.length; i++){
          if(data.players[i].character == charname){
            return;
          }
        }
    
          Room.findOneAndUpdate({room_id:roomid ,"players.id":user._id} ,{$set:{"players.$.character":charname}}, { new:true }, (err,data)=>{
    
          
            toRoom(roomid,JSON.stringify(["chartaken",data.players]));
          });
    
        
      });
    }
    else if(match === 'statusready'){
      var user=data[1];
      var roomid=data[2];

      function error(func){

        Room.findOne({room_id:roomid,"players.id":user._id } ,(err,data)=>{
    
          if(err) return func("error");
    
          if(data === null) return func("error");
    
          var players=data.players;
          for(var i=0; i<players.length; i++){
            if(players[i].id === user._id && players[i].character === ""){
              return func("select character");
            }
          }
    
          return func("noerror");
    
        });
      }
    
      error(function(err){
        if(err !== "error"){
          if(err === "select character"){

            ws.send(JSON.stringify(["message","Please select a character before ready"]));
          }else{
    
            Room.findOneAndUpdate({room_id:roomid ,"players.id":user._id} ,{$set:{"players.$.status":"ready"}}, { new:true }, (err,data2)=>{
    
              toRoom(roomid,JSON.stringify(["statusready",user,data2.players]));
            
          });
    
          }
    
        }
      });
    }
    else if(match === 'readycancel'){
      var user=data[1];
      var roomid=data[2];

      Room.findOne({room_id:roomid,"players.id":user._id } ,(err,data)=>{

        if(err) return;
    
        if(data !== null){
    
          Room.findOneAndUpdate({room_id:roomid ,"players.id":user._id} ,{$set:{"players.$.status":"not ready"}}, { new:true }, (err,data2)=>{
    

            toRoom(roomid,JSON.stringify(["readycancel",user,data2.players]));
    
          });
    
        }
    
      });
    }
    else if(match === 'mainstart'){
      var user=data[1];
      var roomid=data[2];

      function error(func){
        Room.findOne({room_id:roomid,created_by:user._id } ,(err,data)=>{
    
          if (err) return func("error","");
    
          if(data === null){
            return func("error","");
          }else{
            var players=data.players;
    
            for(var i=0; i<players.length; i++){
              if(players[i].id === user._id && players[i].character === ""){
                return func("select character","");
              }
            }
    
    
            for(var i=0; i<players.length; i++){
              if(players[i].status === "not ready" && players[i].id !== data.created_by){
                return func("not ready","");
                
              }
            }
    
            return func("noerror",data.players);
          }
        });
    
      }
    
    
      error(function(err,players){
        if(err === "error") return;
    
        if(err === "not ready"){

          toRoom(roomid,JSON.stringify(["message","Players not ready"]));

        }else if(err === "select character"){
    
          toRoom(roomid,JSON.stringify(["message","Please select a character before ready"]));
        }else if(err === "noerror"){
          Room.findOneAndUpdate({room_id:roomid } ,{$set:{date:Date.now(),stat:"closed"}}, { new:true }, (err,data2)=>{
    
          });
  
          toRoom(roomid,JSON.stringify(["gamestarted",players]));
    
        }
    
      });

    }
    else if(match === 'ping'){
      ws.send(JSON.stringify(["pong"]));
    }
/******************************************************************************* */
    else if(match === "playerisready"){
      var room=data[1];
      toRoom(room,JSON.stringify(["playerisReady"]));
    }
    else if(match === 'moves'){
      var uid=data[1];
      var room=data[2];
      var move=data[3];
      var camMat=data[4];
      var camUp=data[5];

      toRoom(room,JSON.stringify(["moves",uid,move,camMat,camUp]));
    }
    else if(match === 'mousemove'){
      var uid=data[1];
      var room=data[2];
      var moveX=data[3];
      var moveY=data[4];

      toRoomBroadcast(room,ws,JSON.stringify(["mousemove",uid,moveX,moveY]));
    }
    else if(match === "position"){
      var keys=data[1];
      var uuid=data[2];
      var myroom=data[3];
      var posX=data[4];
      var posZ=data[5];
      toRoomBroadcast(myroom,ws,JSON.stringify(["position",keys,uuid,posX,posZ]));
    }
    else if(match === "idle"){
      var uuid=data[1], room=data[2];
      toRoom(room,JSON.stringify(["idle",uuid]));
    }
    else if(match === "dead"){
      var uuid=data[1], room=data[2];

      toRoom(room,JSON.stringify(["dead",uuid]));

    }


  });

  ws.on('close', function() {
    var soc_id=ws['soc_id'];
    var rooms=ws['rooms'];

    var node=Array.prototype.indexOf.call(sockets, ws);
    if(node !== -1) sockets.splice(node,1);

    Room.findOne({"players.soc_id":soc_id}, (err,data)=>{
          if(err) return;
          if(data === null) return;
      
          function getId(func){
            for(var i=0; i<data.players.length; i++){
              if(data.players[i].soc_id == soc_id){
                 return func(data.players[i].id);
              }
            }
          }
      
          getId(function(id){
            Room.findOneAndUpdate({"players.soc_id":soc_id} ,{$pull:{players:{soc_id:soc_id}}}, { new:true }, (err,data2)=>{
              if(data2.created_by === id){
                toRoom(data2.room_id,JSON.stringify(["room_closed"]));
                toRoom(data2.room_id,JSON.stringify(["playerDisconnect",id]));
              }else{

                toRoom(data2.room_id,JSON.stringify(["room_created",{_id:id},data2]));
                toRoom(data2.room_id,JSON.stringify(["playerDisconnect",id]));
              }
            });
      
          });
      
          
        });
      });


  });


/********************************************************************************* */


// const Game=io.of('/game');

// Game.use((socket, next) => {
//   var user=socket.handshake.auth.user;
//   var room=socket.handshake.auth.room;
//   Room.findOne({ room_id:room,"players.id":user._id }, (err, data) => {
//     if(data){
//       next();
//     }else{
//       next(new Error("Game authorisation error"));
//     }

//   });
// });

// Game.on('connection',socket=>{

//   socket.on('ping',()=>{
//     Game.to(socket.id).emit("ping");
//   });


//   socket.on('rejoin',function(room){
//     socket.join(room);
//   });

  // socket.on('keydown',function(uid,room,keys){
  //   Game.to(room).emit("keydown",uid,keys);

  // });
  // socket.on('keyup',function(uid,room,keys){
  //   Game.to(room).emit("keyup",uid,keys);

  // });

//   socket.on("mousemove",(uid,room,movX,movY)=>{
//     socket.broadcast.to(room).emit("mousemove",uid,movX,movY);
//   });

//   socket.on("position",(uid,room,posX,posZ)=>{
//     socket.broadcast.to(room).emit("position",uid,posX,posZ);
//   });

//   socket.on("idle",(uid,room)=>{
//     socket.broadcast.to(room).emit("idle",uid);
//   });


//   // socket.on("movement",(uid,room,move)=>{
//   //   socket.broadcast.to(room).emit("movement",uid,move);
//   // });

//   socket.on("moves",(uid,room,move)=>{
//     Game.to(room).emit("moves",uid,move);
//   });

//   socket.on("movesend",(uid,room,move)=>{
//     Game.to(room).emit("movesend",uid,move);
//   });

// });


// function clock(){
//   Room.find({stat:"closed"},(err,data)=>{
//     for(var i=0; i<data.length; i++){
//       if(Date.now() - data[i].date.getTime() > 15000 ){
//         Game.to(data[i].room_id).emit("allPlayersReady");
//         data[i].stat = "active";
//         data[i].save(function(){

//         });

//       }
//     }
//   });
// }
// setInterval(clock,20000);