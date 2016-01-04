$( document ).ready( function() {
//    screens = $( ".screen" );
//CarGo.logout();
    $( "header nav a" ).click( function(){
        console.log( "Time to go home" );
        CarGo.checkSession();
    });
    CarGo.checkSession();
//Check if the session exists, if it does, go directly to the main menu
});

var screens;
var jsonString;
var locationTimer;
var nearCab;
var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
var jsonLocation;

var CarGo = {
    validateFormElements:function() {

    },
    getLocation:function() {
        GMaps.geolocate({
            success: function(position) {
                jsonLocation = '{"lat":'+ position.coords.latitude +',"lng":'+ position.coords.longitude +'}'
//                console.log( jsonLocation );
                return jsonLocation;
            }
        });
/*
        var MemberFind = Parse.Object.extend( "_User" );
        var query = new Parse.Query( Parse.User );
        var jsonLocation = "";
        query.equalTo( "username", sessionStorage.emailID );
        query.first({
            success:function( results ){
                var res = results.toJSON();
                GMaps.geolocate({
                    success: function(position) {
                        jsonLocation = '{"lat":'+ position.coords.latitude +',"lng":'+ position.coords.longitude +'}'
                        console.log( jsonLocation );
                        results.set( "currentLocation", jsonLocation );
                        results.save();
                    },
                    error: function(error) {
                        alert('Geolocation failed: '+error.message);
                    }
                });
                console.log( res.carclub );
            },
            error:function( error ){
                console.log( error.message );
            }
        });
*/
    },
    findClosestCab:function( ){
//THIS FUNCTION IS NOT WORKING!!!
        var me = this;
        var lata = "53.8046474";
        var lnga = "-1.5391425";
        var time = 0;
        var distance = 0;

        var index = 0;
        var ids = [];
        var distances = [];
    var nearestID = "x";
    var nearestDistance = 0;

        var mapdiv = $( "<div/>" );
        mapdiv.attr( "id", "gmap" );
        mapdiv.attr( "display", "none" );
        $( ".screen" ).append( mapdiv );
        map = new GMaps({
            div: "#gmap",
            lat: lata,
            lng: lnga
        });
        var User = Parse.Object.extend( "_User" );
        var query = new Parse.Query( User );

        query.find({
            success:function( results ){
                $( results ).each( function(i, e){
                    var change = 0;
                    var p = e.toJSON();
                    var latlng = $.parseJSON( p.currentLocation );
                    console.log( i );
                    GMaps.geolocate({
                        success:function( position ){
                            map.getRoutes({
                                origin: [ lata, lnga ],
                                destination: [ latlng.lat, latlng.lng ],
                                callback: function ( b ) {
                                    for ( var i=0; i<b[ 0 ].legs.length; i++ ) {
                                        time += b[ 0 ].legs[ i ].duration.value;
                                        distance += b[ 0 ].legs[ i ].distance.value;
                                    }
                                    ids.push( '{"id":"' + p.objectId + '","distance":' + distance + '}' );
//                                    index++;
//                                    console.log( "[" + lata + ", " + lnga + "] - [" + latlng.lat + ", " + latlng.lng + "] - " +distance );
//                                    nearestID = p.objectId;
//                                    nearestDistance = distance;
//                                    distance=0;
//                                    console.log( ids[0] );
//                                    console.log( i );
                                    if( results.length < i ) {
                                        imprime();
                                    }
                                }
                            });
                        },
                        error:function( error ){
                            console.log( error.message );
                        }
                    });
                });
            },
            error:function( error ){
                console.log( error.message );
            }
        });
        var imprime = function() {
            console.log( "Printing: " + ids[2] );
        };
/*
"lata":53.9458553
"lnga":-1.0590113000000656
*/
    },
    checkSession:function() {
        $( ".screen" ).empty;
        var me = this;
        if( sessionStorage.sessionID ){
            me.loginType();
        } else {
            me.welcomeScreen();
        }
    },
    welcomeScreen:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h1>CarGo</h1>\
                <h1>\
                    <i class='ion-model-s icon-big'></i>\
                </h1>\
                <h2>a better way to get around!</h2>\
                <a href='#' class='button full-button js--signup-button'>Signup / Login</a>\
                <p>We only take people to and from places. We never run a cab service, just a new way of moving people around with cars.</p>\
            </div>\
        ");
        $( '.screen' ).attr( 'id', 'welcome-screen' );
        $( ".button" ).click(function(){
            $( ".screen" ).empty;
            me.loginSignupScreen();
        });
    },
    loginSignupScreen:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h2 style='color: transparent'>_</h2>\
                <form class='input-form'>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='email' id='email' placeholder='Email' >\
                            <label for='email' id='login-email'>Email</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='password' name='login-password' id='login-password' placeholder='Password'>\
                            <label for='login-password' id='lbl-login-password'>Password</label>\
                        </span>\
                    </div>\
                    <a href='#' class='button full-button js--login-signup-save-button'>Login/Signup</a>\
                </form>\
            </div>\
        ");
        $( '.screen' ).attr( 'id', '' );
        $( 'input' ).keyup(function(){
            var type = "";
            if( $( this ).attr( 'name' ) == "email" ) {
                type = "email";
            } else {
                type = $( this ).attr( 'name' );
            }
            me.validateForm( $( this ).val(), $( this ).attr( 'id' ), type );
        });
        $( ".button" ).click(function(){

//STARTING
            var emailID = $( "#email" ).val();
            var pass = $( "#login-password" ).val();
            pass = CryptoJS.MD5( pass ).toString( CryptoJS.enc.Hex );
            var user = Parse.User;
            var us = Parse.Object.extend( "User" );
            var query = new Parse.Query( us );

            user.logIn( emailID, pass, {
                success:function( user ) {
                    if( typeof( Storage ) !== "undefined" ) {
                        var cad = emailID + pass;
                        var sessionID = CryptoJS.MD5( cad );
                        sessionStorage.sessionID = sessionID.toString( CryptoJS.enc.Hex );
                        sessionStorage.emailID = emailID;
                        sessionStorage.newMember = "No";
//                        console.log( "About to check" );
                        me.newLogLocation();
                        query.equalTo( "email", sessionStorage.emailID );
                        query.first({
                            success:function( u ){
                                console.log( u.toJSON() );
                                sessionStorage.fullname = u.toJSON().fullname;
                            },
                            error:function( error ){
                                console.log( error.message );
                            }
                        });
                        me.loginType();
                    } else {
                        //NO LOCAL STORAGE
//                        console.log( "Your browser doesn't accept local storage." );
                    }
                },
                error:function( user, error ) {
                    var MemberFind = Parse.Object.extend( "_User" );
                    var query = new Parse.Query( Parse.User );
                    query.equalTo( "email", emailID );
                    query.count({
                        success:function( count ){
                            if( count >= 1 ) {
//                                console.log( "Email or Password incorrect, please try again." );
                                err = 0;
                            } else {
//                                console.log( "Register a new user" );
                                user.set( "username", emailID );
                                user.set( "password", pass );
                                user.set( "email", emailID );
                                user.signUp( null, {
                                    success:function( user ){
//                                        console.log( "User saved correctly" );
                                        var sessionID = CryptoJS.MD5( emailID + pass );
                                        sessionStorage.sessionID = sessionID.toString( CryptoJS.enc.Hex );
                                        sessionStorage.emailID = emailID;
                                        sessionStorage.newMember = "Yes";
//                                        me.signupMemberDetails();
                                        me.newLogLocation();
                                        me.loginType();
                                    },
                                    error:function( user, error ){
                                        console.log( "There was a problem saving the user" );
                                    }
                                });
                                err = 0;
                            }
                        },
                        error:function( error ){
                        }
                    });
                }
            });

//ENDING

//            me.welcomeScreen();
        });
    },
    loginType:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h2 style='color: transparent'>_</h2>\
                <a href='#' class='button full-button js--join-carclub-button'>CarClub</a>\
                <a href='#' class='button ghost-button js--hire-car-button'>Hire a car</a>\
                <a href='#' class='button ghost-button js--book-cab-button'>Book a cab</a>\
                <a href='#' class='button ghost-button js--logout-button'>Logout</a>\
            </div>\
        ");
/*
//NEED TO CHECK IF THE USER IS NEW OR NOT FROM THE DATABASE INSTEAD OF USING SESSIONSTORAGE
//MAYBE USING QUERY.DOESNOTEXIST()
        var user = Parse.Object.extend( "_User" );
        var query = new Parse.Query( user );

        query.equalTo( "carclub", "" );
*/
        if( sessionStorage.newMember == "Yes" ){
            $( ".js--join-carclub-button" ).text( "Join CarClub" );
        }
        $( ".button" ).click(function(){
            switch( $( this ).text() ){
                case 'CarClub':
                    me.carClubMenu();
                break;
                case 'Hire a car':
                    if( sessionStorage.newMember == "Yes" ) {
                        me.signupMemberDetails( 2 );
                    } else {
                        me.carHireMenu();
                    }
                break;
                case 'Book a cab':
                    me.bookACabMenu();
                break;
                case 'Join CarClub':
                    me.signupMemberDetails( 1 );
                break;
                case 'Pay with card':
                    me.payWithCard();
                break;
                case 'Logout':
                    me.logout();
                break;
            }
        });
    },
    logout:function() {
        var me = this;
        sessionStorage.removeItem( "sessionID" );
        sessionStorage.removeItem( "emailID" );
        localStorage.clear();
        sessionStorage.clear();
        console.log( locationTimer );
        clearInterval( locationTimer );
        locationTimer = false;
        console.log( locationTimer );
        console.log("timer stopped");
        me.checkSession();
    },
    carClubMenu:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h2 style='color: transparent'>_</h2>\
                <a href='#' class='button full-button'>Show services</a>\
                <a href='#' class='button ghost-button'>Assigned services</a>\
                <a href='#' class='button ghost-button'>Setup schedule</a>\
                <a href='#' class='button ghost-button'>Finances</a>\
            </div>\
        ");
        $( ".button" ).click(function(){
            switch( $( this ).text() ){
                case 'Show services':
                    me.carClubPendingServices();
                break;
                case 'Assigned services':
                    me.carClubAssignedServices();
                break;
                case 'Setup schedule':
                    me.carClubSchedule();
                break;
                case 'Finances':
                    me.carClubMemberFinances();
                break;
            }
        });
    },
    carClubSchedule:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h3>Choose your available schedule:</h3>\
            </div>\
        ");
        var schedule = new Array();
        $( function(){
            dh_calendar_carclub_schedule.ini( function( e ){
                jsonString = JSON.stringify(e);
                schedule.push( jsonString );
            });
        });
        $( ".screen .verticalcenter" ).append( "<a href='#' class='button full-button'>Save</a>" );
        $( ".button" ).click(function(){
            var Sched = Parse.Object.extend( "MemberSchedule" );
            $.each( schedule, function( i, e ){
                var j = $.parseJSON( schedule[ i ] );
                var query = new Sched();
                console.log( j.day );
                query.set( "Year", parseInt( j.year ) );
                query.set( "Month", parseInt( j.month ) );
                query.set( "Day", parseInt( j.day ) );
                query.set( "Hour", parseInt( j.hour ) );
                query.set( "Length", parseInt( j.hours ) );
                query.set( "CanDrive", j.candrive );
                query.set( "memberID", sessionStorage.emailID );
                query.save(null, {
                    success:function(){
                        me.loginType();
//                        console.log( "Saved" );
                    },
                    error:function( error ){
                        console.log( error.message );
                    }
                });
            });
        });
    },
    carClubPendingServices:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h2>Next service</h2>\
            <ul class='list-services hire'>\
            </ul>\
            <ul class='list-services cab'>\
            </ul>\
        </div>\
        ");
        var Hire3 = Parse.Object.extend( "CarHire" );
        var query3 = new Parse.Query( Hire3 );
        query3.equalTo( "hireStatus", "time" );
        query3.notEqualTo( "clientID", sessionStorage.emailID );
        query3.doesNotExist( "ownerID" );
        query3.descending( "createdAt" );
        query3.limit( 25 );
        query3.find({
            success:function( results3 ){
                var template = Handlebars.compile( $( "#car-hire-single" ).html() );
                $( ".list-services.hire" ).html( " " );
                $( results3 ).each( function(i, e){
                    var p2 = e.toJSON();
                    var times2 = $.parseJSON( p2.startTime );
                    var q2 = {"objectId":p2.objectId,"hireStatus":p2.hireStatus,"startTime":times2.hour,"endTime":times2.hours+times2.hour,"ownerID":sessionStorage.fullname,"pickupDropoffAddress":p2.pickupDropoffAddress,"carClubType":"Car Hire"};
                    $( ".list-services.hire" ).append( template( q2 ) );
                    $( ".list-services.hire" ).find( "a" ).eq( i ).click( function(){
                        me.carHireDetails( $( this ).find( "#objectID" ).val() );
                    });
                });
            },
            error:function( error ){
                console.log( error.message );
            }
        });

        var Service = Parse.Object.extend( "CabServices" );
        var query = new Parse.Query( Service );
        var User = Parse.Object.extend( "User" );
        var query2 = new Parse.Query( User );

        query.notEqualTo( "clientID", sessionStorage.emailID );
        query.descending( "createdAt" );
        query.doesNotExist( "driverID" );
        query.limit( 25 );
        query.find({
            success:function( results ){
                var template = Handlebars.compile( $( "#carclub-single-service" ).html() );
                $( ".list-services.cab" ).append( " " );
                var p;
                $( results ).each( function(i, e){
                    p = e.toJSON();
                    var r = $.parseJSON(p.pickupTime);
                    var s = r.hour + ":" + r.minutes;
                    query2.equalTo( "username",p.clientID);
                    query2.first({
                        success:function( res ){
                            $( res ).each( function( j, f ){
                                var a = f.toJSON();
                                var q = {"carClubType":"Cab Service","objectId":p.objectId,"serviceStatus":p.serviceStatus,"clientID":a.fullname,"pickupTime":s,"pickupAddress":p.pickupAddress,"estimateDuration":p.estimateDuration}
                                $( ".list-services.cab" ).append( template( q ));
                                $( ".list-services.cab" ).find( "a" ).eq( i ).click( function(){
                                    me.carClubServiceInformation( $( this ).find( "#objectID" ).val() );
                                });
                            });
                        },
                        error:function( error ){
                            console.log( error.message );
                        }
                    });
                });
            },
            error:function( error ){
                console.log( error.message );
            }
        });
        $( ".button" ).click( function(){
            alert( "Clicked" );
        });
    },
    carClubAssignedServices:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h2>Next service</h2>\
            <ul class='list-services hire'>\
            </ul>\
            <ul class='list-services cab'>\
            </ul>\
        </div>\
        ");
        var Hire3 = Parse.Object.extend( "CarHire" );
        var query3 = new Parse.Query( Hire3 );
        query3.equalTo( "hireStatus", "time" );
        query3.equalTo( "ownerID", sessionStorage.emailID );
        query3.descending( "createdAt" );
        query3.limit( 25 );
        query3.find({
            success:function( results3 ){
                var template = Handlebars.compile( $( "#car-hire-single" ).html() );
                $( ".list-services.hire" ).html( " " );
                $( results3 ).each( function(i, e){
                    var p2 = e.toJSON();
                    var times2 = $.parseJSON( p2.startTime );
                    var q2 = {"objectId":p2.objectId,"hireStatus":p2.hireStatus,"startTime":times2.hour,"endTime":times2.hours+times2.hour,"ownerID":sessionStorage.fullname,"pickupDropoffAddress":p2.pickupDropoffAddress,"carClubType":"Car Hire"};
                    $( ".list-services.hire" ).append( template( q2 ) );
                    $( ".list-services.hire" ).find( "a" ).eq( i ).click( function(){
                        me.carHireDetails( $( this ).find( "#objectID" ).val(), "release" );
                    });
                });
            },
            error:function( error ){
                console.log( error.message );
            }
        });

        var Service = Parse.Object.extend( "CabServices" );
        var query = new Parse.Query( Service );
        var User = Parse.Object.extend( "User" );
        var query2 = new Parse.Query( User );

        query.equalTo( "driverID", sessionStorage.emailID );
        query.equalTo( "serviceStatus", "time" );
        query.descending( "createdAt" );
        query.limit( 25 );
        query.find({
            success:function( results ){
                var template = Handlebars.compile( $( "#carclub-single-service" ).html() );
                $( ".list-services.cab" ).append( " " );
                var p;
                $( results ).each( function(i, e){
                    p = e.toJSON();
                    var r = $.parseJSON(p.pickupTime);
                    var s = r.hour + ":" + r.minutes;
                    query2.equalTo( "username",p.clientID);
                    query2.first({
                        success:function( res ){
                            $( res ).each( function( j, f ){
                                var a = f.toJSON();
                                var q = {"carClubType":"Cab Service","objectId":p.objectId,"serviceStatus":p.serviceStatus,"clientID":a.fullname,"pickupTime":s,"pickupAddress":p.pickupAddress,"estimateDuration":p.estimateDuration}
                                $( ".list-services.cab" ).append( template( q ));
                                $( ".list-services.cab" ).find( "a" ).eq( i ).click( function(){
                                    me.carClubServiceInformation( $( this ).find( "#objectID" ).val(), "release" );
                                });
                            });
                        },
                        error:function( error ){
                            console.log( error.message );
                        }
                    });
                });
            },
            error:function( error ){
                console.log( error.message );
            }
        });
        $( ".button" ).click( function(){
            alert( "Clicked" );
        });
    },
    carClubServiceInformation:function( code, rel ) {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h6>Pick up: <span class='pickup'>Here</span></h6>\
            <h6>Drop off: <span class='dropoff'>There</span></h6>\
            <div class='input-row'>\
                <div id='mapPlanTrip'></div>\
            </div>\
            <p>There is a new client to pickup.</p>\
            <p>Estimate time <span class='estTime'>10</span> minutes.</p>\
        <a href='#' class='button full-button'>Take job</a>\
        </div>\
        ");
//        $( "p" ).click(function(){
        if( rel != undefined ) {
            $( ".button" ).text( "Release Service" );
        }
        var Service = Parse.Object.extend( "CabServices" );
        var query = new Parse.Query( Service );

        query.equalTo( "objectId", code );
        query.first({
            success:function( results ){
                var res = results.toJSON();
                var pickup = $.parseJSON( res.pickupLocation );
                var dropoff = $.parseJSON( res.dropoffLocation );
                var mapName = "#mapPlanTrip";
                map = new GMaps({
                    div: mapName,
                    lat: pickup.lat,
                    lng: pickup.lng,
                });
                map.addMarker({
                    lat: pickup.lat,
                    lng: pickup.lng,
                });
                map.addMarker({
                    lat: dropoff.lat,
                    lng: dropoff.lng,
                });
                map.drawRoute({
                    origin: [pickup.lat, pickup.lng],
                    destination: [dropoff.lat, dropoff.lng],
                    travelMode: 'driving',
                    strokeColor: '#123456',
                    strokeOpacity: 0.6,
                    strokeWeight: 6
                });
                $( ".pickup" ).html( res.pickupAddress );
                $( ".dropoff" ).html( res.dropoffAddress );
                $( ".estTime" ).html( res.estimateDuration );
            },
            error:function( error ){
                console.log( error.message );
            }
        });
        $( ".button" ).click( function(){
            switch( $( ".button" ).text() ){
                case "Release Service":
                    console.log( "Releasing service" );
                    var Services = Parse.Object.extend( "CabServices" );
                    var query2 = new Parse.Query( Services );
                    var time = new Date();
                    var endTime = '{"year":' + time.getFullYear() + ',"month":' + time.getMonth() + ',"day":' + time.getDay() + ',"hour":' + time.getHours() + '}';

                    query2.equalTo( "objectId", code );
                    query2.first().then(function( data ){
                        data.set( "serviceStatus", "done" );
                        data.set( "endTime", endTime );
                        data.save({
                            success:function(){
                                console.log( "Service released!" );
                                me.carClubPendingServices();
                            },
                            error:function( error ){
                                console.log( error.message );
                            }
                        });
                    });
                break;
                case "Take job":
                    console.log( "Accepting service" );
                    var Services = Parse.Object.extend( "CabServices" );
                    var query2 = new Parse.Query( Services );

                    query2.equalTo( "objectId", code );
                    query2.first().then(function( data ){
                        data.set( "driverID", sessionStorage.emailID );
                        data.save({
                            success:function(){
                                console.log( "Service assigned!" );
                                me.carClubAssignedServices();
                            },
                            error:function( error ){
                                console.log( error.message );
                            }
                        });
                    });
                break;
            }
        });
    },
    carClubMemberDetails:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
<div class='calendarLayer'> </div>\
        ");
        dh_calendar_book_a_cab.ini( function( e ){
//            $( 'p' ).html( e.year );
            alert( e.minute );
  		});
        $( "p" ).click(function(){
        });
    },
    carClubMemberFinances:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h2>Accrued</h2>\
            <div class='driver-card'>\
                <img src='resources/images/annettemay.jpg'>\
                <div class='driver-info'>\
                    <div><i class='ion-person'></i><h3 id='driver-name'>Annette May</h3></div>\
                    <div><i class='ion-android-home'></i><h3 id='driver-address'>This is her address line</h3></div>\
                    <div><i class='ion-android-call'></i><h3 id='driver-phone'>07471234567</h3></div>\
                </div>\
            </div>\
            <div class='accrued-amount'>\
                <div class='accrued-row'>\
                    <div class='icon-section'>\
                        <i class='ion-pie-graph big-icon'></i>\
                    </div>\
                    <div class='title-section'>\
                        <h3>Accrued Amount</h3>\
                    </div>\
                    <div class='amount-section'>\
                        <h4>This month</h4>\
                        <h3 id='accrued-ammount'>£450.00</h3>\
                    </div>\
                </div>\
            </div>\
            <p><span>Please read and confirm below</span>\
You must commit to the times you have agreed to in order to continue being a CarClub member and a user of CarGo. Failure to notify us of any changes will result in instant removal from the CarClub and CarGo altogether. Thank you and have a great experience with us.</p>\
            <a href='#' class='button full-button'>Finish</a>\
        </div>\
        ");
        var Hire = Parse.Object.extend( "CarHire" );
        var query = new Parse.Query( Hire );

        query.equalTo( "ownerID", sessionStorage.emailID );
        query.equalTo( "hireStatus", "done" );
        query.descending( "createdAt" );
        query.find({
            success:function( results ){

            }
        });
    },
    signupMemberDetails:function( type ) {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <p> Personal Details </p>\
            <form class='input-form'>\
                <div class='input-row'>\
                    <span class='input-element'>\
                        <input type='text' name='full-name' id='full-name' placeholder='Full Name'>\
                        <label for='full-name'>Full Name</label>\
                    </span>\
                    <span class='input-element'>\
                        <input type='text' name='number' id='number' placeholder='Phone Number'>\
                        <label for='number'>Phone Number</label>\
                    </span>\
                    <span class='input-element'>\
                        <input type='text' name='home-address' id='home-address' placeholder='Home Address'>\
                        <label for='home-address'>Home Address</label>\
                    </span>\
                    <span class='input-element'>\
                        <input type='text' name='postcode' id='postcode' placeholder='Post Code'>\
                        <label for='postcode'>Post Code</label>\
                    </span>\
                </div>\
                <div class='input-row'>\
                    <div class='side-by-side-small'>\
                        <div class='chkbox'>\
                            <input type='checkbox' value='yes' id='chkboxInput' name='chkboxInput'>\
                            <label for='chkboxInput'><i class='ion-android-done'></i></label>\
                        </div>\
                    </div>\
                    <div class='side-by-side'>\
                        <p>I want to join CarClub.</p>\
                    </div>\
                </div>\
                <a href='#' class='button full-button js--signup-member-details-button'>Save</a>\
            </form>\
        ");
        $( '.screen' ).attr( 'id', '' );
        $( 'input' ).keyup( function(){
            var type = "";
            if( $( this ).attr( 'name' ) == "email" ) {
                type = "email";
            } else {
                type = $( this ).attr( 'name' );
            }
            me.validateForm( $( this ).val(), $( this ).attr( 'id' ), type );
        });
        $( ".button" ).click( function(){
            var user = Parse.Object.extend( "_User" );
            var query = new Parse.Query( user );
            var fname = $("#full-name").val();
            var pnumber = $("#number").val();
            var haddress = $("#home-address").val();
            var postcode = $("#postcode").val();
            var carclub = 'No';
            if($('#chkboxInput').prop('checked') == true) {
                //Is insured for more than one driver
                var carclub = 'Yes';
            }
            query.equalTo( 'email', sessionStorage.emailID )
            query.first().then(function( data ){
                data.set( 'fullname', fname );
                data.set( 'phonenumber', pnumber );
                data.set( 'address', haddress );
                data.set( 'carclub', carclub );
                data.set( 'postcode', postcode );
                data.save();
                sessionStorage.carClub = carclub;
                if( sessionStorage.newMember == "Yes" ){
                    sessionStorage.newMember = "No";
                    if( carclub == "Yes" ) {
                        me.signupMemberCarDetails( carclub );
                    } else {
                        me.loginType();
                    }
                }
            });
        });
    },
    signupMemberCarDetails:function( cc ) {
        $( ".screen" ).empty;
        var me = this;
        var screenContents = "\
        <div class='verticalcenter'>\
            <form class='car-details-input-form'>\
                <a href='#' class='button camera-button'>\
                    <i class='ion-android-camera'></i>\
                    <p><i class='ion-card icon-not-yet'></i> Drivers license</p>\
                </a>\
        ";
        if( cc == "Yes" ) {
            screenContents += "\
                    <span class='input-element'>\
                        <input type='text' name='car-description' id='car-description' placeholder='Car Description'>\
                        <label for='car-description'>Car Description (Make, Model, etc...)</label>\
                    </span>\
                    <span class='input-element'>\
                        <input type='text' name='car-passengers' id='car-passengers' placeholder='Number of Passengers'>\
                        <label for='car-make'>Number of Passengers (including driver) </label>\
                    </span>\
                <div class='input-row'>\
                    <span class='input-element'>\
                        <input type='text' name='carreg' id='carreg' placeholder='Car Registration Number'>\
                        <label for='carreg'>Car Registration Number</label>\
                    </span>\
                </div>\
                <div class='input-row'>\
                    <span class='input-element'>\
                        <input type='text' name='policynumber' id='policynumber' placeholder='Policy Number'>\
                        <label for='policynumber'>Policy Number</label>\
                    </span>\
                </div>\
                <div class='input-row'>\
                    <div class='side-by-side-small'>\
                        <div class='chkbox'>\
                            <input type='checkbox' value='yes' id='chkboxInput' name='chkboxInput'>\
                            <label for='chkboxInput'><i class='ion-android-done'></i></label>\
                        </div>\
                    </div>\
                    <div class='side-by-side'>\
                        <p>I am insured for more than one driver.</p>\
                    </div>\
                </div>\
                ";
            }
            screenContents += "\
                <a href='#' class='button full-button js--registration-cardetails-save-button'>Save</a>\
            </form>\
        </div>\
        ";
        $( '.screen' ).html( screenContents );
        $( '.screen' ).attr( 'id', '' );
        $( 'input' ).keyup(function(){
            var type = "";
            if( $( this ).attr( 'name' ) == "email" ) {
                type = "email";
            } else {
                type = $( this ).attr( 'name' );
            }
            me.validateForm( $( this ).val(), $( this ).attr( 'id' ), type );
        });
        $( ".button" ).click(function(){
            console.log( 'Got here!' );

            var Car = Parse.Object.extend("Car");
            var car = new Car;

            var emailID = sessionStorage.emailID;
            var carreg = $("#carreg").val();
            var policynumber = $("#policynumber").val();
            var cdesc = $("#car-description").val();
            var cpass = $("#car-passengers").val();
            var insured = 0;
            if($('#chkboxInput').prop('checked') == true) {
                //Is insured for more than one driver
                var insured = 1;
            }

            car.set('emailID', emailID);
            car.set('carRegNumber', carreg);
            car.set('policyNumber', policynumber);
            car.set('insured', insured);
            car.set('carDescription', cdesc);
            car.set('carPassengers', cpass);

            car.save(null, {
                success: function() {
                    console.log("Car Details Saved!");
                    sessionStorage.newMember = "No";
                    me.loginType();
                },
                error: function(car, error) {
                    console.log("There was a problem");
                }
            });
        });
    },
    carHireMenu:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h2 style='color: transparent'>_</h2>\
                <a href='#' class='button full-button js--join-carclub-button'>Hire</a>\
                <a href='#' class='button ghost-button js--hire-car-button'>View scheduled hires</a>\
            </div>\
        ");
        $( ".button" ).click(function(){
            switch( $( this ).text() ){
                case 'Hire':
                    me.carHire();
                break;
                case 'View scheduled hires':
                    me.carHireList();
                break;
            }
        });
    },
    carHireList:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h2>My Bookings</h2>\
            <ul class='list-bookings'>\
            </ul>\
        </div>\
        ");
        var Hire = Parse.Object.extend( "CarHire" );
        var query = new Parse.Query( Hire );
        var User = Parse.Object.extend( "_User" );
        var query2 = new Parse.Query( User );

        query.equalTo( "hireStatus", "time" );
        query.equalTo( "clientID", sessionStorage.emailID );
        query.descending( "createdAt" );
        query.limit( 25 );
        query.find({
            success:function( results ){
                var template = Handlebars.compile( $( "#car-hire-single" ).html() );
                $( ".list-bookings" ).html( " " );
                $( results ).each( function(i, e){
                    var p = e.toJSON();
                    var times = $.parseJSON( p.startTime );
                    var owner;
//                    console.log( p.ownerID );

                    query2.equalTo( "email", p.ownerID );
                    query2.first({
                        success:function( data ){

                            if( data != undefined ) {
                                owner = data.toJSON().fullname;
                                console.log( owner );
                            }
                        },
                        error:function( error ){
                            console.log( error.message );
                        }
                    });

                    var q = {"objectId":p.objectId,"hireStatus":p.hireStatus,"startTime":times.hour,"endTime":times.hours+times.hour,"ownerID":owner,"pickupDropoffAddress":p.pickupDropoffAddress};
//                    console.log( q.startTime );
//                    var r = $.parseJSON( q );
                    $( ".list-bookings" ).append( template( q ) );
                    $( ".list-bookings" ).find( "a" ).eq( i ).click( function(){
                        me.carHireDetails( $( this ).find( "#objectID" ).val() );
                    });
                });
            },
            error:function( error ){
                console.log( error.message );
            }
        });
    },
    carHireDetails:function( code, rel ) {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h6>The dropoff and pickup will be at: <span class='location'>.</span></h6>\
            <h6>Dropoff Time: <span class='pickup'>.</span></h6>\
            <h6>Pickup Time: <span class='dropoff'>.</span></h6>\
            <div class='input-row'>\
                <div id='mapPlanTrip'></div>\
            </div>\
            <p>The car will be dropped off by <span id='ownerID'>.</span></p>\
        </div>\
        ");
        $( ".verticalcenter" ).append( "<a href='#' class='button full-button'>Hire your car</a>'" );
        var Hire = Parse.Object.extend( "CarHire" );
        var query = new Parse.Query( Hire );
        var Users = Parse.Object.extend( "_User" );
        var query2 = new Parse.Query( Users );

        query.equalTo( "objectId", code );
        query.first({
            success:function( results ){
                var res = results.toJSON();
                var pudo = res.pickupDropoffAddress;
                var startTime = res.startTime;
                var endTime = res.endTime;
                var pudol = $.parseJSON( res.pickupDropoffLocation );
                var mapName = "#mapPlanTrip";
                map = new GMaps({
                    div: mapName,
                    lat: pudol.lat,
                    lng: pudol.lng,
                });
                map.addMarker({
                    lat: pudol.lat,
                    lng: pudol.lng,
                });
                var p = $.parseJSON( startTime );
                $( ".location" ).html( pudo );
                $( ".pickup" ).html( p.hour );
                $( ".dropoff" ).html( (p.hour + p.hours) );
                if( sessionStorage.emailID != res.clientID ){
//                    console.log( "It's not mine!" );
                    $( ".verticalcenter" ).find( "p" ).html( "" );
                    if( rel == 'release' ) {
                        $( ".verticalcenter" ).find( ".button" ).text( "Release Service" );
                    }
                    $( ".button" ).click( function(){
                        switch( $( ".button" ).text() ) {
                            case "Hire your car":
//                              console.log( "Accepting service" );
                                var Services = Parse.Object.extend( "CarHire" );
                                var query3 = new Parse.Query( Services );

                                query3.equalTo( "objectId", code );
                                query3.first().then(function( data ){
                                    data.set( "ownerID", sessionStorage.emailID );
                                    data.save({
                                        success:function(){
                                            console.log( "Service assigned!" );
                                            me.loginType();
                                        },
                                        error:function( error ){
                                            console.log( error.message );
                                        }
                                    });
                                });
                            break;
                            case "Release Service":
//                                if( $( "p" ).text() == "" )
//                                    console.log( $( ".verticalcenter" ).find( ".button" ).text() + " owner" );
                            break;
                        }
                    });
                } else {
                    console.log( "It's mine!" );
//                    $( "#ownerID" ).html( sessionStorage.fullname );
                    console.log( res.ownerID );
                    query2.equalTo( "email", res.ownerID );
                    query2.first({
                        success:function( results2 ) {
                            console.log( results2 );
                            if( results2 != undefined ) {
                                var res2 = results2.toJSON();
                                $( "#ownerID" ).html( res2.fullname );
                                $( ".verticalcenter" ).find( ".button" ).text( "Release Service" );
                            } else {
                                $( ".verticalcenter" ).find( "p" ).html( "Your service has not ben assigned a car yet." );
                                $( ".verticalcenter" ).find( ".button" ).remove();
                            }
                        }, error:function( error ) {
                            console.log( error.message );
                        }
                    });

                }
            },
            error:function( error ){
                console.log( error.message );
            }
        });
        $( ".button" ).click( function(){
            if( $( "p" ).text() != "" ) {
                var time = new Date();
                var endTime = '{"year":' + time.getFullYear() + ',"month":' + time.getMonth() + ',"day":' + time.getDay() + ',"hour":' + time.getHours() + '}';
                console.log( endTime );
                console.log( $( ".button" ).text() + " client");
                query.equalTo( "objectId", code );
                query.first().then( function( data ){
                    data.set( "endTimeClient", endTime );
                    data.set( "hireStatus", "done" );
                    data.save();
                    });
            } else {
                var time = new Date();
                var endTime = '{"year":' + time.getFullYear() + ',"month":' + time.getMonth() + ',"day":' + time.getDay() + ',"hour":' + time.getHours() + '}';
                console.log( endTime );
                console.log( $( ".button" ).text() + " owner");
                query.equalTo( "objectId", code );
                query.first().then( function( data ){
                    data.set( "endTimeDriver", endTime );
                    data.set( "hireStatus", "done" );
//CHECK HERE
                    data.save();
                    });
            }
        });
    },
    carHire:function( code ) {
        $( ".screen" ).empty;
        var me = this;
        var fare = 10;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h2 style='color: transparent'>_</h2>\
                <form class='car-details-input-form'>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input id='startTime' class='datepicker' name='date' type='text' autofocuss placeholder='Start time' data-valuee='-'>\
                            <label for='startTime'>Start time</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input id='endTime' class='datepicker' name='date' type='text' autofocuss placeholder='End time' data-valuee='-' disabled>\
                            <label for='endTime'>End time</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='pickup-location' id='pickup-location' placeholder='Pickup/Dropoff location'>\
                            <label for='pickup-location'>Pickup/Dropoff location</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <div id='mapPlanTrip'></div>\
                    </div>\
                    <p>Fare:</p>\
                    <h2 id='location-screen-fare'>£<span class='fare'>XX.XX</span></h2>\
                    <a href='#' class='button full-button js--hire-car-save-button'>Hire</a>\
                </form>\
            </div>\
        ");
        $( "#startTime" ).focus(function(){
	     	$( function(){
	     		dh_calendar_hire_a_car.ini( function( e ){
                    jsonString = JSON.stringify(e);
                    $( "#startTime" ).val( e.day + " " + months[e.month] + ", " + e.year + " - Dropoff: " + e.hour + " hours" );
                    $( "#endTime" ).val( e.day + " " + months[e.month] + ", " + e.year + " - Pickup: " + (e.hour + e.hours) + " hours" );
                    $( "#startTime" ).attr( "data-valuee", jsonString );
                    if( e.hours >= 4 ){
                        me.fare = 10;
                        var extraHours = e.hours - 4;
                        me.fare = me.fare + ( extraHours * 5 )
                        $( "#location-screen-fare" ).text( me.fare );
                    }
	     		});
	     	});
            $( "#blackOverlay" ).show();
        });
        var mapName = "#mapPlanTrip";
        map = new GMaps({
            div: mapName,
            lat: 51.5002918,
            lng: -0.1206113
        });
        $( "#pickup-location" ).focusout( function(){
            GMaps.geocode({
                address: $('#pickup-location').val().trim(),
                callback: function(results, status){
                    if(status=='OK'){
                        var latlng = results[0].geometry.location;
                        map.setCenter(latlng.lat(), latlng.lng());
                        lata = latlng.lat();
                        lnga = latlng.lng();
                        map.removeMarkers();
                        map.addMarker({
                            lat: latlng.lat(),
                            lng: latlng.lng()
                        });
                    }
                }
            });
        });
        $( ".button" ).click(function(){
            var clientID = sessionStorage.emailID;
            var startTime = $( "#startTime" ).attr("data-valuee");
            var endTime = $( "#endTime" ).attr("data-valuee");
            var hireStatus = "time";
            var pickupDropoffAddress = $( "#pickup-location" ).val();
            var pickupDropoffLocation = "";
            fare = $( ".fare" ).text();
            GMaps.geocode({
                address: $('#pickup-location').val().trim(),
                callback: function(results, status){
                    if(status=='OK'){
                        var latlng = results[0].geometry.location;
                        pickupDropoffLocation = '{"lat":' + latlng.lat() + ',"lng":' + latlng.lng() + '}'

                        jsonString = {"clientID":clientID, "startTime":startTime, "endTime":endTime, "hireStatus":hireStatus, "pickupDropoffLocation": pickupDropoffLocation, "pickupDropoffAddress":pickupDropoffAddress, "fare":me.fare};
                        console.log(jsonString);
                        me.payWithCard( 'hire', jsonString );
                    }
                }
            });
        });
    },
    bookACabMenu:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h2 style='color: transparent'>_</h2>\
                <a href='#' class='button full-button js--join-carclub-button'>Book a cab</a>\
                <a href='#' class='button ghost-button js--hire-car-button'>View cab bookings</a>\
            </div>\
        ");
        $( ".button" ).click(function(){
            switch( $( this ).text() ){
                case 'Book a cab':
                    me.bookACabLocationsTime();
                break;
                case 'View cab bookings':
                    me.bookACabList();
                break;
            }
        });
    },
    bookACabLocationsTime:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <form class='car-details-input-form'>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input id='pickupTime' class='datepicker' name='date' type='text' autofocuss placeholder='Pickup time' data-valuee='2015-12-22T20:00:37.163Z'>\
                            <label for='pickup'>Pickup time</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='pickup-location' id='pickup-location' placeholder='Pickup location'>\
                            <label for='pickup'>Pickup location</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='dropoff-location' id='dropoff-location' placeholder='Dropoff location'>\
                            <label for='dropoff'>Dropoff location</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <div id='mapPlanTrip'></div>\
                    </div>\
                    <p>Fare:</p>\
                    <h2 id='location-screen-fare'>£XX.XX</h2>\
                    <a href='#' class='button full-button js--location-screen-save-button'>Save</a>\
                </form>\
            </div>\
        ");
        var jsoncString2 = "";
        $( ".button" ).click(function(){
/*
estimateDuration
estimateDistance
pickupTime : 23/Dec/2015 01:00 AM +0530
pickupLocation
dropoffLocation
clientID
serviceStatus
fare
*/
            var a = $.parseJSON( jsonString );

            var pula = "";
            var pulb = "";
            var dateR = new Date();

            pula = '{"lat":' + a.lata + ',"lng":' + a.lnga + '}';
            pulb = '{"lat":' + a.latb + ',"lng":' + a.lngb + '}';
            jsonString = {"estimateDuration":Math.round(a.estimateDuration/60), "estimateDistance":a.estimateDistance, "pickupTime":JSON.stringify( jsonString2), "pickupLocation":pula, "dropoffLocation":pulb, "clientID":a.clientID, "serviceStatus":a.serviceStatus, "fare":a.fare, "pickupAddress":a.pickupAddress, "dropoffAddress":a.dropoffAddress};
            console.log(jsonString);
            me.payWithCard( 'cab', jsonString );
        });
        $( "#pickup-location" ).focusout( function(){
            GMaps.geocode({
                address: $('#pickup-location').val().trim(),
                callback: function(results, status){
                    if(status=='OK'){
                        var latlng = results[0].geometry.location;
                        map.setCenter(latlng.lat(), latlng.lng());
                        lata = latlng.lat();
                        lnga = latlng.lng();
                        map.addMarker({
                            lat: latlng.lat(),
                            lng: latlng.lng()
                        });
                        if( $( "#dropoff-location" ).val() != "" ) {
                            map.drawRoute({
                                origin: [lata, lnga],
                                destination: [latb, lngb],
                                travelMode: 'driving',
                                strokeColor: '#131540',
                                strokeOpacity: 0.6,
                                strokeWeight: 6
                            });
                            map.getRoutes({
                                origin: [lata, lnga],
                                destination: [latb, lngb],
                                callback: function (e) {
                                    var time = 0;
                                    var distance = 0;
                                    for (var i=0; i<e[0].legs.length; i++) {
                                        time += e[0].legs[i].duration.value;
                                        distance += e[0].legs[i].distance.value;
                                    }
//                                    console.log(time + " " + distance);
                                    var fare = distance * 0.000621371;
                                    fare = fare.toFixed(2);
                                    $("#location-screen-fare").html("£" + fare);
                                    jsonString = '{ "estimateDuration":' + time + ', "estimateDistance":' + distance + ', "pickupTime":"' + $( '#pickupTime' ).attr( 'data-valuee' ) + '", "lata":' + lata + ', "lnga":' + lnga + ', "latb":' + latb + ', "lngb":' + lngb + ', "clientID":"' + sessionStorage.emailID + '", "serviceStatus":"time", "fare":' + fare + ', "pickupAddress":"' + $('#pickup-location').val() + '", "dropoffAddress":"' + $('#dropoff-location').val() + '" }' ;
                                    console.log(jsonString);
/*           console.log( "Duration: " + time );
            console.log( "Distance: " + distance );
            console.log( "Pickup = [ Lat: " + lata + ", Lng: " + lnga + "]");
            console.log( "Dropoff = [ Lat: " + latb + ", Lng: " + lngb + "]");
            console.log( "ClientID: " + sessionStorage.emailID );
            console.log( "Service Status: Pending" );*/
//                                    console.log(fare);
                                }
                            });
                        }
                    }
                }
            });
        });
        $( "#dropoff-location" ).focusout( function(){
            GMaps.geocode({
                address: $('#dropoff-location').val().trim(),
                callback: function(results, status){
                    if(status=='OK'){
                        var latlng = results[0].geometry.location;
                        map.setCenter(latlng.lat(), latlng.lng());
                            latb = latlng.lat();
                            lngb = latlng.lng();
                        map.addMarker({
                            lat: latlng.lat(),
                            lng: latlng.lng()
                        });
                        if( $( "#pickup-location" ).val() != "" ) {
                            map.drawRoute({
                                origin: [lata, lnga],
                                destination: [latb, lngb],
                                travelMode: 'driving',
                                strokeColor: '#131540',
                                strokeOpacity: 0.6,
                                strokeWeight: 6
                            });
                            map.getRoutes({
                                origin: [lata, lnga],
                                destination: [latb, lngb],
                                callback: function (e) {
                                    var time = 0;
                                    var distance = 0;
                                    for (var i=0; i<e[0].legs.length; i++) {
                                        time += e[0].legs[i].duration.value;
                                        distance += e[0].legs[i].distance.value;
                                    }
//                                    console.log(this.time + " " + this.distance);
                                    var fare = distance * 0.000621371;
                                    fare = fare.toFixed(2);
                                    $("#location-screen-fare").html("£" + fare);
                                    jsonString = '{ "estimateDuration":' + time + ', "estimateDistance":' + distance + ', "pickupTime":"' + $( '#pickupTime' ).attr( 'data-valuee' ) + '", "lata":' + lata + ', "lnga":' + lnga + ', "latb":' + latb + ', "lngb":' + lngb + ', "clientID":"' + sessionStorage.emailID + '", "serviceStatus":"time", "fare":' + fare + ', "pickupAddress":"' + $('#pickup-location').val() + '", "dropoffAddress":"' + $('#dropoff-location').val() + '" }' ;
//                                    jsonString = '{ "estimateDuration":' + time + ', "estimateDistance":' + distance + ', "pickupTime":"' + $( '#pickupTime' ).attr( 'data-valuee' ) + '", "pickupLocation":"{' + lata + ', ' + lnga + '}", "dropoffLocation":"{' + latb + ', ' + lngb + '}", "clientID":"' + sessionStorage.emailID + '", "serviceStatus":"Pending", "fare":' + fare + ' }' ;
                                    console.log(jsonString);
//                                    console.log(fare);
                                }
                            });
                        }
                    }
                }
            });
        });
        var mapName = "#mapPlanTrip";
        map = new GMaps({
            div: mapName,
            lat: 51.5002918,
            lng: -0.1206113
        });
        $( "#pickupTime" ).focus(function(){
	     	$( function(){
	     		dh_calendar_book_a_cab.ini( function( e ){
//                    jsonString2 = JSON.stringify(e);
                    jsonString2 = e;
                    $( "#pickupTime" ).val( e.day + " " + months[e.month] + ", " + e.year + " - Pickup at " + e.hour + ":" + (e.minutes) );
                    $( "#pickupTime" ).attr( "data-valuee", jsonString2 );
	     		});
	     	});
            $( "#blackOverlay" ).show();
        });
    },
    bookACabList:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h2>My Bookings</h2>\
            <ul class='list-bookings'>\
            </ul>\
        </div>\
        ");
        var Service = Parse.Object.extend( "CabServices" );
        var query = new Parse.Query( Service );
//console.log( "I'm here" );
        query.equalTo( "clientID", sessionStorage.emailID );
        query.equalTo( "serviceStatus", "time" );
        query.descending( "createdAt" );
        query.limit( 25 );
        query.find({
            success:function( results ){
                var template = Handlebars.compile( $( "#cab-single-service" ).html() );
                var p;
                $( ".list-bookings" ).html( " " );
                $( results ).each( function(i, e){
                    p = e.toJSON();
                    var r = $.parseJSON(p.pickupTime);
                    var s = r.hour + ":" + r.minutes;
                    if( p.driverID != undefined ) {
                    var q = {"objectId":p.objectId,"serviceStatus":p.serviceStatus,"pickupTime":s,"pickupAddress":p.pickupAddress,"estimateDuration":p.estimateDuration,"driverID":p.driverID};
                        var rel = "release";
                    } else {
                    var q = {"objectId":p.objectId,"serviceStatus":p.serviceStatus,"pickupTime":s,"pickupAddress":p.pickupAddress,"estimateDuration":p.estimateDuration};
                        var rel = "-";
                    }
//                        console.log( p.driverID );
//                    var driver = p.driverID;

                    $( ".list-bookings" ).append( template( q ));
                    $( ".list-bookings" ).find( "a" ).eq( i ).click( function(){
                        me.bookACabWait( $( this ).find( "#objectID" ).val(), rel );
                    });
                    q = p;
                });
//NEED TO UPDATE THE HOUR FOR PICKUP
/*
                var pt = $( ".pickupTime" );
                $.each( results, function( i, e ){
                    p = e.toJSON();
//                    console.log( $.parseJSON(p.pickupTime).hour + ":" + $.parseJSON(p.pickupTime).minutes );
                    var r = $.parseJSON(p.pickupTime);
//                        $( ".list-bookings" ).find( "#pickupTime" ).eq( i ).text( i );
                    console.log( i );
                    console.log( pt[ i ] );
//                    pt[ i ].append( "textHello" );
                    pt[ i ].attr( "color", "pink" );
//                    pt[ i ].text( r.hour + ":" + r.minutes );
                });
//<span class="clase"> Hola </span>
*/
            },
            error:function( error ){
                console.log( error.message );
            }
        });

    },
    bookACabWait:function( code, rel ) {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h6>Pick up: <span class='pickup'>Here</span></h6>\
            <h6>Drop off: <span class='dropoff'>There</span></h6>\
            <div class='input-row'>\
                <div id='mapPlanTrip'></div>\
            </div>\
            <p>Your drive will be about <span class='estTime'>-</span> minutes long.</p>\
        </div>\
        ");
        if( rel != undefined && rel == "release" ){
            $( ".verticalcenter" ).append( "<a href='#' class='button full-button'>Release Service</a>" );
            $( ".button" ).click( function(){
                console.log( "Releasing service" );
                var Services = Parse.Object.extend( "CabServices" );
                var query2 = new Parse.Query( Services );
                var time = new Date();
                var endTime = '{"year":' + time.getFullYear() + ',"month":' + time.getMonth() + ',"day":' + time.getDay() + ',"hour":' + time.getHours() + '}';

                query2.equalTo( "objectId", code );
                query2.first().then(function( data ){
                    data.set( "serviceStatus", "done" );
                    data.set( "endTime", endTime );
                    data.save({
                        success:function(){
                            console.log( "Service released!" );
                        },
                        error:function( error ){
                            console.log( error.message );
                        }
                    });
                });
            });
        }
        var Service = Parse.Object.extend( "CabServices" );
        var query = new Parse.Query( Service );

        query.equalTo( "objectId", code );
        query.equalTo( "serviceStatus", "time" );
        query.first({
            success:function( results ){
                var res = results.toJSON();
                var pickup = $.parseJSON( res.pickupLocation );
                var dropoff = $.parseJSON( res.dropoffLocation );
                var mapName = "#mapPlanTrip";
                map = new GMaps({
                    div: mapName,
                    lat: pickup.lat,
                    lng: pickup.lng
                });
                map.addMarker({
                    lat: pickup.lat,
                    lng: pickup.lng
                });
                map.addMarker({
                    lat: dropoff.lat,
                    lng: dropoff.lng
                });
                map.drawRoute({
                    origin: [pickup.lat, pickup.lng],
                    destination: [dropoff.lat, dropoff.lng],
                    travelMode: 'driving',
                    strokeColor: '#123456',
                    strokeOpacity: 0.6,
                    strokeWeight: 6
                });
                $( ".pickup" ).html( res.pickupAddress );
                $( ".dropoff" ).html( res.dropoffAddress );
                $( ".estTime" ).html( res.estimateDuration );
            },
            error:function( error ){
                console.log( error.message );
            }
        });
    },
    validateForm:function( textname, textid, type ) {
        var me = this;
        var lbl = $( "label[for='" + textid + "']" );
        var rtrn = 0;
    /*
    rtrn = 0 ; Error
    rtrn = 1 ; No Error
    */
        var strformat = "";
        switch(type){
            case 'text':
                var txtformat = /^[a-zA-Z0-9,.!?\s]+$/;
                strformat = txtformat;
            break;
            case 'email':
                var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                strformat = mailformat;
            break;
            case 'number':
    /* RegEx taken from http://regexlib.com/UserPatterns.aspx?authorid=d95177b0-6014-4e73-a959-73f1663ae814&AspxAutoDetectCookieSupport=1 */
                var numformat = /^((\(?0\d{4}\)?\s?\d{3}\s?\d{3})|(\(?0\d{3}\)?\s?\d{3}\s?\d{4})|(\(?0\d{2}\)?\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
                strformat = numformat;
            break;
            case 'password':
    /* RegEx taken from http://regexlib.com/UserPatterns.aspx?authorid=d95177b0-6014-4e73-a959-73f1663ae814&AspxAutoDetectCookieSupport=1 */
                var txtformat = /^[a-zA-Z0-9,.!?\s]+$/;
                strformat = txtformat;
            break;
            }
        if( textname.match( strformat ) ){
                $( "#" + textid ).removeClass( "invalidTxt" );
                rtrn = 1;
           } else {
                $( "#" + textid ).addClass( "invalidTxt" );
                rtrn = 0;
           }
        return rtrn;
    },
    payWithCard:function( type, data ) {
        var me = this;
        var key = 'pk_test_Cvf637rTocgISSRnsbcqqaTb';
        switch( type ){
            case 'cab':
                var estimateDuration = data.estimateDuration;
                var estimateDistance = data.estimateDistance;
                var pickupTime = data.pickupTime;
                var pickupLocation = data.pickupLocation;
                var dropoffLocation = data.dropoffLocation;
                var clientID = data.clientID;
                var serviceStatus = data.serviceStatus;
                var fare = ( data.fare * 100 );
                var pickupAddress = data.pickupAddress;
                var dropoffAddress = data.dropoffAddress
            break;
            case 'hire':
                var clientID = data.clientID;
                var startTime = data.startTime;
                var endTime = data.endTime;
                var hireStatus = data.hireStatus;
                var pickupDropoffLocation = data.pickupDropoffLocation;
                var pickupDropoffAddress = data.pickupDropoffAddress;
                var fare = ( data.fare * 100 );
            break;
        }

        var handler = StripeCheckout.configure({
            key: key,
            locale: 'auto',
            token: function(token) {
                $.ajax({
                    type: 'POST',
                    url: 'http://cg.dihops.com/ch.php',
                    data: 'token=' + token.id + '&amount=' + fare + "&sekey=" + CryptoJS.MD5( "293d55f63db67899d8a0c1e5c55cf2a4" ).toString( CryptoJS.enc.Hex ),
                    success:function( data ){
                        var chargeToken = $.parseJSON( data.substr( 20, data.length ) ).id;
                        switch( type ){
                            case "cab":
                                var Services = Parse.Object.extend( "CabServices" );
                                var query = new Services();

                                query.set( 'estimateDuration', estimateDuration );
                                query.set( 'estimateDistance', estimateDistance );
                                query.set( 'pickupTime', pickupTime );
                                query.set( 'pickupLocation', pickupLocation );
                                query.set( 'dropoffLocation', dropoffLocation );
                                query.set( 'clientID', clientID );
                                query.set( 'serviceStatus', serviceStatus );
                                query.set( 'fare', fare );
                                query.set( 'pickupAddress', pickupAddress );
                                query.set( 'dropoffAddress', dropoffAddress );
                                query.set( 'chargeToken', chargeToken );
                                query.save(null, {
                                    success:function(){
                                        console.log( "Service saved correctly!" );
                                        me.bookACabList();
                                    },
                                    error:function(query, error){
                                        console.log( error.message );
                                    }
                                });
                            break;
                            case "hire":
                                var Hire = Parse.Object.extend( "CarHire" );
                                var query = new Hire();

                                query.set( "clientID", clientID );
                                query.set( "startTime", startTime );
                                query.set( "endTime", endTime );
                                query.set( "hireStatus", hireStatus );
                                query.set( "pickupDropoffLocation", pickupDropoffLocation );
                                query.set( "pickupDropoffAddress", pickupDropoffAddress );
                                query.set( "fare", fare );
                                query.set( 'chargeToken', chargeToken );
                                query.save(null, {
                                    success:function(){
                                        console.log( 'Car Hired Correctly' );
                                        me.carHireList();
                                    },
                                    error:function(){
                                        console.log( error.message );
                                    }
                                });
                            break;
                        }
                    }
                });
            }
        });

        handler.open({
            name: 'CarGo',
            email: sessionStorage.emailID,
            description: 'Pay for the service',
            currency: "gbp",
            allowRememberMe: false,
            amount: fare
        });
        // Close Checkout on page navigation
        $(window).on('popstate', function() {
            handler.close();
        });
    },
    payWithCardOriginal:function( type, fare ) {
        var me = this;
        $( ".verticalcenter" ).html('\
            <a href="#" class="button full-button"> Pay! </a>\
        ');

        var key = 'pk_test_Cvf637rTocgISSRnsbcqqaTb';

        var handler = StripeCheckout.configure({
            key: key,

            locale: 'auto',
            token: function(token) {
                // Use the token to create the charge with a server-side script.
                // You can access the token ID with `token.id`
                $.ajax({
                        type: 'POST',
                        url: 'ch.php',
                        data: 'token=' + token.id + '&amount=' + fare,
                        success:function( data ){
                            if( type == "cab" ) {
                                me.bookACabList();
                            }
                            console.log( data );
                        }
                    });

//# replace full card details with the string token from our params
//                var $button = $('.button');
//                $button.after('<hr /><p>Your Stripe token is: <strong>' + token.id + '</strong></p>');
            }
        });

        $('.button').on('click', function(e) {
            // Open Checkout with further options
            handler.open({
                name: 'CarGo',
                description: 'Pay for the service',
                currency: "gbp",
                amount: fare
            });
            e.preventDefault();
        });

        // Close Checkout on page navigation
        $(window).on('popstate', function() {
            handler.close();
        });
    },
    newLogLocation:function(){
        var me = this;
        var Service = Parse.Object.extend( "loginLog" );
        var query = new Service();

        me.getLocation();
        setTimeout( function(){
            console.log( jsonLocation );
            var time = Date();
            console.log( time );

            query.set( "emailID", sessionStorage.emailID );
            query.set( "loginTime". time );
            query.set( "loginLocation", jsonLocation );
            query.save( null, {
                success:function(){
                    console.log( "Log saved" );
                }, error:function( error ){
                    console.log( error.message );
                }
            } );

        }, 1000 );
    }
};

var dh_calendar_book_a_cab = {
    day : 0,
    month : 0,
    year : 0,
    hour : 0,
    minute : 0,
    e : null,
    ini : function( e ){
        var me = this;
        $( "body" ).append("\
            <div class='blackOverlay'>\
                <div class='calendarLayer'>\
                </div>\
            </div>\
        ");

        $( ".calendarLayer" ).html( '\
            <div class="dh-calendar">\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
            </div>\
        ');
        var semanas = $( ".dh-calendar .dh-week" );
        var date = new Date();
        me.year = date.getFullYear();
        me.month = date.getMonth();
        me.e = e;

        //Obtenemos en que dia inicia el mes (d,l,m,m,j,v,s)
        var diasXmes = [31,28,31,30,31,30,31,31,30,31,30,31];

        if( date.getFullYear() % 4  == 0 ){
            diasXmes[ 1 ] = 29;
        }
        var primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
        var primer_dia = parseInt( primerDia.getDay() );
        var ultimo_dia = diasXmes[ date.getMonth() ];
        var dia = 1;

        semanas.each( function( i ){
            var dias = $( this ).find( ".dh-day" );

            dias.each( function( j ){
                var txt_dia = '';
                if( i == 0 ){
                    if( j >= primer_dia ){
                        txt_dia = dia;
                        $( this ).html( txt_dia );
                        dia++;
                        $( this ).removeClass( "noBorder" );
                        me.evt_click_day( $( this ) );
                    }
                }else{
                    if( dia <= ultimo_dia ){
                        txt_dia = dia;
                        $( this ).html( txt_dia );
                        dia++;
                        $( this ).removeClass( "noBorder" );
                        me.evt_click_day( $( this ) );
                    }
                }

            });
        });
        $( ".dh-calendar" ).show();
    },

    evt_click_day : function( obj ){
        var me = this;
        var fecha = new Date();
        obj.addClass( "dh-dayfill" );

        obj.click( function(){
            me.day = parseInt ( obj.text() );
            if( me.day >= fecha.getDate() ){
                me.date_options();
            }
        });

    },

    date_options : function(){
        var me = this;
        var fecha = new Date();
        var _hora = fecha.getHours();
        var _hora_ini = 0;
        if( me.day > fecha.getDate() ){
            _hora = 12;
        }else{
            _hora_ini = _hora;
        }

        var _hora_fin = _hora + 4;
        var overlay = $( "<div/>" );
        overlay.addClass( "dh-overlay" ).appendTo( ".blackOverlay" );

        var dialog = $( "<div/>" ).addClass( "dh-dialog" ).appendTo( ".dh-overlay" );
        dialog.show();

        var fila1 = $( "<div/>" ).addClass( "dh-row" );
        var fila3 = $( "<div/>" ).addClass( "dh-row" );
        var fila4 = $( "<div/>" ).addClass( "dh-row" );
        var fila5 = $( "<div/>" ).addClass( "dh-row" );
        var fila6 = $( "<div/>" ).addClass( "dh-row" );
        var slider = $( "<div/>" );
        var s_time_lbl = $( "<label/>" ).addClass( "sliderNumberLabel" );
        var min_time_lbl = $( "<label/>" ).addClass( "sliderNumberLabel" );
        var s_time = $( "<span/>" ).addClass( "sliderNumber" );
        var min_time = $( "<span/>" ).addClass( "sliderNumber" );
        var slider2 = $( "<div/>" );
        var btn_ok = $( "<a/>" ).addClass( "button" ).addClass( "full-button" ).text( "save" ).attr("href","#");

        s_time_lbl.append( "Hour:" );
        min_time_lbl.append( "Minutes:" );
        fila1.append( s_time_lbl );
        fila1.append( s_time );
        fila1.appendTo( dialog );
        fila4.append( min_time_lbl );
        fila4.append( min_time );
        fila3.appendTo( dialog );
        fila4.appendTo( dialog );
        fila5.appendTo( dialog );
        btn_ok.appendTo( fila6 );
        fila6.appendTo( dialog );

        slider.attr( "id", "sl" );
        slider.appendTo( fila3 );

        slider2.attr( "id", "sl" );
        slider2.appendTo( fila5 );

        s_time.text( 0 );

        slider.slider({
                range: false,
                min: 0,
                max: 23,
                slide: function( event, ui ) {
                    s_time.text( ui.value );
                }
            }
        );

        min_time.text( 0 );
        slider2.slider({
                range: false,
                min: 0,
                max: 59,
                step: 5,
                slide: function( event, ui ) {
                    min_time.text( ui.value );
                }
            }
        );

        btn_ok.click( function(){
            var obj = {
                "year": me.year,
                "month": me.month,
                "day": me.day,
                "hour": parseInt( s_time.text() ),
                "minutes": parseInt( min_time.text() )
            };

            me.e( obj );
            dialog.fadeOut();
            overlay.fadeOut(function(){
                dialog.remove();
                overlay.remove();
                $( ".blackOverlay" ).remove();
            });
        });
    }
};

var dh_calendar_hire_a_car = {
    day : 0,
    month : 0,
    year : 0,
    hour : 0,
    minute : 0,
    e : null,
    ini : function( e ){
        var me = this;
        $( "body" ).append("\
            <div class='blackOverlay'>\
                <div class='calendarLayer'>\
                </div>\
            </div>\
        ");

        $( ".calendarLayer" ).html( '\
            <div class="dh-calendar">\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
            </div>\
        ');
        var semanas = $( ".dh-calendar .dh-week" );
        var date = new Date();
        me.year = date.getFullYear();
//		     		alert( me.year );
        me.month = date.getMonth();
        me.e = e;

        //Obtenemos en que dia inicia el mes (d,l,m,m,j,v,s)
        var diasXmes = [31,28,31,30,31,30,31,31,30,31,30,31];

        if( date.getFullYear() % 4  == 0 ){
            diasXmes[ 1 ] = 29;
        }
        var primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
        var primer_dia = parseInt( primerDia.getDay() );
        var ultimo_dia = diasXmes[ date.getMonth() ];
        var dia = 1;

        semanas.each( function( i ){
            var dias = $( this ).find( ".dh-day" );

            dias.each( function( j ){
                var txt_dia = '';
                if( i == 0 ){
                    if( j >= primer_dia ){
                        txt_dia = dia;
                        $( this ).html( txt_dia );
                        dia++;
                        $( this ).removeClass( "noBorder" );
                        me.evt_click_day( $( this ) );
                    }
                }else{
                    if( dia <= ultimo_dia ){
                        txt_dia = dia;
                        $( this ).html( txt_dia );
                        dia++;
                        $( this ).removeClass( "noBorder" );
                        me.evt_click_day( $( this ) );
                    }
                }

            });
        });
        $( ".dh-calendar" ).show();
    },

    evt_click_day : function( obj ){
        var me = this;
        var fecha = new Date();
        obj.addClass( "dh-dayfill" );

        obj.click( function(){
            me.day = parseInt ( obj.text() );
            if( me.day >= fecha.getDate() ){
                me.date_options();
            }
        });

    },

    date_options : function(){
        var me = this;
        var fecha = new Date();
        var _hora = fecha.getHours();
        var _hora_ini = 0;
        if( me.day > fecha.getDate() ){
            _hora = 12;
        }else{
            _hora_ini = _hora;
        }

        var _hora_fin = _hora + 4;
        var overlay = $( "<div/>" );
        overlay.addClass( "dh-overlay" ).appendTo( ".blackOverlay" );

        var dialog = $( "<div/>" ).addClass( "dh-dialog" ).appendTo( ".dh-overlay" );
        dialog.show();

        var fila1 = $( "<div/>" ).addClass( "dh-row" );
        var fila3 = $( "<div/>" ).addClass( "dh-row" );
        var fila4 = $( "<div/>" ).addClass( "dh-row" );
        var fila5 = $( "<div/>" ).addClass( "dh-row" );
        var fila6 = $( "<div/>" ).addClass( "dh-row" );
        var slider = $( "<div/>" );
        var s_time_lbl = $( "<label/>" ).addClass( "sliderNumberLabel" );
        var min_time_lbl = $( "<label/>" ).addClass( "sliderNumberLabel" );
        var s_time = $( "<span/>" ).addClass( "sliderNumber" );
        var min_time = $( "<span/>" ).addClass( "sliderNumber" );
        var slider2 = $( "<div/>" );
        var btn_ok = $( "<a/>" ).addClass( "button" ).addClass( "full-button" ).text( "save" ).attr("href","#");

        s_time_lbl.append( "Starting time:" );
        min_time_lbl.append( "Number of Hours:" );
        fila1.append( s_time_lbl );
        fila1.append( s_time );
        fila1.appendTo( dialog );
        fila4.append( min_time_lbl );
        fila4.append( min_time );
        fila3.appendTo( dialog );
        fila4.appendTo( dialog );
        fila5.appendTo( dialog );
        btn_ok.appendTo( fila6 );
        fila6.appendTo( dialog );

        slider.attr( "id", "sl" );
        slider.appendTo( fila3 );

        slider2.attr( "id", "sl" );
        slider2.appendTo( fila5 );

        s_time.text( 0 );

        slider.slider({
                range: false,
                min: 0,
                max: 23,
                slide: function( event, ui ) {
                    s_time.text( ui.value );
                }
            }
        );

        min_time.text( 4 );
        slider2.slider({
                range: false,
                min: 4,
                max: 23,
                slide: function( event, ui ) {
                    min_time.text( ui.value );
                }
            }
        );

        btn_ok.click( function(){
            var obj = {
                "year": me.year,
                "month": me.month,
                "day": me.day,
                "hour": parseInt( s_time.text() ),
                "hours": parseInt( min_time.text() )
            };

            me.e( obj );
            dialog.fadeOut();
            overlay.fadeOut(function(){
                dialog.remove();
                overlay.remove();
                $( ".blackOverlay" ).remove();
            });
        });
    }
};

var dh_calendar_carclub_schedule = {
    day : 0,
    month : 0,
    year : 0,
    hour : 0,
    minute : 0,
    e : null,
    ini : function( e ){
        var me = this;
        $( "body" ).append("\
                <div class='calendarLayer'>\
                </div>\
        ");

        $( ".screen .verticalcenter" ).append( '\
            <div class="dh-calendar">\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
                <div class="dh-week">\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                    <div class="dh-day noBorder"></div>\
                </div>\
            </div>\
        ');
        var semanas = $( ".dh-calendar .dh-week" );
        var date = new Date();
        me.year = date.getFullYear();
//		     		alert( me.year );
        me.month = date.getMonth();
        me.e = e;

        //Obtenemos en que dia inicia el mes (d,l,m,m,j,v,s)
        var diasXmes = [31,28,31,30,31,30,31,31,30,31,30,31];

        if( date.getFullYear() % 4  == 0 ){
            diasXmes[ 1 ] = 29;
        }
        var primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
        var primer_dia = parseInt( primerDia.getDay() );
        var ultimo_dia = diasXmes[ date.getMonth() ];
        var dia = 1;

        semanas.each( function( i ){
            var dias = $( this ).find( ".dh-day" );

            dias.each( function( j ){
                var txt_dia = '';
                if( i == 0 ){
                    if( j >= primer_dia ){
                        txt_dia = dia;
                        $( this ).html( txt_dia );
//                        $( this ).addClass( "dh-day-completed" );
                        dia++;
                        $( this ).removeClass( "noBorder" );
//                        $( this ).addClass( "dh-day-completed" );
                        me.evt_click_day( $( this ) );
                    }
                }else{
                    if( dia <= ultimo_dia ){
                        txt_dia = dia;
                        $( this ).html( txt_dia );
//                        $( this ).attr( "id", txt_dia + "dia" )
                        dia++;
                        $( this ).removeClass( "noBorder" );
//                        $( this ).addClass( "dh-day-completed" );
                        me.evt_click_day( $( this ) );
                    }
                }

            });
        });
        $( ".dh-calendar" ).show();
    },

    evt_click_day : function( obj ){
        var me = this;
        var fecha = new Date();
        obj.addClass( "dh-dayfill" );

        obj.click( function(){
            if( $( this ).attr( "class" ).match( "dh-day-completed" ) == null ){
                me.day = parseInt ( obj.text() );
                if( me.day >= fecha.getDate() ){
                    me.date_options();
                    $( this ).addClass( "dh-day-completed" );

                }
            }
        });

    },

    date_options : function(){
        var me = this;
        var fecha = new Date();
        var _hora = fecha.getHours();
        var _hora_ini = 0;
        if( me.day > fecha.getDate() ){
            _hora = 12;
        }else{
            _hora_ini = _hora;
        }

        var _hora_fin = _hora + 4;
        var overlay = $( "<div/>" );
        overlay.addClass( "dh-overlay" ).appendTo( ".screen" );

        var dialog = $( "<div/>" ).addClass( "dh-dialog" ).appendTo( ".dh-overlay" );
        dialog.show();

        var fila1 = $( "<div/>" ).addClass( "dh-row" );
        var fila3 = $( "<div/>" ).addClass( "dh-row" );
        var fila4 = $( "<div/>" ).addClass( "dh-row" );
        var fila5 = $( "<div/>" ).addClass( "dh-row" );
        var fila6 = $( "<div/>" ).addClass( "dh-row" );
        var slider = $( "<div/>" );
        var s_time_lbl = $( "<label/>" ).addClass( "sliderNumberLabel" );
        var min_time_lbl = $( "<label/>" ).addClass( "sliderNumberLabel" );
        var s_time = $( "<span/>" ).addClass( "sliderNumber" );
        var min_time = $( "<span/>" ).addClass( "sliderNumber" );
        var slider2 = $( "<div/>" );
        var chk = $( "<input>" ).attr( "type", "checkbox" ).attr( "value", "yes" ).addClass( "chkbox" );
        var chk_lbl = $( "<label>" ).text( "I can drive during this time." );
        var btn_ok = $( "<a/>" ).addClass( "button" ).addClass( "full-button" ).text( "save" ).attr("href","#");

        s_time_lbl.append( "Starting time:" );
        min_time_lbl.append( "Number of Hours:" );
        fila1.append( s_time_lbl );
        fila1.append( s_time );
        fila1.appendTo( dialog );
        fila4.append( min_time_lbl );
        fila4.append( min_time );
        fila3.appendTo( dialog );
        fila4.appendTo( dialog );
        fila5.appendTo( dialog );
        fila6.append( chk );
        fila6.append( chk_lbl );
        btn_ok.appendTo( fila6 );
        fila6.appendTo( dialog );

        slider.attr( "id", "sl" );
        slider.appendTo( fila3 );

        slider2.attr( "id", "sl" );
        slider2.appendTo( fila5 );

        s_time.text( 0 );

        slider.slider({
                range: false,
                min: 0,
                max: 23,
                slide: function( event, ui ) {
                    s_time.text( ui.value );
                }
            }
        );

        min_time.text( 4 );
        slider2.slider({
                range: false,
                min: 4,
                max: 23,
                slide: function( event, ui ) {
                    min_time.text( ui.value );
                }
            }
        );

        btn_ok.click( function(){
            var obj = {
                "year": me.year,
                "month": me.month,
                "day": me.day,
                "hour": parseInt( s_time.text() ),
                "hours": parseInt( min_time.text() ),
                "candrive": chk.prop( "checked" )
            };
//            var idDia = "#" + me.day + "dia";
            me.e( obj );
            dialog.fadeOut();
            overlay.fadeOut(function(){
                dialog.remove();
                overlay.remove();
                $( ".blackOverlay" ).remove();
            });
        });
    }
};
