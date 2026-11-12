(function(){
  'use strict';
  // Esta página não carrega scripts nem rotas administrativas.
  // Em testes, grava somente uma fila de cadastros no armazenamento local da mesma origem.
  var form=document.getElementById('publicRegistration');
  var feedback=document.getElementById('formFeedback');
  var success=document.getElementById('successPanel');
  var restart=document.getElementById('restartButton');
  function digits(value){return String(value||'').replace(/\D/g,'');}
  function cpfFormat(raw){
    var d=digits(raw).slice(0,11);
    return d.replace(/^(\d{3})(\d)/,'$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3')
      .replace(/\.(\d{3})(\d)/,'.$1-$2');
  }
  function cpfValid(raw){
    var cpf=digits(raw);
    if(cpf.length!==11||/^(\d)\1+$/.test(cpf))return false;
    for(var t=9;t<=10;t++){
      var sum=0;
      for(var i=0;i<t;i++)sum+=Number(cpf[i])*(t+1-i);
      var digit=(sum*10)%11;
      if(digit===10)digit=0;
      if(digit!==Number(cpf[t]))return false;
    }
    return true;
  }
  function phoneFormat(raw){
    var d=digits(raw).slice(0,11);
    if(!d)return '';
    if(d.length<=2)return '('+d;
    var rest=d.slice(2),group=d.length===11?5:4;
    if(rest.length<=4)return '('+d.slice(0,2)+') '+rest;
    return '('+d.slice(0,2)+') '+rest.slice(0,group)+'-'+rest.slice(group);
  }
  var cpf=document.getElementById('cpf'),phone=document.getElementById('phone');
  cpf.addEventListener('input',function(){cpf.value=cpfFormat(cpf.value);cpf.removeAttribute('aria-invalid');});
  phone.addEventListener('input',function(){phone.value=phoneFormat(phone.value);phone.removeAttribute('aria-invalid');});
  form.querySelectorAll('input,select').forEach(function(el){
    el.addEventListener('change',function(){el.removeAttribute('aria-invalid');});
  });
  form.addEventListener('submit',function(event){
    event.preventDefault();
    feedback.hidden=true;
    var values=new FormData(form),required=['name','cpf','street','number','neighborhood','city','state'];
    var incomplete=required.map(function(name){return form.elements[name];}).find(function(el){return !String(el.value||'').trim();});
    var phoneValue=digits(values.get('phone'));
    var invalidCPF=!cpfValid(values.get('cpf'));
    var invalidPhone=!!phoneValue&&phoneValue.length!==10&&phoneValue.length!==11;
    var invalidState=!/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(String(values.get('state')||''));
    var problem=incomplete||(invalidCPF?cpf:null)||(invalidPhone?phone:null)||(invalidState?form.elements.state:null);
    if(problem){
      problem.setAttribute('aria-invalid','true');
      feedback.textContent=incomplete?'Preencha todos os campos obrigatórios.':invalidCPF?'Confira o CPF informado.':invalidPhone?'Informe um telefone com DDD (10 ou 11 dígitos).':'Selecione uma UF válida.';
      feedback.hidden=false;
      problem.focus();
      feedback.scrollIntoView({block:'nearest',behavior:'smooth'});
      return;
    }
    var item={};
    ['name','cpf','phone','street','number','neighborhood','city','state','complement'].forEach(function(key){
      item[key]=String(values.get(key)||'').trim();
    });
    var result=window.PLSRegistration&&window.PLSRegistration.register(item);
    if(!result||!result.ok){
      feedback.textContent=result&&result.error||'Não foi possível salvar o cadastro de teste neste navegador.';
      feedback.hidden=false;
      feedback.scrollIntoView({block:'nearest',behavior:'smooth'});
      return;
    }
    form.reset();
    form.hidden=true;
    success.hidden=false;
    success.scrollIntoView({block:'start',behavior:'smooth'});
  });
  restart.addEventListener('click',function(){
    form.reset();
    form.hidden=false;
    success.hidden=true;
    feedback.hidden=true;
    document.getElementById('fullName').focus();
  });
})();