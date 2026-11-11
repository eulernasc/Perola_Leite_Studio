const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const project = path.join(__dirname, '..');
const nodes = {
  app: {innerHTML:''},
  'page-root': {innerHTML:''},
  'modal-root': {innerHTML:''},
  'toast-root': {innerHTML:''}
};
const storage = new Map();
const document = {
  getElementById: id => nodes[id] || null,
  addEventListener: () => {},
  querySelectorAll: () => []
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
  URL,
};
vm.createContext(ctx);
['data.js','app.js','forms.js'].forEach(name => {
  vm.runInContext(fs.readFileSync(path.join(project,name),'utf8'),ctx,{filename:name});
});
const P = ctx.window.PL;
assert.equal(P.db.services.length,7,'sete serviços iniciais');
assert.equal(P.db.addons.length,5,'cinco complementos iniciais');
assert.equal(P.cpfValid('529.982.247-25'),true);
assert.equal(P.cpfValid('111.111.111-11'),false);
P.navItems.forEach(([page]) => {
  P.page=page;
  P.render();
  assert.ok(nodes.app.innerHTML.length > 1500,page+' deve renderizar');
});
assert.ok(nodes.app.innerHTML.includes('Modo local')||P.page==='ajustes');
assert.ok(P.reportsPage().includes('CPF'));
assert.ok(P.reportsPage().includes('endereço'));

const c={id:'cliente-ficticia',name:'Cliente Fictícia',cpf:'52998224725',address:'Rua Exemplo, 100'};
P.db.clients.push(c);
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
assert.equal(P.db.payments[0].snapshot.address,c.address,'endereço preservado');
P.save();
assert.ok(storage.get(P.key).includes('cliente-ficticia'),'persistência local');

console.log('PASSOU: 7 telas, CPF, serviços, complementos, preços históricos, conflito, pagamentos, relatórios e armazenamento local.');
