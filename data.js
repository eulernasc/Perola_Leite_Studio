(function () {
  'use strict';
  var P = window.PL = {};
  P.key = 'perola-leite-studio-local-v1';
  P.uid = function () { return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8); };
  P.today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  P.addDays = function (iso, days) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate()+days); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  P.weekStart = function (iso) { var d = new Date(iso+'T12:00:00'); return P.addDays(iso, -((d.getDay()+6)%7)); };
  P.monthKey = function (iso) { return (iso||P.today()).slice(0,7); };
  P.money = function (value) { return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); };
  P.date = function (iso) { if (!iso) return '—'; return new Date(iso+'T12:00:00').toLocaleDateString('pt-BR'); };
  P.dateLong = function (iso) { return new Date(iso+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}); };
  P.monthLong = function (ym) { return new Date(ym+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); };
  P.weekday = function (iso, short) { return new Date(iso+'T12:00:00').toLocaleDateString('pt-BR',{weekday:short?'short':'long'}).replace('.',''); };
  P.clockMins = function (clock) { var parts=String(clock||'00:00').split(':').map(Number); return parts[0]*60+parts[1]; };
  P.clock = function (minutes) { return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0'); };
  P.esc = function (value) { return String(value==null?'':value).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  P.norm = function (s) { return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); };
  P.digits = function (s) { return String(s||'').replace(/\D/g,''); };
  P.cpfFormat = function (s) { var d=P.digits(s).slice(0,11); return d.replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1-$2'); };
  P.phoneFormat = function (raw) {
    var d=P.digits(raw).slice(0,11);
    if(!d)return '';
    if(d.length<=2)return '('+d;
    var ddd='('+d.slice(0,2)+') ',rest=d.slice(2);
    if(rest.length<=4)return ddd+rest;
    var prefixLength=d.length===11?5:4;
    return ddd+rest.slice(0,prefixLength)+'-'+rest.slice(prefixLength);
  };
  P.cpfValid = function (raw) { var s=P.digits(raw); if(s.length!==11||/^(\d)\1+$/.test(s))return false; for(var t=9;t<11;t++){var sum=0;for(var k=0;k<t;k++)sum+=Number(s[k])*(t+1-k);var check=(sum*10)%11;if(check===10)check=0;if(check!==Number(s[t]))return false;}return true; };
  P.icons = {
    home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    sparkle:'<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9zM19 18v4M17 20h4"/>',
    wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18M16 14h2"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    settings:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',chevronLeft:'<path d="m15 18-6-6 6-6"/>',chevronRight:'<path d="m9 18 6-6-6-6"/>',search:'<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',
    check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>',camera:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="m8 6 1.5-3h5L16 6"/><circle cx="12" cy="13" r="3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',heart:'<path d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.9a5.3 5.3 0 0 0 0-7.5z"/>',
    trending:'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',minus:'<path d="M5 12h14"/>',download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6M10 10v7M14 10v7"/>',edit:'<path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11z"/>',
    shield:'<path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    money:'<path d="M3 6h18v12H3z"/><circle cx="12" cy="12" r="3"/><path d="M6 9h.01M18 15h.01"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    alert:'<circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 17h.01"/>',star:'<path d="m12 2 3.1 6.3L22 9.3l-5 4.8 1.2 6.9-6.2-3.3-6.2 3.3L7 14.1l-5-4.8 6.9-1z"/>'
  };
  P.icon = function (name,klass) { return '<svg aria-hidden="true" class="'+(klass||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(P.icons[name]||P.icons.sparkle)+'</svg>'; };
  P.baseServices = [
    ['Alongamento Completo',185,90,false],['Combo Blindagem',175,120,true],['Alongamento Simples',160,90,false],
    ['Esmaltação em gel nos pés',85,60,true],['Manutenção',100,90,true],['Esmaltação em gel nas mãos',90,60,true],['Remoção gel',50,30,false]
  ].map(function(x,i){return {id:'serv_'+(i+1),name:x[0],price:x[1],minutes:x[2],startingAt:x[3],category:'Unhas',description:'',image:'',active:true};});
  P.baseAddons = [
    ['Esmaltação em gel na manutenção',25,15,false],['Unha quebrada blindagem',5,10,true],['Esmaltação decorada',35,15,false],
    ['Francesinha',30,15,false],['Unha quebrada manutenção',7,10,true]
  ].map(function(x,i){return {id:'addon_'+(i+1),name:x[0],price:x[1],minutes:x[2],perUnit:x[3],description:i===1?'A partir de 4 unhas quebradas na blindagem, conferir o preço de novo alongamento.':'',image:'',active:true,serviceIds:[],thresholdQty:i===1?4:0,thresholdPrice:null};});
  P.defaults = function(){return {version:1,clients:[],services:P.baseServices,addons:P.baseAddons,appointments:[],payments:[],expenses:[],auditLog:[],blocks:[],settings:{studio:'Pérola Leite Studio',start:'07:00',end:'20:00',currency:'BRL'},createdAt:new Date().toISOString()};};
  try { P.db = JSON.parse(localStorage.getItem(P.key)) || P.defaults(); if(!P.db || !Array.isArray(P.db.clients)||!Array.isArray(P.db.services)) throw Error('Formato inválido'); }
  catch(e){P.db=P.defaults();}
  P.save = function () { try {localStorage.setItem(P.key,JSON.stringify(P.db));return true;}catch(e){P.toast('Limite do armazenamento do navegador. Reduza as fotos ou faça um backup.','error');return false;} };
  P.publicInboxKey='perola-leite-studio-public-registrations-v1';
  P.importPublicRegistrations=function(){
    var pending;
    try{pending=JSON.parse(localStorage.getItem(P.publicInboxKey)||'[]');}catch(e){return 0;}
    if(!Array.isArray(pending)||!pending.length)return 0;
    var before=P.db.clients.length,accepted=0;
    pending.forEach(function(row){
      if(!row||typeof row!=='object')return;
      var cpf=P.digits(row.cpf);
      if(!P.cpfValid(cpf)||!String(row.name||'').trim())return;
      if(P.db.clients.some(function(c){return P.digits(c.cpf)===cpf;}))return;
      var item={id:String(row.id||P.uid()),name:String(row.name).trim(),cpf:cpf,
        phone:P.digits(row.phone),street:String(row.street||'').trim(),
        number:String(row.number||'').trim(),neighborhood:String(row.neighborhood||'').trim(),
        city:String(row.city||'').trim(),state:String(row.state||'').trim().toUpperCase(),
        complement:String(row.complement||'').trim(),address:String(row.address||'').trim(),
        createdAt:row.createdAt||new Date().toISOString(),origin:'cadastro-publico-local'};
      P.db.clients.push(item);accepted++;
    });
    if(accepted&&!P.save()){
      P.db.clients.splice(before,accepted);
      return 0;
    }
    try{localStorage.setItem(P.publicInboxKey,'[]');}catch(e){}
    return accepted;
  };
  P.find = function (type,id) {return (P.db[type]||[]).find(function(x){return x.id===id;});};
  P.active = function (type) {return (P.db[type]||[]).filter(function(x){return x.active!==false;});};
  P.items = function (a) {var serv=P.find('services',a.serviceId);var price=Number(a.priceOverride!=null?a.priceOverride:(a.basePrice!=null?a.basePrice:(serv?serv.price:0)));var rows=[{name:a.serviceName||(serv?serv.name:'Serviço removido'),price:price,qty:1,minutes:serv?Number(serv.minutes):90}];(a.addons||[]).forEach(function(x){var def=P.find('addons',x.id)||{};rows.push({name:x.name||def.name||'Complemento',price:x.specialTotal!=null?Number(x.specialTotal):Number(x.price),qty:x.specialTotal!=null?1:Number(x.qty)||1,displayQty:Number(x.qty)||1,minutes:Number(x.minutes)||0});});return rows;};
  P.total = function(a){ if(a.finalTotal!=null)return Number(a.finalTotal);return Math.max(0,P.items(a).reduce(function(sum,x){return sum+x.price*x.qty;},0)-Number(a.discount||0));};
  P.duration = function (a) {var s=P.find('services',a.serviceId);return Number(a.serviceMinutes!=null?a.serviceMinutes:(s?s.minutes:90))+(a.addons||[]).reduce(function(sum,x){return sum+(Number(x.minutes)||0)*(Number(x.qty)||1);},0);};
  P.paid = function(id){return P.db.payments.filter(function(p){return p.appointmentId===id&&!p.voided;}).reduce(function(s,p){return s+Number(p.amount||0);},0);};
  P.remaining = function(a){return Math.max(0,P.total(a)-P.paid(a.id));};
  P.clientLabel = function(id){var c=P.find('clients',id);return c?c.name:'Cliente não encontrado';};
  P.overlap = function(date,time,minutes,excludeId){var a=P.clockMins(time),b=a+Number(minutes);return P.db.appointments.some(function(x){return x.id!==excludeId&&x.date===date&&x.status!=='cancelado'&&a<P.clockMins(x.time)+P.duration(x)&&b>P.clockMins(x.time);})||P.db.blocks.some(function(x){return x.id!==excludeId&&x.date===date&&a<P.clockMins(x.end)&&b>P.clockMins(x.start);});};
  P.formatAddress = function(client) {
    var c=client||{};
    var street=String(c.street||'').trim(), number=String(c.number||'').trim();
    var neighborhood=String(c.neighborhood||'').trim(), complement=String(c.complement||'').trim();
    var city=String(c.city||'').trim(), state=String(c.state||'').trim().toUpperCase();
    if(!street&&!number&&!neighborhood&&!city&&!state&&!complement)return String(c.address||'').trim();
    var first=[street,number].filter(Boolean).join(', ');
    if(complement)first+=(first?', ':'')+complement;
    var cityState=[city,state].filter(Boolean).join('/');
    return [first,neighborhood,cityState].filter(Boolean).join(' - ');
  };
  P.snapshot = function(appt){var c=P.find('clients',appt.clientId)||{};return {clientName:c.name||'Cliente removida',cpf:c.cpf||'',address:P.formatAddress(c),street:c.street||'',number:c.number||'',neighborhood:c.neighborhood||'',city:c.city||'',state:c.state||'',complement:c.complement||'',serviceText:P.items(appt).map(function(x){return x.name+((x.displayQty||x.qty)>1?' x'+(x.displayQty||x.qty):'');}).join(' + '),serviceDate:appt.date};};
  P.auditFinance = function(kind,action,id,before,after,reason){
    if(!Array.isArray(P.db.auditLog))P.db.auditLog=[];
    P.db.auditLog.push({id:P.uid(),kind:kind,action:action,recordId:id,at:new Date().toISOString(),reason:reason||'',before:before||null,after:after||null});
  };
  P.receive = function(appt,amount,method,date){var snap=appt.snapshot||P.snapshot(appt);var payment={id:P.uid(),appointmentId:appt.id,amount:Number(amount),method:method,date:date||P.today(),snapshot:snap,createdAt:new Date().toISOString()};P.db.payments.push(payment);P.auditFinance('recebimento','criado',payment.id,null,{amount:payment.amount,method:payment.method,date:payment.date},'Recebimento registrado');};
  P.toast = function(message,type){var host=document.getElementById('toast-root');if(!host)return;host.innerHTML='<div class="toast '+(type||'')+'">'+P.esc(message)+'</div>';clearTimeout(P.toastTimer);P.toastTimer=setTimeout(function(){host.innerHTML='';},3500);};
  P.badge = function(status){var names={agendado:'Agendado',confirmado:'Confirmado',concluido:'Concluído',cancelado:'Cancelado',bloqueado:'Bloqueado'};return '<span class="status '+P.esc(status)+'">'+(names[status]||P.esc(status))+'</span>';};
  P.csv = function(rows,filename){var content='\ufeff'+rows.map(function(row){return row.map(function(cell){return '"'+String(cell==null?'':cell).replace(/"/g,'""')+'"';}).join(';');}).join('\r\n');var link=document.createElement('a');link.href=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));link.download=filename;link.click();setTimeout(function(){URL.revokeObjectURL(link.href);},2000);};
  P.exportJSON = function(){var link=document.createElement('a');link.href=URL.createObjectURL(new Blob([JSON.stringify(P.db,null,2)],{type:'application/json'}));link.download='perola-leite-backup-'+P.today()+'.json';link.click();setTimeout(function(){URL.revokeObjectURL(link.href);},2000);};
  P.importPublicRegistrations();
})();