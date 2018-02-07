$(function() {


    //------SEZIONE GESTISCI ATTIVITA'--------
    //bottone nuova attivita
    $(".btn-nuova-attivita").on("click", function () {
        var titoloMacro = $(this).attr("data-info");
        var idMacro = $(this).attr("id");
        $("#nuova-attivita h2").prepend("<span>"+titoloMacro+" - </span>");
        $("#nuova-attivita").append("<span id='macro'>"+idMacro+"</span>");
        $("#overlay").show();
    });

    //Disabilito gli input dei vari form delle schede attività tranne gli input della dialog pre creare una nuova attività
    $("input[type=text], textarea").not($("#nuova-attivita").find("input[type=text],textarea")).attr('disabled','disabled');

    $("#nuova-attivita button").on("click",function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(".error").each(function () {
            pulisciErrore($(this));
        });
        $("#nuova-attivita").find("input[type=text],textarea").val('');
        fadeOverlay();
    });

    $("#nuova-attivita input[type=submit]").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var divDaAggiornare = $(this).next("div");

        if(validaFormModifica("nuova-attivita")) {
            var idMacro = $("#macro").text();
            $.post("php/modifica_attivita.php", $("#nuova-attivita form").serialize()+"&nuovaAttivita=true"+"&"+"idMacro="+idMacro, function (risposta) {
                risposta = JSON.parse(risposta);
                if(risposta.stato == 1) {
                    $.alert( {
                        boxWidth: calcolaDimensioneDialog(),
                        useBootstrap: false,
                        type: 'green',
                        title: 'Successo',
                        content: risposta.messaggio,
                        buttons: {
                            Ok: {
                                action: function () {
                                    fadeOverlay();
                                }
                            }
                        }
                    });
                }
                else {
                    if(risposta.hasOwnProperty('Tipo')) {
                        notificaErrore($("#nuova-attivita #nome").parent(),risposta.messaggio);


                    }
                    else {
                        generaAlert('red',"Errore",risposta.messaggio);
                    }
                }
            });
        }
    });

    //array associativo per il vari campi dati delle varie schede
    var campiDati = {};
    //Quando si preme il tasto modifica i campi di testo vengono abilitati e si mostra il bottone di annulamento delle modifiche
    $(".schede .modifica").on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();

        $(this).hide();
        $(this).prev().show();
        //mostro il pulsante annulla modifiche
        $(this).next().show();

        //seleziono l'id del div del pulsante premuto
        var target = $(this).attr('data-target');
        $("#"+target).find("textarea,input[type=text]").removeAttr('disabled');

        //salvo i dati dei vari campi
        campiDati[target] = salvaDati(target);
    });

    //listener per tasto cancella modifiche di un' attività
    $(".schede .bottone-annulla").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        $(this).hide();
        $(this).prevAll(".salva-dati").hide();
        $(this).prev().show();
        //elimino le notifiche di errore
        $(".error").each(function () {
            pulisciErrore($(this));
        });

        //ripristino dati
        var target = $(this).attr('data-target');
        console.log("#nome-"+target);
        $("#nome-"+target).val(campiDati[target]["nome-attivita"]);
        $("#descrizione-"+target).val(campiDati[target]["descrizione"]);
        $("#prezzo-"+target).val(campiDati[target]["prezzo"]);

        //disabilito i campi di testo
        $("#"+target).find("textarea,input[type=text]").attr('disabled','disabled');
    });

    $(".salva-dati").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var target = $(this).attr('data-target');
        if(validaFormModifica(target)) {
            $.post("php/modifica_attivita.php",$("#"+target).find("form").serialize()+"&"+"idAttivita="+target, function(risposta) {
                risposta = JSON.parse(risposta);
                if(risposta.stato == 1) {
                    campiDati[target] = salvaDati(target);
                    generaAlert('green',"Successo",risposta.messaggio);
                }
                else {
                    generaAlert('red',"Errore",risposta.messaggio);
                }
            });
        }
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
                            risposta = JSON.parse(risposta);
                            if(risposta.stato == 1) {
                                generaAlert('green', 'Successo', risposta.messaggio);
                            }
                            else{
                                generaAlert('red', 'Errore', risposta.messaggio);
                            }
                        });
                    }
                },
                Annulla:{}
            }
        });
    });


    //----SEZIONE GESTISCI PRENOTAZIONI----
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
    /*
    var etichette = [];
    var valoriGrafico = [];

    $(".numero-prenotazioni").each(function(){
        etichette.push($(this).data("target"));
        valoriGrafico.push(parseInt($(this).text()));
    });

    //Statistiche
    var data = {
        labels: etichette,
        series: valoriGrafico
    };

    new Chartist.Pie('.ct-chart', data);
    */
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
     var campiDati = $("#"+target).find("input[type=text], textarea");
     var datiSalvati = {};
     $(campiDati).each(function () {
         datiSalvati[$(this).attr("class")] = $(this).val();
     });
     return datiSalvati;
}

//funzione che notifica gli errori nei vari campi dati del form di modifica delle attività
function validaFormModifica(target) {
    var valido = true;
    var inputs = $("#"+target).find("textarea,input[type=text]");
    $(inputs).each(function () {
        if($(this).val().trim().length == 0){
            notificaErrore($(this).parent(),"Il campo non può essere vuoto");
            valido = false;
        }
    });
    return valido;
}

function fadeOverlay() {
    $("#overlay").fadeOut('Slow', function () {
        $("#nuova-attivita h2 span").remove();
        $("#macro").remove();
    });
}