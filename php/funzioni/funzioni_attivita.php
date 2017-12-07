<?php
function getMacroattivita($db) {
    $query = $db->prepare("SELECT * FROM Macroattivita");
    $query->execute();

    $listaMacro = $query->fetchAll();
    for($i=0; $i<count($listaMacro);$i++) {
        $listaMacro[$i]["Attivita"] = getAttivita($db,$listaMacro[$i]["Codice"]);
    }

    return $listaMacro;
}

function getAttivita($db,$codiceMacro) {
    $query = $db->prepare("SELECT * FROM Attivita WHERE Macro = ?");
    $query->execute(array($codiceMacro));

    $listaAttivita = $query->fetchAll();
    return $listaAttivita;
}