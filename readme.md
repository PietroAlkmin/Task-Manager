# Task-It! - Gerenciador de Tarefas

Task-It! é um gerenciador de tarefas voltado para estudantes e profissionais que buscam organizar suas atividades diárias de forma simples e eficiente. O sistema permite a criação de tarefas, definição de prazos e organização por prioridade.

## Requisitos

- Node.js (versão 14.x ou superior)
- PostgreSQL (versão 12.x ou superior)

## Instalação

1. **Clonar o repositório:**

```bash
   git clone https://github.com/seu-usuario/seu-projeto.git
   cd seu-projeto
```

2. **Instalar as dependências:**

```bash
npm install
```

3. **Configurar o arquivo `.env`:**

Renomeie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente necessárias, como as configurações do banco de dados PostgreSQL.


Configuração do Banco de Dados
------------------------------

1. **Criar banco de dados:**

    Crie um banco de dados PostgreSQL com o nome especificado no seu arquivo `.env`.

2. **Executar o script SQL de inicialização:**

```bash
npm run init-db
```

Isso criará a tabela `users` no seu banco de dados PostgreSQL com UUID como chave primária e inserirá alguns registros de exemplo.


Funcionalidades
---------------

* **Padrão MVC:** Estrutura organizada em Model, View e Controller.
* **PostgreSQL:** Banco de dados relacional utilizado para persistência dos dados.
* **UUID:** Utilização de UUID como chave primária na tabela `users`.
* **Scripts com `nodemon`:** Utilização do `nodemon` para reiniciar automaticamente o servidor após alterações no código.
* **Testes:** Inclui estrutura básica para testes automatizados.

Scripts Disponíveis
-------------------

* `npm start`: Inicia o servidor Node.js.
* `npm run dev`: Inicia o servidor com `nodemon`, reiniciando automaticamente após alterações no código.
* `npm run test`: Executa os testes automatizados.
* `npm run test:coverage`: Executa os testes e gera um relatório de cobertura de código.

Estrutura de Diretórios
-----------------------

* **`config/`**: Configurações do banco de dados e outras configurações do projeto.
* **`controllers/`**: Controladores da aplicação (lógica de negócio).
* **`models/`**: Modelos da aplicação (definições de dados e interações com o banco de dados).
* **`routes/`**: Rotas da aplicação.
* **`tests/`**: Testes automatizados.
* **`views/`**: Views da aplicação (se aplicável).

Contribuição
------------

Contribuições são bem-vindas! Sinta-se à vontade para abrir um issue ou enviar um pull request.

Licença
-------

Este projeto está licenciado sob a Licença MIT.

