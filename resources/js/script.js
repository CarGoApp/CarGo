$( document ).ready( function() {
//    screens = $( ".screen" );

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

var CarGo = {
    getLocation:function() {
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
    },
//THIS FUNCTION IS NOT WORKING!!!
    findClosestCab:function( lata, lnga ){
        var me = this;
        var lata = "53.957433";
        var lnga = "-1.0843267999999853";
        var time = 0;
        var distance = 0;
        var nearestID = "";
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
                    var p = e.toJSON();
                    console.log( p.username );


                    var latlng = $.parseJSON( p.currentLocation );
                    console.log( latlng.lng );
                    GMaps.geolocate({
                        success:function( position ){
                            map.getRoutes({
                                origin: [lata, lnga],
                                destination: [latlng.lat, latlng.lng],
                                callback: function ( e ) {
                                    for ( var i=0; i<e[0].legs.length; i++ ) {
                                        time += e[0].legs[i].duration.value;
                                        distance += e[0].legs[i].distance.value;
                                    }
                                    if( nearestDistance == 0 || nearestDistance > distance ) {
                                        nearestDistance = distance;
                                        nearestID = p.objectID;
                                    }
                                    console.log( nearestID + " is " + nearestDistance + "m away" );
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
                <form class='input-form'>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='login-email' id='login-email' placeholder='Email'>\
                            <label for='login-email'>Email</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='password' name='login-password' id='login-password' placeholder='Password'>\
                            <label for='login-password'>Password</label>\
                        </span>\
                    </div>\
                    <a href='#' class='button full-button js--login-signup-save-button'>Login/Signup</a>\
                </form>\
            </div>\
        ");
        $( '.screen' ).attr( 'id', '' );
        $( ".button" ).click(function(){

//STARTING
            var emailID = $( "#login-email" ).val();
            var pass = $( "#login-password" ).val();
            pass = CryptoJS.MD5( pass ).toString( CryptoJS.enc.Hex );
            var user = Parse.User;

            user.logIn( emailID, pass, {
                success:function( user ) {
                    if( typeof( Storage ) !== "undefined" ) {
                        var cad = emailID + pass;
                        var sessionID = CryptoJS.MD5( cad );
                        sessionStorage.sessionID = sessionID.toString( CryptoJS.enc.Hex );
                        sessionStorage.emailID = emailID;
                        me.loginType();
                    } else {
                        //NO LOCAL STORAGE
//                        console.log( "Your browser doesn't accept local storage." );
                    }
                },
                error:function( user, error ) {
//                    console.log( error );
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
                                        me.signupMemberDetails();
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
//        locationTimer = setInterval( function(){ me.getLocation(); }, 10000 );
        me.findClosestCab();
        $( ".button" ).click(function(){
            switch( $( this ).text() ){
                case 'CarClub':
                    me.carClubMenu();
                break;
                case 'Hire a car':
                    me.carHireMenu();
                break;
                case 'Book a cab':
                    me.bookACabMenu();
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
                <a href='#' class='button ghost-button'>Setup schedule</a>\
                <a href='#' class='button ghost-button'>Finances</a>\
            </div>\
        ");
        $( ".button" ).click(function(){
            switch( $( this ).text() ){
                case 'Show services':
                    me.carClubPendingServices();
                break;
                case 'Setup schedule':
                break;
                case 'Finances':
                break;
            }
        });
    },
    carClubSchedule:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        ");
        $( "p" ).click(function(){
        });
    },
    carClubPendingServices:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h2>Next service</h2>\
            <ul class='list-services'>\
            </ul>\
            <a href='#' class='button full-button'>Next 6</a>\
        </div>\
        ");
        var Service = Parse.Object.extend( "CabServices" );
        var query = new Parse.Query( Service );

        query.equalTo( "clientID", sessionStorage.emailID );
        query.descending( "createdAt" );
        query.limit( 25 );
        query.find({
            success:function( results ){
                var template = Handlebars.compile( $( "#carclub-single-service" ).html() );
                $( ".list-services" ).html( " " );
                $( results ).each( function(i, e){
                    var p = e.toJSON();
                    $( ".list-services" ).append( template( p ));
                    $( ".list-services" ).find( "a" ).eq( i ).click( function(){
                        me.carClubServiceInformation( $( this ).find( "#objectID" ).val() );
//                        console.log( $( this ).find( "#objectID" ).val() );
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
    carClubServiceInformation:function( code ) {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        <div class='verticalcenter'>\
            <h6>Pick up: <span class='pickup'>Here</span></h6>\
            <h6>Drop off: <span class='dropoff'>There</span></h6>\
            <div class='input-row'>\
                <div id='mapPlanTrip'></div>\
            </div>\
            <p>You have a new client to pickup.</p>\
            <p>Estimate time <span class='estTime'>10</span> minutes.</p>\
        <a href='#' class='button full-button'>Next 6</a>\
        </div>\
        ");
//        $( "p" ).click(function(){
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
    },
    carClubMemberDetails:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        ");
        $( "p" ).click(function(){
        });
    },
    carClubMemberFinances:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
        ");
        $( "p" ).click(function(){
        });
    },
    signupMemberDetails:function() {
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
                        <input type='text' name='phone-number' id='phone-number' placeholder='Phone Number'>\
                        <label for='cardno'>Phone Number</label>\
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
        $( ".button" ).click(function(){
            var user = Parse.Object.extend( "_User" );
            var query = new Parse.Query( user );
            var fname = $("#full-name").val();
            var pnumber = $("#phone-number").val();
            var haddress = $("#home-address").val();
            var postcode = $("#postcode").val();
            var carclub = 'No';
            if($('#chkboxInput').prop('checked') == true) {
                //Is insured for more than one driver
                var carclub = 'Yes';
            }
            query.equalTo( 'email', sessionStorage.emailID )
            query.first().then(function( data ){
//                console.log( sessionStorage.emailID + ' was found' );
//                console.log( data.get( 'email' ) + 'was found in Parse' );
                data.set( 'fullname', fname );
                data.set( 'phonenumber', pnumber );
                data.set( 'address', haddress );
                data.set( 'carclub', carclub );
                data.set( 'postcode', postcode );
                data.save();
                sessionStorage.carClub = carclub;
                me.signupMemberCarDetails( carclub );
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
                    me.carHireDetails();
                break;
                case 'View scheduled hires':
                break;
            }
        });
    },
    carHireDetails:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <form class='car-details-input-form'>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input id='startTime' class='datepicker' name='date' type='text' autofocuss value='23 December, 2015' data-valuee='2015-12-22T20:00:37.163Z'>\
                            <label for='startTime'>Start time</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='pickup-location' id='pickup-location' placeholder='Pickup location'>\
                            <label for='pickup-location'>Pickup/Dropoff location</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input id='endTime' class='datepicker' name='date' type='text' autofocuss value='23 December, 2015' data-valuee='2015-12-22T20:00:37.163Z'>\
                            <label for='endTime'>End time</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <div id='mapPlanTrip'></div>\
                    </div>\
                    <p>Fare:</p>\
                    <h2 id='location-screen-fare'>£XX.XX</h2>\
                    <a href='#' class='button full-button js--hire-car-save-button'>Hire</a>\
                </form>\
            </div>\
        ");
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
/*
DATA
clientID
ownerID
startTime
endTime
hireStatus
pickupDropoffLocation
pickupDropoffAddress
*/
            var clientID = sessionStorage.emailID;
            var startTime = $( "#startTime" ).attr("data-valuee");
            var endTime = $( "#endTime" ).attr("data-valuee");
            var hireStatus = "time";
            var pickupDropoffAddress = $( "#pickup-location" ).val();
            var pickupDropoffLocation = "";
            GMaps.geocode({
                address: $('#pickup-location').val().trim(),
                callback: function(results, status){
                    if(status=='OK'){
                        var latlng = results[0].geometry.location;
                        pickupDropoffLocation = '{"lat":' + latlng.lat() + ',"lng":' + latlng.lng() + '}'
/*
                        console.log( clientID );
                        console.log( startTime );
                        console.log( endTime );
                        console.log( hireStatus );
                        console.log( pickupDropoffLocation );
                        console.log( pickupDropoffAddress );
*/
                        var Hire = Parse.Object.extend( "CarHire" );
                        var query = new Hire();
                        query.set( "clientID", clientID );
                        query.set( "startTime", startTime );
                        query.set( "endTime", endTime );
                        query.set( "hireStatus", hireStatus );
                        query.set( "pickupDropoffLocation", pickupDropoffLocation );
                        query.set( "pickupDropoffAddress", pickupDropoffAddress );
                        query.save(null, {
                            success:function(){
                                console.log( "Hire saved!" );
                            },
                            error:function(){
                                console.log( error.message );
                            }
                        });
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
                            <input id='pickupTime' class='datepicker' name='date' type='text' autofocuss value='23 December, 2015' data-valuee='2015-12-22T20:00:37.163Z'>\
                            <label for='pickup'>Pick up time</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='pickup-location' id='pickup-location' placeholder='Pick up location'>\
                            <label for='pickup'>Pick up location</label>\
                        </span>\
                    </div>\
                    <div class='input-row'>\
                        <span class='input-element'>\
                            <input type='text' name='dropoff-location' id='dropoff-location' placeholder='Drop off location'>\
                            <label for='dropoff'>Drop off location</label>\
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

            var Services = Parse.Object.extend( "CabServices" );
            var query = new Services();
//            var pula = new Parse.GeoPoint;
            var pula = "";
            var pulb = "";
            var dateR = new Date();
            console.log( dateR.toISOString() );
//            pula.latitude = a.lata;
//            pula.longitude = a.lnga;
            pula = '{"lat":' + a.lata + ',"lng":' + a.lnga + '}';
            pulb = '{"lat":' + a.latb + ',"lng":' + a.lngb + '}';
            query.set( 'estimateDuration', Math.round(a.estimateDuration/60) );
            query.set( 'estimateDistance', a.estimateDistance );
            query.set( 'pickupTime', dateR );
            query.set( 'pickupLocation', pula );
            query.set( 'dropoffLocation', pulb );
            query.set( 'clientID', a.clientID );
            query.set( 'serviceStatus', a.serviceStatus );
            query.set( 'fare', a.fare );
            query.set( 'pickupAddress', a.pickupAddress );
            query.set( 'dropoffAddress', a.dropoffAddress );

            query.save(null, {
                success:function(){
                    console.log( "Service saved correctly!" );
                    me.bookACabWait();
                },
                error:function(query, error){
                    console.log( error.message );
                }
            });
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
    },
    bookACabWait:function() {
        $( ".screen" ).empty;
        var me = this;
        $( '.screen' ).html("\
            <div class='verticalcenter'>\
                <h6>Pick up: <span>Here</span></h6>\
                <h6>Drop off: <span>There</span></h6>\
                <div class='input-row'>\
                    <div id='mapPlanTrip'></div>\
                </div>\
                <p>Pick up will be in 10 mins. Driver will call when he's at your pick up location.</p>\
                <div class='driver-card'>\
                    <img src='resources/images/annettemay.jpg'>\
                    <div class='driver-info'>\
                        <h3>Annette May</h3>\
                        <h4>079xxxxxxxx <span>Toyota Avensis 'Black'</span></h4>\
                    </div>\
                </div>\
                <a href='#' class='button full-button'>Next 16</a>\
            </div>\
        ");

        $( "p" ).click(function(){
        });
    }
};
