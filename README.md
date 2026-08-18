# ContabilHoteisFrontEnd

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.4.

## API configuration

As chamadas à API usam a variável `apiUrl` definida em `src/environments/`:

- `environment.development.ts` aponta para `/api`, que é redirecionado pelo dev server via `proxy.conf.json` (ajuste o `target` para a URL real do backend).
- `environment.ts` (produção) deve apontar diretamente para a URL da API em produção.

O `ApiService` em `src/app/core/services/api.service.ts` centraliza as chamadas HTTP (`get`, `post`, `put`, `delete`) usando essa base de URL.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

>quando você tiver a URL real da API, é só trocar apiUrl em environment.development.ts/environment.ts e o target em proxy.conf.json
