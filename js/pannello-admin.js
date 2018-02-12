var campiDati = {};
var scanner = null;
$(function() {

    //------SEZIONE GESTISCI ATTIVITA'--------
    //Modifica macro attivita
    aggiungiEventiMacroAttivita();

    //aggiungo listener alle schede attività

    aggiugngiEventiSchedeAttivita();

    //bottone crea nuova Macroattivita
    $("#crea-macro").on("click", function() {
        $("#label-dialog2").text("Nuova macroattività");
        $("#finestra-macro").show();
        bloccaScroll();
        $("#finestra-macro input[type=submit]").attr("data-fun","0");

    });

    //Creazione o modifica di una macroattività
    $("#finestra-macro input[type=submit]").on("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        var tipoOperazione = $(this).attr("data-fun");
        console.log(tipoOperazione);
        if(validaFormModifica("finestra-macro")) {
            var form =  $("#finestra-macro form");
            var formData = new FormData();
            formData.append("nome-macro", $("#nome-macro").val());
            formData.append("descrizione-macro", $("#descrizione-macro").val());
            formData.append("immagine",$("#immagine")[0].files[0]);
            formData.append("immagine-banner",$("#immagine-banner")[0].files[0]);

            if(tipoOperazione == "0") {
                formData.append("nuovaMacro","1");
                $.ajax({
                    type: 'POST',
                    data: formData,
                    url: "php/macroattivita.php",
                    contentType: false,
                    processData: false,
                    async:true,
                    success: function (risposta) {
                        try {
                            risposta = JSON.parse(risposta);
                            formData.append("idMacro",risposta.idMacro);
                            if (risposta.stato == 1) {
                                generaAlert('green', "Successo", risposta.messaggio);
                                $("#finestra-macro").fadeOut('Slow');
                                $.ajax({
                                    url: "pannello_admin.php",
                                    data: formData,
                                    processData: false,
                                    contentType: false,
                                    type: 'POST',
                                    success:function(ris) {
                                       togliEventiMacroAttivita();
                                       $("#act-manager").append(ris);
                                       sbloccaScroll();
                                       aggiungiEventiMacroAttivita();
                                       $("#finestra-macro form")[0].reset();
                                    }
                                });
                                /*
                                $.post("pannello_admin.php", formData, function(ris) {
                                    togliEventiMacroAttivita();
                                    $("#act-manager").append(ris);
                                    sbloccaScroll();
                                    aggiungiEventiMacroAttivita();
                                    $("#finestra-macro form")[0].reset();
                                });*/
                            }
                            else {
                                generaAlert('red', "Errore", risposta.messaggio);
                            }
                        }
                        catch(e) {
                            console.error(e);
                            generaAlertErroreGenerico();
                        }
                    }
                }
                );
            }
            else{
                var idMacro = $("#finestra-macro input[type=submit]").attr('data-fun');

                formData.append("idMacro",idMacro);

                $.ajax({
                    type: 'POST',
                    data: formData,
                    url: "php/macroattivita.php",
                    contentType: false,
                    processData: false,
                    async: true,
                    success: function (risposta) {
                        try {
                            risposta = JSON.parse(risposta);
                            console.log("parse OK")
                            if (risposta.stato == 1) {
                                generaAlert('green', "Successo", risposta.messaggio);
                                //la macroattività è stata aggiornata con successo
                                //aggiorno il titolo della macro nel pannello admin h1
                                $("span[data-target='" + idMacro + "']").prev().text(form[0].value);
                                $("#finestra-macro").fadeOut('slow',function() {
                                    sbloccaScroll();
                                    $("#finestra-macro form")[0].reset();
                                });
                            }
                            else {
                                generaAlert('red', "Errore", risposta.messaggio);
                            }
                        }
                        catch (e) {
                            console.log(e);
                            generaAlertErroreGenerico();
                        }
                    }
                });
            }

        }
    });

    $("#annulla-macro").on("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $("#label-dialog2").text("Nuova macroattività");
        $("#finestra-macro").fadeOut("Slow",function(){
            pulisciErrori($("#finestra-macro").find(".alert.errore"),$("#finestra-macro").find("form"));
            $(this).find("input[type=text],textarea").val('');
            sbloccaScroll();
        });

    });

    //--------SEZIONE GESTISCI UTENTI---------
    //Eliminazione di un account
    $("#usr-manager .btn-cancella").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('data-target');
        $.confirm({
            boxWidth: calcolaDimensioneDialog(),
            useBootstrap: false,
            title: 'Conferma',
            content: "Procedere con l'eliminazione dell'account? ",
            buttons: {
                Procedi: {
                    btnClass: 'btn-red',
                    action: function () {
                        eliminaAccount(target);
                    }
                },
                Annulla:{}
            }
        });
    });

    //reimposta password
    $("#usr-manager .btn-reimposta").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('data-target');
        var userName = $('#'+target).children(".username").text();
        $.confirm({
            boxWidth: calcolaDimensioneDialog(),
            useBootstrap: false,
            title: 'Conferma',
            content: "Procedere con il reset della password dell'account: "+userName+"?",
            buttons: {
                Procedi: {
                    btnClass: 'btn-blue',
                    action: function () {
                        $.post("php/modifica_dati_utente.php",{IDUtente:target},function (risposta) {
                            try {
                                risposta = JSON.parse(risposta);
                                if (risposta.stato == 1) {
                                    generaAlert('green', 'Successo', risposta.messaggio);
                                }
                                else {
                                    generaAlert('red', 'Errore', risposta.messaggio);
                                }
                            }
                            catch(e) {
                                generaAlertErroreGenerico();
                            }
                        });
                    }
                },
                Annulla:{}
            }
        });
    });


    //----SEZIONE GESTISCI PRENOTAZIONI----

    //Convalida prenotazione
    $("#scheda-QR").on("click", function(){
        $("#lettoreQR").show();
        scanner = new Instascan.Scanner({
            video: $('#videoQR')[0],
            backgroundScan: false
        });
        scanner.addListener('scan', function (content) {
            if(content.match("^pr-")) {
                $("#testoQR").val(content);
                //Visto che ho scansionato un QR apparentemente valido, provo subito la convalida senza che l'utente debba
                //cliccare il tasto "conferma"
                convalidaPrenotazione($("#testoQR").val());
            }
            else
                generaAlert('red', "Errore", "Codice QR inquadrato non inerente ad una prenotazione.");
        });
        try {
            Instascan.Camera.getCameras().then(function (cameras) {
                if (cameras.length > 0) {

                    scanner.start(cameras[0]).catch(function(e) {
                        generaAlert('red', "Errore", "La lettura dei codici QR via HTTP è supportata solo da Firefox o Edge. Assicurati di avere un browser compatibile o usa HTTPS per abilitare il supporto anche su Chrome");
                    });
                } else {
                    generaAlert('red', "Errore", "Nessuna fotocamera trovata. La lettura dei codici QR verrà quindi disabilitata");
                    //Mostro errore nessuna camera trovata
                }
            }).catch(function(e) {
                generaAlert('red', "Errore", "Errore nell'inizializzazione del lettore QR. La lettura dei codici QR non sarà quindi possibile");
            });
        }
        catch(e) {
            generaAlert('red', "Errore", "Errore nell'inizializzazione del lettore QR. La lettura dei codici QR non sarà quindi possibile");
        }
        bloccaScroll();
    });

    $("#convalidaQR").on("submit",function(event) {
        event.preventDefault();
        event.stopPropagation();

        if(!$("#testoQR").val().match("^pr-")) {
            generaAlert('red', "Errore", "Codice prenotazione inserito non valido");
        }
        else {
            convalidaPrenotazione($("#testoQR").val());
        }
    });

    $("#annulla-QR").on("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $("#lettoreQR").fadeOut("Slow", function(){
            //pulisciErrori();
            scanner.stop();
            sbloccaScroll();
        });
    });

    //Cancella prenotazione
    $("#res-manager .btn-cancella").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('data-target');
        $.confirm({
            boxWidth: calcolaDimensioneDialog(),
            useBootstrap: false,
            title: 'Conferma',
            content: "Procedere con l'eliminazione della prenotazione ? ",
            buttons: {
                Procedi: {
                    btnClass: 'btn-red',
                    action: function () {
                        eliminaPrenotazione(target);
                    }
                },
                Annulla:{}
            }
        });
    });

    //Tasto conferma pagamento
    $(".pay").click(function (e){
        e.preventDefault();
        e.stopPropagation();
        var target =  $(this).attr("data-target");
        var bottoneCliccato = $(this);
        var cellaPagamento = $(this).parent().prev();
        $.post("pannello_admin.php", {confermaPagamento:"1", codicePrenotazione:target}, function (risposta) {
            try {
                risposta = JSON.parse(risposta);
                if (risposta.stato == 1) {
                    generaAlert('green', 'Pagamento effettuato', risposta.messaggio);
                    var rigaTabella = bottoneCliccato.parent();
                    bottoneCliccato.remove();
                    rigaTabella.text("Pagamento effettuato");
                    cellaPagamento.text("Pagato");
                }
                else {
                    generaAlert('red', 'Errore', risposta.messaggio);
                }
            }
            catch(e) {
                generaAlertErroreGenerico();
            }
        });
    });
});


function eliminaRigaTabella(target) {
    $('#'+target).slideUp('Slow', function () {
        $('#'+target).remove();
    });
}

function rispostaEliminiazionePrenotazione(target) {
    eliminaRigaTabella(target);
}

//funzione che permette di salvare i dati dei form delle varie schede attività
//
function salvaDati(target) {
     var campiDati = $("#"+target).find("input[type=text], textarea,input[type=number]");
     var datiSalvati = {};
     $(campiDati).each(function () {
         datiSalvati[$(this).attr("class")] = $(this).val();
     });
     return datiSalvati;
}

//funzione che notifica gli errori nei vari campi dati del form di modifica delle attività
function validaFormModifica(target) {
    var valido = true;
    var targetSelector = $("#"+target);
    var divAlert = targetSelector.find(".alert.errore");
    var formErr = targetSelector.find("form");
    var inputs = targetSelector.find("textarea,input[type=text]");
    pulisciErrori(divAlert, formErr);
    $(inputs).each(function () {
        if($(this).val().trim().length == 0) {
            notificaErrore($(this),"Il campo "+' '+$(this).attr("name")+' '+" non può essere vuoto",divAlert, formErr );
            valido = false;
        }
    });
    return valido;
}


function aggiugngiEventiSchedeAttivita() {
    //Disabilito gli input dei vari form delle schede attività tranne gli input della dialog pre creare una nuova attività
    $("[data-modifica=false]").find(" input[type=number],input[type=text], textarea").attr('disabled','disabled');

    //event listener per il bottone elimina attività
    $(".elimina-attivita").on("click", function () {
        //prendo l'attributo data target per sapere quale scheda eliminare
        var idScheda = $(this).attr("data-target");
        //finestra di dialogo con richiesta AJAX
        $.confirm({
            boxWidth: calcolaDimensioneDialog(),
            useBootstrap: false,
            title: 'Conferma',
            content: "Procedere con l'eliminazione dell'attività? Tutte le prenotazioni relative a questa attività verrannò eliminate ",
            buttons: {
                Procedi: {
                    btnClass: 'btn-red',
                    action: function () {
                        $.post("php/modifica_attivita.php",{eliminaAttivita:1, idAttivita: idScheda}, function(risposta){
                            try {
                                risposta = JSON.parse(risposta);
                                if(risposta.stato == "1") {
                                    generaAlert('green','Successo', risposta.messaggio);
                                    //al successo dell'eliminazione rimuovo la scheda
                                    sistemaSchede(idScheda);
                                    $("[data-attivita='"+idScheda.replace("attivita-","")+"']").remove();
                                }
                                else {
                                    generaAlert('red','Errore', risposta.messaggio);
                                }
                            }
                            catch(e) {
                                console.log(e);
                                generaAlertErroreGenerico();
                            }
                        });
                    }
                },
                Annulla: {}
            }
        });
    });

    //array associativo per il vari campi dati delle varie schede

    //Quando si preme il tasto modifica i campi di testo vengono abilitati e si mostra il bottone di annulamento delle modifiche
    $(".schede .modifica").on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();

        //seleziono l'id del div del pulsante premuto
        var target = $(this).attr('data-target');
        $("#"+target).attr("data-modifica","true");
        abilitaModicaScheda(target);
        //salvo i dati dei vari campi
        campiDati[target] = salvaDati(target);
    });

    //listener per tasto cancella modifiche di un' attività
    $(".schede .bottone-annulla").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        //elimino le notifiche di errore
        var formPadre = $(this).parent().parent();
        var divAlert = formPadre.parent().find(".alert.errore");

        pulisciErrori(divAlert,formPadre);
        //ripristino dati
        var target = $(this).attr('data-target');

        $("#"+target).attr("data-modifica","false");
        $("#nome-"+target).val(campiDati[target]["nome-attivita"]);
        $("#descrizione-"+target).val(campiDati[target]["descrizione"]);
        $("#prezzo-"+target).val(""+campiDati[target]["prezzo"]);
        disabilitaModificaScheda(target);

    });

    $(".salva-dati").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var target = $(this).attr('data-target');

        if(validaFormModifica(target)) {
            var arrayForm = $("#"+target).find("form").serializeArray();
            arrayForm.push({name: "idAttivita", value:target});
            $.post("php/modifica_attivita.php",arrayForm, function(risposta) {
                try {
                    risposta = JSON.parse(risposta);
                    if(risposta.stato== 1) {
                        campiDati[target] = salvaDati(target);

                        generaAlert('green',"Successo",risposta.messaggio);

                        disabilitaModificaScheda(target);

                        $("#"+target+" h2").text(arrayForm[0].value);
                    }
                    else {
                        generaAlert('red',"Errore",risposta.messaggio);
                    }
                }
                catch(e) {
                    console.log(e);
                    generaAlertErroreGenerico();
                }
            });
        }
    });
}

function abilitaModicaScheda(target) {
    $("#"+target).find("textarea,input[type=text],input[type=number]").removeAttr('disabled');
    $("#"+target+" .salva-dati").show();
    $("#"+target+" .bottone-annulla").show();
    $("#"+target+" .modifica").hide();
    $("#"+target+" .nome-attivita").focus();
}

function disabilitaModificaScheda(target) {
    $("#"+target).find("textarea,input[type=text],input[type=number]").attr('disabled','disabled');
    $("#"+target+" .salva-dati").hide();
    $("#"+target+" .bottone-annulla").hide();
    $("#"+target+" .modifica").show();
}
/**
 * Questa funzione toglie gli eventi da tutte le schede attività
 */
function togliEventiSchedeAttivita() {
    $(".elimina-attivita").off("click");
    $(".salva-dati").off("click");
    $(".schede .modifica").off("click");
    $(".schede .bottone-annulla").off("click");
}

/**
 * Fade out della finestra di dialogo
 */
function fadeDialogoNuovaAttivita() {
    $("#nuova-scheda-attivita").fadeOut('Slow', function () {
        $("#nuova-attivita").find("input[type=text],textarea,input[type=number]").val('');
        $("#nuova-attivita h2 span").remove();
        sbloccaScroll();
    });
}


function aggiungiEventiMacroAttivita() {

    //bottone nuova attivita
    $(".btn-nuova-attivita").on("click", function () {
        var titoloMacro = $(this).attr("data-info");
        var idMacro = $(this).attr("data-target");
        $("#nuova-attivita h2").prepend("<span>"+titoloMacro+" - </span>");
        $("#nuova-attivita input[type=submit]").attr("data-macro",idMacro);
        $("#nuova-scheda-attivita").show();
        bloccaScroll();
        $("#nome").focus();
    });

    //bottone annulla creazione nuova attività
    $("#nuova-attivita button").on("click",function(e) {
        e.preventDefault();
        e.stopPropagation();
        pulisciErrori($("#nuova-attivita").find(".alert.errore"),$("#nuova-attivita").find("form"));
        fadeDialogoNuovaAttivita();
    });

    //nuova attività - conferma
    $("#nuova-attivita input[type=submit]").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var divDaAggiornare = $(this).next("div");

        if(validaFormModifica("nuova-attivita")) {
            var idMacro = $(this).attr('data-macro');
            var form = $("#nuova-attivita form").serializeArray();
            form.push({name:"nuovaAttivita", value:"true"},{name:"idMacro",value:idMacro});
            $.post("php/modifica_attivita.php",form, function (risposta) {
                try {
                    risposta = JSON.parse(risposta);
                    if (risposta.stato == 1) {
                        var nSchedeModulo = ($("#gruppo-macro-" + risposta.idMacro + " .scheda-wrapper").length) % 2;
                        var classe = "";
                        if (nSchedeModulo == 0)
                            classe = 'pari';
                        else
                            classe = 'dispari';
                        $.alert({
                            boxWidth: calcolaDimensioneDialog(),
                            useBootstrap: false,
                            type: 'green',
                            title: 'Successo',
                            content: risposta.messaggio,
                            buttons: {
                                Ok: {
                                    action: function () {
                                        $.post("pannello_admin.php", {nuovaScheda:1, Classe:classe, Codice:risposta.CodiceAtt },
                                            function (ris) {
                                                $(ris).insertBefore($("#gruppo-macro-" + risposta.idMacro + ' ' + ".inserimento-scheda"));
                                                togliEventiSchedeAttivita();
                                                fadeDialogoNuovaAttivita();
                                                aggiugngiEventiSchedeAttivita();
                                            });
                                    }
                                }
                            }
                        });
                    }
                    else {
                        if (risposta.hasOwnProperty('Tipo')) {
                            notificaErrore($("#nuova-attivita #nome"), risposta.messaggio, $("#nuova-attivita .alert.errore"),$("#nuova-attivita"));
                        }
                        else {
                            generaAlert('red', "Errore", risposta.messaggio);
                        }
                    }
                }
                catch(e) {
                    generaAlertErroreGenerico();
                }
            });
        }
    });

    /**
     * Modifica dei dati di una macroattività
     */
    $(".mod-macro").on("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        var idMacro = $(this).parent().attr("data-target");
        $.post("pannello_admin.php", {RichiestaMacro: idMacro}, function(macro) {
            try {
                macro = JSON.parse(macro);
                $("#label-dialog2").text(macro.Nome + " - Modifica");
                $("#nome-macro").val(macro.Nome);
                $("#descrizione-macro").val(macro.Descrizione);
                $("#finestra-macro").show();
                bloccaScroll();
                $("#finestra-macro input[type=submit]").attr("data-fun", idMacro);
            }
            catch(e) {
                generaAlertErroreGenerico();
            }
        });
    });

    /**
     * listener per il pulsante elimina delle macroattività
     */

    $(".canc-macro").on("click",function(e){
        e.preventDefault();
        e.stopPropagation();
        var idMacro = $(this).parent().attr("data-target");
        var padreBottone = $(this).parent().parent();

        $.confirm({
            boxWidth: calcolaDimensioneDialog(),
            useBootstrap: false,
            title: 'Conferma',
            content: "Procedere con l'eliminazione della macroattività? Tutte le attività relative ad essa verrannò eliminate e conseguentemente verranno eliminate le prenotazioni di queste ultime  ",
            buttons: {
                Procedi: {
                    btnClass: 'btn-red',
                    action: function () {
                        $.post("php/macroattivita.php",{idMacro:idMacro, eliminaMacro:1}, function(risposta){
                            try{
                                risposta = JSON.parse(risposta);
                                if(risposta.stato == "1"){
                                    generaAlert('green',"Successo",risposta.messaggio);
                                    var listaAttivita = $("#gruppo-"+idMacro).find("div.schede-attivita");
                                    listaAttivita.each(function () {
                                        $("[data-attivita='"+$(this).attr("id").replace("attivita-","")+"']").remove();
                                    });
                                    $("#gruppo-"+idMacro).remove();
                                    padreBottone.next().remove();
                                    padreBottone.remove();
                                }
                                else{
                                    generaAlert('red',"Errore",risposta.messaggio);
                                }
                            }
                            catch(e) {
                                console.log(e);
                                generaAlertErroreGenerico();
                            }
                        });
                    }
                },
                Annulla: {}
            }
        });
    });


}

function togliEventiMacroAttivita() {
    $(".btn-nuova-attivita").off("click");
    $("#nuova-attivita button").off("click");
    $("#nuova-attivita input[type=submit]").off("click");
    $(".mod-macro").off("click");
    $(".canc-macro").off("click");
}
//blocca lo scroll se premo il tasto crea nuova macroattività
function bloccaScroll(){
    $("body").css({"overflow" : "hidden"});
}
//sblocca lo scroll se premo annulla
function sbloccaScroll(){
    $("body").css({"overflow-y":"scroll"});
}

/**
 * Funzione che convalida una prenotazione
 * @param codicePrenotazione il codice della prenotazione da convalidare, nel formato in cui è scritto nel pdf (e nel QR)
 */
function convalidaPrenotazione(codicePrenotazione) {
    $.post("pannello_admin.php", {
        convalidaPrenotazione: true,
        prenotazione: codicePrenotazione
    }, function(responseText) {
        try {
            var rispostaJSON = JSON.parse(responseText);
            if(rispostaJSON.stato == 1) {
                generaAlert('green', "Successo", rispostaJSON.messaggio);
                //Se sono arrivato qua significa che il codice della prenotazione è valido, quindi è nel formato che mi
                //aspetto (grazie ai controlli server-side)
                $("tr#"+(codicePrenotazione.split("-"))[1]+" > td.stato").text("Confermata");

                $("form#convalidaQR")[0].reset();
            }
            else {
                generaAlert('red',"Errore",rispostaJSON.messaggio);
            }

        }
        catch(e) {
            generaAlertErroreGenerico();
        }
    });
}