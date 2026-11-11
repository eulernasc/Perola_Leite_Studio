(function(){
 'use strict';
 var P=window.PL, root=document.getElementById('time-root'),active=null;
 function pad(n){return String(n).padStart(2,'0');}
 function clean(s){var m=/^(\d{1,2}):(\d{2})$/.exec(String(s||''));if(!m)return null;var h=Number(m[1]),min=Number(m[2]);if(h>23||min>59)return null;return pad(h)+':'+pad(min);}
 function field(name,label,value,required){
   var time=clean(value)||'09:00';
   return '<div class="field time-field"><label>'+P.esc(label)+'</label><input class="time-value" type="hidden" name="'+P.esc(name)+'" value="'+time+'" '+(required?'required':'')+'><button type="button" class="time-trigger" data-time-trigger aria-label="Selecionar horário '+P.esc(label)+'"><span class="time-value-label">'+time+'</span>'+P.icon('clock')+'</button></div>';
 }
 P.timeField=field;
 function close(){root.innerHTML='';root.className='';active=null;}
 function paint(){
   if(!active)return;
   var v=clean(active.value)||'09:00',parts=v.split(':').map(Number),h=parts[0],m=parts[1];
   var hours=Array.from({length:24},function(_,i){return '<button type="button" data-time-hour="'+i+'" class="time-option '+(i===h?'selected':'')+'">'+pad(i)+'</button>';}).join('');
   var minutes=Array.from({length:12},function(_,i){return '<button type="button" data-time-minute="'+(i*5)+'" class="time-option '+(i*5===m?'selected':'')+'">'+pad(i*5)+'</button>';}).join('');
   root.className='time-overlay';
   root.innerHTML='<div class="time-shade" data-time-close></div><div role="dialog" aria-modal="true" aria-label="Escolher horário" class="time-popover"><div class="time-popover-head"><div><span class="picker-eyebrow">AGENDA DO ESTÚDIO</span><h3>Escolha o horário</h3><small>Toque nas horas e minutos ou digite um horário exato.</small></div><button class="btn icon" type="button" data-time-close aria-label="Fechar">'+P.icon('close')+'</button></div><div class="time-current"><label for="time-exact">Horário selecionado</label><input id="time-exact" type="text" inputmode="numeric" maxlength="5" value="'+v+'" aria-label="Horário HH:MM"><span>HH:MM</span></div><div class="time-columns"><div><div class="time-col-title">Hora</div><div class="time-options" data-time-hour-list>'+hours+'</div></div><div><div class="time-col-title">Minutos (de 5 em 5)</div><div class="time-options" data-time-minute-list>'+minutes+'</div></div></div><div class="time-popover-footer"><button type="button" class="btn soft" data-time-close>Cancelar</button><button type="button" class="btn primary" data-time-confirm>'+P.icon('check')+'Confirmar horário</button></div></div>';
   var popup=root.querySelector('.time-popover');
   if(window.innerWidth>820&&active.trigger&&active.trigger.isConnected){var rect=active.trigger.getBoundingClientRect();var left=Math.max(12,Math.min(window.innerWidth-365,rect.left));var top=rect.bottom+8;if(top+485>window.innerHeight)top=Math.max(10,rect.top-490);popup.style.left=left+'px';popup.style.top=top+'px';}
   var sel=root.querySelector('[data-time-hour-list] .selected');if(sel)sel.scrollIntoView({block:'center'});
 }
 function setTime(hours,minutes){active.value=pad(hours)+':'+pad(minutes);paint();}
 function confirmTime(){
   if(!active)return;var input=root.querySelector('#time-exact');var value=clean(input?input.value:active.value);
   if(!value){P.toast('Informe um horário válido no formato 09:30.','error');if(input)input.focus();return;}
   var source=active;source.input.value=value;
   var label=source.trigger.querySelector('.time-value-label');if(label)label.textContent=value;
   close();source.input.dispatchEvent(new Event('change',{bubbles:true}));
 }
 document.addEventListener('click',function(ev){
   var trigger=ev.target.closest('[data-time-trigger]');
   if(trigger){ev.preventDefault();ev.stopPropagation();var field=trigger.closest('.time-field'),input=field&&field.querySelector('.time-value');if(!input)return;active={trigger:trigger,input:input,value:clean(input.value)||'09:00'};paint();return;}
   if(!active)return;
   var hour=ev.target.closest('[data-time-hour]'),minute=ev.target.closest('[data-time-minute]');
   if(hour){ev.preventDefault();var p=(clean(active.value)||'09:00').split(':').map(Number);setTime(Number(hour.dataset.timeHour),p[1]);return;}
   if(minute){ev.preventDefault();var p=(clean(active.value)||'09:00').split(':').map(Number);setTime(p[0],Number(minute.dataset.timeMinute));return;}
   if(ev.target.closest('[data-time-confirm]')){ev.preventDefault();confirmTime();return;}
   if(ev.target.closest('[data-time-close]')){ev.preventDefault();close();return;}
 },true);
 document.addEventListener('input',function(ev){if(ev.target.id==='time-exact'&&active){var raw=ev.target.value.replace(/[^0-9:]/g,'');if(/^\d{3,4}$/.test(raw))raw=raw.slice(0,-2)+':'+raw.slice(-2);ev.target.value=raw;var value=clean(raw);if(value)active.value=value;}},true);
 document.addEventListener('keydown',function(ev){if(!active)return;if(ev.key==='Escape'){ev.stopImmediatePropagation();close();}if(ev.key==='Enter'&&ev.target.id==='time-exact'){ev.preventDefault();ev.stopImmediatePropagation();confirmTime();}},true);
 P.closeTimePicker=close;
})();