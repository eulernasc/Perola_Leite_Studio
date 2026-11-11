(function(){
 'use strict';
 var promptEvent=null;
 var P=window.PL;
 function isInstalled(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
 window.addEventListener('beforeinstallprompt',function(ev){ev.preventDefault();promptEvent=ev;update();});
 window.addEventListener('appinstalled',function(){promptEvent=null;update();if(P&&P.toast)P.toast('Pérola Leite Studio instalado com sucesso!');});
 function update(){document.querySelectorAll('[data-action="install-app"]').forEach(function(btn){
   if(isInstalled()){btn.style.display='none';return;}
   btn.style.display='';
 });}
 P.installApp=async function(){
   if(isInstalled()){P.toast('O aplicativo já está instalado.');return;}
   if(promptEvent){var ev=promptEvent;promptEvent=null;ev.prompt();try{var result=await ev.userChoice;if(result&&result.outcome==='accepted'){P.toast('Adicionando o Pérola Leite Studio à tela inicial.');}}catch(e){}update();return;}
   var isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
   if(isiOS){alert('Para instalar no iPhone: abra este link no Safari, toque no botão Compartilhar e escolha “Adicionar à Tela de Início”.');return;}
   P.toast('Abra o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”.');
 };
 if('serviceWorker' in navigator&&location.protocol==='https:'){
   window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(function(){update();}).catch(function(e){console.warn('Service worker não registrado',e);});});
 }
 document.addEventListener('DOMContentLoaded',update);
})();