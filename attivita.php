<?php
require_once "php/funzioni/funzioni_pagina.php";
require_once "php/database.php";
require_once "php/funzioni/funzioni_attivita.php";

$activeIndex = 1;

/*Intestazione: indica la pagina attualmente attiva --> attività */
$HTML_INTESTAZIONE = intestazione($activeIndex);

/*Richiamo pagina contatti*/
$HTML = file_get_contents("template/attivita/attivita.html");

/*Rimpiazza il segnaposto con il menù*/
$HTML = str_replace("[#INTESTAZIONE]",$HTML_INTESTAZIONE, $HTML);

$HTML = str_replace( "[#ATTIVITA]",stampaAttivita(), $HTML);

/*Footer*/
$HTML = str_replace("[#MENU-MOBILE]",menu_mobile($activeIndex),$HTML);

echo $HTML;


function stampaAttivita() {
    $class = array("odd","even");
    $classIndex = false;
    $listaMacroAttivita = getMacroattivita();

    $output = "";

    foreach($listaMacroAttivita as $macro) {
        $output.= file_get_contents("template/attivita/sezione_macroattivita.html");
        $output = str_replace("[#CLASS_MACROATTIVITA]",$class[$classIndex], $output);
        $output = str_replace("[#ID_MACROATTIVITA]",$macro["Ancora"], $output);
        $output = str_replace("[#MACRO_BANNER]",$macro["Banner"], $output);
        $output = str_replace("[#MACRO_NOME]",$macro["Nome"], $output);
        $output = str_replace("[#MACRO_DESCRIZIONE]",$macro["Descrizione"], $output);

        $sottoattivita = "";
        foreach($macro["Attivita"] as $attivita) {
            $sottoattivita  .= file_get_contents("template/attivita/sezione_attivita.html");
            $sottoattivita  = str_replace("[#NOME-SOTTOATTIVITA]", $attivita["Nome"], $sottoattivita );
            $sottoattivita  = str_replace("[#DESCRIZIONE-SOTTOATTIVITA]", $attivita["Descrizione"], $sottoattivita );
            $sottoattivita  = str_replace("[#CODICE-SOTTOATTIVITA]", $attivita["Codice"], $sottoattivita );
            $sottoattivita  = str_replace("[#PREZZO-SOTTOATTIVITA]", $attivita["Prezzo"], $sottoattivita );

            /**
             * Viene visualizzato il pulsante "Prenota" se si è loggati, altrimenti viene visualizzato uno span con
             * un messaggio. Un utente non registrato e/o non loggato non può effettuare prenotazioni
             */
            if(isUtenteLoggato()) {
                $sottoattivita = str_replace("[#A-LOGGATO]","a",$sottoattivita);
                $sottoattivita = str_replace("[#TESTO-PULSANTE]","Prenota",$sottoattivita);
            }
            else {
                $sottoattivita = str_replace("[#A-LOGGATO]","span",$sottoattivita);
                $sottoattivita = str_replace("[#TESTO-PULSANTE]","Effettua il login o registrati per prenotare",$sottoattivita);
            }
        }

        $output = str_replace("[#SOTTOATTIVITA]", $sottoattivita, $output);
        $classIndex = !$classIndex;
    }

    return $output;
}

?>
