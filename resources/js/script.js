$(document).ready(function(){
// ----- ENABLE SCROLLING ANIMATIONS
// Going from Home Screen to Login Screen
    $(".js--signup-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--login-signup-screen').offset().top}, 1000);
    });

// After writing the email/password and pressing submit
    $(".js--login-signup-save-button").click(function(){
        if($('#email').val() == '') {
            $('html, body').animate({scrollTop: $('.js--login-signup-error-screen').offset().top}, 1000);
        } else {
            $('html, body').animate({scrollTop: $('.js--information-screen').offset().top}, 1000);
            loginSignup();
        }
    });

// From here to there
   $(".js--screen-proceed-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--signup-carddetails-screen').offset().top}, 1000);
    });
   $(".js--signup-carddetails-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--signup-type-screen').offset().top}, 1000);
    });
    $(".js--login-signup-try-again-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--login-signup-screen').offset().top}, 1000);
    });
    $(".js--signup-member-details-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--login-signup-screen').offset().top}, 1000);
        saveMemberDetails();
    });
//CARCLUB SIDE
    $(".js--join-carclub-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--driver-list-services-screen').offset().top}, 1000);
    });
   $(".list-services li").click(function(){
        $('html, body').animate({scrollTop: $('.js--driver-waiting-screen').offset().top}, 1000);
    });
   $(".js--driver-list-services-screen h2").click(function(){
        $('html, body').animate({scrollTop: $('.js--driver-list-earnings-screen').offset().top}, 1000);
    });
   $(".js--registration-cardetails-save-button").click(function(){
       saveCarDetails()
   });

//BOOK A CAB SIDE
    $(".js--book-cab-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--location-screen').offset().top}, 1000);
    });
    $(".js--location-screen-save-button").click(function(e){
//        $('html, body').animate({scrollTop: $('.js--waiting-screen').offset().top}, 1000);
// TESTING THE MAPS

      var lata = 0;
      var lnga = 0;
      var latb = 0;
      var lngb = 0;

//      $('#submittext3').submit(function(e){
        e.preventDefault();
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


// END OF THE MAPS TESTING
    });

    $("#chkboxInput").click(function() {
        alert($("#chkboxInput").prop('checked'));
    });
// ----- PARSE HANDLING
    function saveMemberDetails() {
        var MemberDetails = Parse.Object.extend("MemberDetails");
        var memberdetails = new MemberDetails;

        var fname = $("#full-name").val();
        var pnumber = $("#phone-number").val();
        var haddress = $("#home-address").val();
//ISN'T WORKING        var encPass = CryptoJS.MD5(pass);

        memberdetails.set('fullName', fname);
        memberdetails.set('phoneNumber', pnumber);
        memberdetails.set('homeAddress', haddress);
        memberdetails.set('emailID', 'web2bruno@gmail.com');

        memberdetails.save(null, {
            success: function() {
                console.log("Member Details Saved!");
            },
            error: function(memberdetails, error) {
                console.log("There was a problem");
            }
        })
    }

   function loginSignup() {
        var Member = Parse.Object.extend("Members");
        var member = new Member;

        var emailID = $("#login-email").val();
        var pass = $("#login-password").val();
//ISN'T WORKING        var encPass = CryptoJS.MD5(pass);

        member.set('emailID', emailID);
        member.set('pass', pass);

        member.save(null, {
            success: function() {
                console.log("Member Saved!");
            },
            error: function(member, error) {
                console.log("There was a problem");
            }
        })
    }

   function saveCarDetails() {
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
    }

// MANIPULATING THE MAPS
      map = new GMaps({
        div: '#mapPlanTrip',
        lat: 51.5002918,
        lng: -0.1206113
      });

/* CALCULATING THE FARES!
https://tfl.gov.uk/modes/taxis-and-minicabs/taxi-fares

1 mile 7.2 each
6 miles 4.3 each
Average per mile 5.75!!

1meter = 0.000621371miles
*/
});
