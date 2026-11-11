(function(){
  'use strict';
  var P=window.PL;
  var WIDTH=842,HEIGHT=595;
  var colors={ink:[.26,.20,.18],gold:[.67,.49,.31],muted:[.57,.48,.44],line:[.91,.85,.80],soft:[.975,.952,.935],green:[.27,.47,.36]};
  function rgb(key){return (colors[key]||colors.ink).map(function(n){return n.toFixed(3);}).join(' ');}
  function safe(s){return String(s==null?'':s).replace(/[\r\n\t]+/g,' ').replace(/[\u2010-\u2015]/g,'-').replace(/[^\u0020-\u00ff]/g,'?').trim();}
  function ps(s){return '('+safe(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')+')';}
  function f(n){return Number(n).toFixed(1);}
  function pdfBytes(binary){var result=new Uint8Array(binary.length);for(var i=0;i<binary.length;i++)result[i]=binary.charCodeAt(i)&255;return result;}
  function wrap(value,width,size){var words=safe(value).split(/\s+/),lines=[],line='';
    var max=Math.max(3,Math.floor(width/(size*.54)));
    words.forEach(function(word){
      if(!word)return;
      while(word.length>max){if(line){lines.push(line);line='';}lines.push(word.slice(0,max));word=word.slice(max);}
      if(!word)return;
      if((line?line.length+1:0)+word.length>max){lines.push(line);line=word;}else line+=(line?' ':'')+word;
    });
    if(line)lines.push(line);
    return lines.length?lines:[''];
  }
  P.generatePDF=function(){
    if(typeof Blob==='undefined'||typeof URL==='undefined'||!URL.createObjectURL){P.toast('Este navegador não suporta o download direto de PDF.','error');return;}
    var month=P.reportMonth,summary=P.summaryFor(month);
    var receipts=summary.payments.slice().sort(function(a,b){return a.date.localeCompare(b.date)||a.createdAt.localeCompare(b.createdAt);});
    var expenses=summary.expenses.slice().sort(function(a,b){return a.date.localeCompare(b.date);});
    var pages=[],page=null,y=0;
    function rect(x,top,w,h,fill){page.push(rgb(fill)+' rg '+f(x)+' '+f(HEIGHT-top-h)+' '+f(w)+' '+f(h)+' re f\n');}
    function line(x,top,w){page.push(rgb('line')+' RG 0.6 w '+f(x)+' '+f(HEIGHT-top)+' m '+f(x+w)+' '+f(HEIGHT-top)+' l S\n');}
    function text(s,x,top,size,bold,key){page.push('BT /'+(bold?'F2':'F1')+' '+f(size)+' Tf '+rgb(key||'ink')+' rg '+f(x)+' '+f(HEIGHT-top)+' Td '+ps(s)+' Tj ET\n');}
    function start(title){
      page=[];pages.push(page);y=42;
      rect(0,0,WIDTH,8,'gold');
      text('PÉROLA LEITE STUDIO',37,35,11,true,'gold');
      text('RELATÓRIO FINANCEIRO | '+P.monthLong(month).toUpperCase(),37,57,16,true,'ink');
      text('Documento gerencial de apoio contábil',37,74,9,false,'muted');
      text('Emitido em '+P.date(P.today()),WIDTH-160,74,9,false,'muted');
      line(37,88,WIDTH-74);
      y=111;
      if(title){text(title,37,y,12,true,'gold');y+=23;}
    }
    function ensure(h,label){if(y+h>HEIGHT-45)start(label||'Continuação');}
    function section(title){
      ensure(35,title);
      text(title,37,y,12,true,'ink');y+=15;
      line(37,y,WIDTH-74);y+=14;
    }
    function metric(label,val,x){rect(x,y,238,59,'soft');text(label,x+12,y+18,9,false,'muted');text(val,x+12,y+42,18,true,'ink');}
    function table(headers,rows,widths){
      var x0=37,total=widths.reduce(function(a,b){return a+b;},0);
      function header(){ensure(26,'Continuação dos lançamentos');rect(37,y,total,24,'soft');var x=x0;headers.forEach(function(h,i){text(h.toUpperCase(),x+5,y+16,7,true,'gold');x+=widths[i];});y+=24;}
      header();
      rows.forEach(function(row){
        var split=row.map(function(s,i){return wrap(s,widths[i]-10,8);});
        var h=Math.max(29,Math.max.apply(null,split.map(function(a){return a.length;}))*11+11);
        if(y+h>HEIGHT-45){start('Continuação dos lançamentos');header();}
        var x=x0;split.forEach(function(lines,i){lines.forEach(function(value,j){text(value,x+5,y+14+j*11,8,false,i===row.length-1?'ink':'muted');});x+=widths[i];});
        y+=h;line(37,y,total);
      });
      y+=13;
    }
    start();
    text('RESUMO MENSAL',37,y,12,true,'gold');y+=13;
    metric('Recebido no mês',P.money(summary.received),37);
    metric('Despesas do mês',P.money(summary.spent),302);
    metric('Saldo do período',P.money(summary.balance),567);
    y+=76;
    section('Recebimentos por forma de pagamento');
    var methods={};
    receipts.forEach(function(p){var method=p.method||'Não informado';methods[method]=(methods[method]||0)+Number(p.amount||0);});
    var methodKeys=Object.keys(methods).sort();
    if(!methodKeys.length){text('Nenhum recebimento no período.',42,y,10,false,'muted');y+=25;}
    else{methodKeys.forEach(function(method){ensure(19,'Recebimentos por forma de pagamento');text(method,42,y,9,false,'ink');text(P.money(methods[method]),290,y,9,true,'green');y+=19;});}
    section('Lançamentos detalhados - um registro por pagamento');
    var rows=receipts.map(function(p){
      var s=p.snapshot||{};
      return [P.date(p.date),P.date(s.serviceDate),s.clientName||'',P.cpfFormat(s.cpf),s.address||'',s.serviceText||'',p.method||'',P.money(p.amount)];
    });
    if(!rows.length){text('Não há pagamentos registrados no período.',42,y,10,false,'muted');y+=27;}
    else table(['Recebido','Atendimento','Cliente','CPF','Endereço','Serviços','Forma','Valor'],rows,[67,70,96,85,143,155,73,79]);
    section('Despesas registradas');
    if(!expenses.length){text('Nenhuma despesa lançada no período.',42,y,10,false,'muted');y+=22;}
    else table(['Data','Descrição','Categoria','Forma','Valor'],expenses.map(function(e){return[P.date(e.date),e.title,e.category,e.method,P.money(e.amount)];}),[86,293,156,131,102]);
    ensure(39,'Observações');
    y+=8;
    text('Relatório auxiliar. Não substitui notas fiscais, recibos ou documentos legalmente obrigatórios.',37,y,8,false,'muted');
    text('Informações pessoais restritas: compartilhar somente com o contador autorizado.',37,y+13,8,false,'muted');
    pages.forEach(function(pg,index){
      pg.push(rgb('line')+' RG 0.5 w 37 32 m '+(WIDTH-37)+' 32 l S\n');
      pg.push('BT /F1 8 Tf '+rgb('muted')+' rg 37 21 Td '+ps('Pérola Leite Studio | Relatório gerencial de '+P.monthLong(month))+' Tj ET\n');
      pg.push('BT /F1 8 Tf '+rgb('muted')+' rg '+(WIDTH-78)+' 21 Td '+ps((index+1)+' / '+pages.length)+' Tj ET\n');
    });
    var objects=['', '<< /Type /Catalog /Pages 2 0 R >>','',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
    var kids=[];
    pages.forEach(function(pg,i){
      var p=5+i*2,stream=p+1,body=pg.join('');
      kids.push(p+' 0 R');
      objects[p]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+WIDTH+' '+HEIGHT+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+stream+' 0 R >>';
      objects[stream]='<< /Length '+body.length+' >>\nstream\n'+body+'endstream';
    });
    objects[2]='<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+pages.length+' >>';
    var bin='%PDF-1.4\n%\xC2\xA3\xC2\xA5\n',offsets=[0];
    for(var j=1;j<objects.length;j++){offsets[j]=bin.length;bin+=j+' 0 obj\n'+objects[j]+'\nendobj\n';}
    var startXref=bin.length;
    bin+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
    for(j=1;j<objects.length;j++)bin+=String(offsets[j]).padStart(10,'0')+' 00000 n \n';
    bin+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+startXref+'\n%%EOF';
    var blob=new Blob([pdfBytes(bin)],{type:'application/pdf'});
    var url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='Perola-Leite-Relatorio-'+month+'.pdf';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},30000);
    P.toast('PDF gerado e enviado para download.');
    return {pages:pages.length,size:blob.size,filename:link.download};
  };
})();