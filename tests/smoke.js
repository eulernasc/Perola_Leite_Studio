const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const project = path.join(__dirname, '..');
const nodes = {
  app: {innerHTML:''},
  'page-root': {innerHTML:''},
  'modal-root': {innerHTML:''},
  'calendar-root': {innerHTML:''},
  'time-root': {innerHTML:''},
  'toast-root': {innerHTML:''}
};
const storage = new Map();
const downloads=[];
let lastPdfBlob=null;
const document = {
  getElementById: id => nodes[id] || null,
  addEventListener: () => {},
  querySelectorAll: () => [],
  createElement: tag => ({ href:'', download:'', click(){downloads.push(this.download)}, remove(){} }),
  body: {appendChild(){}},
  documentElement: {classList:{add(){},remove(){},contains(){return false;}}}
};
const ctx = {
  window: {innerWidth: 390},
  document,
  localStorage: {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, value)
  },
  setTimeout: () => 0,
  clearTimeout: () => {},
  console,
  Date,
  Math,
  Number,
  String,
  Array,
  JSON,
  Intl,
  URL: {createObjectURL(blob){lastPdfBlob=blob;return 'blob:test'},revokeObjectURL(){}},
  Blob,
};
vm.createContext(ctx);
['data.js','calendar-ui.js','time-ui.js','app.js','forms.js','pdf.js'].forEach(name => {
  vm.runInContext(fs.readFileSync(path.join(project,name),'utf8'),ctx,{filename:name});
});
const P = ctx.window.PL;
assert.equal(P.db.services.length,7,'sete serviços iniciais');
assert.equal(P.db.addons.length,5,'cinco complementos iniciais');
assert.equal(P.cpfValid('529.982.247-25'),true);
assert.equal(P.cpfValid('111.111.111-11'),false);
assert.equal(P.phoneFormat('55555555555'),'(55) 55555-5555','celular brasileiro com nove dígitos');
assert.equal(P.phoneFormat('3533334444'),'(35) 3333-4444','telefone fixo com oito dígitos');
assert.equal(P.phoneFormat('(35) 99999-8888'),'(35) 99999-8888','máscara idempotente');
assert.equal(P.phoneFormat(''),'', 'telefone opcional vazio');
P.navItems.forEach(([page]) => {
  P.page=page;
  P.render();
  assert.ok(nodes.app.innerHTML.length > 1500,page+' deve renderizar');
});
assert.ok(nodes.app.innerHTML.includes('Modo local')||P.page==='ajustes');
assert.ok(P.reportsPage().includes('CPF'));
assert.ok(P.reportsPage().includes('endereço'));
assert.ok(P.reportsPage().includes('calendar-trigger'),'relatório deve usar calendário customizado');
assert.ok(P.financePage().includes('calendar-trigger'),'financeiro deve usar calendário customizado');
assert.ok(P.calendarField('date','Data',P.today(),true).includes('calendar-trigger'),'agendamentos devem usar seletor próprio');
assert.ok(P.settingsPage().includes('install-app'),'botão de instalação PWA configurado');
assert.ok(P.timeField('time','Horário','09:00',true).includes('data-time-trigger'),'seletor inteiro clicável');
assert.ok(P.homePage().includes('data-action="new-client"'),'atalho para cadastrar cliente no início');
assert.ok(P.financePage().includes('data-action="new-expense"'),'financeiro com ação de despesa');
const indexHTML=fs.readFileSync(path.join(project,'index.html'),'utf8');
assert.match(indexHTML,/property="og:image"[^>]+social-preview\.png/,'imagem social Open Graph');
assert.match(indexHTML,/site\.webmanifest/,'manifest PWA');
assert.match(indexHTML,/pwa\.js/,'script de instalação');
assert.match(indexHTML,/calendar-ui\.js/,'script de calendário');
assert.match(indexHTML,/time-ui\.js/,'script de horário');
assert.match(indexHTML,/pdf\.js/,'gerador PDF direto');
assert.equal((indexHTML.match(/src="\.\/pdf\.js"/g)||[]).length,1,'PDF carregado apenas uma vez');
assert.equal((indexHTML.match(/src="\.\/time-ui\.js"/g)||[]).length,1,'horário carregado apenas uma vez');
const manifest=JSON.parse(fs.readFileSync(path.join(project,'site.webmanifest'),'utf8'));
assert.equal(manifest.display,'standalone');
for(const asset of [
 'assets/brand-icon.svg','assets/social-preview.png','assets/favicon-32.png',
 'assets/icon-192.png','assets/icon-512.png','assets/icon-maskable-512.png','assets/apple-touch-icon.png'
])assert.ok(fs.existsSync(path.join(project,asset)),'arquivo necessário: '+asset);
const css=fs.readFileSync(path.join(project,'styles.css'),'utf8');
assert.match(css,/image-uploader input\[type=file\]\.file-hidden/,'arquivo nativo oculto');
assert.match(css,/picker-month-grid/,'calendário mensal do estúdio');
assert.match(css,/body\.modal-open/,'trava de rolagem do fundo');
assert.match(css,/\.mobile-week-sticky\s*\{/,'faixa sticky de dias');
assert.match(css,/position:sticky;/,'sticky position no celular');
assert.match(css,/\.time-trigger/,'seletor de hora personalizado');
assert.match(css,/\.field input\[type="checkbox"\]/,'checkbox personalizado');
assert.ok(css.includes('.mobile-top .brand .brand-mark'),'borboleta acessível no topo mobile');
assert.ok(css.includes('display:block!important'),'ícone visível mesmo com regra anterior de ocultação');
const forms=fs.readFileSync(path.join(project,'forms.js'),'utf8');
assert.match(forms,/case 'install-app'/,'ação instalar');
assert.match(forms,/case 'choose-image'/,'ação escolher foto');
assert.match(forms,/case 'edit-payment'/,'editar recebimento');
assert.match(forms,/case 'void-payment'/,'excluir recebimento com auditoria');
assert.match(forms,/case 'void-expense'/,'excluir despesas com auditoria');
assert.match(forms,/case 'delete-appt'/,'excluir agendamento');
assert.match(forms,/P\.generatePDF\(\)/,'download direto do PDF');
assert.doesNotMatch(forms,/\.print\(\)/,'não deve abrir impressão');
for(const name of ['street','number','neighborhood','city','state','complement']){
 assert.ok(forms.includes(name),'campo de endereço: '+name);
}
assert.ok(P.clientsPage().includes('Lavras/MG')===false,'listagem ainda vazia antes de incluir cliente');
assert.doesNotMatch(forms,/type="date"/,'sem campos nativos de data nos formulários');

assert.ok(P.agendaPage().includes('week-calendar') || P.agendaMode==='dia','agenda semanal com grade proporcional');
P.agendaMode='semana';
P.page='agenda';
const stickyHTML=P.agendaPage();
assert.match(stickyHTML,/id="mobile-week-sticky"/,'dias da semana fixos na agenda mobile');
assert.match(stickyHTML,/id="week-sticky-scroll"/,'faixa de dias com rolagem sincronizada');
assert.match(stickyHTML,/id="week-calendar-grid"/,'grade semanal com identificador para sincronização');
assert.equal((stickyHTML.match(/data-action="select-day"/g)||[]).length,14,'sete dias no desktop e sete na faixa fixa do mobile');
const captures={};
function scrollingElement(){return {scrollLeft:0,clientWidth:390,addEventListener(type,fn){this[type]=fn;}};}
const fakeGrid=scrollingElement(),fakeDays=scrollingElement(),fakeStrip={style:{}};
nodes['week-calendar-grid']=fakeGrid;
nodes['week-sticky-scroll']=fakeDays;
nodes['mobile-week-sticky']=fakeStrip;
document.querySelector=()=>({getBoundingClientRect:()=>({height:73})});
P.setupAgendaSticky();
assert.equal(fakeStrip.style.top,'73px','faixa fixa respeita altura da logo');
fakeGrid.scrollLeft=250;fakeGrid.scroll();
assert.equal(fakeDays.scrollLeft,250,'cabeçalho acompanha a grade horizontal');
fakeDays.scrollLeft=105;fakeDays.scroll();
assert.equal(fakeGrid.scrollLeft,105,'grade acompanha a faixa horizontal');
delete nodes['week-calendar-grid'];delete nodes['week-sticky-scroll'];delete nodes['mobile-week-sticky'];
P.agendaMode='dia';P.page='inicio';

const oldClient={name:'Cadastro anterior',address:'Avenida Antiga, 50'};
assert.equal(P.formatAddress(oldClient),'Avenida Antiga, 50','endereço antigo continua acessível');
const c={id:'cliente-ficticia',name:'Cliente Fictícia',cpf:'52998224725',
  street:'Rua Exemplo',number:'100',neighborhood:'Centro',city:'Lavras',state:'MG',
  complement:'Sala 2',address:'Rua Exemplo, 100'};
assert.equal(P.formatAddress(c),'Rua Exemplo, 100, Sala 2 - Centro - Lavras/MG','endereço estruturado e bem formatado');
P.db.clients.push(c);
assert.ok(P.clientsPage().includes('Lavras/MG'),'listagem mostra endereço formatado');
c.phone='35999998888';
assert.ok(P.clientsPage().includes('(35) 99999-8888'),'listagem deve aplicar máscara');

const a={
  id:'agendamento-teste',clientId:c.id,serviceId:'serv_1',
  serviceName:'Alongamento Completo',basePrice:185,serviceMinutes:90,
  addons:[{id:'addon_4',name:'Francesinha',price:30,qty:1,minutes:15}],
  date:P.today(),time:'10:00',status:'confirmado'
};
P.db.appointments.push(a);
assert.equal(P.total(a),215);
assert.equal(P.duration(a),105);
assert.equal(P.overlap(a.date,'10:30',30),true,'conflito');
assert.equal(P.overlap(a.date,'12:00',30),false,'sem conflito');
P.db.services[0].price=240;
assert.equal(P.total(a),215,'preço contratado não muda com catálogo');

a.status='concluido';a.finalTotal=215;a.snapshot=P.snapshot(a);
P.receive(a,120,'Pix',a.date);
assert.equal(P.remaining(a),95);
P.receive(a,95,'Dinheiro',a.date);
assert.equal(P.remaining(a),0);
assert.equal(P.summaryFor(P.monthKey(a.date)).received,215);
assert.equal(P.db.payments.length,2,'dois pagamentos separados');
assert.equal(P.db.payments[0].snapshot.cpf,c.cpf,'CPF preservado');
assert.equal(P.db.payments[0].snapshot.address,P.formatAddress(c),'endereço estruturado no lançamento');
assert.ok(P.financePage().includes('data-action="edit-payment"'),'financeiro exibe editar recebimento');
assert.ok(P.financePage().includes('data-action="void-payment"'),'financeiro exibe excluir recebimento');
const pdf=P.generatePDF();
assert.ok(pdf.pages>=1,'PDF tem pelo menos uma página');
assert.ok(pdf.size>1400,'PDF deve conter estrutura e lançamentos');
assert.ok(downloads.some(name=>name.endsWith('.pdf')),'PDF baixado sem abrir impressora');
assert.ok(lastPdfBlob,'PDF como Blob válido');
P.db.payments[0].voided=true;
P.auditFinance('recebimento','excluido',P.db.payments[0].id,{amount:120},{voided:true},'Teste');
assert.equal(P.paid(a.id),95,'recebimento estornado sai do saldo');
assert.equal(P.summaryFor(P.monthKey(a.date)).received,95,'estorno sai do financeiro');
assert.equal(P.remaining(a),120,'valor estornado volta a receber');
assert.ok(P.db.auditLog.some(log=>log.action==='excluido'),'auditoria de exclusão preservada');
P.db.expenses.push({id:'expense-test',title:'Material fictício',date:P.today(),amount:35,method:'Pix',category:'Materiais'});
assert.equal(P.summaryFor(P.monthKey(a.date)).spent,35,'despesa registrada entra no saldo');
P.db.expenses[0].voided=true;
assert.equal(P.summaryFor(P.monthKey(a.date)).spent,0,'despesa excluída sai do saldo');

P.save();
assert.ok(storage.get(P.key).includes('cliente-ficticia'),'persistência local');

console.log('PASSOU: agenda, horário, modal, financeiro com auditoria, exclusões, PDF direto, PWA e persistência.');
