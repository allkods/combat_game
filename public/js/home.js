const token= document.querySelector('meta[name="token"]').getAttribute('content');
const user= JSON.parse(document.querySelector('meta[name="user"]').getAttribute('content'));
const name=user.name;
const uid=user._id;
const playerss=[];
var playersReady=0;
var myroom=undefined;
var gamestarted=false;

var pingNow;
var ping;

const wss=new WebSocket("ws://192.168.28.27:8080/"+token+",.sep.,"+uid);




const loader={
    enable:function(){
        document.getElementById('loader').style.display="block";
    },
    disable:function(){
        document.getElementById('loader').style.display="none";
    }
}

const create=document.getElementById('create');
const createbtn=document.getElementById('createbtn');
const createclose=document.getElementById('Cclose');
const roomid=document.getElementById('roomid');
const joined=document.getElementById('joined').getElementsByTagName('ul')[0];
const proceedbtn=document.getElementById('proceed');

const join=document.getElementById('join');
const joinbtn=document.getElementById('joinbtn');
const joinclose=document.getElementById('close');
const joinroomid=document.getElementById('tojoininput');
const joinbtn2=document.getElementById('tojoinbtn');

const charactercnt=document.getElementById('charactercnt');
const cupbtn=document.getElementById('cupbtn');
const cdownbtn=document.getElementById('cdownbtn');
const charimg=document.querySelectorAll('#charimages>div');
const charimgselect=document.querySelectorAll('#charimages>div>input');

const psCnt=document.getElementById('psCnt');
const mainSbtn=document.getElementById('main-start-btn');
const readybtn=document.getElementById('ready-btn');
const scancelbtn=document.getElementById('s-cancel-btn');
const touchtostart=document.getElementById('touchtostart');
const touchtoFS=document.getElementById('touchtoFS');
const backgroundSong = document.getElementById('backgroundSong');
/******************************************************** */
const gamediv=document.getElementById('gamediv');



function popMsg(msg){
    var x=document.getElementById('message');
    if(msg == "you cannot start the game alone !"){
        create.style.display="block";
    }else{
        create.style.display="none";
    }
    x.style.display="flex";
    x.innerHTML="<p>"+msg+"</p>";
    setTimeout(function(){
        x.style.display="none";
        
    },2000);
}



/*                  EVENT LISTENERS                  */

createbtn.addEventListener('click',function(){
    wss.send(JSON.stringify( ["createroom",user] ));
    // create.style.display="block";
});

joinbtn.addEventListener('click',function(){
    join.style.display="flex";
});

createclose.addEventListener('click',function(){
    create.style.display="none";
    joined.innerHTML="";
    wss.send(JSON.stringify( ["leaveroom",user,myroom] ));
});

joinclose.addEventListener('click',function(){
    join.style.display="none";
    wss.send(JSON.stringify( ["leaveroom",user,myroom] ));
});

joinbtn2.addEventListener('click',function(){
    var jrid=joinroomid.value;
    wss.send(JSON.stringify( ["joinroom",user,jrid] ));
});
proceedbtn.addEventListener('click',function(){
    wss.send(JSON.stringify( ["start",user,myroom] ));
});
readybtn.addEventListener('click',function(){
    wss.send(JSON.stringify( ["statusready",user,myroom] ));
});
scancelbtn.addEventListener('click',function(){
    wss.send(JSON.stringify( ["readycancel",user,myroom] ));
});

mainSbtn.addEventListener('click',function(){
    wss.send(JSON.stringify( ["mainstart",user,myroom] ));
});




var pingStore=0;
/*                  SOCKET RECEIVERS                   */

wss.addEventListener('open',function(){
    console.log("websocket connected");
    // setInterval(function(){
    //         pingNow=Date.now();
    //         wss.send(JSON.stringify(["ping"]));
    //     },4000);
    pingStore = Date.now();
    wss.send(JSON.stringify(["ping"]));
});

wss.addEventListener('error',function(err){
    console.log(err);
});
wss.addEventListener('close',function(){
    console.log('connection closed');
});

wss.addEventListener('message',function(msg){
    var data=JSON.parse(msg.data);
    if(data.length < 1) return;

    var match=data[0];
    

    if(match === 'room_created'){

    room=data[2];
    create.style.display="block";
    join.style.display="none";
    roomid.innerHTML="room id: "+room.room_id;
    myroom=room.room_id;
    joined.innerHTML='';

    var players=room.players;

     for(var i=0; i<players.length; i++){
        if(players[i].id !== user._id){
            joined.innerHTML += "<li>"+players[i].name+" has joined...</li>";
        }else{
            joined.innerHTML += "<li>you have joined...</li>";
        }
    }

    if(user._id === room.created_by){
        proceedbtn.style.display="block";
    }else{
        proceedbtn.style.display="none";
    }
  


    }
    else if(match === 'room_closed'){
        popMsg("room has been closed..!!");
    }
    else if(match === 'message'){
        popMsg(data[1]);
    }
    else if(match === 'proceed'){
        var room=data[1];

        charactercnt.style.display="flex";
    psCnt.innerHTML="";
    for(var i=0; i<room.players.length; i++){
        if(room.players[i].id !== user._id){
            psCnt.innerHTML += "<p id='ready-"+room.players[i].id+"'>"+room.players[i].name+" - <span>not ready</span></p>";
        }
    }
    if(user._id === room.created_by){
        mainSbtn.style.display="block";
    }else{
        readybtn.style.display="block";
    }
    }
    else if(match === 'chartaken'){
        var players=data[1];

        charcnt=document.getElementsByClassName('char-cnt');
    for(var i=0; i<charcnt.length; i++){
        charcnt[i].getElementsByTagName('div')[0].style.background='transparent';
        charcnt[i].getElementsByTagName('div')[0].innerHTML='';
    }

    for(var i=0; i<players.length; i++){
        var charname=players[i].character;
        var charele=document.getElementById('char-'+charname);
        if(charele){
            charele.style.background="rgba(0,0,0,.9)";
            if(players[i].id == user._id){
                var ihtml="<p>Occupied by you";
            }else{
                var ihtml="<p>Occupied by "+players[i].name+"</p>";
            }
            charele.innerHTML=ihtml;
        }
    }
    }
    else if(match === 'statusready'){
        var thisuser=data[1];
        var players=data[2];

        if(thisuser._id === user._id){
            readybtn.style.display="none";
            scancelbtn.style.display="block";
          }
          psCnt.innerHTML="";
        for(var i=0; i<players.length; i++){
            if(players[i].id !== user._id){
                psCnt.innerHTML += "<p id='ready-"+players[i].id+"'>"+players[i].name+" - <span>ready</span></p>";
            }
        }
    }
    else if(match === 'readycancel'){
        var thisuser=data[1];
        var players=data[2];

        if(thisuser._id === user._id){
            readybtn.style.display="block";
            scancelbtn.style.display="none";
        }
        psCnt.innerHTML="";
      for(var i=0; i<players.length; i++){
          if(players[i].id !== user._id){
              psCnt.innerHTML += "<p id='ready-"+players[i].id+"'>"+players[i].name+" - <span>not ready</span></p>";
          }
      }
    }
    else if(match === 'pong'){
        var ping=Date.now()-pingStore;

        pingStore = Date.now();
        wss.send(JSON.stringify(["ping"]));
    }
    else if(match === 'playerDisconnect'){
        playersReady++;
    }
/*********************************************************************************************** */

    else if(match === 'gamestarted'){
        if(gamestarted) return;

        var pl=data[1];

        loader.enable();
        touchtostart.style.display="flex";

        for(var i=0; i<pl.length; i++){
            playerss.push({uid:pl[i].id,character:pl[i].character});
        }
        gamediv.style.display="block";

        init(function(){
            insertPlayers(function(){
        
                insertanimations(function(){
                    
                    initializePlayers(function(){

                        loadSounds(function(){

                            // calling animation frame
                            animate();

                            loader.disable();
                            wss.send(JSON.stringify(["playerisready",myroom]));


                        });
    
                    });
            
                });
            
            });
        });

    }
    else if(match === "playerisReady"){
        playersReady++;
        if(playersReady === 1){
            setTimeout(function(){
                gamestarted = true;
            },1000 * 30);
        }
        
        if(playersReady === models.length){
            touchtostart.style.display="none";
            gamestarted = true;
        }
    }
    else if(match === "mousemove"){
        var uuid=data[1];
        var movX=data[2];
        var movY=data[3];

        var i=getIndexById(uuid);
        if(models[i] === undefined) return;
    
        onmousemove(uuid,movX,movY);

    }
    else if(match === "moves"){
        var uuid=data[1];
        var move=data[2];
        var camMat=data[3];
        var camUp=data[4];

        var i=getIndexById(uuid);

        if(models[i] === undefined) return;


        models[i].camMat = camMat;
        models[i].camUp = camUp;
        
       if(move === 'KeyM'){
        models[i].animate(models[i].attack[models[i].aI].name,THREE.LoopOnce);
        }

        if(move == 'KeyP' && models[i].power >0){
            models[i].animate('block',THREE.LoopOnce);
            models[i].block=true;
        }else{
            models[i].block=false;
        }

        if(move === 'KeyU'){
            models[i].poweringup =true;
        }else{
            models[i].poweringup=false;
        }

        if(models[i].poweringup && models[i].power < 100){
            models[i].power += 0.1;
            models[i].animate('powerup',THREE.LoopOnce);
        }else{
            models[i].poweringup=false;
        }

        if(move === 'KeyN'){
            if(models[i].prevaction._clip.name !== 'throw' ||
            models[i].prevaction._clip.name === 'throw' &&
             !models[i].prevaction.isRunning()){

                if(models[i].power > 0){

                    models[i].animate('throw',THREE.LoopOnce);
                    setTimeout(function(){
                        powerballs.push( new powerBall(models[i].model,camMat,camUp));
                        if(models[i].power > 0) models[i].power -= 8;
                    },300)
                }
            }
       
        }

        if(models[i].power > 90 && models[i].blood < 100){
            models[i].blood += 0.005;
        }

    }
    else if(match === "position"){

        var keys=data[1], uuid=data[2], posX=data[3], posZ= data[4];
        var i=getIndexById(uuid);

        if(models[i] === undefined) return;

        models[i].model.position.x=posX;
        models[i].model.position.z=posZ;

        if( keys.includes('KeyW') && 
        keys.includes('KeyA') ||
        keys.includes('KeyW') && 
        keys.includes('KeyD') )
    {

        models[i].animate('running');
    }

    else if( keys.includes('KeyS') && 
             keys.includes('KeyA') ||
             keys.includes('KeyS') && 
             keys.includes('KeyD') )
    {

        models[i].animate('back');
    }

    else if( keys.includes('KeyA') )
    {
        models[i].animate('left');
    }
    else if( keys.includes('KeyD') )
    {
        models[i].animate('right');
    }
    else if( keys.includes('KeyW') )
    {
        models[i].animate('running');
    }
    else if(keys.includes('KeyS') )
    {
        models[i].animate('back');
    }

    }
    else if(match === "idle"){
        var uuid=data[1];

        var i=getIndexById(uuid);

        if(models[i] === undefined) return;

        models[i].animate('idle');
        
    }
    else if(match === 'dead'){
        var uuid=data[1];
        var i=getIndexById(uuid);

        models[i].animate('dead',THREE.LoopOnce);
        models[i].dead=true;

    }
});


window.addEventListener('load',function(){
    loader.disable();
});


/*              lOCAL EVENT LISTENERS               */

 cdownbtn.addEventListener('click',function(){
    slideDown();
 });
 cupbtn.addEventListener('click',function(){
    slideUp();
 });
 var ciI=0;
 function slideDown(){
     if(ciI < charimg.length-1){
        ciI++;
        for(var i=0; i<charimg.length; i++){
            charimg[i].style.transform="translateY(-"+ciI+"00%)";
         }

     }
 }

 function slideUp(){
    if(ciI > 0){
        ciI--;
       for(var i=0; i<charimg.length; i++){
           charimg[i].style.transform="translateY(-"+ciI+"00%)";
        }
        
    }
}
for(var i=0; i<charimgselect.length; i++){
    charimgselect[i].addEventListener('change',function(){
        wss.send(JSON.stringify(["charselec",user,myroom,this.value]));
    });
}


var backgroundSongfiles=['/music/music1.mp3','/music/music2.mp3','/music/music3.mp3'];
var backgroundSongsIndex=0;
var backgroundSongVolume = 0.03;

touchtoFS.addEventListener('click',function(){
    if(document.fullscreenEnabled){
        document.body.requestFullscreen();
    }
    touchtoFS.style.display="none";
    backgroundSong.volume = backgroundSongVolume;
    backgroundSong.play();
});

backgroundSong.addEventListener('ended',function(){
    
    if(backgroundSongsIndex < backgroundSongfiles.length - 1)
    backgroundSongsIndex++;
    else
    backgroundSongsIndex = 0;

    backgroundSong.src = backgroundSongfiles[backgroundSongsIndex];
    backgroundSong.volume = backgroundSongVolume;
    backgroundSong.play();
});

/**************************************************************************************/
//                                  GAME SCRIPT BELOW
/************************************************************************************* */


/*--------------------------------- JOY STICK CONTROLS ----------------------------- */
var joystickper=false;
var joyRadius;
var touchedI=0;
var touchedI2=0;

var joystick=document.getElementById('joystick');

var joycnt=document.getElementById('joystickcnt');
var jstoucher=document.getElementById('jsToucher');

var jcbound=joycnt.getBoundingClientRect();
var joycntcen={
    x:0,
    y:0
};
joycntcen.x = Math.round(jcbound.x+(joycnt.offsetWidth/2));
joycntcen.y = Math.round(jcbound.y+(joycnt.offsetWidth/2));

window.addEventListener('resize',function(){
    jcbound=joycnt.getBoundingClientRect();
    joycntcen.x = Math.round(jcbound.x+(joycnt.offsetWidth/2));
    joycntcen.y = Math.round(jcbound.y+(joycnt.offsetWidth/2));
});

jstoucher.addEventListener('touchstart',touchstart);
jstoucher.addEventListener('touchend',touchend);
jstoucher.addEventListener('touchmove',touchmove);

// jstoucher.addEventListener('mousedown',touchstart);
// jstoucher.addEventListener('mouseup',touchend);
// window.addEventListener('mousemove',jmmove);

function touchstart(e){

    var i = getIndexById(uid);
    if(models[i].dead) return;

    jcbound=joycnt.getBoundingClientRect();
    joycntcen.x = Math.round(jcbound.x+(joycnt.offsetWidth/2));
    joycntcen.y = Math.round(jcbound.y+(joycnt.offsetWidth/2));

        var x1=joycntcen.x;
        var y1=joycntcen.y;

        var x2=e.targetTouches[0].clientX;
        var y2=e.targetTouches[0].clientY;

        var xdis=x2-x1;
        var ydis=y2-y1;

        joyRadius=Math.sqrt(Math.pow(xdis,2) + Math.pow(ydis,2));

        
        if(joyRadius < joystick.offsetWidth/2){
            joystickper=true;
            joystick.style.background="rgba(255,255,255,.5)";
        }
}
function touchend(){

    if(joystickper){
        joystickper=false;
        joycnt.style.transform="rotate(0deg)";
        joystick.style.transform="translateX(0px)";
        joystick.style.background="rgba(255,255,255,.2)";
        joyRadius=0;
        var i=getIndexById(uid);
        models[i].keys=[];
        
        if(!models[i].dead)
        wss.send(JSON.stringify(["idle",uid,myroom]));
    }
}
function touchmove(e){
    if(!joystickper) return;

        var x1=joycntcen.x;
        var y1=joycntcen.y;

        var x2=e.targetTouches[0].clientX;
        var y2=e.changedTouches[0].clientY;

        var xdis=x2-x1;
        var ydis=y2-y1;

        delta_x = x2 - x1;
        delta_y = y2 - y1;

        theta = Math.atan2(delta_y, delta_x) * 180 / Math.PI;

        joycnt.style.transform="rotate("+Math.round(theta)+"deg)";

        joyRadius=Math.sqrt(Math.pow(xdis,2) + Math.pow(ydis,2));

        if(joyRadius < 40){
            joystick.style.transform="translateX("+joyRadius+"px)";
        }

        if(joyRadius >30){

            var i=getIndexById(uid);
        
            if(models[i].dead)
            return;

            if(theta > -22.5 && theta <22.5){
                models[i].keys=['KeyD'];
            }
            if(theta > -67.5 && theta < -22.5){
                models[i].keys=['KeyW','KeyD'];
            }
            if(theta > -112.5 && theta < -67.5){
                models[i].keys=['KeyW'];
            }
            if(theta > -157.5 && theta < -112.5){
                models[i].keys=['KeyW','KeyA'];
            }
            if(theta < -157.5 || theta > 157.5){
                models[i].keys=['KeyA'];
            }
            if(theta < 157.5 && theta > 112.5){
                models[i].keys=['KeyS','KeyA'];
            }
            if(theta < 112.5 && theta > 67.5){
                models[i].keys=['KeyS'];
            }
            if(theta < 67.5 && theta > 22.5){
                models[i].keys=['KeyS','KeyD'];
            }

        }


}

const Cattack=document.getElementById('attack');
const Cdefend=document.getElementById('defend');
const Cpowerup=document.getElementById('powerup');
const Cpattack=document.getElementById('powerattack');
const touchmover=document.getElementById('touchmover');
var tmmoveX,tmmoveY,tmtouched;

touchmover.addEventListener('touchstart',function(e){
    tmtouched={x:e.targetTouches[0].clientX,y:e.targetTouches[0].clientY};
    
});
touchmover.addEventListener('touchmove',function(e){
    tmmoveX=Math.round((e.targetTouches[0].clientX-tmtouched.x) * 0.2);
    tmmoveY=Math.round((e.targetTouches[0].clientY-tmtouched.y) * 0.09);

    onmousemove(uid,tmmoveX,tmmoveY);
    oncammove(tmmoveX,tmmoveY);
    wss.send(JSON.stringify(["mousemove",uid,myroom,tmmoveX,tmmoveY]));
    
});



Cattack.addEventListener('touchstart',function(){
    if(!gamestarted) return;

    var i=getIndexById(uid);
    if(models[i] === undefined) return;

    models[i].move = ['KeyM'];

    this.style.background="rgba(255,255,255,.5)";
});
Cattack.addEventListener('touchend',function(){
    if(!gamestarted) return;


    var i=getIndexById(uid);
    if(models[i] === undefined) return;


    var node=Array.prototype.indexOf.call(models[i].move, 'KeyM');
    if(node !== -1) models[i].move.splice(node,1);
    
    this.style.background="rgba(255,255,255,.2)";
});

Cdefend.addEventListener('touchstart',function(){
    if(!gamestarted) return;

    var i=getIndexById(uid);

    if(models[i] === undefined) return;

    models[i].move = ['KeyP'];
    this.style.background="rgba(255,255,255,.5)";
});
Cdefend.addEventListener('touchend',function(){
    if(!gamestarted) return;
    
    var i=getIndexById(uid);

    if(models[i] === undefined) return;

    var node=Array.prototype.indexOf.call(models[i].move, 'KeyP');
    if(node !== -1) models[i].move.splice(node,1);
    this.style.background="rgba(255,255,255,.2)";
});

Cpowerup.addEventListener('touchstart',function(){
    if(!gamestarted) return;

    var i=getIndexById(uid);

    if(models[i] === undefined) return;

    models[i].move = ['KeyU'];
    this.style.background="rgba(255,255,255,.5)";
});
Cpowerup.addEventListener('touchend',function(){
    if(!gamestarted) return;
    
    var i=getIndexById(uid);

    if(models[i] === undefined) return;

    var node=Array.prototype.indexOf.call(models[i].move, 'KeyU');
    if(node !== -1) models[i].move.splice(node,1);
    this.style.background="rgba(255,255,255,.2)";
});

Cpattack.addEventListener('touchstart',function(){
    if(!gamestarted) return;

    var i=getIndexById(uid);

    if(models[i] === undefined) return;

    models[i].move = ['KeyN'];
    this.style.background="rgba(255,255,255,.5)";
});
Cpattack.addEventListener('touchend',function(){
    if(!gamestarted) return;
    
    var i=getIndexById(uid);

    if(models[i] === undefined) return;

    var node=Array.prototype.indexOf.call(models[i].move, 'KeyN');
    if(node !== -1) models[i].move.splice(node,1);
    this.style.background="rgba(255,255,255,.2)";
});


/***************************** MAIN GAME **************************************/
/*                              USER DEFINED FUNCTIONS                              */


/*          functions for inserting 3d models and their animations         */

function loadSingleAnim(character,j,func){
    character.model.animations=[];

    var anim=new THREE.FBXLoader();
    anim.setPath('./characters/'+character.model.name+'/anim/');
    anim.load(animations[j].path,function(anim){

            var animation=anim.animations[0];
            animation.name=animations[j].name;
            character.model.animations.push(animation);
            return func();
    
        });

}

function loadAnim(model,func){
    var x=0;
    for(var i=0; i<animations.length; i++){
        loadSingleAnim(model,i,function(){
            x++;
            if(x == animations.length) return func();
        });
    }
}

function insertanimations(func){
    var x=0;
    for(var i=0; i< models.length; i++){
       loadAnim(models[i],function(){
            x++;
            if(x == models.length) return func();
       });
    }
}


function loadObject(i,func){
    var loader=new THREE.FBXLoader();
    loader.setPath('./characters/'+playerss[i].character+'/');
    loader.load('character.fbx',function(fbx){
        var model=fbx;
        model.uuid=playerss[i].uid;
        model.name=playerss[i].character;
        model.traverse( function ( object ) {
            if ( object.isMesh ) object.castShadow = true;
        });

        models.push(new player(model));
        return func();

    });
}


function insertPlayers(func){
    var i=0;
    var len=playerss.length;
    var x=0;
    for(var i=0; i<len; i++){
        loadObject(i,function(){
            x++;
            if(x == playerss.length) return func();
    });

    }
   
}




/*          on window resize updating renderer         */

function onWindowResize(){
    var width=window.innerWidth;
    var height=window.innerHeight;

    renderer.setSize(width,height);

    camera.aspect = width/height;
    camera.updateProjectionMatrix();
}



/*          function for moving object according to mousemove        */

function onmousemove( uuid,movX,movY) {
    var i=getIndexById(uuid);
    
    if(models[i].dead) return;

    var movementX = movX;
    var movementY = movY;

    euler.setFromQuaternion( models[i].model.quaternion );

    euler.y -= movementX * 0.002;
    euler.x =0;

    euler.x = Math.max( PI_2 - maxPolarAngle, Math.min( PI_2 - minPolarAngle, euler.x ) );

    models[i].model.quaternion.setFromEuler( euler );

}

function oncammove( movX,movY ) {

    var movementX = movX;
    var movementY = movY;

    euler.setFromQuaternion( camera.quaternion );

    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;

    euler.x = Math.max( PI_2 - maxPolarAngle, Math.min( PI_2 - minPolarAngle, euler.x ) );

    camera.quaternion.setFromEuler( euler );

}




/*          function for moving object forward and backward         */

function moveforward( object,distance,camMat,camUp) {
    // move forward parallel to the xz-plane
    // assumes camera.up is y-up

    var vec=new THREE.Vector3();
    vec.setFromMatrixColumn( camMat, 0 );
    vec.crossVectors( camUp, vec );
    object.position.addScaledVector( vec, distance );

}




/*           function for moving object left and right       */

function moveright (object, distance, camMat ) {

    var vec=new THREE.Vector3();
    vec.setFromMatrixColumn( camMat, 0 );
    object.position.addScaledVector( vec, distance );

};




/*          function for getting face direction of object        */

function getdirection(object) {

    var direction = new THREE.Vector3( 0, 0, - 1 );
    var v=new THREE.Vector3();
    return v.copy( direction ).applyQuaternion( object.quaternion );

}




/*          function for setting current user game position            */

function mygameposition(model,i){

    if(i === 0){ model.pos(0,-0.3,-2); model.rot(0,0,0); camera.rotation.y=3.142; }
    else if(i===1){ model.pos(0,-0.3,2); model.rot(0,3.142,0);}
    else if(i===2){ model.pos(-2,-0.3,0); model.rot(0,1.571,0); camera.rotation.y=1.571+3.142; }
    else if(i===3){ model.pos(2,-0.3,0); model.rot(0,-1.571,0); camera.rotation.y=-1.571+3.142; }
    else{ return; }

}




/*          function for setting other users game position            */

function othersgameposition(model,i){

    if(i === 0){ model.pos(0,-0.3,-2); model.rot(0,0,0); }
    else if(i===1){ model.pos(0,-0.3,2); model.rot(0,3.142,0); }
    else if(i===2){ model.pos(-2,-0.3,0); model.rot(0,1.571,0);}
    else if(i===3){ model.pos(2,-0.3,0); model.rot(0,-1.571,0); }
    else{ return; }

}




/*          function for detecting collision between two object           */

function getCollision(mod1,mod2){

        xDis=mod2.model.position.x-mod1.model.position.x;
        zDis=mod2.model.position.z-mod1.model.position.z;

        var x=Math.sqrt(Math.pow(xDis,2) + Math.pow(zDis,2));

        return x;

}




/*          function for getting other users index number from players array           */

function getOthersIndex(ind){
    var arr=[];
    for(var i=0; i<models.length; i++){
        if(i !== ind){
            arr.push(i);
        }
    }
    return arr;
}




/*          function for getting current user index number from players array           */

function getModelIndex(){
    for(var i=0; i<models.length; i++){
        if(models[i].model.uuid === uid){
            return i;
        }
    }
    return undefined;

}




/*          function for getting user index number from player array by uid         */

function getIndexById(id){
    for(var i=0; i<models.length; i++){
        if(models[i].model.uuid === id){
            return i;
        }
    }
    return undefined;

}




/*          function for creating blood bar above all users except current user           */

function createBloodBar(model){
    var geometry = new THREE.PlaneBufferGeometry( 0.09, 0.009 );
    var material = new THREE.MeshBasicMaterial( {color: "rgb(228, 0, 0)", side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.uuid=model.uuid;

    plane.position.x=model.position.x;
    plane.position.z=model.position.z;
    plane.position.y=0.25;

    var i=getIndexById(uid);
    plane.lookAt(models[i].model.position.x, 0, models[i].model.position.z);
    scene.add(plane);

    bloodBars.push(plane);
   

}



/*          function for updating other users blood bar          */

function updateBloodBars(){
    for(var j=0; j<bloodBars.length; j++){
        var k=bloodBars[j].uuid;
        k=getIndexById(k);

        bloodBars[j].position.x=models[k].model.position.x;
        bloodBars[j].position.z=models[k].model.position.z;
        bloodBars[j].position.y=0.25;
    
        bloodBars[j].lookAt(camera.position.x, 0, camera.position.z);

        var bl=models[k].blood;
        var pr= bl/100;

        if(pr>0)
        bloodBars[j].scale.x=pr;
        else
        bloodBars[j].scale.x=0;
        
    }
}



/*          function for updating current user blood and power bar           */

function updateMyBars(){
    bloodline.style.width=models[getIndexById(uid)].blood+"%";
    powerline.style.width=models[getIndexById(uid)].power+"%";
}




/*          function for updating player ray of collision according to player movement          */

function updateRay(){
    for(var i=0; i<models.length; i++){
        var dir=getdirection(models[i].model);
    
        var z=-0.35*dir.z + models[i].model.position.z;
        var x=-0.35*dir.x + models[i].model.position.x;
    
        models[i].ray.x=x;
        models[i].ray.z=z;

    }
}







/*          function for updating camera on model movement          */

function cameraUpdate(){
    var j=getModelIndex(uid);
    if(models[j] === undefined) return;

    var dir=getdirection(models[j].model);

    var z=0.7*dir.z + models[j].model.position.z;
    var x=0.7*dir.x + models[j].model.position.x;

    camera.position.x=x;
    camera.position.z=z;
}

function movementLogic(){
    if(!gamestarted) return;

        var i=getIndexById(uid);

        var mymodel=models[i];

        if(mymodel.dead) return;

        if(mymodel.prevaction._clip.name === 'beaten' && mymodel.prevaction.isRunning())
        return;

        if( mymodel.keys.includes('KeyW') && 
            mymodel.keys.includes('KeyA') ||
            mymodel.keys.includes('KeyW') && 
            mymodel.keys.includes('KeyD') )
        {

            mymodel.speed = 0.013;
            mymodel.animate('running');
        }

        else if( mymodel.keys.includes('KeyS') && 
                 mymodel.keys.includes('KeyA') ||
                 mymodel.keys.includes('KeyS') && 
                 mymodel.keys.includes('KeyD') )
        {

            mymodel.speed = 0.010;
            mymodel.animate('back');
        }

        else if( mymodel.keys.includes('KeyA') )
        {
            mymodel.speed = 0.010;
            mymodel.animate('left');
        }
        else if( mymodel.keys.includes('KeyD') )
        {

            mymodel.speed = 0.010;
            mymodel.animate('right');
        }
        else if( mymodel.keys.includes('KeyW') )
        {

            mymodel.speed = 0.015;
            mymodel.animate('running');
        }
        else if( mymodel.keys.includes('KeyS') )
        {

            mymodel.speed = 0.010;
            mymodel.animate('back');
        }



        if( mymodel.getAttack(mymodel.prevaction._clip.name) !== undefined && 
            mymodel.prevaction.isRunning() || 
            mymodel.prevaction._clip.name === 'block' && 
            mymodel.prevaction.isRunning() ||
            mymodel.prevaction._clip.name === 'throw' && 
            mymodel.prevaction.isRunning() )
        {
            mymodel.speed=0.001;
        }


         if(mymodel.keys.includes('KeyW',0)){
            moveforward(mymodel.model,mymodel.speed,camera.matrix,camera.up);
        }
        if(mymodel.keys.includes('KeyS',0)){
            moveforward(mymodel.model,-mymodel.speed,camera.matrix,camera.up);
        }
        if(mymodel.keys.includes('KeyA',0)){
            moveright(mymodel.model,-mymodel.speed,camera.matrix);
        }
        if(mymodel.keys.includes('KeyD',0)){
            moveright(mymodel.model,mymodel.speed,camera.matrix);
        }
       
        

        if( mymodel.keys.length === 0 && mymodel.move.length ===0 && mymodel.prevaction._clip.name !== "idle" ){
                wss.send(JSON.stringify(["idle",uid,myroom]));
         }


        
        if(mymodel.model.position.z > 2){
            mymodel.model.position.z = 2;
        }
        if(mymodel.model.position.z < -2){
            mymodel.model.position.z = -2;
        }
        if(mymodel.model.position.x > 2){
            mymodel.model.position.x = 2;
        }
        if(mymodel.model.position.x < -2){
            mymodel.model.position.x = -2;
        }

       
        if( mymodel.keys.includes('KeyW',0) || 
            mymodel.keys.includes('KeyA',0) || 
            mymodel.keys.includes('KeyD',0) || 
            mymodel.keys.includes('KeyS',0)){
            wss.send(JSON.stringify(["position",mymodel.keys,uid,myroom,mymodel.model.position.x,mymodel.model.position.z]));
        }





var ci=getIndexById(uid);
var oi=getOthersIndex(ci);

for(var j=0; j<oi.length; j++){
var k=oi[j];
var gc=getCollision(models[ci],models[k]);

if(gc < 0.30){
    models[ci].speed +=0.001;

    if(models[ci].keys.includes('KeyW',0)){
        moveforward(models[ci].model,-models[ci].speed,camera.matrix,camera.up);
        models[ci].animate('running');
    }if(models[ci].keys.includes('KeyS',0)){
        moveforward(models[ci].model,models[ci].speed,camera.matrix,camera.up);
        models[ci].animate('running');
    }if(models[ci].keys.includes('KeyA',0)){
        moveright(models[ci].model,models[ci].speed,camera.matrix);
        models[ci].animate('running');
    }if(models[ci].keys.includes('KeyD',0)){
        moveright(models[ci].model,-models[ci].speed,camera.matrix);
        models[ci].animate('running');
    }


}else{
    models[ci].speed=0.020;
}
if(gc <0.35){
    var node=Array.prototype.indexOf.call(models[ci].collision, models[k].model.uuid);
    if(node === -1) models[ci].collision.push(models[k].model.uuid);
    
    node=Array.prototype.indexOf.call(models[k].collision, models[ci].model.uuid);
    if(node === -1) models[k].collision.push(models[ci].model.uuid);
    
    }else{
    
    var node=Array.prototype.indexOf.call(models[ci].collision, models[k].model.uuid);
    if(node !== -1) models[ci].collision.splice(node,1);
    
    node=Array.prototype.indexOf.call(models[k].collision, models[ci].model.uuid);
    if(node !== -1) models[k].collision.splice(node,1);
    
    }
}


}

/*          function for animating at 60 fps           */

function animate(){
    requestAnimationFrame(animate);
                let mixerUpdateDelta = clock.getDelta();
                for(var i=0; i<models.length; i++){
                    models[i].mixer.update( mixerUpdateDelta );
                }

                updateMyBars();
                updateBloodBars();
                updateRay();
                cameraUpdate();
                movementLogic();
                gameLogic();
                updatePowerBalls();
                
                renderer.render( scene, camera );
}




/*          function for adding event listeners to animation mixers          */

function mixerListener(model){
    model.mixer.addEventListener( 'finished', function( e ) {

        if(model.dead) return;

        if(e.action._clip.name !== 'powerup'){

            model.timeout=setTimeout(function(){
                model.animate('idle');
            },300);
        }
        
     });

}





function init(func){

    //scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff  );
    //scene.fog = new THREE.Fog( 0xffffff, 3, 10 );
    
    //camera
    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 30000 );
    camera.position.set( 0, 0.1, 0);
    
    //audio listener
    listener = new THREE.AudioListener();
	camera.add( listener );

    clock = new THREE.Clock();
    
    
    
    //lightings
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );
    
    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( - 3, 15, 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add( dirLight );
    
    const geometry = new THREE.BoxGeometry( 6, 6, 6 );
    const sides=[];
    const loads=[];
       var fr= new THREE.TextureLoader().load('skybox/fr2.png');
       var bk= new THREE.TextureLoader().load('skybox/bk2.png');
       var up= new THREE.TextureLoader().load('skybox/up2.png');
       var dn= new THREE.TextureLoader().load('skybox/dn2.png');
       var rt= new THREE.TextureLoader().load('skybox/rt2.png');
       var lt= new THREE.TextureLoader().load('skybox/lt2.png');
    
       loads.push(fr,bk,up,dn,rt,lt);
    
       for(var i=0; i<loads.length; i++){
           loads[i].repeat.x=1;
           loads[i].repeat.y=1;
           loads[i].offset.x=0;
           loads[i].offset.y=0;
       }
    
       
       sides.push(new THREE.MeshBasicMaterial({map: fr}));
       sides.push(new THREE.MeshBasicMaterial({map: bk}));
       sides.push(new THREE.MeshBasicMaterial({map: up}));
       sides.push(new THREE.MeshBasicMaterial({map: dn}));
       sides.push(new THREE.MeshBasicMaterial({map: rt}));
       sides.push(new THREE.MeshBasicMaterial({map: lt}));
    
       for(var i=0; i<sides.length; i++){
        sides[i].side=THREE.BackSide;
       }
     
    const cube = new THREE.Mesh( geometry, sides );
    scene.add( cube );
    cube.position.y=2.7;
    cube.receiveShadow=true;

    
    //renderer
    renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    
    gamediv.appendChild(renderer.domElement);
    
    
    window.addEventListener( 'resize', onWindowResize, false );
    
    return func();
}



var movesendInd=0;
function gameLogic(){
    if(!gamestarted) return;

        var i = getIndexById(uid);

        var mymodel=models[i];

        if(mymodel.dead) return;

        if(mymodel.prevaction._clip.name === 'beaten' && mymodel.prevaction.isRunning())
        return;

        if(mymodel.blood < 1 && !mymodel.dead ){
            wss.send(JSON.stringify(["dead",uid,myroom]));
        }

        if(mymodel.move.length > 0){
            movesendInd = 1;
            wss.send(JSON.stringify(["moves",uid,myroom,mymodel.move[0],camera.matrix,camera.up]));
        }else{

            if(movesendInd == 1){
                wss.send(JSON.stringify(["moves",uid,myroom,'',camera.matrix,camera.up]));
                movesendInd = 0;
            }

        }




}


function initializePlayers(func){

    for(var i=0; i<models.length;i++){
                    
            
        // setting sizes and position
        models[i].scale(0.003,0.003,0.003);
        if(models[i].model.uuid == uid){
            mygameposition(models[i],i);
        }else{
            othersgameposition(models[i],i);
        }

        if(models[i].model.name == 'dreyar'){
            models[i].scale(0.00028,0.00028,0.00028);
        }

        // creating other users blood bar
        if(models[i].model.uuid !== uid){
            createBloodBar(models[i].model);
        }

        // activating idle animation to the characters
        var clip = THREE.AnimationClip.findByName( models[i].model.animations, 'idle');

        models[i].action=models[i].mixer.clipAction(clip);
        models[i].prevaction=models[i].action;

        models[i].action.play();

        //attaching event listeners to the models mixer
        mixerListener(models[i]);

        //adding model to the scene
        scene.add(models[i].model);
        
}
//setting ray position;
updateRay();
// setting new camera position
cameraUpdate();

return func();

}




/*                              VARIABLES DECLARATION                              */


var bloodline=document.getElementById('bloodline');
var powerline=document.getElementById('powerline');
var powerTimeout=null;


const bloodBars=[];
var timeout;
let sphere;

let scene, renderer, camera, stats;
let models=[], clock;
let listener;

const powerballs=[];

let animprep=[];
let animations=[
    {name:'idle', path:'idle.fbx'},
    {name:'running', path:'running.fbx'},
    {name:'back', path:'back.fbx'},
    {name:'left', path:'left.fbx'},
    {name:'right', path:'right.fbx'},
    {name:'kick1', path:'kick1.fbx'},
    {name:'kick2', path:'kick2.fbx'},
    {name:'kick3', path:'kick3.fbx'},
    {name:'punch1', path:'punch1.fbx'},
    {name:'punch2', path:'punch2.fbx'},
    {name:'punch3', path:'punch3.fbx'},
    {name:'block', path:'block.fbx'},
    {name:'dead', path:'dead.fbx'},
    {name:'beaten', path:'beaten.fbx'},
    {name:'powerup', path:'powerup.fbx'},
    {name:'throw', path:'throw.fbx'}
];
var controls;
const euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
const PI_2 = Math.PI / 2;
minPolarAngle = 0; // radians
maxPolarAngle = Math.PI;



/*                              OBJECTS                              */


/*          player object           */

function player(model){
    this.model=model;
    this.mixer=new THREE.AnimationMixer( this.model );
    this.action=undefined; this.prevaction=undefined;
    this.keys=[];
    this.move=[];
    this.speed=0.020;
    this.collision=[];
    this.timeout;
    this.ray={x:null,z:null};

    this.sounds={};
    this.analyser={};
    this.attack=[
        {name:'punch1',pow:1,sound:'attack'},
        {name:'punch2',pow:1.5,sound:'attack'},
        {name:'punch3',pow:2,sound:'attack'},
         {name:'kick1',pow:2.5,sound:'attack'},
         {name:'kick2',pow:3,sound:'attack'},
         {name:'kick3',pow:3.5,sound:'attackspc'}
    ];
    this.aI=0;

    this.blood=100; this.power=100; this.block=false;
    this.dead=false;
    this.poweringup=false;

    this.beatenIndex=0;

    this.getAttack=function(name){

        for(var i=0; i<this.attack.length; i++){
            if(this.attack[i].name === name)
            return this.attack[i];
        }
        return undefined;
    }

    this.animate=function(name,loop=false){
        clearTimeout(this.timeout);
        var mymodel=this.model;



        if(this.prevaction._clip.name === 'idle' && name === 'idle'){
            return;
        }

        if(this.prevaction._clip.name == 'running' && name === 'running'){
            return;
        }
        if(this.prevaction._clip.name == 'back' && name === 'back'){
            return;
        }
        if(this.prevaction._clip.name == 'left' && name === 'left'){
            return;
        }
        if(this.prevaction._clip.name == 'right' && name === 'right'){
            return;
        }

        if(this.prevaction._clip.name == 'throw' && name === 'throw' && this.prevaction.isRunning()){
            return;
        }

        if(this.prevaction._clip.name == 'powerup' && name === 'powerup'){
            return;
        }

        if( this.prevaction.isRunning()  &&
            this.prevaction._clip.name !== 'idle' &&
            this.prevaction._clip.name !== 'running' &&
            this.prevaction._clip.name !== 'back' &&
            this.prevaction._clip.name !== 'left' &&
            this.prevaction._clip.name !== 'right' &&
            name !== 'dead' && name !== 'beaten' ){
            return;
        }

        if(this.prevaction._clip.name === 'dead') return;
       

        var kk = Object.keys(this.sounds);
        for(var i=0; i<kk.length; i++){
            var src = this.sounds[kk[i]].src;
            this.sounds[kk[i]].src = "";
            this.sounds[kk[i]].src = src;
        }
        

        var attack=this.getAttack(name);
        if(attack !== undefined){

            if(this.aI < this.attack.length -1)
            this.aI++;
            else
            this.aI=0;

            for(var k=0; k<this.collision.length; k++){
                var mod= getIndexById(this.collision[k]);

                xDis=models[mod].model.position.x-this.ray.x;
                zDis=models[mod].model.position.z-this.ray.z;
        
                var x=Math.sqrt(Math.pow(xDis,2) + Math.pow(zDis,2));

               if(x < 0.20){

                if(models[mod].block && models[mod].power > 0){
                    models[mod].blood -= attack.pow/2;
                    if(models[mod].power > 0) models[mod].power -= 4;
                    models[mod].sounds.block.play();
                }else{
                    models[mod].blood -= attack.pow;
                    if(models[mod].blood > 0)
                    models[mod].animate('beaten',THREE.LoopOnce);
                    models[mod].sounds[attack.sound].play();
                }

               }

            }

        }


        var clip = THREE.AnimationClip.findByName( mymodel.animations, name);

        this.action=this.mixer.clipAction(clip);
        if(loop){
            this.action.loop =loop;
        }

        this.action.reset();
        this.action.weight=1;
        this.action.clampWhenFinished=true;


        if(name == 'powerup'){
            this.sounds.powerup.loop = true;
            this.sounds['powerup'].play();
        }
        else if(name == 'throw'){
            this.sounds.throw.play();
            this.action.setDuration(.5);
        }
        else if(name == 'dead'){
            this.sounds.dead.play();
        }
        else if(attack !== undefined){
            this.action.setDuration(1);
        }
        else if(name == 'beaten'){
            if(this.power > 10){
                this.action.setDuration(.8);
            }else{
                this.beatenIndex++;
                this.action.setDuration(1.1);
                if(this.beatenIndex > 3){
                    this.action.setDuration(.2);
                    this.beatenIndex=0;
                }
            }
        }

        

        

        

        if(this.prevaction._clip.name !== name){
            this.prevaction.crossFadeTo( this.action, 0.5, false ).play();
        }else{
            this.action.play();
        }
        this.prevaction=this.action;
    }

    this.pos=function(x,y,z){ this.model.position.x=x; this.model.position.y=y; this.model.position.z=z; }
    this.rot=function(x,y,z){ this.model.rotation.x=x; this.model.rotation.y=y; this.model.rotation.z=z; }
    this.scale=function(x,y,z){ this.model.scale.x=x; this.model.scale.y=y; this.model.scale.z=z; }


}



/*                                  EVENT LISTENERS                           */


/*          enabling pointer lock control on click event            */





 






/*                              PROGRAM EXECUTION                                */




/*          inserting 3d players to the scene            */



    // document.body.addEventListener( 'click', function () {
    //     if(!gamestarted) return;
    
    //     controls.lock();
    //     touchtostart.style.display="none";
    // }, false );
    
    
    
    
    /*          rotating camera and model on mouse move          */
    
    document.body.addEventListener( 'mousemove', function (event) {
        
        if(!gamestarted) return;
    
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        
    
        onmousemove(uid,movementX,movementY);
        oncammove(movementX,movementY);

        wss.send(JSON.stringify(["mousemove",uid,myroom,movementX,movementY]));
    
    }, false );

    /*          assigning pressed key to the owner object on key down          */

window.addEventListener('keydown',function(e){
    if(!gamestarted) return;

    var i=getIndexById(uid);

    if(models[i] === undefined) return;

        var key= e.code || e.key;
        if(key == 'KeyM'){
            models[i].move = ['KeyM'];
        }else if(key == 'KeyP'){
            models[i].move = ['KeyP'];
        }else if(key == 'KeyU'){
            models[i].move = ['KeyU'];
        }else if(key == 'KeyN'){
            models[i].move = ['KeyN'];
        }
        else{
            
           var node=Array.prototype.indexOf.call(models[i].keys, key);
           if(node === -1) models[i].keys.push(key);


        }


});


/*          removing pressed key from the owner object on key up          */

window.addEventListener('keyup',function(e){
    if(!gamestarted) return;

    var i=getIndexById(uid);

    if(models[i] === undefined) return;

        var key= e.code || e.key;

        if(key == 'KeyM' || key == 'KeyP' || key == 'KeyU' || key == 'KeyN' ){
            var node=Array.prototype.indexOf.call(models[i].move, key);
            if(node !== -1) models[i].move.splice(node,1);
        }
        else{        
        
            var node=Array.prototype.indexOf.call(models[i].keys, key);
            if(node !== -1) models[i].keys.splice(node,1);
        }

});


const soundFiles = {
    attack:'/music/attack.mp3',
    attackspc:'/music/attackspc.mp3',
    block:'/music/block.mp3',
    powerup:'/music/powerup.mp3',
    ball:'/music/ball.mp3',
    throw:'/music/throw.mp3',
    dead:'/music/dead.mp3'
}
function loadSounds(func){

    const keys=Object.keys(soundFiles);
    for(var i=0; i<models.length; i++){

        for(var j=0; j<keys.length; j++){

            var se = document.createElement('audio');
            se.setAttribute('src',soundFiles[keys[j]]);
            models[i].sounds[keys[j]] = se;

            var sdemo = new THREE.PositionalAudio( listener );
            sdemo.setMediaElementSource( se );
            sdemo.setRefDistance( 0.2 );
			
			models[i].model.add( sdemo );

            models[i].analyser[keys[j]] = new THREE.AudioAnalyser( sdemo, 32 );


        }



        
    }
 
    return func();

}

function powerBall(node,camMat,camUp){

    this.camMat = camMat;
    this.camUp = camUp;
      
    const gm = new THREE.SphereGeometry( 0.1, 50, 50 );
    const material = new THREE.MeshPhongMaterial( { color: 0xffff00, opacity: 0.7, transparent:true } );
    material.side = THREE.DoubleSide;
    this.sphere = new THREE.Mesh( gm, material );

    this.sphere.position.y=0.05;
    this.sphere.rotation.y=node.rotation.y;

    var dir=getdirection(node);

    var z=-0.3*dir.z + node.position.z;
    var x=-0.3*dir.x + node.position.x;

    this.sphere.position.x=x;
    this.sphere.position.z=z;

    scene.add( this.sphere );
}

function updatePowerBalls(){

    for(var i=0; i<powerballs.length; i++){

        var mymodel = powerballs[i];

        moveforward(mymodel.sphere,0.1,mymodel.camMat,mymodel.camUp);

        if( mymodel.sphere.position.z > 3  || 
            mymodel.sphere.position.z < -3 ||
            mymodel.sphere.position.x > 3  ||
            mymodel.sphere.position.x < -3 ){
            removePowerBall(i);
            i--;
            continue;
        }


        for(var j=0; j<models.length; j++){

            var mod2 = models[j];

            xDis=mod2.model.position.x-mymodel.sphere.position.x;
            zDis=mod2.model.position.z-mymodel.sphere.position.z;

            var gc=Math.sqrt(Math.pow(xDis,2) + Math.pow(zDis,2));

            if(gc < 0.25){

                removePowerBall(i);
                powerBallHit(j);
                i--;
                break;

            }
        }


       
    }
}

function removePowerBall(i){

    powerballs[i].sphere.geometry.dispose();
    powerballs[i].sphere.material.dispose();
    scene.remove( powerballs[i].sphere );
    renderer.renderLists.dispose();
    powerballs.splice(i,1);
}

function powerBallHit(i){
    var mymodel = models[i];

    if(mymodel.block && mymodel.power > 0){
        mymodel.blood -= 2;
        if(mymodel.power > 0) mymodel.power -= 5;
        mymodel.sounds.block.play();
    }else{
        mymodel.blood -= 4;
        if(mymodel.blood > 0)
        mymodel.animate('beaten',THREE.LoopOnce);
        mymodel.sounds.ball.play();
    }

}