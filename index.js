"use strict";

var express = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './files/')
    },
    filename: function (req, file, cb) {
        require('crypto').pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
        });
    }
});
var upload = multer({ storage: storage });
var http = require("http"); 
var path = require('path');
var fs = require('fs');
var app = express();
app.use(express.static('public'));
var firebase = require('firebase');
var config = {
    apiKey: "AIzaSyATRGz9jLS7KIVCnIBUPvU8_B3kpFNri_g",
    authDomain: "spicygifmeme.firebaseapp.com",
    serviceAccount: "SpicyGifMeme-1ba09b36502b.json",
    databaseURL: "https://spicygifmeme.firebaseio.com",
    storageBucket: "spicygifmeme.appspot.com",
    messagingSenderId: "694275757511"
};
firebase.initializeApp(config);
var db = firebase.database();
var ref = db.ref("gif");
var music = require('./public/js/music'); 

app.post('/upload', upload.single('file'), function (req, res, next) {
    //need calculated tempo, normal range between 100-160bpm
    var musicTempo = 120; //default

   music.processSong(req.file.path, function (tempo) {
        var startRange = musicTempo-5;
        musicTempo = tempo;
        var endRange = musicTempo+5;
        var returnData ={
            id: "26BRIhmJu160i924E",
                url: "http://media1.giphy.com/media/26BRIhmJu160i924E/giphy.gif",
                width: 500,
                height: 249,
                frames: 68,
                spiciness: 3,
                tempo: musicTempo
        }
        ref.orderByChild("tempo").startAt(startRange).endAt(endRange).on("child_added", function(snapshot) {
            //console.log(snapshot.key);
               returnData= {
                id: snapshot.key,
                url: snapshot.val().url,
                width: snapshot.val().width,
                height: snapshot.val().height,
                frames: snapshot.val().frames,
                spiciness: snapshot.val().spicy_rating,
                tempo: snapshot.val().tempo
            };
           ref.off("child_added");
        });
        setTimeout(function(){
            res.send(returnData);
        }, 2000);
    
    });
});

app.post('/upload', function (req, res) {
    return res.status(400).send({
        "error": "No file included"
    });
})

app.get('/', function (req, res) {
    console.log("sup");
    return res.sendFile(path.resolve('frontend/index.html'));
});

http.createServer(app).listen(process.env.PORT || 8001, function () {
    console.log('listening');
});
