<?php

ini_set('display_errors', "On");
error_reporting(E_ALL);


define("PERCORSO_RELATIVO","");

require_once "php/database.php";
require_once "php/funzioni/funzioni_pagina.php";

loginRichiesto();

$activeIndex = 0;

//Intestazione: indica la pagina attualmente attiva  contattaci
$HTML_INTESTAZIONE = intestazione($activeIndex);



//Richiamo pagina contatti
$HTML = file_get_contents("template/utente/pannello_utente.html");

//Rimpiazza il segnaposto con il menù
$HTML = str_replace("[#INTESTAZIONE]",$HTML_INTESTAZIONE, $HTML);


//Scheda prenotazioni
$HTML = str_replace("[#SCHEDE]",stampaSchedePrenotazioniAttive(), $HTML);

//Scheda Account
$HTML = str_replace("[#STORICO-PRENOTAZIONI]",storicoPrenotazioni(), $HTML);
$HTML = str_replace("[#NOME]",$_SESSION["Utente"]["Nome"], $HTML);
$HTML = str_replace("[#COGNOME]",$_SESSION["Utente"]["Cognome"], $HTML);
$HTML = str_replace("[#INDIRIZZO]",$_SESSION["Utente"]["Indirizzo"], $HTML);
$HTML = str_replace("[#CIVICO]",$_SESSION["Utente"]["Civico"], $HTML);
$HTML = str_replace("[#CITTA]",$_SESSION["Utente"]["Citta"], $HTML);
$HTML = str_replace("[#CAP]",$_SESSION["Utente"]["CAP"], $HTML);
$HTML = str_replace("[#USERNAME]",$_SESSION["Utente"]["Username"], $HTML);
$HTML = str_replace("[#EMAIL]",$_SESSION["Utente"]["Email"], $HTML);

//Footer
$HTML = str_replace("[#MENU-MOBILE]",menuMobile($activeIndex),$HTML);
echo $HTML;



function prenotazioniAttive() {
    global $db;

    $infoPrenotazioni = $db->prepare("SELECT  Prenotazioni.Codice AS Codice, Attivita.Nome AS Nome, Prenotazioni.Giorno AS Giorno, Prenotazioni.PostiPrenotati AS Posti, Pagamento FROM Prenotazioni, Attivita WHERE Prenotazioni.IDUtente = ? AND Prenotazioni.IDAttivita = Attivita.Codice AND Prenotazioni.Stato = 'Sospesa' AND Prenotazioni.Giorno >= (SELECT CURDATE() )ORDER BY Giorno ");
    $infoPrenotazioni->execute(array($_SESSION["Utente"]["ID"]));
    $prenotazioni = $infoPrenotazioni->fetchAll();

    foreach($prenotazioni as &$prenotazione) {
        if($prenotazione["Pagamento"]==0){
            $prenotazione["Pagamento"] = 'Non pagato';
        }
        else{
            $prenotazione["Pagamento"] = 'Pagato';
        }
    }
    return $prenotazioni;
}

function stampaSchedePrenotazioniAttive(){
    $listaPrenotazioniAttive = prenotazioniAttive();

    $output = "";
    $i = false;
    $class = array('pari','dispari');
    foreach ($listaPrenotazioniAttive as $prenotazione){
        $data = convertiDataToOutput($prenotazione["Giorno"]);
        $output .= file_get_contents("template/utente/schede_prenotazioni.html");
        $output = str_replace("[#NOME-ATTIVITA]", $prenotazione["Nome"], $output );
        $output = str_replace("[#GIORNO]", $data, $output );
        $output = str_replace("[#POSTI]", $prenotazione["Posti"], $output );
        $output = str_replace("[#PAGAMENTO]", $prenotazione["Pagamento"], $output );
        $output = str_replace("[#CLASSE-SCHEDA]", $class[intval($i)], $output );
        $output = str_replace("[#ID-PRENOTAZIONE]", $prenotazione["Codice"], $output );
        $i = !$i;
    }
    return $output;
}



function storicoPrenotazioni() {
    global $db;

    $infoPrenotazioni = $db->prepare("SELECT Attivita.Nome AS Nome, Prenotazioni.Giorno AS Giorno, Prenotazioni.PostiPrenotati AS Posti, Prenotazioni.Stato AS Stato, Prenotazioni.Valutazione as Voto 
FROM  Attivita, Prenotazioni WHERE Prenotazioni.IDUtente = ? AND Prenotazioni.IDAttivita = Attivita.Codice AND (Prenotazioni.Stato='Confermata' OR Prenotazioni.Stato='Cancellata' OR (Prenotazioni.Stato='Sospesa' AND Prenotazioni.Giorno < (SELECT CURDATE()) ) ) ");
    $infoPrenotazioni->execute(array($_SESSION["Utente"]["ID"]));
    $prenotazioni = $infoPrenotazioni->fetchAll();

    $riga2="";

    foreach($prenotazioni as $prenotazione) {
        $voto=controlloVoto($prenotazione["Voto"],$prenotazione["Stato"]);
        $data = convertiDataToOutput($prenotazione["Giorno"]);
        $riga2 .= <<<RIGA
<tr><td>{$prenotazione["Nome"]}</td><td>{$data}</td><td>{$prenotazione["Posti"]}</td><td>{$prenotazione["Stato"]}</td><td>$voto</td></tr>
RIGA;
    }
    return $riga2;
}



//controlla il voto e in caso crea il pulsante per la valutazione
function controlloVoto($cella,$stato){

    if($cella== NULL&&$stato=="Confermata"){

      return <<<RIGA
<div class="rate-wrapper hide">      
    <a class="btn btn-primary">Valuta</a>
</div>
<<<<<<< HEAD
<div class="rate-wrapper" id="show">
<select><option selected>--</option><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
<input type="submit" value="Conferma" class="btn btn-primary ">
<button class="btn-cancella" id="cancel">Annulla</button>
=======
<div class="rate-wrapper show">
    <select>
        <option>--</option>
        <option>0</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
    </select>
    <a href="#" class="btn btn-primary ">Conferma</a>
    <button class="btn-cancella cancel">Annulla</button>
>>>>>>> 95723709cb315ca7034a183cad6ed722e9c17358
</div>
RIGA;
        
    
    
    }
    else {
        if($cella== NULL&&($stato=="Cancellata"||$stato="Sospesa")){

            return "- -";
        }

        return $cella;
    }
}







?>
