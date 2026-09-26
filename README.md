# Frontend — gestão financeira para hotéis

Interface Angular conectada à API Spring Boot na pasta irmã `Contabil-hoteis`. Leia o `README.md` da raiz do pacote para o passo a passo completo.

Requer Node.js 22.22.3 ou superior, ou Node.js 24.15.0 ou superior. Instale as dependências e inicie:

```bash
npm ci
npm start
```

Acesse `http://localhost:4200` e entre com o e-mail e a senha do administrador criado pelo backend. `proxy.conf.json` encaminha `/api` para `http://localhost:8080`, então o backend deve estar em execução nessa porta. Login e demais alterações usam sessão HTTP e token CSRF.

No menu **Usuários**, o administrador pode criar logins de gerente e caixa com senhas individuais. O gerente vê fluxo de caixa, pagamentos e contas e fechamento de caixa. O caixa vê somente o fluxo e pode criar e editar lançamentos; gerente e administrador também podem excluir. A permissão é verificada novamente no backend.

Para compilar, execute `npm run build`. Em hospedagem de produção, sirva o build do Angular com fallback para `index.html` e configure o servidor web para encaminhar `/api` ao backend na mesma origem. `src/environments/environment.ts` usa `/api`.

Reservas, hóspedes, fluxo de caixa, faturamento, pagamentos, impostos, suprimentos, relatórios e fechamento são lidos da API. A página de pagamentos resume os lançamentos por forma de pagamento; não realiza cobrança nem conciliação bancária. Os valores de faturamento dependem dos lançamentos de receita feitos no fluxo de caixa. Suprimentos em dinheiro não entram no faturamento; são somados apenas ao valor esperado no fechamento. As alíquotas iniciais são exemplos configuráveis e devem ser conferidas com o contador.
