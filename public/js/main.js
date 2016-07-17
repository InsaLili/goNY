/**
 * Created by Lili on 08/04/15.
 */
// DOM Ready =============================================================
$(document).ready(function() {
    $(document).on('contextmenu', function() {
        return false;
    });

    var db = new PouchDB('http://myoa.smileupps.com/trip');
    var socket = io.connect('https://gony.herokuapp.com');
    // var socket = io.connect('http://192.168.145.39:8000');
    var myLayer;
    var groupNumber = 5;
    var locationAmount = 23;
    var attractionAmount = 15;
    var cardBtn = false;
    var heartBtn = false;
    var attractionBtn = false;
    var hotelBtn = false;
    var stepNumber = 1;
    var locationNames = [
        'The Cloisters',
        'Central Park',
        'Broadway',
        'Empire State Building',
        'Museum of Modern Art',
        'New York skyline',
        'Statue of Liberty',
        'Fifth Avenue',
        'New York Public Library',
        'Times Square',
        'Top of the Rock',
        "St. Patrick's Cathedral",
        'Brooklyn',
        '9/11 Memorial',
        'Museum of Natural History',
        'Hotel Indigo - Chelsea', //hotel, place16
        'Harlem YMCA',
        'Herald Square Hotel',
        'Broadway Hotel',
        'Hilton Garden Inn',
        'Room Mate Grace',
        'DoubleTree',
        'New York Marriott Marquis'];
    var locationCoordinates = [
        [-73.9317274,40.8648628],
        [-73.9653551,40.7828647],
        [-73.9811689,40.7818015],
        [-73.9856554,40.7484404],
        [-73.9776216,40.7614327],
        [-74.0091314,40.7015699],
        [-74.0445004,40.6892494],
        [-73.9966758,40.7318461],
        [-73.9822534,40.7531823],
        [-73.985131,40.758895],
        [-73.9793369,40.7592487],
        [-73.9759927,40.7584653],
        [-73.993853,40.703750],
        [-74.0132725,40.7114998],
        [-73.9739882,40.7813241],
        [-73.991731,40.746761],//place16
        [-73.9429932,40.8147773],
        [-73.9751046,40.7889031],
        [-73.9699991,40.7979427],
        [-73.9823115,40.746876],
        [-73.9838552,40.7574278],
        [-73.971413,40.756633],
        [-73.98601,40.758521]
    ];
    var red = '#D00000';
    var white= '#eeeeee';
    var blue= '#63b6e5';

    var Server = {
        init: function () {
            Server.domInit();
            Server.mapInit();
            Server.dialogInit();
            Server.serviceInit();
            Server.attachNotes();
            Server.attachRating();
        },

        domInit: function(){

            for(var i=0; i<locationAmount; i++){
                var name = locationNames[i];
                var num = i+1;
                var leftOffset, topOffset;
                if(i<attractionAmount){
                    $('.locations').append('<div class="location attractions" id="location'+num+'"></div>');
                    leftOffset = i*90+100;
                    topOffset = 100;
                }else{
                    $('.locations').append('<div class="location hotels" id="location'+num+'"></div>');
                    leftOffset = (i-attractionAmount)*90+100;
                    topOffset = 600;
                }
                var $currentLocation = $('#location'+num);

                var title = '<div class="locationTitle"><h3>'+name+'</h3></div>';

                var visual = '<div class="visualPlayers"  id="visualLocation'+num+'"><h4>Visualisation :</h4><div class="visualPlayer visualPlayer1"><img src="img/player1.png"></div><div class="visualPlayer visualPlayer2"><img src="img/player2.png"></div><div class="visualPlayer visualPlayer3"><img src="img/player3.png"></div></div>';
                var choose = '<div class="chooseLocation"><h4>Choisir cet emplacement:</h4><button class="btn btn-default btn-md submitChoice" name='+name+' value='+num+'>Choisir</button></div>';
                var vote = '<span class="vote" id="vote'+num+'"><h4>Évaluation :</h4><div class="voteId"><img src="img/player1.png"></div><div class="voteId"><img src="img/player2.png"></div><div class="voteId"><img src="img/player3.png"></div><span class="glyphicon glyphicon-heart grey"></span><span class="glyphicon glyphicon-heart grey"></span><span class="glyphicon glyphicon-heart grey"></span></span>';
                var note = '<div class="note"><h4>Notes :</h4><span id="note'+num+'"></span></div>';
                var content = '<div class="locationContent">'+visual+choose+vote+note+'</div>';

                $currentLocation.append(title);
                $currentLocation.append(content);
                $currentLocation.offset({top: topOffset, left:leftOffset});
            }

            //------------------Enable multi-touch of location cards
            $('.location').touch();
            $('.chooseLocation').hide();
            $('.visualPlayer').hide();

            //off('click') insure the click only be detected once a time
            $('body').off('click').on('click', '.markerBtn', function(){
                Server.chooseLocation(this);
            });

            $('#heart').on('click', Server.filtrateLocation);
            $('#all').on('click',Server.hideLocation);
            $('#step1 .glyphicon').css('color', white);
            $('#step1 p').css('color', white);
            $('#step1 span').on('click', function(){
                if(stepNumber==1){
                    socket.emit('validation',{step: stepNumber});
                    clearInterval(intervals.main);
                    $(this).removeClass('glyphicon-unchecked');
                    $(this).addClass('glyphicon-check');
                    $('#step2 .glyphicon').css('color', white);
                    $('#step2 p').css('color', white);
                    $('#secondStepDialog').dialog('open');
                    stepNumber++;
                }

            });
            $('#step2 span').on('click', function() {
                if(stepNumber==2){
                    socket.emit('validation', {step: stepNumber});
                    clearInterval(intervals.main);
                    $(this).removeClass('glyphicon-unchecked');
                    $(this).addClass('glyphicon-check');
                    $('#step3 .glyphicon').css('color', white);
                    $('#step3 p').css('color', white);
                    $('#thirdStepDialog').dialog('open');
                    stepNumber++;
                }
            });
            $('#step3 span').on('click', function() {
                if(stepNumber==3){
                    $(this).removeClass('glyphicon-unchecked');
                    $(this).addClass('glyphicon-check');
                    $('#gameEnd').dialog('open');
                    $('#validation').prop('disabled', true);
                }
            });
        },

        //------------------Initialize each dialog
        dialogInit: function () {
            $("#start").dialog({
                resizable: false,
                width: 600,
                height: 200,
                modal: true,
                buttons: {
                    "Commencer": function () {
                        socket.emit('start');
                        $(this).dialog("close");
                        //-------------------set the counter
                        $('#timer1').countdown({
                            image: "/img/digits.png",
                            format: "mm:ss",
                            startTime: "15:00"//change to 15:00
                        });
                        setTimeout(function(){
                            $('#validation').removeAttr('disabled');
                        },5000);//change 5000 to 1000*60*20 before the experiment
                    }
                }
            });
            $('#secondStepDialog').dialog({
                autoOpen: false,
                resizable: false,
                width: 600,
                height: 200,
                modal: true,
                buttons: {
                    "Commencer": function () {
                        $(this).dialog("close");
                        $('#timer1').remove();
                        //-------------------set the counter
                        $('#timer2').countdown({
                            image: "/img/digits.png",
                            format: "mm:ss",
                            startTime: "10:00"//change to 10:00
                        });
                        setTimeout(function(){
                            $('#validation').removeAttr('disabled');
                        },5000);//change 5000 to 1000*60*20 before the experiment
                    }
                }
            });

            $("#thirdStepDialog").dialog({
                autoOpen: false,
                width: 600,
                height: 200,
                modal: true,
                buttons: {
                    "OK": function () {
                        $(this).dialog("close");
                    }
                }
            });
            $("#gameEnd").dialog({
                autoOpen: false,
                width: 600,
                height: 200,
                modal: true,
                buttons: {
                    "OK": function () {
                        socket.emit('end');
                        $(this).dialog("close");
                    }
                }
            });
        },

        //------realize the communication between pages
        serviceInit: function () {
            socket.on('addnote', function (data) {
                console.log(data);
                var id = data.id;
                var content = data.content;
                var player = data.player;
                var location = data.location;
                var notes = data.notes;
                $('#note' + location).append('<p id=' + id + ' class="notePlayer' + player + '">' + content + '</p>');
                var noteHeight = $('#location' + location + ' .note').height();
                if (noteHeight + 200 > 300) {
                    $('#location' + location).height(noteHeight + 200 + 'px');
                } else {
                    $('#location' + location).height(300 + 'px');
                }

            });

            socket.on('addagu', function (data) {
                console.log(data);
                var id = data.id;
                var content = data.content;
                var player = data.player;
                var location = parseInt(data.location);
                $('.arguments span').append('<p id=' + id + ' class="aguPlayer' + player + '">' + content + '</p>');
                var noteHeight = $('#location' + location + ' .note').height();
                var aguHeight = $('#location' + location + ' .arguments').height();
                $('#location' + location).height(noteHeight + aguHeight + 220 + 'px');
            });


            socket.on('deletenote', function (data) {
                console.log(data);
                var id = data.id;
                $('#' + id).remove();
                var location = data.location;
                var player = data.player;
                var notes = data.notes;
                var noteHeight = $('#location' + location + ' .note').height();
                if (noteHeight + 200 > 300) {
                    $('#location' + location).height(noteHeight + 200 + 'px');
                } else {
                    $('#location' + location).height(300 + 'px');
                }
            });

            socket.on('deleteagu', function (data) {
                console.log(data);
                var id = data.id;
                $('#' + id).remove();
                var location = data.location;
                var player = data.player;
                var noteHeight = $('#location' + location + ' .note').height();
                if (noteHeight + 200 > 350) {
                    $('#location' + location).height(noteHeight + 200 + 'px');
                } else {
                    $('#location' + location).height(350 + 'px');
                }
                var noteHeight = $('#location' + location + ' .note').height();
                var aguHeight = $('#location' + location + ' .arguments').height();
                $('#location' + location).height(noteHeight + aguHeight + 220 + 'px');
            });

            socket.on('vote', function (data) {
                var location = data.location;
                var player = data.player;
                var value = data.value;
                var hearts = $('#location' + location + ' span.glyphicon');
                if (value == true) {
                    $(hearts[player - 1]).css('color', red);
                } else {
                    $(hearts[player - 1]).css('color', 'grey');
                }
                if(heartBtn==true) Server.filtrateLocation();
            });

        },

        mapInit: function () {

            L.mapbox.accessToken = 'pk.eyJ1IjoiaW5zYWxpbGkiLCJhIjoickF1VzlYVSJ9.JH9ZrV76fbU5Ub9ZgBhNCw';
            var map = L.mapbox.map('map', 'insalili.nc53883g', {
                zoomControl: false
            }).setView([40.7504877,-73.9839238], 12);

            var message = [];

            //        info in the pop-up window
            for(var i=0; i<locationAmount; i++){
                var num = i+1;
                var name = locationNames[i];
                message[i]= '<div id="marker'+num+'"><h3>'+name+'</h3><img class= "markerImg" src="/img/place'+num+'.jpg"><button type="button" class="btn player1 markerBtn" value="'+num+',1"><img src="/img/player1.png"></button><button type="button" class="btn player2 markerBtn" value="'+num+',2"><img src="/img/player2.png"></button><button type="button" class="btn player3 markerBtn" value="'+num+',3"><img src="/img/player3.png"></button></div>';
            }

            myLayer = L.mapbox.featureLayer().addTo(map);

            var geojson = {};
            geojson['type'] = 'FeatureCollection';
            geojson['features'] = [];

            for (var k =0; k<locationAmount; k++) {
                var symbol,color,hotels,attractions;
                if(k<attractionAmount){
                    symbol = "pitch";
                    color = "#E91E63";
                    hotels = false;
                    attractions = true;
                }else{
                    symbol = "lodging";
                    color = "#FF9800";
                    hotels = true;
                    attractions = false;
                }
                var newFeature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": locationCoordinates[k]
                    },
                    "properties": {
                        "title": locationNames[k],
                        "metadata":k+1,
                        "content": message[k],
                        "hotels": hotels,
                        "attractions": attractions,
                        "marker-symbol": symbol,
                        "marker-color": color,
                        "marker-size": "large"
                    }
                };
                geojson['features'].push(newFeature);
            }

            myLayer.on('layeradd', function(e) {
                var marker = e.layer;
                var feature = marker.feature;

                var popupContent = feature.properties.content;

                marker.bindPopup(popupContent,{
                    closeButton: false,
                    minWidth:400,
                    maxWidth: 400
                });
            });

            //----------------Add features to the map.
            myLayer.setGeoJSON(geojson);

            $('.filter button').on('click', function() {
                var button = $(this).data('filter');
                switch (button){
                    case 'card':
                        (cardBtn==true)?cardBtn=false:cardBtn=true;
                        break;
                    case 'heart':
                        (heartBtn==true)?heartBtn=false:heartBtn=true;
                        break;
                    case 'hotels':
                        (hotelBtn==true)?hotelBtn=false:hotelBtn=true;
                        break;
                    case 'attractions':
                        (attractionBtn==true)?attractionBtn=false:attractionBtn=true;
                        break;
                }
                socket.emit('filtrateLocation',{button:button, cardBtn:cardBtn, heartBtn:heartBtn, hotelsBtn: hotelBtn, attractionBtn:attractionBtn});
                ($(this).hasClass('active') == true)? $(this).removeClass('active'):$(this).addClass('active');
                Server.filtrateLocation();
            });

            map.on('zoomend', function(){
                socket.emit('changeZoom');
                console.log('change zoom');
            });

            map.on('dragend', function(){
                socket.emit('dragend');
                console.log('drag map');
            });
//            map.addListener('dragend', function(){
//                socket.emit('dragend');
//                console.log('drag map');
//            });
        },

        //-----------------Add users' notes to the location cards
        attachNotes: function(){
            $('.location p').remove();
            var startKey = 'note_'+groupNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey+'_1',
                endkey: startKey+'_4\uffff'
            }).then(function(locationData){
                var note1 = 0;
                var note2 = 0;
                var note3 = 0;
                for(var i = 0; i < locationData.rows.length; i++){
                    var location = locationData.rows[i].doc.location;
                    var player = locationData.rows[i].doc.author;
                    var content = locationData.rows[i].doc.content;
                    var id = locationData.rows[i].doc._id;
                    switch (player){
                        case 1:
                            note1++;
                            break;
                        case 2:
                            note2++;
                            break;
                        case 3:
                            note3++;
                            break;
                    }
                    $('#note'+location).append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                }
            });
        },

        //-----------------Add progression to the progress bar
        attachRating: function(){
            var startKey = 'vote_'+groupNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey,
                endkey: startKey+'\uffff'
            }).then(function(votes){
                for(var i = 0; i < votes.rows.length; i++) {
                    var player = votes.rows[i].doc.player;
                    var location = votes.rows[i].doc.location;
                    var value = votes.rows[i].doc.vote;
                    if(value == true){
                        var hearts = $('#vote'+location+' .glyphicon');
                        $(hearts[player-1]).css('color', red);
                    }
                }
            });
        },

        filtrateLocation: function(){
            $('.location').hide();
            if(attractionBtn==true && hotelBtn==true){
                if(heartBtn==true){
                    var startKey = 'vote_'+groupNumber;
                    db.allDocs({
                        include_docs: true,
                        attachements: true,
                        startkey: startKey,
                        endkey: startKey+'\uffff'
                    }).then(function(votes){
                        var list=[];
                        for(var i = 0; i < votes.rows.length; i++) {
                            var doc = votes.rows[i].doc;
                            if(doc.vote == true){
                                var location = doc.location;
                                if(cardBtn==true) $('#location'+location).show();
                                list.push(location);
                            }
                        }
                        myLayer.setFilter(function(f) {
                            var number = f.properties.metadata;
                            return (jQuery.inArray(number, list)!==-1);
                        });
                    });
                }else{
                    if(cardBtn==true) $('.location').show();
                    myLayer.setFilter(function(f) {
                        return true;
                    });
                }
            }else if(attractionBtn==true && hotelBtn==false){
                if(heartBtn==true){
                    var startKey = 'vote_'+groupNumber;
                    db.allDocs({
                        include_docs: true,
                        attachements: true,
                        startkey: startKey,
                        endkey: startKey+'\uffff'
                    }).then(function(votes){
                        var list=[];
                        for(var i = 0; i < votes.rows.length; i++) {
                            var doc = votes.rows[i].doc;
                            if(doc.vote == true){
                                var location = doc.location;
                                if(location<=attractionAmount){
                                    list.push(location);
                                    if(cardBtn==true) $('#location'+location).show();
                                }
                            }
                        }
                        myLayer.setFilter(function(f) {
                            var number = f.properties.metadata;
                            return (jQuery.inArray(number, list)!==-1);
                        });
                    });
                }else{
                    if(cardBtn==true) $('.attractions').show();
                    myLayer.setFilter(function(f) {
                        return f.properties.attractions === true;
                    });
                }
            }else if(attractionBtn==false && hotelBtn==true){
                if(heartBtn==true){
                    var startKey = 'vote_'+groupNumber;
                    db.allDocs({
                        include_docs: true,
                        attachements: true,
                        startkey: startKey,
                        endkey: startKey+'\uffff'
                    }).then(function(votes){
                        var list=[];
                        for(var i = 0; i < votes.rows.length; i++) {
                            var doc = votes.rows[i].doc;
                            if(doc.vote == true){
                                var location = doc.location;
                                if(location>attractionAmount){
                                    list.push(location);
                                    if(cardBtn==true) $('#location'+location).show();
                                }
                            }
                        }
                        myLayer.setFilter(function(f) {
                            var number = f.properties.metadata;
                            return (jQuery.inArray(number, list)!==-1);
                        });
                    });
                }else{
                    if(cardBtn==true) $('.hotels').show();
                    myLayer.setFilter(function(f) {
                        return f.properties.hotels === true;
                    });
                }
            }else{
                myLayer.setFilter(function(f) {
                    return false;
                });
            }
        },

//        hideLocation: function(){
//            socket.emit('hideLocation',{hide: hide});
//            if(hide==false){
//                $('.location').hide();
//                $('#all').css('color', 'grey');
//                hide = true;
//            }else{
//                $('.location').show();
//                $('#all').css('color', blue);
//                hide=false;
//            }
//        },

        chooseLocation: function(element){
            var buttonValue = element.value.split(',');
            console.log(buttonValue);
            var location = parseInt(buttonValue[0]);
            var player = parseInt(buttonValue[1]);
            socket.emit('chooselocation', { location: location, player: player, group: groupNumber});

            $('.visualPlayer'+player).hide();
            $('div#visualLocation'+location+' .visualPlayer'+player).show();

            var className = element.className;
            var elements = document.getElementsByClassName(className);
            $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
            $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        }
    };

    Server.init();
});
