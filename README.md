# Pérola Leite Studio

Protótipo administrativo mobile-first para a nail designer Pérola Leite Studio.

## Estado do projeto

- **Branch de testes:** `desenvolvimento`.
- **Branch de produção:** `main` (não alterada nesta etapa).
- **Dados:** somente no `localStorage` do navegador. Não há backend, autenticação real ou sincronização entre aparelhos.
- **Hospedagem de testes:** GitHub Pages configurado em **Deploy from a branch**, branch **desenvolvimento**, pasta **/(root)**. O workflow GitHub Actions executa apenas os testes de sintaxe e regras de negócio.
- **Design:** off-white, nude, rosé suave e dourado. A logomarca dourada exibida nesta versão é uma representação tipográfica temporária, até integrar o arquivo original.

## Funcionalidades do protótipo

1. Visão geral com indicadores da agenda e dos recebimentos.
2. Agenda diária e semanal, horário ocupado, confirmação, remarcação, cancelamento, conclusão e bloqueio de horário.
3. Cadastro de clientes com nome, CPF validado, telefone e endereço, busca por nome ou CPF.
4. Cadastro, edição, desativação e exclusão condicionada ao histórico dos serviços e complementos.
5. Foto opcional em serviços e complementos com upload, compressão, prévia e remoção (armazenamento local limitado).
6. Complementos com valor, duração extra, quantidade e vínculo a serviços.
7. Conclusão de atendimento com pagamento integral, parcial, misto ou pendente.
8. Financeiro separado em recebimentos, contas a receber e despesas.
9. Relatório mensal com resumo, detalhes cronológicos, nome, CPF, endereço, serviço, formas de pagamento, datas e valores.
10. Exportação CSV, visualização para imprimir/salvar PDF e backup JSON.

## Como testar

Com o repositório aberto na branch `desenvolvimento`, rode um servidor HTTP local para evitar restrições do navegador ao abrir arquivos diretamente:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`. Após configurar Settings > Pages > Deploy from a branch > desenvolvimento > /(root) > Save, a publicação do GitHub Pages ocorrerá pela branch, de forma independente dos testes do Actions.

Fluxo sugerido: cadastre uma **cliente fictícia**, agende o serviço e um complemento, abra o atendimento pela agenda, conclua e registre o recebimento. Confira depois Financeiro e Relatórios. Teste pagamentos em duas formas e um saldo pendente.

Para validar sintaxe e regras essenciais, com Node 22:

```bash
node --check data.js
node --check app.js
node --check forms.js
node tests/smoke.js
```

## Proteção de dados e limitações importantes

**Esta é uma versão de demonstração sem controle de acesso.** Não cadastre pessoas reais nem informações confidenciais. CPF, endereço e lançamentos ficam neste navegador, podem ser vistos por qualquer pessoa com acesso ao aparelho/perfil e podem desaparecer ao limpar os dados do navegador. Não são compartilhados automaticamente entre dispositivos.

O navegador pode limitar a quantidade de fotos e registros. Faça backups com frequência em Configurações. Para uso real será necessário implementar autenticação, autorização no backend, banco persistente (por exemplo, Firebase), políticas de acesso, armazenamento seguro de imagens, backups e critérios de LGPD.

A exportação PDF usa o recurso nativo de impressão do navegador (escolha “Salvar como PDF”), e não substitui nota fiscal ou escrituração.

**Não utilizar Work para o frontend.** O Work foi reservado pelo usuário exclusivamente para uma eventual etapa de banco de dados.

## Próximos passos

Validar os fluxos no celular e no computador, revisar o acabamento visual, integrar a logo original na cor dourada, definir a persistência segura e só depois levar a versão estável para a `main`.
