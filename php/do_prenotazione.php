<?php
session_start();
require_once "database.php";
require_once "funzioni/funzioni_json.php";

/*
 * Bisogna prendere i dati in input dal form di registrazione e controllare la loro correttezza.
 * In caso positivo si procede all'inserimento del DB
 * In caso negativo si rigetta ritornando una oggetto JSON
 */

//La data passata è nel formato DD/MM/YYYY, mentre la devo convertire nel formato YYYY/MM/DD
$data = convertiData(filter_var($_POST["data"],FILTER_SANITIZE_FULL_SPECIAL_CHARS));
if(!$data) {
    erroreJSON("Data non valida");
    return;
}

$nPosti = $_POST["posti"];
$utente = $_SESSION["Utente"]["ID"];
$attivita = $_POST["attivita"];

$postiDefault = 50;

$PostiDisponibiliGiornata = $db->prepare("SELECT PostiDisponibili FROM Disponibilita WHERE Attivita = ? AND Giorno = ?");
$PostiDisponibiliGiornata->execute(array($attivita,$data));

$PostiPrenotati = $db->prepare("SELECT SUM(PostiPrenotati) AS PostiOccupati FROM Prenotazioni WHERE Attivita = ? AND Giorno = ?");
$PostiPrenotati->execute(array($attivita, $data));


($PostiDisponibiliGiornata->rowCount() == 0 )
    ?
    $PostiDisponibiliGiornata = $postiDefault
    :
    $PostiDisponibiliGiornata = $PostiDisponibiliGiornata->fetch()["PostiDisponibili"];


$PostiDisponibiliEffettivi = intval($PostiDisponibiliGiornata) - intval($PostiPrenotati->fetch()["PostiOccupati"]);

if ($nPosti > $PostiDisponibiliEffettivi) {
    erroreJSON("Numero posti inserti maggiore del numero posti disponibili");
    return;
}

else {
    $db->beginTransaction();
    $insertStatement = $db->prepare("INSERT INTO Prenotazioni VALUES(NULL,?,?,?,?)");
    if($insertStatement->execute(array($attivita,$utente,$data,$nPosti))) {
        $messaggio = successoJSON("Prenotazione inserita",array("CodicePrenotazione"=>$db->lastInsertId()));
        $db->commit();
    }
    else{
        $db->rollBack();
        erroreJSON("Errore nell'inserimento della prenotazione nel database.");
    }
}

function convertiData($dataDaConvertire) {
    //Se l'input non è coinforme a quello che mi aspetto ritorno false
    if(!preg_match("/^(\d{2})\/(\d{2})\/(\d{4})$/",$dataDaConvertire))
        return false;

    $matches = explode("/",$dataDaConvertire);
    $dataCalcolata = new DateTime(intval($matches[2])."-".intval($matches[1])."-".intval($matches[0]));

    //Se la data è nel formato corretto ma non è valida (ad esempio 31/02/2018) ritorno false
    if($dataCalcolata->format("d/m/Y") != $dataDaConvertire)
        return false;

    //Converto la data dal formato dd/mm/yyyy al formato yyyy-mm-dd (accettato da mysql)
    return $dataCalcolata->format("Y-m-d");
}
?>


