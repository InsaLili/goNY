
// DOM Ready =============================================================
$(document).ready(function($){
    // Variables =============================================================
    var locationNumber;
    var groupNumber = 5;
    var playerNumber = 0;
    var like = false;
    var red = '#D00000';

    var db = new PouchDB('http://myoa.smileupps.com/trip');
    // var socket = io.connect('http://localhost:8000');
    var socket = io.connect('https://gony.herokuapp.com');

    // Functions =============================================================
    var Client = {
        init: function(){
            $('#appLayer').hide();
            //set avatar src based on user's choice
            var imgSrc = ['img/player1.png','img/player2.png','img/player3.png'];

            //------------------hide arguments part
            $('#showAgu').hide();
            $('#addAgu').hide();

            //------------------click events for validation btns
            $('#submitNote').on('click', Client.addNote);
            $('#submitAgu').on('click', Client.addAgu);
            $("#heart").on('click', Client.addHeart);
            $('#avatar').on('click', function(){
                if (screenfull.enabled) {
                    screenfull.request();
                } else {
                    // Ignore or do something else
                }
            });

            $("#showNotes").on('click', '.deletenote', function(){
                Client.deleteNote(this.id);
            });

            $('.choosePlayerBtn').on('click', function(){
                $('#maskLayer').hide();
                $('#appLayer').show();

                playerNumber = parseInt($(this).val());
                $('#avatar img').attr('src',imgSrc[playerNumber-1]);
                Client.dialogInit();
                Client.serviceInit();
            });
        },

        //------------------dialog initiation
        dialogInit: function(){
            $( '#chooseLocationDlg' ).dialog({
                resizable: false,
                autoOpen: false,
                width: 600,
                height:200,
                modal: true,
                buttons:{
                    "OK": function(){
                        $(this).dialog("close");
                    }
                }
            });
            $( '#writeNoteDlg' ).dialog({
                autoOpen: false,
                height:200,
                modal: true,
                buttons:{
                    "OK": function(){
                        $(this).dialog("close");
                    }
                }
            });
        },

        serviceInit: function(){
            //------------------communication via server

            var addresses=[
//                'http://place.qyer.com/poi/V2EJZlFvBz9TbA/',
//                'http://place.qyer.com/poi/V2EJYlFiBzNTZQ/',
//                'http://place.qyer.com/poi/V2EJalFiBzJTYg/',
//                'http://place.qyer.com/poi/V2EJZFFiBzNTbQ/',
//                'http://place.qyer.com/poi/V2EJYlFgBzZTZg/',
//                'http://place.qyer.com/poi/V2UJYlFnBzBTYFI_/',
//                'http://place.qyer.com/poi/V2EJYlFiBzFTYw/',
//                'http://place.qyer.com/poi/V2EJalFiBzJTYQ/',
//                'http://place.qyer.com/poi/V2EJYlFiBzBTZA/',
//                'http://place.qyer.com/poi/V2IJYlFvBzZTYw/',
//                'http://place.qyer.com/poi/V2EJYlFgBzNTZg/',
//                'http://place.qyer.com/poi/V2EJalFnBzZTZw/',
//                'http://place.qyer.com/poi/V2EJYlFiBz5TYA/',
//                'http://place.qyer.com/poi/V2AJZlFnBz9TZg/',
//                'http://place.qyer.com/poi/V2EJalFnBzdTYg/',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/The-Cloisters/d687-a8773',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Central-Park-Les-attractions-de-New-York-city/d687-a1283',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Broadway/d687-a18',
                'http://www.viatorcom.fr/fr/7379/tours/New-York/Billets-pour-lEmpire-State-Building-Billets-pour-lobservatoire-et-billets-coupe-file-facultatifs/d687-2194EMPIRE',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Museum-of-Modern-Art-MoMA/d687-a1299',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Ligne-dhorizon-de-New-York/d687-a15125',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Statue-de-la-Liberte/d687-a16',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Cinquieme-Avenue/d687-a8774',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/New-York-Public-Library/d687-a9793',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Times-Square/d687-a1272',
                'http://www.viatorcom.fr/fr/7379/tours/New-York/New-York-terrasse-panoramique-Top-of-the-Rock/d687-3784TOPROCK',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Cathedrale-Saint-Patrick/d687-a8775',
                'http://www.viatorcom.fr/fr/7379/New-York-attractions/Brooklyn/d687-a68',
                'http://www.viatorcom.fr/fr/7379/tours/New-York/Entree-au-musee-du-Memorial-du-11-septembre/d687-7195SEPT11',
                'http://www.viatorcom.fr/fr/7379/tours/New-York/Musee-americain-dHistoire-naturelle-American-Museum-of-Natural-History/d687-2396AMNH',
                'http://www.booking.com/hotel/us/indigo-new-york-city.html?checkin=2015-12-25;checkout=2015-12-26',//place16
                'http://www.booking.com/hotel/us/harlem-ymca.fr.html?checkin=2015-12-25;checkout=2015-12-26',
                'http://www.booking.com/hotel/us/herald-square.html?checkin=2015-12-25;checkout=2015-12-26',
                'http://www.booking.com/hotel/us/broadway-hostel.html?sid=d9792821e277b223efea4bc86338dd10;dcid=4;checkin=2015-12-25&checkout=2015-12-26&dist=0&group_adults=2&sb_price_type=total&type=total&',
                'http://www.booking.com/hotel/us/hilton-garden-inn-new-york-midtown-park-avenue.fr.html?checkin=2015-12-25;checkout=2015-12-26',
                'http://www.booking.com/hotel/us/room-mate-grace.fr.html?checkin=2015-12-25;checkout=2015-12-26;',
                'http://www.booking.com/hotel/us/doubletree-metropolitan.html?sid=d9792821e277b223efea4bc86338dd10;dcid=4;checkin=2015-12-25&checkout=2015-12-26&dist=0&group_adults=2&sb_price_type=total&type=total&',
                'http://www.booking.com/hotel/us/new-york-marriott-marquis.html?checkin=2015-12-25;checkout=2015-12-26'];

            socket.on('chooselocation', function (data) {
                var player = data.player;
                if(player == playerNumber) {
                    locationNumber = data.location;
                    Client.attachNote(data.notes);
                    Client.attachVote(data.eval);
                    document.getElementById("frame").src = addresses[locationNumber-1];
                }
            });
        },

        attachNote: function(notes){
            $("#showNotes span").empty();
            var noteContent = '';
            for(var i=0; i < notes.length; i++){
                var note = notes[i];
                noteContent += '<div class = "noteOfPlayer">';
                noteContent += '<p>'+note.content+'</p>';
                noteContent += '<button id="'+note.id+'" class="btn btn-default btn-xs deletenote">'+'Effacer'+'</button>';
                noteContent += '</div>';
            }
            $('#showNotes span').html(noteContent);
            Client.changeColor();
        },

        attachVote: function(vote){
            if(vote.length !== 0){
                like = vote[0].value;
                if(like == true){
                    $('#heart').css('color', red);
                }else{
                    $('#heart').css('color', 'grey');
                }
            }else{
                $('#heart').css('color', 'grey');
            }
        },

        addNote: function(){
            event.preventDefault();

            if(!locationNumber){
                $('#chooseLocationDlg').dialog('open');
                return;
            }
            //if textarea is empty, return false
            var textarea = $('#myNote textarea');
            var text = textarea.val();
            if(!text){
                $('#writeNoteDlg').dialog('open');
                return;
            }
            var id= 'group'+groupNumber+'/location'+locationNumber+'/player'+playerNumber+'/'+Math.random();
            $('#showNotes span').append('<div class="noteOfPlayer">'+'<p>'+text+'</p>'+'<button id='+id+'  class="btn btn-default btn-xs deletenote">Effacer</button>'+'</div>');
            Client.changeColor();
            socket.emit('addnote', {id: id,content: text, location: locationNumber,player: playerNumber});
            //clear text area
            textarea.val('');
        },

        deleteNote: function(id){
            $('#'+id).parent().remove();
            socket.emit('deletenote', {id: id});
        },

        addHeart: function(){
            if(!locationNumber){
                $('#chooseLocationDlg').dialog('open');
                return;
            }
            var id = 'group'+groupNumber+'/location'+locationNumber+'/player'+playerNumber;
            if(like == false){
                like = true;
                $( '#heart' ).css('color', red);
            }else{
                like = false;
                $( '#heart' ).css('color', 'grey');
            }
            socket.emit('vote', {id: id,value:like,location:locationNumber,player:playerNumber});
        },

        // updateVote: function(value, id){
        //     db.upsert(id, function(doc){
        //         return{
        //             "type": "vote",
        //             "group": groupNumber,
        //             "location": locationNumber,
        //             "player": playerNumber,
        //             "vote": value
        //         }
        //     }).then(function(){
        //         socket.emit('vote', {location: locationNumber, group: groupNumber, player: playerNumber, value:value});
        //     }).catch(function(err){
        //         console.log(err);
        //     });

        // },

        changeColor: function(){
            var colors = [['#E0F2F1','#009688'], ['#F1F8E9','#8BC34A'], ['#FFF3E0','#FF9800']];
            $('#note p').css({'background-color': colors[playerNumber-1][0],'color': colors[playerNumber-1][1]});
        }
    };

    Client.init();
});

