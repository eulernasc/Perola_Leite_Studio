(function () {
  'use strict';
  var P = window.PL;
  var root = document.getElementById('calendar-root');
  var state = null;
  var months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  function ic(name){return P.icon(name);}
  function parsed(value){var m=/^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value||'');return m?{year:+m[1],month:+m[2]-1,day:+(m[3]||1)}:null;}
  function pad(n){return String(n).padStart(2,'0');}
  function fmt(value,kind){var d=parsed(value);if(!d)return 'Escolha uma data';return kind==='month'?months[d.month]+' de '+d.year:pad(d.day)+' de '+months[d.month].toLowerCase()+' de '+d.year;}
  P.calendarField=function(name,label,value,required){
    return '<div class="field calendar-field"><label>'+P.esc(label)+'</label><input class="calendar-value" type="hidden" name="'+P.esc(name)+'" value="'+P.esc(value||'')+'" '+(required?'required':'')+'><button class="calendar-trigger" type="button" data-calendar-trigger="day" aria-label="Escolher '+P.esc(label)+'"><span class="calendar-value-label">'+P.esc(fmt(value,'day'))+'</span>'+ic('calendar')+'</button></div>';
  };
  P.monthControl=function(key,value){
    return '<div class="month-control calendar-field"><input class="calendar-value" type="hidden" data-filter="'+P.esc(key)+'" value="'+P.esc(value)+'"><button class="calendar-trigger" type="button" data-calendar-trigger="month" aria-label="Escolher mês de referência"><span class="calendar-value-label">'+P.esc(fmt(value,'month'))+'</span>'+ic('calendar')+'</button></div>';
  };
  function close(){root.innerHTML='';root.className='';state=null;}
  function draw(){
    if(!state)return;
    var year=state.year,month=state.month,kind=state.kind,selected=parsed(state.selected);
    var head='<div class="picker-top"><div><span class="picker-eyebrow">PÉROLA LEITE STUDIO</span><strong>Selecione '+(kind==='month'?'a competência':'a data')+'</strong></div><button class="picker-dismiss" type="button" data-picker-close aria-label="Fechar">'+ic('close')+'</button></div>';
    var controls='<div class="picker-nav"><button type="button" data-picker-nav="-12" aria-label="Ano anterior">'+ic('chevronLeft')+'</button><span class="picker-month-heading">'+(kind==='month'?'Ano de '+year:months[month]+' de '+year)+'</span><button type="button" data-picker-nav="12" aria-label="Próximo ano">'+ic('chevronRight')+'</button></div>';
    var now=parsed(P.today()),grid='';
    if(kind==='month'){
      grid='<div class="picker-month-grid">'+months.map(function(name,m){var picked=selected&&selected.year===year&&selected.month===m;var current=now.year===year&&now.month===m;return '<button type="button" class="picker-month '+(picked?'is-selected ':'')+(current?'is-current':'')+'" data-picker-select="'+year+'-'+pad(m+1)+'">'+name.slice(0,3)+'</button>';}).join('')+'</div>';
    }else{
      controls='<div class="picker-nav"><button type="button" data-picker-nav="-1" aria-label="Mês anterior">'+ic('chevronLeft')+'</button><span class="picker-month-heading">'+months[month]+' de '+year+'</span><button type="button" data-picker-nav="1" aria-label="Próximo mês">'+ic('chevronRight')+'</button></div>';
      var first=new Date(year,month,1),firstCol=(first.getDay()+6)%7,number=new Date(year,month+1,0).getDate();
      grid='<div class="picker-day-grid">'+days.map(function(d){return '<span class="picker-week-label">'+d+'</span>';}).join('');
      for(var i=0;i<42;i++){var day=i-firstCol+1;if(day<1||day>number){grid+='<span class="picker-day-blank"></span>';continue;}
        var value=year+'-'+pad(month+1)+'-'+pad(day),picked=selected&&selected.year===year&&selected.month===month&&selected.day===day,current=now.year===year&&now.month===month&&now.day===day;
        grid+='<button type="button" class="picker-day '+(picked?'is-selected ':'')+(current?'is-current':'')+'" data-picker-select="'+value+'">'+day+'</button>';
      }grid+='</div>';
    }
    root.className='calendar-overlay';
    root.innerHTML='<div class="calendar-shade" data-picker-close></div><div class="calendar-popover" role="dialog" aria-label="Selecionar data">'+head+controls+grid+'<div class="picker-footer"><button type="button" class="picker-shortcut" data-picker-today>'+(kind==='month'?'Este mês':'Hoje')+'</button><button type="button" class="picker-shortcut" data-picker-close>Fechar</button></div></div>';
    var popup=root.querySelector('.calendar-popover');
    if(window.innerWidth>820&&state.button&&state.button.isConnected){var r=state.button.getBoundingClientRect();var width=334;var left=Math.max(12,Math.min(window.innerWidth-width-12,r.left));var top=r.bottom+9;if(top+420>window.innerHeight)top=Math.max(12,r.top-430);popup.style.left=left+'px';popup.style.top=top+'px';}
  }
  function open(button){
    if(state&&state.button===button){close();return;}
    var field=button.closest('.calendar-field'),input=field&&field.querySelector('.calendar-value');
    if(!input)return;
    var kind=button.dataset.calendarTrigger,selected=input.value||((kind==='month')?P.monthKey():P.today()),parts=parsed(selected)||parsed(P.today());
    state={kind:kind,input:input,button:button,selected:selected,year:parts.year,month:parts.month};
    draw();
  }
  function choose(value){
    if(!state)return;
    var s=state; s.input.value=value;
    var label=s.button.querySelector('.calendar-value-label');if(label)label.textContent=fmt(value,s.kind);
    close();
    s.input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-calendar-trigger]');
    if(b){ev.preventDefault();ev.stopPropagation();open(b);return;}
    if(!state)return;
    var sel=ev.target.closest('[data-picker-select]');if(sel){ev.preventDefault();ev.stopPropagation();choose(sel.dataset.pickerSelect);return;}
    var nav=ev.target.closest('[data-picker-nav]');if(nav){ev.preventDefault();ev.stopPropagation();var v=+nav.dataset.pickerNav;if(state.kind==='month'){state.year+=v/12;}else{var d=new Date(state.year,state.month+v,1);state.year=d.getFullYear();state.month=d.getMonth();}draw();return;}
    var today=ev.target.closest('[data-picker-today]');if(today){ev.preventDefault();ev.stopPropagation();choose(state.kind==='month'?P.monthKey():P.today());return;}
    if(ev.target.closest('[data-picker-close]')){ev.preventDefault();ev.stopPropagation();close();return;}
    if(!ev.target.closest('.calendar-popover'))close();
  },true);
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&state){ev.stopImmediatePropagation();close();}},true);
  P.closeCalendar=close;
})();