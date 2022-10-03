let data = require('./rooms.json');
var fs=require('fs');

module.exports.checkRoom = (room) => {
   
        for (var d of data) {
            if (d.room_id == room) {
                    return 1;
            } else {
                continue;
            }
        }
}


module.exports.insertData = (writable,func) => {
   
        data.push(writable); //add some data
        json = JSON.stringify(data); //convert it back to json
        fs.writeFile('./controllers/rooms.json', json, 'utf8', function(){
            return func();
        }); // write it back 
   
}