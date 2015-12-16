$(document).ready(function(){
    $(".js--signup-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--login-signup-screen').offset().top}, 1000);
    });

    $(".js--login-signup-save-button").click(function(){
        if($('#email').val() == '') {
            $('html, body').animate({scrollTop: $('.js--login-signup-error-screen').offset().top}, 1000);
        } else {
            $('html, body').animate({scrollTop: $('.js--information-screen').offset().top}, 1000);
        }
    });
   $(".js--screen-proceed-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--signup-carddetails-screen').offset().top}, 1000);
    });
   $(".js--signup-carddetails-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--signup-type-screen').offset().top}, 1000);
    });
    $(".js--login-signup-try-again-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--login-signup-screen').offset().top}, 1000);
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

//BOOK A CAB SIDE
    $(".js--book-cab-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--location-screen').offset().top}, 1000);
    });
    $(".js--location-screen-save-button").click(function(){
        $('html, body').animate({scrollTop: $('.js--waiting-screen').offset().top}, 1000);
    });

//js--signup-carddetails-button
});
