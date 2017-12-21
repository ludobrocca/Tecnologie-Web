<?php
require_once "php/funzioni/funzioni_pagina.php";
$activeIndex = 4;
?>

<!DOCTYPE html>
<html lang="it">
<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrati</title>
    <link rel="icon" href="images/favicon.ico">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,100,300,500,700,900" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="css/default.css" >
    <link rel="stylesheet" type="text/css" href="css/login.css" >
    <link rel="stylesheet" type="text/css"  href="css/mobile.css" media="handheld, screen and (max-width:768px), only screen and (max-device-width:768px)"/>
    <script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="js/registrazione.js"></script>
</head>
<body>
    <?php intestazione($activeIndex);?>
    <div class="form" id="container_form">

        <form action="php/do_registrazione.php" method="POST" onsubmit="return validaForm()">
            <h1>Crea account</h1>
            <div id="sectionPersonalData">
                <div class="field-container">
                    <label for="nome">Nome: </label>
                    <input type="text" id="nome" name="nome" placeholder="Inserisci il tuo nome">
                </div>
                <div class="field-container">
                    <label for="cognome">Cognome: </label>
                    <input type="text" id="cognome" name="cognome" placeholder="Inserisci il tuo cognome">
                </div>
                <div class="field-container" id="indirizzo-container">
                    <label for="indirizzo">Indirizzo: </label>
                    <input type="text" id="indirizzo" name="indirizzo" placeholder="Inserisci il tuo indirizzo di residenza">
                </div>
                <div class="field-container" id="civico-container">
                    <label for="civico">Civico: </label>
                    <input type="text"  size="4" id="civico" name="civico" placeholder="N.">
                </div>
                <div class="field-container" id="citta-container">
                    <label for="citta">Citt&agrave;: </label>
                    <input type="text" id="citta" name="citta" placeholder="Inserisci la tua città di residenza">
                </div>
                <div class="field-container" id="cap-container">
                    <label for="CAP">CAP: </label>
                    <input type="text"  size="4" id="CAP" name="CAP" placeholder="CAP...">
                </div>

            </div>
            <div id="sectionAccountData">
                <div class="field-container">
                    <label for="email">Email: </label>
                    <input type="text" id="email" name="email" placeholder="Inserisci emali">
                </div>
                <div class="field-container">
                    <label for="username">Nome utente: </label>
                    <input type="text" id="username" name="username" placeholder="Inserisci nome utente">
                </div>
                <div class="field-container">
                    <label for="password">Password: </label>
                    <input type="password" id="password" name="password" placeholder="Password...">
                </div>
                <div class="field-container">
                    <label for="password2">Ripeti password: </label>
                    <input type="password" id="password2" name="password2" placeholder="Ripeti password..">
                </div>
            </div>
            <div class="button-holder">  <input type="submit" value="Registrati" name="registrazione" class="primary-btn inline-btn"></div>
        </form>
    </div>
    <?php footer($activeIndex);?>
</body>
</html>