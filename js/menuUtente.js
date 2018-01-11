/*function openSection(evento, sezione) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(sezione).style.display = "block";
    evento.currentTarget.className += " active";
}*/

$(document).ready(function(){
    $("#prenotazioni").show();
    $(".tablinks").on("click",function (e) {
       var tabTarget = $(this).attr("data-target");
       $(".tabcontent").hide();
       $('#'+tabTarget).show();
    });
});