$(document).ready(function(){
    $(".tabcontent").first().show();
    $(".tablinks").first().addClass("active");
    $(".tablinks").on("click",function (e) {
       var tabTarget = $(this).attr("data-target");
       $(".tablinks").removeClass("active");
       $(this).addClass("active");
       $(".tabcontent").hide();
       $('#'+tabTarget).show();
    });
    toggleMostra();
    //Scheda Prenotazioni
    stileCellaPagamento();
    //richiesta AJAX per la cancellazione di una prenotazione
    $(".button-holder > .btn-cancella").on("click", function () {
        var target = $(this).attr("data-target");
        var data = validaData($('#'+target).find(".giorno").text());
        var timeDiff = data - (new Date());
        var giorniDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        if(giorniDiff<2) {
            $.alert ({
                boxWidth: calcolaDimensioneDialog(),
                useBootstrap: false,
                type: 'red',
                title: 'Errore',
                content: "Non puoi cancellare la prenotazione con 2 giorni di anticipo."
            });
        }
        else {
            $.confirm({
                boxWidth: calcolaDimensioneDialog(),
                useBootstrap: false,
                type: 'blue',
                title: 'Conferma',
                content: "Procedere con l'eliminazione della prenotazione?",
                buttons: {
                    Procedi:{
                        btnClass: 'btn-blue',
                        action: function () {
                            $.post("php/delete_prenotazione.php",{
                                idPrenotazione: target
                            },function (risposta) {
                                risposta = JSON.parse(risposta);
                                if(risposta.stato == 1) {
                                    //successo
                                    var pari = $('#'+target).parent().nextAll(".pari");
                                    var dispari = $('#'+target).parent().nextAll(".dispari");

                                    $('#'+target).parent().slideUp('Slow', function(){
                                        $(this).remove();
                                    });

                                    dispari.removeClass("dispari").addClass("pari");
                                    pari.removeClass("pari").addClass("dispari");
                                }
                                else{
                                    $.alert ({
                                        boxWidth: calcolaDimensioneDialog(),
                                        useBootstrap: false,
                                        type: 'red',
                                        title: 'Errore',
                                        content: risposta.messaggio
                                    });
                                }
                            });
                        }
                    },
                    Annulla:  {
                       
                    }
                }
            });

        }

    });

    //Scheda Account
    $datiForm = salvaDatiForm();

    $(":text").attr('disabled','disabled');

    $(".mostra-modifica").hide();
    $("#modifica").on("click",function () {
        $(".mostra-modifica").slideDown(200);
        $(":text").not('#username').removeAttr('disabled');

    });
    //Modifica dati account
    $("form").on("submit", function (e) {
        //prima di fare il submit controllo la validità dei dati modificati
        if(validaFormUtente()) {
            alert("ok");

        }
        else{
            alert("nope");
            e.preventDefault();
            e.stopPropagation();
        }

    });

    $("#annulla").on("click",function () {
        $(":text").attr('disabled','disabled');
        ripristinaDatiInizialiForm($datiForm);
        $(".mostra-modifica").slideUp(200, function () {
            $(this).hide();
        });
    });
});

function salvaDatiForm(){
    var inputs = $('input').not(':input[type=submit]');
     var datiForm = {};
    $(inputs).each(function () {
        datiForm[$(this).attr("id")] = $(this).val();
    });
    return datiForm;
}

function ripristinaDatiInizialiForm(oggettoDatiForm){
    var inputs = $('input').not(':input[type=submit]');
    $(inputs).each(function () {
        $(this).val(oggettoDatiForm[$(this).attr("id")]);
    });
}

function stileCellaPagamento(){
    $(".pagamento").each(function () {
        if( $(this).text() === "Non pagato")
            $(this).css("color","#B80000");
        else
            $(this).css("color","#34ba49");
  });
}


function calcolaDimensioneDialog() {
    var larghezzaSchermo = $( window ).width();
    return (larghezzaSchermo <= 768) ? "80%" : "20em";
}

function toggleMostra() {
    $(".rate-button").click(function(){
        $(this).hide();
        $(this).next(".submit-rate").show();
    });
    $(".cancel").click(function(){
        $(this).parent().hide();
        $(this).parent().prev().show();
    });
}