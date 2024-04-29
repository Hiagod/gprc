CREATE TABLE IF NOT EXISTS professor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    token VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS turma (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    professor_id INTEGER REFERENCES professor(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS aluno (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    foto VARCHAR(100) NOT NULL,
    turma_id INTEGER REFERENCES turma(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS presenca (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id),
    turma_id INTEGER REFERENCES turma(id),
    data DATE,
    presente BOOLEAN
);
