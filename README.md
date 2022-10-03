# Combat Game
> It is a browser based realtime multiplayer 3d combat game developed using Three.js.

## Screen Shots
![Preview 1](https://user-images.githubusercontent.com/86558781/193513967-a50c528b-85d4-4439-9108-08787af6fd37.png)
![Preview 2](https://user-images.githubusercontent.com/86558781/193514064-7d9b7170-f811-4739-9466-97fed3563af6.png)
![Preview 3](https://user-images.githubusercontent.com/86558781/193514101-c714dc89-f461-4f2f-9cac-19d8418b64aa.png)
![Preview 4](https://user-images.githubusercontent.com/86558781/193514136-f8a1c857-332b-4455-ab91-2b0aab832150.png)
![Preview 5](https://user-images.githubusercontent.com/86558781/193514175-4c52fb1c-2bcc-4eb0-a719-7b85943a5a07.png)
![Preview 6](https://user-images.githubusercontent.com/86558781/193514227-4803dbf0-9230-4a70-b6ee-0cc7a1b0f728.png)

---

## Features
- This game is to be played on mobile devices browser.
- Maximum of 4 players can play within a room.

---

## Prerequisites
### STEP 1
- Edit line 15 of `app.js`
- Pass your own mongoDB connection string to `mongoose.connect()` parameter and save it

### STEP 2
- Enable hotspot of one mobile device and connect all other mobile devices to it.
- Connect the PC which is locally running the game server to the same hotspot.
- Open command prompt and get the ip details ( for windows use `ipconfig` )
- Look for IPv4 address as follows
```bash
      IPv4 Address . . . . . . : 192.168.28.27
```
- Open `'public/js/home.js'` file and edit line 13
- replace the host as follows with your current IPv4 address followed by port number and save it
```javascript
      const wss=new WebSocket("ws://192.168.28.27:8080/"+token+",.sep.,"+uid);
```
> Default port number is `8080`

---

## Running the game server

To Install all the dependencies
```bash
    npm i
```

To start server
```bash
    node app.js
```

> To start the game in your mobile device browser enter the current `IPv4` address followed by `port` number in the browser url as follows

`192.168.28.27:8080`

---

## How to Play

> Enter your name to continue

> One player will create a room and others will join it by the room code

> All players will have to select a game character by using up and down arrow and by touching the shown character to occupy it

> After occupying the character players will have to mark themselves ready.

> Player who created the room will start the game

---

- This is just a beta version. Many improvements and features can be implemented
- Characters and their animations are picked from [Mixamo](https://www.mixamo.com/)