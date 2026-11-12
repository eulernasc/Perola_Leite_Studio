(function () {
  'use strict';
  // Fila de cadastros locais: compartilhada apenas entre páginas da MESMA origem
  // e do MESMO navegador/perfil. Não transmite dados pela rede.
  var INBOX = 'perola-leite-studio-public-registrations-v1';
  var ADMIN = 'perola-leite-studio-local-v1';
  function digits(s){return String(s||'').replace(/\D/g,'');}
  function parse(raw,fallback){try{var parsed=JSON.parse(raw);return parsed==null?fallback:parsed;}catch(e){return fallback;}}
  function address(c){
    var first=[c.street,c.number].filter(Boolean).join(', ');
    if(c.complement)first+=(first?', ':'')+c.complement;
    return [first,c.neighborhood,[c.city,c.state].filter(Boolean).join('/')].filter(Boolean).join(' - ');
  }
  function normalize(fields){
    var out={};
    ['name','cpf','phone','street','number','neighborhood','city','state','complement'].forEach(function(k){
      out[k]=String(fields[k]||'').trim();
    });
    out.cpf=digits(out.cpf);
    out.phone=digits(out.phone);
    out.state=out.state.toUpperCase();
    out.address=address(out);
    return out;
  }
  function register(fields){
    var item=normalize(fields);
    if(!item.name||!item.street||!item.number||!item.neighborhood||!item.city||!item.state||item.cpf.length!==11){
      return {ok:false,error:'Confira os campos obrigatórios do cadastro.'};
    }
    try {
      var main=parse(localStorage.getItem(ADMIN),{}),inbox=parse(localStorage.getItem(INBOX),[]);
      if(!Array.isArray(inbox))inbox=[];
      var existing=(Array.isArray(main.clients)?main.clients:[]).concat(inbox);
      if(existing.some(function(c){return digits(c.cpf)===item.cpf;})){
        return {ok:false,error:'Este CPF já consta nos cadastros de teste deste navegador.'};
      }
      item.id='id_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
      item.createdAt=new Date().toISOString();
      item.origin='cadastro-publico-local';
      inbox.push(item);
      // Grava somente o inbox: não sobrescreve agenda, financeiro ou outros dados da ADM.
      localStorage.setItem(INBOX,JSON.stringify(inbox));
      return {ok:true,id:item.id,name:item.name};
    }catch(e){
      return {ok:false,error:'Não foi possível salvar neste navegador. Verifique espaço disponível e permissões de armazenamento.'};
    }
  }
  window.PLSRegistration = {inboxKey:INBOX,adminKey:ADMIN,register:register};
})();