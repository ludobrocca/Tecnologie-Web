<?php
require_once "php/funzioni/funzioni_pagina.php";
$activeIndex=5;

$HTML_INTESTAZIONE = intestazione($activeIndex);

$HTML = file_get_contents("template/login.html");
$HTML = str_replace("[#INTESTAZIONE]",$HTML_INTESTAZIONE, $HTML);
$HTML = str_replace("[#MENU-MOBILE]",menu_mobile($activeIndex), $HTML);

$HTML = str_replace("[#HTTP_REFERER]",$_SERVER['HTTP_REFERER'],$HTML);
echo $HTML;
?>
