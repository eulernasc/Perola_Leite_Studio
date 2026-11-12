(function () {
  'use strict';
  var P=window.PL, E=P.esc, I=P.icon;
  var modalState={type:'',id:null,image:'',payments:[]};
  var returnToAppointment=false;
  var root=document.getElementById('modal-root');
  function field(name,label,value,type,extra){if(type==='date')return P.calendarField(name,label,value,true);if(type==='time')return P.timeField(name,label,value,true);return '<div class="field"><label>'+label+'</label><input type="'+(type||'text')+'" name="'+name+'" value="'+E(value==null?'':value)+'" '+(extra||'')+'></div>';}
  function textarea(name,label,value){return '<div class="field"><label>'+label+'</label><textarea name="'+name+'">'+E(value||'')+'</textarea></div>';}
  function options(arr,current,placeholder){return '<option value="">'+E(placeholder||'Selecione...')+'</option>'+arr.map(function(x){return '<option value="'+E(x.id)+'" '+(x.id===current?'selected':'')+'>'+E(x.name)+'</option>';}).join('');}
  function formButtons(text,extra){return '<div class="modal-actions">'+(extra||'')+'<button type="button" class="btn" data-action="close-modal">Cancelar</button><button class="btn primary" type="submit">'+I('check')+text+'</button></div>';}
  function lockScroll(){
    if(document.body.classList.contains('modal-open'))return;
    var y=window.scrollY||window.pageYOffset||0;
    P._modalScrollY=y;
    document.body.classList.add('modal-open');
    document.body.style.position='fixed';
    document.body.style.width='100%';
    document.body.style.top='-'+y+'px';
  }
  function unlockScroll(){
    if(!document.body.classList.contains('modal-open'))return;
    document.body.classList.remove('modal-open');
    document.body.style.position='';
    document.body.style.width='';
    document.body.style.top='';
    window.scrollTo(0,P._modalScrollY||0);
  }
  function frame(title,tag,body,footer){lockScroll();root.innerHTML='<div class="modal-wrap" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="'+E(title)+'"><div class="modal-head"><div><div class="eyebrow">Pérola Leite Studio</div><h2>'+title+'</h2></div><button type="button" class="btn icon" data-action="close-modal" aria-label="Fechar">'+I('close')+'</button></div>'+(tag?'<form data-form="'+tag+'" autocomplete="off"><div class="modal-body">'+body+'</div>'+footer+'</form>':'<div class="modal-body">'+body+'</div><div class="modal-actions">'+footer+'</div>')+'</div></div>';setTimeout(function(){var input=root.querySelector('input:not([type=hidden]),select,textarea');if(input)input.focus({preventScroll:true});},50);}
  function imgPanel(){return '<div class="field full"><label>Foto do '+(P.catalogType==='services'?'serviço':'complemento')+' (opcional)</label><div class="image-uploader"><div class="thumb" id="image-preview">'+(modalState.image?'<img src="'+E(modalState.image)+'" alt="Prévia da foto">':I('camera'))+'</div><div class="image-controls"><strong id="image-caption">'+(modalState.image?'Foto selecionada':'Adicione uma foto')+'</strong><p>JPG, PNG ou WebP. A imagem é otimizada automaticamente para os testes.</p><input id="image-upload" type="file" accept="image/png,image/jpeg,image/webp" class="file-hidden" aria-label="Selecionar foto"><div class="image-buttons"><button type="button" class="btn soft" data-action="choose-image">'+I('upload')+'<span>'+(modalState.image?'Trocar foto':'Escolher foto')+'</span></button><button type="button" class="btn sm danger" id="remove-photo-button" data-action="remove-image" '+(modalState.image?'':'hidden')+'>Remover</button></div></div></div></div>';}
  function clientModal(id){
    var c=P.find('clients',id)||{},legacy=!!c.address&&!c.street;
    var ufs=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
    var required=legacy?'':'required';
    var states='<div class="field"><label>Estado (UF) *</label><select name="state" '+required+'><option value="">Selecione a UF</option>'+
      ufs.map(function(uf){return '<option value="'+uf+'" '+(c.state===uf?'selected':'')+'>'+uf+'</option>';}).join('')+'</select></div>';
    var body='<div class="field-grid">'+
      field('name','Nome completo *',c.name,'text','required maxlength="120"')+
      field('cpf','CPF *',P.cpfFormat(c.cpf),'text','required inputmode="numeric" maxlength="14" placeholder="000.000.000-00"')+
      field('phone','Telefone / WhatsApp',P.phoneFormat(c.phone),'tel','inputmode="numeric" autocomplete="tel-national" maxlength="15" placeholder="(35) 99999-9999"')+
      '<div class="address-section-title field full"><strong>Endereço da cliente</strong><small>Preencha os campos separadamente. O relatório monta o endereço completo automaticamente.</small></div>'+
      '<div class="field full">'+field('street','Rua / Avenida *',c.street,'text',required+' maxlength="160" placeholder="Ex.: Rua das Flores"')+'</div>'+
      field('number','Número *',c.number,'text',required+' maxlength="16" placeholder="Ex.: 120 ou S/N"')+
      field('neighborhood','Bairro *',c.neighborhood,'text',required+' maxlength="90" placeholder="Ex.: Centro"')+
      field('city','Cidade *',c.city,'text',required+' maxlength="90" placeholder="Ex.: Lavras"')+
      states+
      '<div class="field full">'+field('complement','Complemento (opcional)',c.complement,'text','maxlength="120" placeholder="Apartamento, casa, bloco, referência..."')+'</div></div>'+
      (legacy?'<div class="notice" style="margin-top:15px"><strong>Cadastro anterior preservado</strong>Endereço antigo: '+E(c.address)+'. Você pode completar os novos campos ou manter o registro anterior sem perder dados.</div>':'')+
      '<p class="hint" style="margin-top:14px">Os dados ficarão vinculados aos lançamentos e relatórios. Nesta versão de testes, use apenas informações fictícias.</p>';
    var buttons=id?'<button type="button" class="btn soft" data-action="'+(c.active===false?'restore-client':'deactivate-client')+'" data-id="'+E(id)+'">'+I(c.active===false?'check':'minus')+(c.active===false?'Ativar':'Desativar')+'</button><button type="button" class="btn danger" data-action="delete-client" data-id="'+E(id)+'">'+I('trash')+'Excluir definitivamente</button>':'';
    frame(id?'Editar cliente':'Nova cliente','client',body,formButtons('Salvar cliente',buttons));
  }
  function clientDeleteModal(id){
    var client=P.find('clients',id);
    if(!client)return;
    var appts=P.db.appointments.filter(function(a){return a.clientId===id;});
    var ids=appts.map(function(a){return a.id;});
    var payments=P.db.payments.filter(function(p){return ids.includes(p.appointmentId);});
    var body='<div class="notice"><strong>Exclusão definitiva e irreversível</strong>Este cadastro será removido, mesmo que a cliente tenha histórico. Nome, CPF, telefone e endereço serão retirados dos registros vinculados. Os horários, serviços, valores recebidos e totais financeiros permanecerão, sem identificar a cliente.</div>'+
      '<div class="mini-item" style="margin-top:16px"><span class="grow"><strong>'+E(client.name)+'</strong><small>CPF: '+E(P.cpfFormat(client.cpf))+' · '+appts.length+' agendamento(s) · '+payments.length+' pagamento(s)</small></span></div>'+
      '<label class="toggle" style="margin-top:16px"><input type="checkbox" id="confirm-client-destruction"><span>Entendo que a exclusão é definitiva e que os dados pessoais desta cliente não poderão ser recuperados pelo sistema.</span></label>';
    frame('Excluir cliente definitivamente',null,body,'<button type="button" class="btn" data-action="close-modal">Cancelar</button><button type="button" class="btn danger" data-action="confirm-delete-client" data-id="'+E(id)+'">'+I('trash')+'Excluir definitivamente</button>');
  }
  function itemModal(id){var type=P.catalogType;var item=P.find(type,id)||{};modalState.image=item.image||'';var isService=type==='services';var body='<div class="field-grid">'+field('name','Nome '+(isService?'do serviço':'do complemento')+' *',item.name,'text','required maxlength="110"')+field('price','Valor em R$ *',item.price===undefined?'':item.price,'number','required min="0" step="0.01"')+field('minutes','Duração '+(isService?'em minutos *':'adicional em minutos'),item.minutes===undefined?'':item.minutes,'number',isService?'required min="1"':'min="0"')+(isService?field('category','Categoria',item.category||'Unhas','text','maxlength="70"'):'<div class="field"><label>Tipo de cobrança</label><label class="toggle"><input type="checkbox" name="perUnit" '+(item.perUnit?'checked':'')+'> Por unidade (ex.: unha quebrada)</label></div>')+'<div class="field full">'+textarea('description','Descrição / observações',item.description)+'</div><div class="field full"><label class="toggle"><input type="checkbox" name="startingAt" '+(item.startingAt?'checked':'')+'><span class="toggle-copy"><strong>Preço variável</strong><small>Marque se o valor puder mudar. O catálogo mostrará "A partir de R$ ...".</small></span></label></div>'+(isService?'':'<div class="field full">'+field('thresholdQty','A partir de quantas unidades aplicar preço especial?',item.thresholdQty||0,'number','min="0" step="1"')+'</div><div class="field full">'+field('thresholdPrice','Valor especial total (R$)',item.thresholdPrice==null?'':item.thresholdPrice,'number','min="0" step="0.01" placeholder="Definir antes de usar"')+'</div>')+imgPanel()+'</div>';
    if(!isService){body+='<hr class="form-divider"><h3>Disponibilidade do complemento</h3><p class="hint">Sem seleção, ficará disponível para todos os serviços.</p><div class="addons-picker">'+P.db.services.map(function(s){return '<label class="addon-row"><input type="checkbox" name="serviceIds" value="'+s.id+'" '+((item.serviceIds||[]).includes(s.id)?'checked':'')+'><span>'+E(s.name)+'</span></label>';}).join('')+'</div>';}
    var extra=id?'<button type="button" class="btn soft" data-action="toggle-item" data-id="'+id+'">'+(item.active===false?'Ativar':'Desativar')+'</button><button type="button" class="btn danger" data-action="delete-item" data-id="'+id+'">'+I('trash')+'Excluir</button>':'';
    frame(id?'Editar '+(isService?'serviço':'complemento'):'Novo '+(isService?'serviço':'complemento'),'item',body,formButtons('Salvar',extra));
  }
  function addonsPicker(chosen,serviceId){var current=chosen||[];var rows=P.active('addons').filter(function(a){return !(a.serviceIds||[]).length||!serviceId||(a.serviceIds||[]).includes(serviceId);});return rows.length?rows.map(function(a){var selected=current.find(function(x){return x.id===a.id;});return '<label class="addon-row" data-addon-row="'+a.id+'"><input type="checkbox" name="addonCheck" value="'+a.id+'" '+(selected?'checked':'')+'><span class="grow"><strong>'+E(a.name)+'</strong><small>'+P.money(a.price)+(a.perUnit?' por unidade':'')+(a.minutes?' · +'+a.minutes+'min':'')+'</small></span>'+(a.perUnit?'<input type="number" name="qty_'+a.id+'" value="'+(selected?selected.qty:1)+'" min="1" max="30" aria-label="Quantidade de '+E(a.name)+'">':'')+'</label>';}).join(''):P.empty('sparkle','Sem complementos','Cadastre complementos no catálogo.');}
  function appointmentModal(id){var a=P.find('appointments',id)||{};var availableClients=P.db.clients.filter(function(c){return c.active!==false||c.id===a.clientId;});if(!availableClients.length){frame('Antes de agendar',null,P.empty('users','Cadastre uma cliente primeiro','Você poderá encontrá-la pelo nome ou CPF no momento do agendamento.'),'<button class="btn primary" data-action="new-client">'+I('plus')+'Cadastrar cliente</button>');return;}
    var currentService=a.serviceId||(P.active('services')[0]||{}).id||'';var currentClient=P.find('clients',a.clientId);
    var clientOpts=availableClients.slice().sort(function(x,y){return x.name.localeCompare(y.name);}).map(function(c){return '<option data-search="'+E(P.norm(c.name+' '+c.cpf))+'" value="'+c.id+'" '+(a.clientId===c.id?'selected':'')+'>'+E(c.name+' · '+P.cpfFormat(c.cpf))+'</option>';}).join('');
    var body='<div class="form-stack"><div class="field"><label>Pesquisar cliente por nome ou CPF *</label><div class="search">'+I('search')+'<input type="search" id="clientSearch" placeholder="Digite o nome ou CPF..." value="'+E(currentClient?currentClient.name:'')+'"></div><select id="client-picker" name="clientId" required style="margin-top:8px"><option value="">Selecione uma cliente</option>'+clientOpts+'</select><small>Não encontrou? <button type="button" class="btn sm soft" data-action="new-client" style="margin-top:6px">Cadastrar nova cliente</button></small></div><div class="field"><label>Serviço principal *</label><select name="serviceId" required id="booking-service">'+options(P.active('services'),currentService,'Selecione um serviço')+'</select></div><div class="field"><label>Complementos (opcionais)</label><div class="addons-picker" id="booking-addons">'+addonsPicker(a.addons,currentService)+'</div></div><div class="field-grid">'+field('date','Data *',a.date||P.agendaDate,'date','required')+field('time','Horário *',a.time||'09:00','time','required')+field('priceOverride','Valor do serviço (R$)',a.priceOverride===undefined?'':a.priceOverride,'number','min="0" step="0.01" placeholder="Padrão do catálogo"')+'<div class="field"><label>Status</label><select name="status"><option value="agendado" '+(a.status!=='confirmado'?'selected':'')+'>Agendado</option><option value="confirmado" '+(a.status==='confirmado'?'selected':'')+'>Confirmado</option></select></div></div>'+textarea('notes','Observações',a.notes)+'<div class="cost-preview"><span>Valor previsto <small style="display:block">Inclui complementos</small></span><strong id="booking-total">'+P.money(P.total(a.serviceId?a:{serviceId:currentService,addons:[]}))+'</strong></div></div>';
    frame(id?'Editar agendamento':'Novo agendamento','appointment',body,formButtons('Salvar agendamento',id?'<button type="button" class="btn danger" data-action="delete-appt" data-id="'+id+'">'+I('trash')+'Excluir</button>':''));
    updateBookingPreview();
  }
  function appointmentInfo(id){var a=P.find('appointments',id);if(!a)return;var c=P.find('clients',a.clientId)||{};var rows=P.items(a);var body='<div class="mini-list"><div class="mini-item"><span class="time-pill">'+E(a.time)+'</span><span class="grow"><strong>'+E(c.name||'Cliente não encontrada')+'</strong><small>'+P.date(a.date)+' · '+P.duration(a)+' minutos</small></span>'+P.badge(a.status)+'</div><div class="mini-item"><div class="grow"><strong>CPF: '+E(P.cpfFormat(c.cpf||''))+'</strong><small>'+E(P.formatAddress(c)||'Endereço não informado')+'</small></div></div></div><hr class="form-divider"><h3>Serviços e adicionais</h3>'+rows.map(function(x){return '<div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:11px;font-size:12px"><span>'+E(x.name)+((x.displayQty||x.qty)>1?' x'+(x.displayQty||x.qty):'')+'</span><strong>'+P.money(x.price*x.qty)+'</strong></div>';}).join('')+'<div class="cost-preview"><span>Valor total</span><strong>'+P.money(P.total(a))+'</strong></div>'+(a.status==='concluido'?'<div class="mini-item" style="margin-top:12px"><span class="grow"><strong>Recebido: '+P.money(P.paid(a.id))+'</strong><small>A receber: '+P.money(P.remaining(a))+'</small></span></div>':'')+(a.notes?'<p class="hint" style="margin-top:13px">Observações: '+E(a.notes)+'</p>':'');
    var buttons='';
    if(a.status==='agendado'||a.status==='confirmado'){buttons='<button class="btn soft" data-action="edit-appt" data-id="'+a.id+'">'+I('edit')+'Editar</button>'+(a.status==='agendado'?'<button class="btn" data-action="confirm-appt" data-id="'+a.id+'">Confirmar</button>':'')+'<button class="btn danger" data-action="cancel-appt" data-id="'+a.id+'">Cancelar</button><button class="btn primary" data-action="complete" data-id="'+a.id+'">'+I('check')+'Concluir atendimento</button>';}
    if(a.status==='concluido'&&P.remaining(a)>.009)buttons='<button class="btn primary" data-action="receive" data-id="'+a.id+'">Registrar recebimento</button>';
    buttons+='<button class="btn danger" data-action="delete-appt" data-id="'+a.id+'">'+I('trash')+'Excluir agendamento</button><button class="btn" data-action="close-modal">Fechar</button>';frame('Detalhes do atendimento',null,body,buttons);
  }
  function paymentRow(amount,method,date){return '<div class="payment-row"><div class="field"><label>Forma</label><select name="payMethod"><option '+(method==='Pix'?'selected':'')+'>Pix</option><option '+(method==='Dinheiro'?'selected':'')+'>Dinheiro</option><option '+(method==='Cartão de débito'?'selected':'')+'>Cartão de débito</option><option '+(method==='Cartão de crédito'?'selected':'')+'>Cartão de crédito</option><option '+(method==='Transferência'?'selected':'')+'>Transferência</option><option '+(method==='Outro'?'selected':'')+'>Outro</option></select></div><div class="field"><label>Valor recebido</label><input name="payAmount" type="number" min="0" step="0.01" required value="'+E(amount)+'"></div><button type="button" class="btn icon danger" data-action="remove-payment" aria-label="Remover forma de pagamento">'+I('trash')+'</button></div>';}
  function completionModal(id){var a=P.find('appointments',id);if(!a)return;var body='<div class="mini-item"><div class="grow"><strong>'+E(P.clientLabel(a.clientId))+'</strong><small>'+P.date(a.date)+' · '+E(a.serviceName||P.items(a)[0].name)+'</small></div></div><div class="field" style="margin-top:20px"><label>Valor final do atendimento (R$)</label><input name="finalTotal" id="finalTotal" type="number" min="0" step="0.01" required value="'+P.total(a)+'"><small>Permite ajustar preço ou desconto antes de registrar a venda.</small></div><hr class="form-divider"><div class="section-head"><h3>Pagamento recebido</h3><button type="button" class="btn sm soft" data-action="add-payment">'+I('plus')+'Adicionar forma</button></div><label class="toggle"><input type="checkbox" id="noPayment" name="noPayment"> Não houve pagamento agora (fica a receber)</label><div id="payment-rows">'+paymentRow(P.total(a).toFixed(2),'Pix',P.today())+'</div><div style="margin-top:15px">'+P.calendarField("paidDate","Data do recebimento",P.today(),true)+'</div><p class="hint">Aceita pagamentos parciais ou divididos em várias formas. A diferença permanece em contas a receber.</p>';frame('Concluir atendimento','complete',body,formButtons('Concluir e registrar'));
  }
  function receiveModal(id){var a=P.find('appointments',id);if(!a)return;var body='<div class="mini-item"><div class="grow"><strong>'+E(P.clientLabel(a.clientId))+'</strong><small>Pendente: '+P.money(P.remaining(a))+'</small></div></div><div class="field-grid" style="margin-top:18px">'+field('amount','Valor recebido (R$) *',P.remaining(a).toFixed(2),'number','required min="0.01" step="0.01" max="'+P.remaining(a).toFixed(2)+'"')+'<div class="field"><label>Forma de pagamento</label><select name="method"><option>Pix</option><option>Dinheiro</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Transferência</option><option>Outro</option></select></div>'+field('date','Data do recebimento',P.today(),'date','required')+'</div>';frame('Registrar recebimento','receive',body,formButtons('Salvar recebimento'));
  }
  function paymentEditModal(id){
    var p=P.find('payments',id);if(!p||p.voided)return;
    var a=P.find('appointments',p.appointmentId);
    var remainingLimit=a?Math.max(0,P.total(a)-P.paid(a.id)+Number(p.amount)):Number(p.amount);
    var client=(p.snapshot||{}).clientName||'Cliente';
    var body='<div class="mini-item"><span class="grow"><strong>'+E(client)+'</strong><small>'+E((p.snapshot||{}).serviceText||'Serviço')+'</small></span></div>'+
      '<div class="field-grid" style="margin-top:18px">'+
      field('amount','Valor recebido (R$) *',Number(p.amount).toFixed(2),'number','required min="0.01" max="'+remainingLimit.toFixed(2)+'" step="0.01"')+
      '<div class="field"><label>Forma de pagamento *</label><select name="method">'+
      ['Pix','Dinheiro','Cartão de débito','Cartão de crédito','Transferência','Outro'].map(function(method){return '<option '+(p.method===method?'selected':'')+'>'+E(method)+'</option>';}).join('')+'</select></div>'+
      field('date','Data do recebimento',p.date,'date','required')+'</div>'+
      '<div class="field" style="margin-top:16px"><label>Motivo da correção *</label><textarea name="reason" maxlength="250" required placeholder="Ex.: forma de pagamento registrada incorretamente"></textarea></div>'+
      '<div class="notice" style="margin-top:16px">As alterações serão registradas no histórico de auditoria para conferência financeira.</div>';
    frame('Editar recebimento','edit-payment',body,formButtons('Salvar correção'));
  }
  function financeVoidModal(type,id){
    var payment=type==='payment',item=P.find(payment?'payments':'expenses',id);
    if(!item||item.voided)return;
    var title=payment?'Excluir recebimento':'Excluir despesa';
    var val=Number(item.amount),desc=payment?((item.snapshot||{}).clientName||'Cliente'):item.title;
    var body='<div class="notice"><strong>Confirmação necessária</strong>O lançamento não aparecerá mais nos totais nem no PDF mensal. Para manter a rastreabilidade contábil, será preservado no histórico de auditoria.</div>'+
      '<div class="mini-item" style="margin-top:16px"><span class="grow"><strong>'+E(desc)+'</strong><small>'+P.date(item.date)+(payment?' · '+E(item.method):'')+'</small></span><strong>'+P.money(val)+'</strong></div>'+
      '<div class="field" style="margin-top:18px"><label>Motivo da exclusão *</label><textarea name="reason" required maxlength="250" placeholder="Explique por que este lançamento será excluído"></textarea></div>';
    frame(title,payment?'void-payment':'void-expense',body,formButtons('Confirmar exclusão'));
  }
  function submitPaymentEdit(form){
    var p=P.find('payments',modalState.id);if(!p||p.voided)return;
    var f=new FormData(form),amount=Number(f.get('amount')),method=String(f.get('method')||''),date=String(f.get('date')||''),reason=String(f.get('reason')||'').trim();
    if(!Number.isFinite(amount)||amount<=0||!method||!date||!reason){P.toast('Preencha todos os campos e o motivo da correção.','error');return;}
    var a=P.find('appointments',p.appointmentId),limit=a?P.total(a)-(P.paid(a.id)-Number(p.amount)):Number(p.amount);
    if(amount>limit+.009){P.toast('Valor maior que o total ainda permitido para este atendimento.','error');return;}
    var before={amount:Number(p.amount),method:p.method,date:p.date};
    p.amount=amount;p.method=method;p.date=date;p.updatedAt=new Date().toISOString();
    P.auditFinance('recebimento','editado',p.id,before,{amount:p.amount,method:p.method,date:p.date},reason);
    notifySaved('Recebimento corrigido.');
  }
  function submitFinanceVoid(form,payment){
    var key=payment?'payments':'expenses',item=P.find(key,modalState.id);
    if(!item||item.voided)return;
    var reason=String(new FormData(form).get('reason')||'').trim();
    if(!reason){P.toast('Informe o motivo da exclusão.','error');return;}
    var before={amount:Number(item.amount),date:item.date};
    if(payment)before.method=item.method;
    else{before.title=item.title;before.category=item.category;}
    item.voided=true;item.voidedAt=new Date().toISOString();item.voidReason=reason;
    P.auditFinance(payment?'recebimento':'despesa','excluido',item.id,before,{voided:true},reason);
    notifySaved(payment?'Recebimento excluído dos totais, com auditoria.':'Despesa excluída dos totais, com auditoria.');
  }
  function expenseModal(id){var x=P.find('expenses',id)||{};var body='<div class="field-grid">'+field('title','Descrição *',x.title,'text','required maxlength="120"')+field('amount','Valor (R$) *',x.amount,'number','required min="0.01" step="0.01"')+field('date','Data *',x.date||P.today(),'date','required')+'<div class="field"><label>Categoria</label><select name="category">'+['Materiais','Produtos','Aluguel','Energia','Marketing','Transporte','Outras'].map(function(a){return '<option '+(x.category===a?'selected':'')+'>'+a+'</option>';}).join('')+'</select></div><div class="field"><label>Forma de pagamento</label><select name="method">'+['Pix','Dinheiro','Cartão de débito','Cartão de crédito','Transferência','Outro'].map(function(a){return '<option '+(x.method===a?'selected':'')+'>'+a+'</option>';}).join('')+'</select></div></div>'+textarea('notes','Observações',x.notes);frame(id?'Editar despesa':'Nova despesa','expense',body,formButtons('Salvar despesa',id?'<button type="button" class="btn danger" data-action="delete-expense" data-id="'+id+'">Excluir</button>':''));
  }
  function blockModal(id){var b=P.find('blocks',id)||{};var body='<div class="field-grid">'+field('date','Data *',b.date||P.agendaDate,'date','required')+field('start','Início *',b.start||'12:00','time','required')+field('end','Fim *',b.end||'13:00','time','required')+'</div>'+textarea('note','Motivo / observação',b.note);frame(id?'Editar bloqueio':'Bloquear horário','block',body,formButtons('Salvar bloqueio',id?'<button type="button" class="btn danger" data-action="delete-block" data-id="'+id+'">Remover</button>':''));
  }
  function historyModal(id){
    var client=P.find('clients',id);if(!client)return;
    var list=P.db.appointments.filter(function(a){return a.clientId===id;}).sort(function(a,b){return (b.date+b.time).localeCompare(a.date+a.time);});
    var received=list.reduce(function(n,a){return n+P.paid(a.id);},0);
    var cards=list.map(function(a){
      var service=a.serviceName||P.items(a)[0].name;
      return '<button class="mini-item" type="button" data-action="show-appt" data-id="'+a.id+'" style="width:100%;text-align:left;cursor:pointer"><span class="time-pill">'+P.date(a.date)+'</span><span class="grow"><strong>'+E(service)+'</strong><small>'+E(a.time)+' · '+P.money(P.total(a))+' · Recebido '+P.money(P.paid(a.id))+'</small></span>'+P.badge(a.status)+'</button>';
    }).join('');
    var body='<div class="mini-item"><div class="grow"><strong>'+E(client.name)+'</strong><small>CPF: '+E(P.cpfFormat(client.cpf))+' · '+E(P.phoneFormat(client.phone)||'Sem telefone')+'</small><small>'+E(P.formatAddress(client)||'Endereço não informado')+'</small></div></div>'+
      '<div class="finance-summary"><div class="card stat"><div class="fin-label">Atendimentos</div><div class="fin-total">'+list.length+'</div></div><div class="card stat"><div class="fin-label">Total recebido</div><div class="fin-total">'+P.money(received)+'</div></div></div>'+
      '<h3>Histórico de atendimentos</h3><div class="mini-list">'+(cards||P.empty('calendar','Sem atendimentos','Esta cliente ainda não possui agendamentos.'))+'</div>';
    frame('Histórico da cliente',null,body,'<button type="button" class="btn soft" data-action="edit-client" data-id="'+id+'">'+I('edit')+'Editar cadastro</button><button type="button" class="btn" data-action="close-modal">Fechar</button>');
  }
  P.openModal=function(type,id){if(P.closeCalendar)P.closeCalendar();if(P.closeTimePicker)P.closeTimePicker();modalState={type:type,id:id||null,image:'',payments:[]};if(type==='client')clientModal(id);if(type==='history')historyModal(id);if(type==='delete-client')clientDeleteModal(id);if(type==='item')itemModal(id);if(type==='appointment')appointmentModal(id);if(type==='view-appt')appointmentInfo(id);if(type==='complete')completionModal(id);if(type==='receive')receiveModal(id);if(type==='expense')expenseModal(id);if(type==='edit-payment')paymentEditModal(id);if(type==='void-payment')financeVoidModal('payment',id);if(type==='void-expense')financeVoidModal('expense',id);if(type==='block')blockModal(id);};
  P.closeModal=function(){if(P.closeCalendar)P.closeCalendar();if(P.closeTimePicker)P.closeTimePicker();root.innerHTML='';modalState={};unlockScroll();};
  function notifySaved(msg){if(!P.save())return;P.closeModal();P.render();P.toast(msg||'Salvo com sucesso.');}
  function updateBookingPreview(){var form=root.querySelector('[data-form="appointment"]');if(!form)return;var serv=P.find('services',form.elements.serviceId.value);var sid=serv?serv.id:'';root.querySelectorAll('[data-addon-row]').forEach(function(r){var a=P.find('addons',r.dataset.addonRow);r.style.display=(a&&(!(a.serviceIds||[]).length||a.serviceIds.includes(sid)))?'flex':'none';if(r.style.display==='none'){var cb=r.querySelector('input[type=checkbox]');if(cb)cb.checked=false;}});var total=Number(form.elements.priceOverride.value===''?(serv?serv.price:0):form.elements.priceOverride.value);root.querySelectorAll('input[name="addonCheck"]:checked').forEach(function(el){var a=P.find('addons',el.value);var qtyField=form.elements['qty_'+el.value];if(a){var qty=Number(qtyField?qtyField.value:1);if(a.thresholdQty>0&&qty>=a.thresholdQty){if(a.thresholdPrice==null){total=NaN;}else{total+=Number(a.thresholdPrice);}}else{total+=Number(a.price)*qty;}}});var el=root.querySelector('#booking-total');if(el)el.textContent=Number.isFinite(total)?P.money(total):'Configure o preço especial';}
  function addPaymentRow(){var el=root.querySelector('#payment-rows');if(el)el.insertAdjacentHTML('beforeend',paymentRow('0.00','Pix',P.today()));}
  function processImage(file){if(!file)return;if(file.size>12*1024*1024){P.toast('Escolha uma foto menor que 12 MB.','error');return;}var img=new Image(),url=URL.createObjectURL(file);img.onload=function(){var canvas=document.createElement('canvas'),max=400,scale=Math.min(1,max/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);modalState.image=canvas.toDataURL('image/jpeg',.71);var preview=root.querySelector('#image-preview');if(preview)preview.innerHTML='<img src="'+modalState.image+'" alt="Prévia da foto">';var label=root.querySelector('#image-caption');if(label)label.textContent=file.name||'Foto selecionada';var btn=root.querySelector('#remove-photo-button');if(btn)btn.hidden=false;var txt=root.querySelector('[data-action="choose-image"] span');if(txt)txt.textContent='Trocar foto';URL.revokeObjectURL(url);};img.onerror=function(){URL.revokeObjectURL(url);P.toast('Não foi possível ler a imagem.','error');};img.src=url;}
  function submitClient(form){
    var f=new FormData(form),name=String(f.get('name')||'').trim(),cpf=P.digits(f.get('cpf'));
    var fields={street:String(f.get('street')||'').trim(),number:String(f.get('number')||'').trim(),
      neighborhood:String(f.get('neighborhood')||'').trim(),city:String(f.get('city')||'').trim(),
      state:String(f.get('state')||'').trim().toUpperCase(),complement:String(f.get('complement')||'').trim()};
    var phone=P.digits(f.get('phone'));
    if(phone&&phone.length!==10&&phone.length!==11){P.toast('Informe telefone com DDD: 10 ou 11 dígitos.','error');return;}
    var existing=modalState.id?P.find('clients',modalState.id):null;
    var hasAddress=Object.values(fields).some(Boolean), keepLegacy=!!(existing&&existing.address&&!existing.street&&!hasAddress);
    if(!name||!P.cpfValid(cpf)){P.toast('Informe nome completo e um CPF válido.','error');return;}
    if(!keepLegacy&&(!fields.street||!fields.number||!fields.neighborhood||!fields.city||!fields.state)){
      P.toast('Preencha rua, número, bairro, cidade e estado.','error');return;
    }
    if(fields.state&&!/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(fields.state)){
      P.toast('Selecione um estado válido.','error');return;
    }
    if(P.db.clients.some(function(c){return c.cpf===cpf&&c.id!==modalState.id;})){P.toast('Já existe uma cliente com esse CPF.','error');return;}
    var item=existing;
    if(!item){item={id:P.uid(),createdAt:new Date().toISOString()};P.db.clients.push(item);}
    var address=keepLegacy?existing.address:P.formatAddress(fields);
    Object.assign(item,fields,{name:name,cpf:cpf,address:address,phone:phone});
    if(returnToAppointment){returnToAppointment=false;if(!P.save())return;P.closeModal();P.render();P.openModal('appointment');var picker=root.querySelector('#client-picker');if(picker){picker.value=item.id;var search=root.querySelector('#clientSearch');if(search)search.value=item.name;}P.toast('Cliente cadastrada. Continue o agendamento.');}else notifySaved('Cadastro da cliente salvo com sucesso.');
  }
  function submitItem(form){var f=new FormData(form),type=P.catalogType,name=String(f.get('name')||'').trim(),price=Number(f.get('price')),minutes=Number(f.get('minutes')||0);if(!name||!Number.isFinite(price)||price<0||minutes<0||(type==='services'&&minutes===0)){P.toast('Confira nome, valor e duração.','error');return;}var item=modalState.id?P.find(type,modalState.id):null;if(!item){item={id:P.uid(),active:true};P.db[type].push(item);}Object.assign(item,{name:name,price:price,minutes:minutes,description:String(f.get('description')||''),image:modalState.image,startingAt:f.has('startingAt'),category:type==='services'?String(f.get('category')||'Unhas'):'',perUnit:type==='addons'&&f.has('perUnit'),serviceIds:type==='addons'?f.getAll('serviceIds'):[],thresholdQty:type==='addons'?Number(f.get('thresholdQty')||0):0,thresholdPrice:type==='addons'&&f.get('thresholdPrice')!==''?Number(f.get('thresholdPrice')):null});notifySaved((type==='services'?'Serviço':'Complemento')+' salvo com sucesso.');}
  function submitAppointment(form){var f=new FormData(form),clientId=String(f.get('clientId')||''),serviceId=String(f.get('serviceId')||''),date=String(f.get('date')||''),time=String(f.get('time')||'');var serv=P.find('services',serviceId),client=P.find('clients',clientId);if(!serv||!client||!date||!time){P.toast('Selecione cliente, serviço, data e horário.','error');return;}var addons=f.getAll('addonCheck').map(function(id){var a=P.find('addons',id);if(!a)return null;return {id:id,name:a.name,price:a.price,minutes:a.minutes,qty:a.perUnit?Math.max(1,Math.min(30,Number(f.get('qty_'+id)||1))):1};}).filter(Boolean);addons.forEach(function(x){var def=P.find('addons',x.id);if(def&&def.thresholdQty>0&&x.qty>=def.thresholdQty){if(def.thresholdPrice==null){x.needsPrice=true;}else{x.specialTotal=Number(def.thresholdPrice);}}});if(addons.some(function(x){return x.needsPrice;})){P.toast('Configure no complemento o valor especial para 4 ou mais unhas quebradas.','error');return;}var mins=Number(serv.minutes)+addons.reduce(function(n,x){return n+x.minutes*x.qty;},0);if(P.clockMins(time)<P.clockMins(P.db.settings.start)||P.clockMins(time)+mins>P.clockMins(P.db.settings.end)){P.toast('Escolha um horário dentro do expediente configurado.','error');return;}if(P.overlap(date,time,mins,modalState.id)){P.toast('Há outro atendimento ou bloqueio neste horário.','error');return;}var value=f.get('priceOverride')===''?undefined:Number(f.get('priceOverride'));if(value!==undefined&&(!Number.isFinite(value)||value<0)){P.toast('O valor deve ser positivo.','error');return;}var item=modalState.id?P.find('appointments',modalState.id):null;if(!item){item={id:P.uid(),createdAt:new Date().toISOString()};P.db.appointments.push(item);}Object.assign(item,{clientId:clientId,serviceId:serviceId,serviceName:serv.name,date:date,time:time,status:String(f.get('status')||'agendado'),addons:addons,basePrice:Number(serv.price),serviceMinutes:Number(serv.minutes),priceOverride:value,notes:String(f.get('notes')||'').trim()});P.agendaDate=date;notifySaved('Agendamento salvo com sucesso.');}
  function submitComplete(form){var a=P.find('appointments',modalState.id);if(!a||a.status==='concluido')return;var final=Number(new FormData(form).get('finalTotal'));if(!Number.isFinite(final)||final<0){P.toast('Informe um valor válido.','error');return;}var noPayment=!!form.querySelector('#noPayment').checked;var payments=[];if(!noPayment)form.querySelectorAll('.payment-row').forEach(function(row){var val=Number(row.querySelector('[name="payAmount"]').value);if(val>0)payments.push({amount:val,method:row.querySelector('[name="payMethod"]').value});});var paid=payments.reduce(function(s,x){return s+x.amount;},0);if(paid>final+.009){P.toast('O total recebido não pode superar o valor do atendimento.','error');return;}a.finalTotal=final;a.completedAt=new Date().toISOString();a.status='concluido';a.snapshot=P.snapshot(a);var d=new FormData(form).get('paidDate')||P.today();payments.forEach(function(x){P.receive(a,x.amount,x.method,d);});notifySaved(paid?('Atendimento concluído. Recebido: '+P.money(paid)):'Atendimento concluído com pagamento pendente.');}
  function submitReceive(form){var a=P.find('appointments',modalState.id);if(!a)return;var f=new FormData(form),amount=Number(f.get('amount'));if(!Number.isFinite(amount)||amount<=0||amount>P.remaining(a)+.009){P.toast('O valor precisa ser maior que zero e até o saldo pendente.','error');return;}P.receive(a,amount,String(f.get('method')),String(f.get('date')||P.today()));notifySaved('Recebimento registrado.');}
  function submitExpense(form){var f=new FormData(form),title=String(f.get('title')||'').trim(),amount=Number(f.get('amount'));if(!title||!Number.isFinite(amount)||amount<=0){P.toast('Confira a descrição e o valor da despesa.','error');return;}var item=modalState.id?P.find('expenses',modalState.id):null;var before=item?{title:item.title,amount:item.amount,date:item.date,category:item.category,method:item.method}:null;if(!item){item={id:P.uid()};P.db.expenses.push(item);}Object.assign(item,{title:title,amount:amount,date:String(f.get('date')),category:String(f.get('category')),method:String(f.get('method')),notes:String(f.get('notes')||'')});P.auditFinance('despesa',before?'editada':'criada',item.id,before,{title:item.title,amount:item.amount,date:item.date,category:item.category,method:item.method},before?'Correção pelo financeiro':'Registro de despesa');notifySaved('Despesa registrada.');}
  function submitBlock(form){var f=new FormData(form),date=String(f.get('date')),start=String(f.get('start')),end=String(f.get('end'));if(P.clockMins(end)<=P.clockMins(start)){P.toast('O fim precisa ser depois do início.','error');return;}if(P.overlap(date,start,P.clockMins(end)-P.clockMins(start),modalState.id)){P.toast('Existe um atendimento ou bloqueio nesse horário.','error');return;}var item=modalState.id?P.find('blocks',modalState.id):null;if(!item){item={id:P.uid()};P.db.blocks.push(item);}Object.assign(item,{date:date,start:start,end:end,note:String(f.get('note')||'')});notifySaved('Horário bloqueado com sucesso.');}
  function reportRows(month){var s=P.summaryFor(month);return s.payments.slice().sort(function(a,b){return a.date.localeCompare(b.date)||a.createdAt.localeCompare(b.createdAt);});}
  function reportCSV(){var rows=[['Tipo','Data recebimento','Data atendimento','Cliente','CPF','Endereço','Serviços e complementos','Forma de pagamento','Valor (R$)']];reportRows(P.reportMonth).forEach(function(p){rows.push(['Receita',P.date(p.date),P.date(p.snapshot.serviceDate),p.snapshot.clientName,P.cpfFormat(p.snapshot.cpf),p.snapshot.address,p.snapshot.serviceText,p.method,Number(p.amount).toFixed(2).replace('.',',')]);});P.summaryFor(P.reportMonth).expenses.forEach(function(x){rows.push(['Despesa',P.date(x.date),'','','','',x.title,x.method,(-Number(x.amount)).toFixed(2).replace('.',',')]);});P.csv(rows,'perola-leite-relatorio-'+P.reportMonth+'.csv');}

  function copySignupLink(){
    var url=P.publicRegistrationLink;
    function fallback(){
      var input=document.querySelector('.signup-share-url');
      if(!input){P.toast('Link indisponível nesta tela.','error');return;}
      input.focus();input.select();
      var copied=false;
      try{copied=document.execCommand('copy');}catch(err){}
      P.toast(copied?'Link de cadastro copiado.':'Selecione e copie o link exibido no campo.',copied?'success':'error');
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){P.toast('Link de cadastro copiado.');}).catch(fallback);
    }else fallback();
  }
  function action(el,ev){var type=el.dataset.action,id=el.dataset.id;switch(type){
    case 'page':P.page=el.dataset.page;P.render();window.scrollTo(0,0);break;
    case 'copy-signup-link':copySignupLink();break;
    case 'new-client':returnToAppointment=modalState.type==='appointment';P.openModal('client');break;
    case 'history-client':P.openModal('history',id);break;
    case 'edit-client':P.openModal('client',id);break;
    case 'delete-client':P.openModal('delete-client',id);break;
    case 'deactivate-client':
      var deactivating=P.find('clients',id);
      if(deactivating&&confirm('Desativar '+deactivating.name+'? O cadastro e os históricos continuarão salvos e poderão ser reativados.')){
        if(P.setClientActive(id,false)){P.closeModal();P.render();P.toast('Cliente desativada.');}
        else P.toast('Não foi possível desativar esta cliente.','error');
      }
      break;
    case 'confirm-delete-client':
      var acknowledged=root.querySelector('#confirm-client-destruction');
      if(!acknowledged||!acknowledged.checked){P.toast('Confirme que entende a exclusão definitiva.','error');break;}
      var removal=P.deleteClientPermanently(id);
      if(removal.ok){
        P.closeModal();P.render();P.toast('Cliente excluída definitivamente. Histórico financeiro preservado sem identificação.');
      }else P.toast('Não foi possível excluir esta cliente.','error');
      break;
    case 'restore-client':
      if(P.restoreClient(id)){P.closeModal();P.render();P.toast('Cliente ativada novamente.');}
      else P.toast('Não foi possível ativar esta cliente.','error');
      break;
    case 'new-item':P.openModal('item');break;case 'edit-item':P.openModal('item',id);break;
    case 'new-appt':P.openModal('appointment');break;case 'edit-appt':P.openModal('appointment',id);break;case 'show-appt':P.openModal('view-appt',id);break;
    case 'complete':P.openModal('complete',id);break;case 'receive':P.openModal('receive',id);break;
    case 'new-expense':P.openModal('expense');break;case 'edit-expense':P.openModal('expense',id);break;case 'edit-payment':P.openModal('edit-payment',id);break;case 'void-payment':P.openModal('void-payment',id);break;case 'void-expense':P.openModal('void-expense',id);break;
    case 'new-block':P.openModal('block');break;case 'show-block':P.openModal('block',id);break;
    case 'close-modal':P.closeModal();break;case 'backdrop':if(el===ev.target)P.closeModal();break;
    case 'agenda-mode':P.agendaMode=el.dataset.mode;P.renderContent();break;
    case 'date-prev':P.agendaDate=P.addDays(P.agendaDate,P.agendaMode==='semana'?-7:-1);P.renderContent();break;
    case 'date-next':P.agendaDate=P.addDays(P.agendaDate,P.agendaMode==='semana'?7:1);P.renderContent();break;
    case 'date-today':P.agendaDate=P.today();P.renderContent();break;
    case 'select-day':P.agendaDate=el.dataset.date;P.agendaMode='dia';P.renderContent();break;
    case 'catalog-tab':P.catalogType=el.dataset.type;P.renderContent();break;
    case 'finance-tab':P.financeTab=el.dataset.tab;P.renderContent();break;
    case 'add-payment':addPaymentRow();break;
    case 'remove-payment':var row=el.closest('.payment-row');if(row)row.remove();break;
    case 'choose-image':var fileInput=root.querySelector('#image-upload');if(fileInput)fileInput.click();break;
    case 'remove-image':modalState.image='';var img=root.querySelector('#image-preview');if(img)img.innerHTML=I('camera');var caption=root.querySelector('#image-caption');if(caption)caption.textContent='Adicione uma foto';var remove=root.querySelector('#remove-photo-button');if(remove)remove.hidden=true;var input=root.querySelector('#image-upload');if(input)input.value='';break;
    case 'confirm-appt':var ap=P.find('appointments',id);if(ap&&ap.status==='agendado'){ap.status='confirmado';notifySaved('Atendimento confirmado.');}break;
    case 'delete-appt':var booking=P.find('appointments',id);if(!booking)break;if(P.db.payments.some(function(p){return p.appointmentId===id&&!p.voided;})){P.toast('Para excluir este agendamento, estorne antes os recebimentos no financeiro.','error');break;}if(confirm('Excluir este agendamento? A ação removerá o horário da agenda.')){P.auditFinance('agendamento','excluido',id,{clientId:booking.clientId,date:booking.date,time:booking.time,serviceName:booking.serviceName,status:booking.status},null,'Exclusão solicitada no painel');P.db.appointments=P.db.appointments.filter(function(x){return x.id!==id;});notifySaved('Agendamento excluído.');}break;
    case 'cancel-appt':if(confirm('Cancelar este agendamento?')){var x=P.find('appointments',id);if(x){x.status='cancelado';notifySaved('Agendamento cancelado.');}}break;
    case 'toggle-item':var item=P.find(P.catalogType,id);if(item){item.active=item.active===false;notifySaved('Disponibilidade alterada.');}break;
    case 'delete-item':var type2=P.catalogType,used=type2==='services'?P.db.appointments.some(function(a){return a.serviceId===id;}):P.db.appointments.some(function(a){return (a.addons||[]).some(function(x){return x.id===id;});});if(used){P.toast('Item já utilizado: desative para preservar o histórico.','error');return;}if(confirm('Excluir este item sem histórico?')){P.db[type2]=P.db[type2].filter(function(x){return x.id!==id;});notifySaved('Item excluído.');}break;
    case 'delete-expense':P.openModal('void-expense',id);break;
    case 'delete-block':P.db.blocks=P.db.blocks.filter(function(x){return x.id!==id;});notifySaved('Bloqueio removido.');break;
    case 'install-app':if(P.installApp)P.installApp();else P.toast('A instalação ainda está sendo preparada.');break;
    case 'pdf':if(P.generatePDF)P.generatePDF();else P.toast('Gerador de PDF indisponível.','error');break;case 'csv':reportCSV();break;case 'backup':P.exportJSON();break;
    case 'reset':if(confirm('Excluir TODOS os dados locais deste navegador? Faça backup antes. Esta ação é irreversível.')){P.db=P.defaults();P.save();try{localStorage.setItem(P.publicInboxKey,'[]');}catch(e){}P.render();P.toast('Dados locais reiniciados.');}break;
  }}
  document.addEventListener('click',function(ev){var b=ev.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='backdrop'&&ev.target!==b)return;ev.preventDefault();action(b,ev);});
  document.addEventListener('submit',function(ev){var form=ev.target.closest('[data-form]');if(!form)return;ev.preventDefault();var tag=form.dataset.form;try{if(tag==='client')submitClient(form);else if(tag==='item')submitItem(form);else if(tag==='appointment')submitAppointment(form);else if(tag==='complete')submitComplete(form);else if(tag==='receive')submitReceive(form);else if(tag==='expense')submitExpense(form);else if(tag==='edit-payment')submitPaymentEdit(form);else if(tag==='void-payment')submitFinanceVoid(form,true);else if(tag==='void-expense')submitFinanceVoid(form,false);else if(tag==='block')submitBlock(form);else if(tag==='settings'){var f=new FormData(form);P.db.settings={studio:String(f.get('studio')||'Pérola Leite Studio'),start:String(f.get('start')||'07:00'),end:String(f.get('end')||'20:00')};P.save();P.toast('Preferências salvas.');}}catch(err){console.error(err);P.toast('Não foi possível salvar. Verifique os campos.','error');}});
  document.addEventListener('input',function(ev){var el=ev.target;if(el.id==='clientSearch'){var q=P.norm(el.value),select=root.querySelector('#client-picker');if(select){Array.from(select.options).forEach(function(o){if(!o.value)return;o.hidden=!!q&&!P.norm(o.textContent+' '+o.dataset.search).includes(q);});var match=Array.from(select.options).find(function(o){return o.value&&!o.hidden;});if(match)select.value=match.value;else select.value='';}}if(el.name==='cpf'){el.value=P.cpfFormat(el.value);}if(el.name==='phone'&&el.closest('[data-form="client"]')){el.value=P.phoneFormat(el.value);}if(el.dataset.filter==='clients'){var q=P.norm(el.value);document.querySelectorAll('[data-client-filter]').forEach(function(row){row.hidden=!!q&&!P.norm(row.dataset.clientFilter).includes(q);});}if(el.closest('[data-form="appointment"]')&&(el.id==='booking-service'||el.name==='addonCheck'||el.name==='priceOverride'||el.name.indexOf('qty_')===0))updateBookingPreview();});
  document.addEventListener('change',function(ev){var el=ev.target;if(el.dataset.filter==='finance-month'){P.financeMonth=el.value;P.renderContent();}if(el.dataset.filter==='report-month'){P.reportMonth=el.value;P.renderContent();}if(el.id==='booking-service')updateBookingPreview();if(el.name==='addonCheck')updateBookingPreview();if(el.id==='noPayment'){var rows=root.querySelector('#payment-rows');if(rows)rows.style.display=el.checked?'none':'';}if(el.id==='image-upload'&&el.files&&el.files[0])processImage(el.files[0]);if(el.id==='importBackup'&&el.files&&el.files[0]){var reader=new FileReader();reader.onload=function(){try{var obj=JSON.parse(reader.result);if(!Array.isArray(obj.clients)||!Array.isArray(obj.services)||!Array.isArray(obj.addons)||!Array.isArray(obj.appointments)||!Array.isArray(obj.payments)||!Array.isArray(obj.expenses)||!Array.isArray(obj.blocks)||!obj.settings)throw Error('Estrutura inválida');if(!confirm('Importar backup? Isso substituirá TODOS os dados locais atuais.'))return;P.db=obj;P.save();P.render();P.toast('Backup importado com sucesso.');}catch(e){P.toast('Arquivo de backup inválido.','error');}};reader.readAsText(el.files[0]);}});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&root.innerHTML)P.closeModal();});
})();