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
   if(isiOS){
     var host=document.getElementById('modal-root');
     if(host)host.innerHTML='<div class="modal-wrap" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="Instalar Pérola Leite"><div class="modal-head"><div><div class="eyebrow">SEU STUDIO NA TELA INICIAL</div><h2>Instalar no iPhone</h2></div><button type="button" class="btn icon" data-action="close-modal" aria-label="Fechar">'+P.icon('close')+'</button></div><div class="modal-body"><p class="subtitle">Instale o Pérola Leite Studio como aplicativo, sem precisar procurar o link novamente.</p><div class="report-checks"><div class="checkline"><span class="time-pill">1</span><div><strong>Abra no Safari</strong><small>Use o navegador Safari do seu iPhone.</small></div></div><div class="checkline"><span class="time-pill">2</span><div><strong>Toque em Compartilhar</strong><small>O botão com um quadrado e uma seta para cima.</small></div></div><div class="checkline"><span class="time-pill">3</span><div><strong>Adicionar à Tela de Início</strong><small>Confirme a instalação para ver o ícone com a borboleta dourada.</small></div></div></div><p class="notice">Lembrete: os dados ainda ficam apenas neste aparelho, sem sincronização com outros dispositivos.</p></div><div class="modal-actions"><button type="button" class="btn primary" data-action="close-modal">Entendi</button></div></div></div>';
     return;
   }
   P.toast('Abra o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”.');
 };
 if('serviceWorker' in navigator&&location.protocol==='https:'){
   window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(function(){update();}).catch(function(e){console.warn('Service worker não registrado',e);});});
 }
 document.addEventListener('DOMContentLoaded',update);
})();