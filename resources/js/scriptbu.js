$( document ).ready( function() {
    screens = $( ".screen" );

    CarGo.mapSetup( 'mapPlanTrip' );
    CarGo.clickEvent();
    CarGo.blurEvent();
//Check if the session exists, if it does, go directly to the main menu
    CarGo.sessionCheck();
    CarGo.showScreen( screen );

});

var map;
var screens;
var screen = 0;

var CarGo = {
    mapSetup:function( mn ){
        var mapName = "#"+mn;
        map = new GMaps({
            div: mapName,
            lat: 51.5002918,
            lng: -0.1206113
        });
    },
    /**
    Function for blur events
    @param
    @return
    */
    blurEvent:function() {
        var me = this;
        $( "#pickup-location" ).focusout( function() {
            me.locationMapMarker1();
        });
        $( "#dropoff-location" ).focusout( function() {
            me.locationMapMarker2();
        });
    },
    /**
    Function for click events
    @param
    @return
    */
    clickEvent:function() {
        var me = this;
        screens.each( function( i ) {
            $( this ).find( ".button" ).click( function() {
                var next;
                var prev = i;
                me.runFunction( screen );
                console.log( screen );
                switch( $(this).text() ){
                    case "CarClub":
                        console.log( "CarClub" );
                        next = 3;
                    break;
                        case "Show Services":
                            console.log( "Show Services" );
                            next = 5;
                        break;
                        case "Setup Schedule":
                            console.log( "Setup Schedule" );
                            next = 0;
                        break;
                        case "Finances":
                            console.log( "Finances" );
                            next = 8;
                        break;
                    case "Hire a car":
                        console.log( "Hire a car" );
                        next = 11;
                    break;
                        case "View hirings":
                            console.log( "View hirings" );
                            next = 5;
                        break;
                        case "View scheduled hires":
                            console.log( "View scheduled hires" );
                            next = 0;
                        break;
                    case "Book a cab":
                        console.log( "Book a cab" );
                        next = 13;
                    break;
                        case "Book":
                            console.log( "Book" );
                            next = 15;
                        break;
                        case "View cab bookings":
                            console.log( "View cab bookings" );
                            next = 0;
                        break;
                    default:
                        next = screens.eq( screen ).find( "input" ).eq( 0 ).val();
                    break;
                }
                me.showScreen( next );
/*                GMaps.geolocate({
                    success: function(position){
                        map.setCenter(position.coords.latitude, position.coords.longitude);
                    },
                });
*/
                map.refresh();
                screen = next;
            });
        });
    },
    /**
    Function to show and hide screens
    @param int s
    */
    showScreen:function( s ) {
        var me = this;
        screens.hide();
        screens.eq( s ).show();
    },
    /**
    Function with the Switch statement with all the functions to run
    @param string funct
    */
    runFunction:function( funct ) {
        var me = this;
        var cont = 1;
        var functi = screens.eq( screen ).find( "input" ).eq( 0 ).val();
        console.log( "Functi: " + functi + " - Funct: " + funct);
        switch( functi ){
            case '1':
                cont = me.loginSignup();
            break;
            case '9':
                cont = console.log( "Save Details" );
                me.saveMemberDetails();
            break;
            case '4':
                cont = me.saveCarDetails();
            break;
            case '15':
                cont = me.locationMapUpdate();
            break;
        }
    },
    /**
    Check if Session exists
    */
    sessionCheck:function(){
        if( sessionStorage.sessionID ){
            screen = 2;
//            screen = 15;
        }
    },
    /**
    Function to verify the login details
    @param string apellido
    */
    loginSignup:function(){
        var me = this;
        var emailID = $( "#login-email" ).val();
        var pass = $( "#login-password" ).val();
        pass = CryptoJS.MD5( pass ).toString( CryptoJS.enc.Hex );
        var user = Parse.User;

        user.logIn( emailID, pass, {
            success:function( user ) {
                console.log( "It Worked!" );
                if( typeof( Storage ) !== "undefined" ) {
                    var cad = emailID + pass;
                    var sessionID = CryptoJS.MD5( cad );
                    sessionStorage.sessionID = sessionID.toString( CryptoJS.enc.Hex );
                    sessionStorage.emailID = emailID;
                } else {
                    //NO LOCAL STORAGE
                    console.log( "Your browser doesn't accept local storage." );
                }
            },
            error:function( user, error ) {
                console.log( error );
                var MemberFind = Parse.Object.extend( "_User" );
                var query = new Parse.Query( Parse.User );
                query.equalTo( "email", emailID );
                query.count({
                    success:function( count ){
                        if( count >= 1 ) {
                            me.showScreen( 1 );
                            console.log( "Email exists, please try again, need to reactivate the click event. " );
                            err = 0;
                        } else {
                            console.log( "Register a new user" );
                            user.set( "username", emailID );
                            user.set( "password", pass );
                            user.set( "email", emailID );
                            user.signUp( null, {
                                success:function( user ){
                                    console.log( "User saved correctly" );
                                    var sessionID = CryptoJS.MD5( emailID + pass );
                                    sessionStorage.sessionID = sessionID.toString( CryptoJS.enc.Hex );
                                    sessionStorage.emailID = emailID;
                                    me.showScreen( 9 );
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
    },
    /**
    Function to save member details
    */
    saveMemberDetails:function() {
/*
        var MemberDetails = Parse.Object.extend("MemberDetails");
        var memberdetails = new MemberDetails;
*/
        var user = Parse.Object.extend( "_User" );
        var query = new Parse.Query( Parse.User );

        var fname = $("#full-name").val();
        var pnumber = $("#phone-number").val();
        var haddress = $("#home-address").val();
        var carclub = 'No';
        if($('#chkboxInput').prop('checked') == true) {
            //Is insured for more than one driver
            var carclub = 'Yes';
        }

//ISN'T WORKING        var encPass = CryptoJS.MD5(pass);

        query.equalTo( "email", localStorage.emailID );
        query.first({
            success:function(){
                query.set( 'fullName', fname );
                query.set( 'phoneNumber', pnumber );
                query.set( 'homeAddress', haddress );
                query.set( 'carclub', carclub );
                query.save();
            }
        });
/*
        memberdetails.set('fullName', fname);
        memberdetails.set('phoneNumber', pnumber);
        memberdetails.set('homeAddress', haddress);
        memberdetails.set('emailID', 'web2bruno@gmail.com');
*/
        memberdetails.save(null, {
            success: function() {
                console.log("Member Details Saved!");
            },
            error: function(memberdetails, error) {
                console.log("There was a problem");
            }
        })
    },
    /**
    Function to save the car details
    */
    saveCarDetails:function() {
        var Car = Parse.Object.extend("Car");
        var car = new Car;

        var emailID = "web2bruno@gmail.com";
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
            },
            error: function(car, error) {
                console.log("There was a problem");
            }
        })
    },
    /**
    Set the first marker
    */
    locationMapMarker1:function() {
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
                }
            }
        });
    },
    /**
    Set the first marker
    */
    locationMapMarker2:function() {
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
                            console.log(time + " " + distance);
                            var fare = distance * 0.000621371;
                            fare = fare.toFixed(2);
                            $("#location-screen-fare").html("£" + fare);
                            console.log(fare);
                        }
                    });
                }
            }
        });
    }
};
/*
        var codigo = $( "<div/>" );
        codigo.addClass( "alertBox" );
        codigo.css("background-color", "red");
        codigo.css("display", "block");
        codigo.css("position", "absolute");
        codigo.css("width", "200px");
        codigo.css("height", "200px");
        codigo.css("top", "0");
        $( "body" ).append ( codigo );
*/
