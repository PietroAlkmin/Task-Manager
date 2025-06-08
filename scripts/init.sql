-- =====================================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS TASK-IT!
-- Versão: 2.0 - Corrigida e Padronizada
-- =====================================================

-- Removendo tabelas existentes (ordem correta para evitar conflitos de FK)
DROP TABLE IF EXISTS log_atividades;
DROP TABLE IF EXISTS anotacoes;
DROP TABLE IF EXISTS tarefa_tags;
DROP TABLE IF EXISTS checklists;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE CATEGORIAS
-- =====================================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) DEFAULT '#8B3DFF', -- Cor em hexadecimal para UI
  user_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE TAGS
-- =====================================================
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  cor VARCHAR(7) DEFAULT '#8B3DFF', -- Cor em hexadecimal para UI
  user_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(nome, user_id) -- Evita tags duplicadas por usuário
);

-- =====================================================
-- TABELA DE TAREFAS (CORRIGIDA)
-- =====================================================
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL, -- Corrigido: titulo -> title (consistência com JS)
  description TEXT, -- Corrigido: descricao -> description
  due_date DATE, -- Corrigido: vencimento -> due_date
  priority VARCHAR(20) DEFAULT 'media', -- Corrigido: prioridade -> priority
  status VARCHAR(20) DEFAULT 'pendente',
  recorrente VARCHAR(20),
  data_hora_inicio TIMESTAMP,
  data_hora_fim TIMESTAMP,
  lembrete_minutos INT DEFAULT 0,
  user_id INT NOT NULL,
  category_id INT, -- Corrigido: categoria_id -> category_id
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Campo faltante adicionado
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

  -- Constraints para garantir valores válidos
  CONSTRAINT chk_priority CHECK (priority IN ('baixa', 'media', 'alta')),
  CONSTRAINT chk_status CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  CONSTRAINT chk_recorrente CHECK (recorrente IN ('nenhuma', 'diaria', 'semanal', 'mensal', 'anual'))
);

-- =====================================================
-- TABELA DE CHECKLISTS
-- =====================================================
CREATE TABLE checklists (
  id SERIAL PRIMARY KEY,
  content VARCHAR(500) NOT NULL, -- Corrigido: conteudo -> content, aumentado tamanho
  completed BOOLEAN DEFAULT FALSE, -- Corrigido: concluido -> completed
  task_id INT NOT NULL, -- Corrigido: tarefa_id -> task_id
  ordem INT DEFAULT 1, -- Campo para ordenação dos itens
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA ASSOCIATIVA: TAREFA-TAGS
-- =====================================================
CREATE TABLE task_tags (
  task_id INT NOT NULL, -- Corrigido: tarefa_id -> task_id
  tag_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE ANOTAÇÕES
-- =====================================================
CREATE TABLE anotacoes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL, -- Corrigido: conteudo -> content
  task_id INT NOT NULL, -- Corrigido: tarefa_id -> task_id
  user_id INT NOT NULL, -- Adicionado para rastrear quem fez a anotação
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Corrigido: data -> criado_em
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE LOG DE ATIVIDADES
-- =====================================================
CREATE TABLE log_atividades (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- criada, editada, concluida, cancelada, etc.
  descricao TEXT, -- Descrição detalhada da ação
  task_id INT NOT NULL, -- Corrigido: tarefa_id -> task_id
  user_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Corrigido: data -> criado_em
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Constraint para garantir tipos válidos de log
  CONSTRAINT chk_tipo_log CHECK (tipo IN ('criada', 'editada', 'concluida', 'cancelada', 'reaberta', 'comentario_adicionado'))
);

-- =====================================================
-- DADOS DE EXEMPLO PARA DESENVOLVIMENTO E TESTES
-- =====================================================

-- Inserindo usuário de exemplo
INSERT INTO users (nome, email, senha) VALUES
('Pietro Alkmin', 'pietro@inteli.edu.br', '$2b$10$example.hash.for.password123'),
('João Silva', 'joao@exemplo.com', '$2b$10$example.hash.for.password456'),
('Maria Santos', 'maria@exemplo.com', '$2b$10$example.hash.for.password789');

-- Inserindo categorias de exemplo
INSERT INTO categories (nome, cor, user_id) VALUES
('Estudos', '#FF6B6B', 1),
('Trabalho', '#4ECDC4', 1),
('Pessoal', '#45B7D1', 1),
('Projetos', '#96CEB4', 1),
('Inteli', '#8B3DFF', 1);

-- Inserindo tags de exemplo
INSERT INTO tags (nome, cor, user_id) VALUES
('Urgente', '#FF3D3D', 1),
('Importante', '#FFB930', 1),
('Fácil', '#3D8BFF', 1),
('Difícil', '#FF6B6B', 1),
('Revisão', '#9B59B6', 1),
('Entrega', '#E74C3C', 1);

-- Inserindo tarefas de exemplo
INSERT INTO tasks (title, description, due_date, priority, status, user_id, category_id) VALUES
('Finalizar Projeto Task-It!', 'Implementar todas as funcionalidades do gerenciador de tarefas conforme especificação do WAD', '2025-02-15', 'alta', 'em_andamento', 1, 5),
('Estudar para Prova de Matemática', 'Revisar capítulos 5-8 do livro de Cálculo Diferencial', '2025-02-10', 'alta', 'pendente', 1, 1),
('Reunião com Orientador', 'Discutir progresso do projeto e próximos passos', '2025-02-08', 'media', 'pendente', 1, 2),
('Implementar Sistema de Login', 'Criar autenticação básica com email e senha', '2025-02-12', 'alta', 'pendente', 1, 5),
('Comprar Materiais Escolares', 'Lista: cadernos, canetas, marca-texto', '2025-02-20', 'baixa', 'pendente', 1, 3),
('Criar Protótipo de Alta Fidelidade', 'Finalizar designs no Figma conforme guia de estilos', '2025-02-09', 'media', 'concluida', 1, 5);

-- Inserindo associações tarefa-tag
INSERT INTO task_tags (task_id, tag_id) VALUES
(1, 1), (1, 2), (1, 6), -- Projeto Task-It: Urgente, Importante, Entrega
(2, 1), (2, 4), -- Prova Matemática: Urgente, Difícil
(3, 2), -- Reunião: Importante
(4, 1), (4, 4), -- Sistema Login: Urgente, Difícil
(5, 3), -- Materiais: Fácil
(6, 2), (6, 3); -- Protótipo: Importante, Fácil

-- Inserindo checklists de exemplo
INSERT INTO checklists (content, completed, task_id, ordem) VALUES
('Corrigir inconsistências no banco de dados', true, 1, 1),
('Implementar Models faltantes', false, 1, 2),
('Criar Controllers completos', false, 1, 3),
('Desenvolver Frontend conforme protótipos', false, 1, 4),
('Implementar sistema de autenticação', false, 1, 5),
('Testes e validação final', false, 1, 6);

-- Inserindo anotações de exemplo
INSERT INTO anotacoes (content, task_id, user_id) VALUES
('Lembrar de focar na arquitetura MVC e seguir as especificações do WAD', 1, 1),
('Verificar se todas as User Stories estão sendo atendidas', 1, 1),
('Revisar especialmente os exercícios de derivadas', 2, 1);

-- Inserindo logs de atividade
INSERT INTO log_atividades (tipo, descricao, task_id, user_id) VALUES
('criada', 'Tarefa criada durante inicialização do sistema', 1, 1),
('criada', 'Tarefa criada durante inicialização do sistema', 2, 1),
('criada', 'Tarefa criada durante inicialização do sistema', 3, 1),
('criada', 'Tarefa criada durante inicialização do sistema', 4, 1),
('criada', 'Tarefa criada durante inicialização do sistema', 5, 1),
('criada', 'Tarefa criada durante inicialização do sistema', 6, 1),
('concluida', 'Protótipo finalizado e aprovado', 6, 1);

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_checklists_task_id ON checklists(task_id);
CREATE INDEX idx_log_atividades_task_id ON log_atividades(task_id);
CREATE INDEX idx_log_atividades_user_id ON log_atividades(user_id);

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================
-- Este script cria a estrutura completa do banco de dados Task-It!
-- com todas as correções necessárias para consistência com o código JavaScript
-- e inclui dados de exemplo para desenvolvimento e testes.
--
-- Principais correções realizadas:
-- 1. Padronização de nomes de campos (português -> inglês)
-- 2. Adição de campos faltantes (criado_em, atualizado_em)
-- 3. Melhoria nas constraints e relacionamentos
-- 4. Adição de índices para performance
-- 5. Dados de exemplo realistas para desenvolvimento
