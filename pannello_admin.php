<?php
define("PERCORSO_RELATIVO","");

require_once "php/database.php";
require_once "php/funzioni/funzioni_pagina.php";
require_once  "php/funzioni/funzioni_attivita.php";
$activeIndex = INF;

loginRichiesto();

//Intestazione: indica la pagina attualmente attiva
$HTML_INTESTAZIONE = intestazione($activeIndex);

//Richiamo pagina contatti
$HTML = file_get_contents("template/pannello_admin.html");

//Rimpiazza il segnaposto con il menù
$HTML = str_replace("[#INTESTAZIONE]",$HTML_INTESTAZIONE, $HTML);

//Rimpiazza segnaposto [#UTENTI]
$HTML = str_replace("[#UTENTI]",listaUtenti(), $HTML);

//Rimpiazza segna posto [#ATTIVITA]
$HTML = str_replace("[#ATTIVITA]",stampaSchedeAttivita(), $HTML);


//tabelle statistiche(rimpiazza i segnaposto [#TABELLA])
$HTML = str_replace("[#ATTIVITA-PIU-PRENOTATE]",AttivitaPiuPrenotate(),$HTML);


//Footer
$HTML = str_replace("[#MENU-MOBILE]",menuMobile($activeIndex),$HTML);
echo $HTML;

//Funzione che crea la tabella degli utenti
function listaUtenti(){
    global $db;
    $listaUtenti = $db->prepare("SELECT Utenti.Nome as Nome, Utenti.Cognome as Cognome, Utenti.Indirizzo as Indirizzo, Utenti.Username as Username, Utenti.Email as Email FROM Utenti WHERE Utenti.Tipo='Utente'");
    $listaUtenti->execute();
    $risultato = $listaUtenti->fetchAll();

    $riga="";
    $i=false;
    $class = array("even","odd");
    foreach ($risultato as $r){
        $riga .= <<<SCRIVI
<tr class="{$class[intval($i)]}"><td>{$r["Nome"]}</td><td>{$r["Cognome"]}</td><td>{$r["Indirizzo"]}</td><td>{$r["Username"]}</td><td>{$r["Email"]}</td><td><span class="btn-reimposta">Reimposta password</span></td></tr>
SCRIVI;
        $i = !$i;
    }

    return $riga;
}

function schedeAttivita($macroattivita) {
    $risultato = getAttivita($macroattivita);

    $output = "";
    $i = false;
    $class = array('pari','dispari');
    foreach ($risultato as $r){
        $output .= file_get_contents("template/scheda_attivita_admin.html");
        $output = str_replace("[#NOME]", $r["Nome"], $output );
        $output = str_replace("[#DESCRIZIONE]", $r["Descrizione"], $output );
        $output = str_replace("[#PREZZO]", $r["Prezzo"], $output );
        $output = str_replace("[#CLASSE-SCHEDA]", $class[intval($i)], $output );
        $i = !$i;
    }
    return $output;
}

function stampaSchedeAttivita(){
    $elencoMacro = getMacroattivita();
    $output="";

    foreach($elencoMacro as $attivita){
        $listaSchede = schedeAttivita($attivita["Codice"]);
        //Creare template per contenere macroattività che ha pulsanti titolo ecc.
        $output .= <<<SCRIVI
        <!-- &nbsp; = spazio 
             &x270E = matita -->
<h2 class="titolo-macro">{$attivita["Nome"]}&nbsp; &#x270E;</h2><div>{$listaSchede}</div><div class="clearfix"></div>
SCRIVI;
    }
    return $output;
}





function AttivitaPiuPrenotate(){
global $db;

$query=$db->prepare("SELECT Attivita.Codice ,Attivita.Nome AS NomeAttivita,COUNT(Prenotazioni.Codice)AS NumeroPrenotazioni FROM Attivita,Prenotazioni WHERE Attivita.Codice=Prenotazioni.IDAttivita GROUP BY Attivita.Codice ORDER BY NumeroPrenotazioni DESC");
$query->execute();
$array=$query->fetchAll();

    $row="";
    $counter = 1;
    foreach($array as $item) {

        $row .= <<<RIGA
        <tr><td>{$counter}</td><td>{$item["NomeAttivita"]}</td><td>{$item["NumeroPrenotazioni"]}</td></tr>
RIGA;
    $counter = $counter + 1;
}
    return $row;

}



?>
