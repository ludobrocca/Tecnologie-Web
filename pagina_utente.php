<?php
require_once "database.php";
require_once "php/funzioni/funzioni_pagina.php";

$activeIndex = 0;

//Intestazione: indica la pagina attualmente attiva  contattaci
$HTML_INTESTAZIONE = intestazione($activeIndex);

//Richiamo pagina contatti
$HTML = file_get_contents("template/utente/pagina_utente.html");

//Rimpiazza il segnaposto con il menù
$HTML = str_replace("[#INTESTAZIONE]",$HTML_INTESTAZIONE, $HTML);

$HTML = str_replace("[#PRENOTAZIONI]",prenotazioniUtente(), $HTML);

//Footer
$HTML = str_replace("[#MENU-MOBILE]",menuMobile($activeIndex),$HTML);
echo $HTML;

?>
