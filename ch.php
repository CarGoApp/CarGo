<?php
require_once( 'vendors/php/stripe/init.php' );

//$key = "pk_test_Cvf637rTocgISSRnsbcqqaTb";
$key = "sk_test_OrEFgJPcPIpzuWTHp3UImj9g";
$token = $_POST[ 'token' ];
$amount = $_POST[ 'amount' ];

\Stripe\Stripe::setApiKey( $key );
try {
//    $myCard = array('number' => '4242424242424242', 'exp_month' => 8, 'exp_year' => 2018);
    $charge = \Stripe\Charge::create(array(
        'source' => $token,
        'amount' => $amount,
        'currency' => 'gbp'
    ));
    echo $charge;
} catch(\Stripe\Error\Card $e) {
  // The card has been declined
}
?>
