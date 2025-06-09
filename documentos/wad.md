# Web Application Document - Projeto Individual - Módulo 2 - Inteli

**_Os trechos em itálico servem apenas como guia para o preenchimento da seção. Por esse motivo, não devem fazer parte da documentação final._**

## Task-It!


#### PIETRO ALKMIN 

## Sumário

1. [Introdução](#c1)  
2. [Visão Geral da Aplicação Web](#c2)  
3. [Projeto Técnico da Aplicação Web](#c3)  
4. [Desenvolvimento da Aplicação Web](#c4)  
5. [Referências](#c5)  

<br>

## <a name="c1"></a>1. Introdução (Semana 01)

O projeto será o desenvolvimento de um Gerenciador de Tarefas, ele será voltado para estudantes e profissionais que buscam organizar suas atividades diárias de forma simples e eficiente. O sistema permitirá a criação de tarefas, definição de prazos e organização por prioridade. O objetivo é facilitar o gerenciamento de rotinas e aumentar a produtividade dos usuários.

---

## <a name="c2"></a>2. Visão Geral da Aplicação Web

### 2.1. Personas (Semana 01)

<div align="center">
  <sub>FIGURA 1 - Persona </sub><br>
  <img src= "../assets/Persona.png" width="100%"
  alt="Persona"><br>
  <sup>Fonte: Material produzido pelo autor, 2025</sup>
</div>

### 2.2. User Stories (Semana 01)

**Principais users storys:**

US01

Como estudante universitário, quero criar uma nova tarefa com título, descrição e prazo, para que eu possa organizar melhor minhas atividades acadêmicas.

US02

Como estudante universitário, quero visualizar minhas tarefas ordenadas por prioridade, para que eu saiba quais atividades devo realizar primeiro.

US03

Como estudante universitário, quero receber notificações antes do vencimento das tarefas, para que eu não perca prazos importantes.

**Análise INVEST da US01:**

Como estudante universitário, quero criar uma nova tarefa com título, descrição e prazo, para que eu possa organizar melhor minhas atividades acadêmicas.


**Justificativa:**

**I – Independente -**	A criação de tarefas é independente de outras funcionalidades, como listagem ou edição.

**N – Negociável -** A forma de criação pode ser discutida: com campos obrigatórios, opcionais, ou até inserção rápida.

**V – Valiosa -**	É fundamental para o funcionamento do sistema, pois sem tarefas não há o que organizar.

**E – Estimável	-** O esforço para implementar a criação de tarefas pode ser estimado facilmente pela equipe.

**S – Pequena -** A ação de criar uma tarefa é pequena e específica, focando em poucos campos (título, descrição e prazo).

**T – Testável	-** Pode ser testada criando uma nova tarefa e verificando se ela foi armazenada corretamente no sistema.


---

## <a name="c3"></a>3. Projeto da Aplicação Web

### 3.1. Modelagem do banco de dados  (Semana 3)

O banco de dados do sistema **Task-It!** foi projetado para suportar a organização e visualização de tarefas em um ambiente acadêmico, com foco em produtividade, categorização, agendamento e rastreamento de ações do usuário.

#### 🔗 Modelo Relacional

A imagem a seguir representa o modelo relacional do sistema, com todas as entidades principais e seus relacionamentos:

![modelo-banco](../assets/Modelo-Banco.pdf)

As principais entidades são:
- **users**: armazena os dados dos usuários do sistema.
- **tasks**: representa as tarefas criadas pelos usuários.
- **categories**: categorias atribuídas às tarefas (ex: estudos, trabalho).
- **tags**: etiquetas personalizadas para classificar tarefas.
- **checklists**: itens de checklist relacionados a cada tarefa.
- **anotacoes**: anotações adicionais que podem ser feitas dentro de uma tarefa.
- **log_atividades**: registra ações realizadas nas tarefas (criação, edição, conclusão).
- **tarefa_tags**: tabela associativa para o relacionamento N:N entre tarefas e tags.

#### Modelo Físico (SQL)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  vencimento DATE,
  prioridade VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pendente',
  recorrente VARCHAR(20),
  data_hora_inicio DATETIME,
  data_hora_fim DATETIME,
  lembrete_minutos INT,
  user_id INT NOT NULL,
  categoria_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (categoria_id) REFERENCES categories(id)
);

CREATE TABLE checklists (
  id SERIAL PRIMARY KEY,
  conteudo VARCHAR(255) NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  tarefa_id INT NOT NULL,
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id)
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tarefa_tags (
  tarefa_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (tarefa_id, tag_id),
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE TABLE anotacoes (
  id SERIAL PRIMARY KEY,
  conteudo TEXT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tarefa_id INT NOT NULL,
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id)
);

CREATE TABLE log_atividades (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50),
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tarefa_id INT NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
### 3.1.1 BD e Models (Semana 5)

O sistema Task-It! implementa um conjunto de Models que representam as entidades do banco de dados e encapsulam a lógica de negócios. O principal Model implementado é:

#### Task Model
O Model `Task` (localizado em `models/Task.js`) é responsável por gerenciar todas as operações relacionadas às tarefas no sistema. Ele implementa os seguintes métodos:

- `getAll()`: Retorna todas as tarefas ordenadas por data de criação
- `getById(id, userId)`: Busca uma tarefa específica pelo ID e usuário
- `create(taskData, userId)`: Cria uma nova tarefa no banco de dados
- `update(id, taskData, userId)`: Atualiza uma tarefa existente
- `delete(id, userId)`: Remove uma tarefa do banco de dados

O Model utiliza o pool de conexões do PostgreSQL configurado em `config/db.js` para realizar as operações no banco de dados de forma eficiente e segura.

### 3.2. Arquitetura (Semana 5)

A aplicação Task-It! segue a arquitetura MVC. O diagrama da arquitetura pode ser visualizado no [Mermaid Live Editor]
https://bit.ly/3SlqL2I


#### Componentes da Arquitetura

1. **Model (Camada de Dados)**
   - Implementado em `models/Task.js`
   - Gerencia a lógica de negócios e operações no banco
   - Utiliza pool de conexões PostgreSQL
   - Implementa métodos CRUD para tarefas

2. **View (Camada de Apresentação)**
   - Templates EJS em `views/pages` e `views/components`
   - Renderiza a interface do usuário
   - Implementa interatividade com JavaScript
   - Exibe dados dinâmicos das tarefas

3. **Controller (Camada de Controle)**
   - Implementado em `controllers/taskController.js`
   - Gerencia o fluxo de dados
   - Processa requisições HTTP
   - Coordena Model e View

#### Fluxo de Dados

1. O usuário interage com a interface no navegador
2. O Router direciona a requisição para o Controller apropriado
3. O Controller processa a requisição e aciona o Model
4. O Model executa operações no banco PostgreSQL
5. O Controller recebe os dados do Model
6. A View é atualizada com os novos dados
7. O resultado é enviado de volta ao navegador

Esta arquitetura permite uma clara separação de responsabilidades, facilitando a manutenção e escalabilidade do sistema.

### 3.3. Wireframes (Semana 03)

<div align="center">
  <sub>FIGURA 2 - Tela Principal </sub><br>
  <img src= "../assets/Dashboard.png" width="100%"
  alt="Dashboard"><br>
  <sup>Fonte: Material produzido pelo autor, 2025</sup>
</div>

**Aqui uma breve descrição da tela principal:**

A tela principal do Task-It! é um dashboard funcional que exibe:

- **Cabeçalho** com logo, notificações e perfil do usuário
- **Menu lateral** com navegação, categorias e tags
- **Barra de busca** e botão para adicionar novas tarefas
- **Visão geral** com cards de estatísticas rápidas
- **Tarefas organizadas por prioridade** (alta, média, baixa)


Cada tarefa mostra título, descrição breve, prazo, categoria e tags relevantes. 
O design prioriza a visualização clara das tarefas mais importantes, permitindo 
que estudantes e profissionais identifiquem rapidamente o que precisa ser feito primeiro.

<div align="center">
  <sub>FIGURA 3 - Criação/Edição de tarefas </sub><br>
  <img src= "../assets/Tarefas.png" width="100%"
  alt="Tela de tarefas"><br>
  <sup>Fonte: Material produzido pelo autor, 2025</sup>
</div>

 **Tela de Criação/Edição de Tarefas - US01**

A tela de criação de tarefas atende à US01 através de:

- Campo para título da tarefa
- Área para descrição detalhada
- Seletor de data/hora para o prazo
- Opções complementares: prioridade, categoria, tags e checklist
- Botões de "Cancelar" e "Criar Tarefa"


Esta interface permite que estudantes organizem suas atividades acadêmicas de forma rápida e estruturada, com todos os campos necessários para um gerenciamento eficiente.

### 3.4. Guia de estilos (Semana 05)

#### Cores
- **Primária**: #8B3DFF (Roxo) - Usado em botões principais, links e elementos de destaque
- **Secundária**: #FFFFFF (Branco) - Usado em cards e elementos de interface
- **Fundo**: #FAFAFA (Cinza muito claro) - Cor de fundo principal
- **Texto**: #2D2D2D (Cinza escuro) - Texto principal
- **Status**:
  - Alta Prioridade: #FFE2E2 (Vermelho claro) com texto #FF3D3D
  - Média Prioridade: #FFF8E2 (Amarelo claro) com texto #FFB930
  - Baixa Prioridade: #E8F1FF (Azul claro) com texto #3D8BFF

#### Tipografia
- **Título Principal**: Inter Bold, 24px
- **Subtítulos**: Inter Medium, 18px
- **Texto**: Inter Regular, 14px
- **Botões**: Inter Semi-Bold, 16px

#### Componentes
1. **Botões**
   - Primário: Fundo roxo (#8B3DFF), texto branco, border-radius: 8px
   - Secundário: Fundo branco, texto roxo, borda roxa (#8B3DFF)
   - Hover: Opacidade 0.9

2. **Cards**
   - Background: Branco
   - Border-radius: 12px
   - Shadow: 0px 4px 12px rgba(0,0,0,0.1)
   - Padding: 16px

3. **Campos de Input**
   - Border-radius: 6px
   - Border: 1px solid #E1E4E8
   - Padding: 12px
   - Focus: Borda roxa (#8B3DFF)

4. **Tags**
   - Border-radius: 16px
   - Padding: 4px 12px
   - Cores variadas com opacidade 0.2
   - Texto na cor principal da tag

### 3.5. Protótipo de alta fidelidade (Semana 05)

O protótipo de alta fidelidade do Task-It! foi desenvolvido para demonstrar a experiência final do usuário, com atenção especial aos detalhes visuais e interações.

<div align="center">
  <sub>FIGURA 4 - Dashboard em Alta Fidelidade</sub><br>
  <img src="../assets/Dashboard_Alta_Fidelidade.png" width="100%" alt="Dashboard em Alta Fidelidade"><br>
  <sup>Fonte: Material produzido pelo autor, 2025</sup>
</div>

O dashboard em alta fidelidade apresenta uma interface moderna e limpa, com cards bem definidos para as tarefas, estatísticas claras e um sistema de navegação intuitivo.

<div align="center">
  <sub>FIGURA 5 - Tela de Calendário</sub><br>
  <img src="../assets/Calendário_Alta_Fidelidade.png" width="100%" alt="Calendário em Alta Fidelidade"><br>
  <sup>Fonte: Material produzido pelo autor, 2025</sup>
</div>

A visualização em calendário permite aos usuários ter uma visão temporal clara de suas tarefas, com indicadores visuais de prioridade e status.

<div align="center">  <sub>FIGURA 6 - Tela de Criação de Tarefas em Alta Fidelidade</sub><br>
  <img src="../assets/Task_Creation.png" width="100%" alt="Tela de Criação de Tarefas"><br>
  <sup>Fonte: Material produzido pelo autor, 2025</sup>
</div>

A tela de criação de tarefas em alta fidelidade apresenta um formulário intuitivo com todos os campos necessários: título, descrição, data/hora, prioridade, categoria, tags e checklist. O design limpo e organizado torna o processo de criação de tarefas simples e eficiente, atendendo diretamente à US01.

### 3.6. WebAPI e endpoints (Semana 05)

O sistema Task-It! implementa uma API RESTful para gerenciamento de tarefas. Abaixo estão documentados os principais endpoints:

#### **Endpoints de Tarefas**

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET | `/tarefas` | Lista todas as tarefas | - |
| GET | `/tarefas/:id` | Busca tarefa específica | `id` (path) |
| POST | `/tarefas` | Cria nova tarefa | `title`, `description`, `due_date`, `priority` (body) |
| PUT | `/tarefas/:id` | Atualiza tarefa | `id` (path), dados da tarefa (body) |
| DELETE | `/tarefas/:id` | Remove tarefa | `id` (path) |

#### **Endpoints das Tabelas (Consulta)**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Lista todos os usuários |
| GET | `/api/categories` | Lista todas as categorias |
| GET | `/api/tasks` | Lista todas as tarefas |
| GET | `/api/tags` | Lista todas as tags |
| GET | `/api/checklists` | Lista todos os checklists |
| GET | `/api/notes` | Lista todas as anotações |

#### **Estrutura de Dados**

**Task Object:**
```json
{
  "id": 1,
  "titulo": "Estudar para prova",
  "descricao": "Revisar capítulos 1-5",
  "vencimento": "2025-06-15",
  "prioridade": "alta",
  "status": "pendente",
  "user_id": 1,
  "categoria_id": 2
}
```

#### **Códigos de Resposta**
- `200 OK`: Operação realizada com sucesso
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

### 3.7 Interface e Navegação (Semana 07)

O frontend do Task-It! foi desenvolvido utilizando **EJS** como template engine, **CSS3** para estilização e **JavaScript** vanilla para interatividade. O sistema segue uma arquitetura MVC com renderização server-side.

#### **Principais Telas Implementadas**

**1. Dashboard Principal**
<div align="center">
  <sub>FIGURA 7 - Dashboard Implementado</sub><br>
  <img src="../assets/Dashboard_Alta_Fidelidade.png" width="100%" alt="Dashboard Implementado"><br>
  <sup>Tela principal com listagem de tarefas organizadas por prioridade</sup>
</div>

- Exibição de tarefas em cards coloridos por prioridade
- Filtros por status (pendente, concluída)
- Botão para adicionar novas tarefas
- Interface responsiva

**2. Formulário de Criação/Edição**
<div align="center">
  <sub>FIGURA 8 - Formulário de Tarefas</sub><br>
  <img src="../assets/Task_Creation.png" width="100%" alt="Formulário de Tarefas"><br>
  <sup>Interface para criação e edição de tarefas</sup>
</div>

- Campos: título, descrição, data de vencimento, prioridade
- Validação client-side com JavaScript
- Feedback visual para erros e sucessos

#### **Funcionalidades JavaScript Implementadas**

```javascript
// Exemplo de código para criação de tarefa
async function createTask(taskData) {
    try {
        const response = await fetch('/tarefas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            fetchTasks(); // Recarrega a lista de tarefas
        }
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
    }
}
```

#### **Navegação e UX**
- **Menu lateral** com links principais (implementado em `sidebar.ejs`)
- **Header responsivo** com navegação (implementado em `header.ejs`)
- **Modais** para confirmação de exclusão
- **Feedback visual** para ações do usuário
- **Loading states** durante operações assíncronas

#### **Arquivos de Estilo**
- `main.css`: Estilos globais e layout
- `dashboard.css`: Estilos específicos do dashboard
- `tasks.css`: Estilos para formulários e cards de tarefas
- `components.css`: Componentes reutilizáveis
- `animations.css`: Animações e transições

#### **Responsividade**
- Layout adaptável para desktop, tablet e mobile
- Menu colapsável em telas menores
- Cards reorganizados em colunas únicas no mobile

---

## <a name="c4"></a>4. Desenvolvimento da Aplicação Web (Semana 8)

### 4.1 Demonstração do Sistema Web (Semana 8)

#### **VIDEO:** [Link do vídeo será inserido aqui após gravação]

#### **Sistema Implementado**

O Task-It! foi desenvolvido como uma aplicação web completa para gerenciamento de tarefas, seguindo a arquitetura MVC e utilizando as seguintes tecnologias:

**Stack Tecnológico:**
- **Backend:** Node.js + Express.js
- **Template Engine:** EJS
- **Banco de Dados:** PostgreSQL
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Arquitetura:** MVC (Model-View-Controller)

#### **Funcionalidades Entregues**

<div align="center">
  <sub>FIGURA 9 - Tela Principal do Sistema</sub><br>
  <img src="../assets/Dashboard_Alta_Fidelidade.png" width="100%" alt="Sistema Final"><br>
  <sup>Interface principal do Task-It! em funcionamento</sup>
</div>

✅ **CRUD Completo de Tarefas**
- Criação de tarefas com título, descrição, prazo e prioridade
- Listagem organizada por prioridade (alta, média, baixa)
- Edição de tarefas existentes
- Exclusão com confirmação

✅ **Interface Responsiva**
- Design adaptável para diferentes dispositivos
- Cards coloridos por prioridade para melhor visualização
- Formulários intuitivos e validados

✅ **Integração com Banco de Dados**
- Persistência de dados em PostgreSQL
- Operações CRUD implementadas via Model
- Queries otimizadas para performance

#### **Fluxo de Uso Demonstrado**

1. **Acesso ao Dashboard:** Visualização das tarefas organizadas por prioridade
2. **Criação de Tarefa:** Preenchimento do formulário com validação
3. **Listagem Dinâmica:** Tarefas exibidas em tempo real após criação
4. **Edição:** Modificação de tarefas existentes
5. **Exclusão:** Remoção com confirmação para evitar acidentes

### 4.2 Conclusões e Trabalhos Futuros (Semana 8)

#### **Pontos Fortes do Projeto**

✅ **Arquitetura Sólida**
- Implementação correta do padrão MVC
- Separação clara de responsabilidades
- Código organizado e manutenível

✅ **Interface Intuitiva**
- Design limpo e funcional
- Experiência do usuário fluida
- Responsividade adequada

✅ **Funcionalidades Core**
- CRUD completo implementado
- Integração eficiente com banco PostgreSQL
- Validações adequadas

#### **Principais Desafios Superados**

🔧 **Configuração do Ambiente**
- Setup inicial do PostgreSQL e conexão com Node.js
- Configuração das variáveis de ambiente

🔧 **Implementação do MVC**
- Estruturação correta dos Controllers e Models
- Gerenciamento de rotas e middlewares

🔧 **Frontend Dinâmico**
- Integração entre EJS templates e JavaScript
- Manipulação do DOM para atualizações em tempo real

#### **Pontos a Melhorar**

⚠️ **Segurança**
- Implementar autenticação de usuários
- Adicionar validação server-side mais robusta
- Sanitização de inputs

⚠️ **Performance**
- Implementar paginação para muitas tarefas
- Otimizar queries do banco de dados
- Adicionar cache quando necessário

#### **Trabalhos Futuros**

🚀 **Funcionalidades Avançadas**
- **Sistema de usuários:** Login/registro com sessões
- **Categorias e tags:** Organização mais detalhada
- **Calendário:** Visualização temporal das tarefas
- **Notificações:** Lembretes antes do vencimento
- **Checklist:** Subtarefas dentro de tarefas principais

🚀 **Melhorias Técnicas**
- **API REST completa:** Transformar em SPA com framework frontend
- **Testes automatizados:** Unit tests e integration tests
- **Deploy:** Configuração para produção (Heroku/Vercel)
- **Mobile:** Desenvolvimento de aplicativo móvel

🚀 **UX/UI**
- **Dark mode:** Tema escuro opcional
- **Drag & drop:** Reorganização de tarefas por arrastar
- **Filtros avançados:** Busca por data, categoria, tags
- **Dashboard analytics:** Estatísticas de produtividade

#### **Aprendizados Principais**

📚 **Técnicos:**
- Domínio da arquitetura MVC em aplicações web
- Integração eficiente entre frontend e backend
- Gerenciamento de banco de dados relacionais

📚 **Soft Skills:**
- Planejamento e organização de projeto
- Resolução de problemas técnicos
- Documentação técnica clara

O projeto Task-It! cumpriu seus objetivos principais de criar um sistema funcional de gerenciamento de tarefas, servindo como base sólida para futuras expansões e melhorias.



## <a name="c5"></a>5. Referências

**Documentação Técnica:**
- Node.js Documentation. Available at: https://nodejs.org/en/docs/
- Express.js Guide. Available at: https://expressjs.com/en/guide/
- PostgreSQL Documentation. Available at: https://www.postgresql.org/docs/
- EJS Template Engine. Available at: https://ejs.co/

**Padrões e Arquitetura:**
- MVC Pattern - Mozilla Developer Network. Available at: https://developer.mozilla.org/en-US/docs/Glossary/MVC
- RESTful API Design Best Practices. Available at: https://restfulapi.net/

**Design e UX:**
- Material Design Guidelines. Available at: https://material.io/design
- Web Content Accessibility Guidelines (WCAG). Available at: https://www.w3.org/WAG/WCAG21/quickref/

---
---
