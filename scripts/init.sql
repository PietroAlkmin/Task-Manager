-- Tabela de Usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de Tarefas
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  vencimento DATE,
  prioridade VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pendente',
  recorrente VARCHAR(20),
  data_hora_inicio TIMESTAMP,
  data_hora_fim TIMESTAMP,
  lembrete_minutos INT,
  user_id INT NOT NULL,
  categoria_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (categoria_id) REFERENCES categories(id)
);

-- Tabela de Checklists
CREATE TABLE checklists (
  id SERIAL PRIMARY KEY,
  conteudo VARCHAR(255) NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  tarefa_id INT NOT NULL,
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id)
);

-- Tabela de Tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela Associativa: Tarefa-Tags
CREATE TABLE tarefa_tags (
  tarefa_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (tarefa_id, tag_id),
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- Tabela de Anotações
CREATE TABLE anotacoes (
  id SERIAL PRIMARY KEY,
  conteudo TEXT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tarefa_id INT NOT NULL,
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id)
);

-- Tabela de Log de Atividades
CREATE TABLE log_atividades (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50), -- criada, editada, concluída...
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tarefa_id INT NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (tarefa_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
