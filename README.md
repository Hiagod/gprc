# Sistema de Controle de Presença Estudantil

Este é um sistema desenvolvido em Flask (Python) e React Native para controle de presença estudantil em turmas. O sistema permite o cadastro de professores, turmas, alunos e registros de presença. Os professores podem marcar a presença dos alunos nas turmas em que estão cadastrados.

## Funcionalidades Principais

- Cadastro de professores e associação com turmas
- Cadastro de turmas e associação com alunos
- Cadastro de alunos em turmas específicas
- Marcação de presença dos alunos em cada aula/turma

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em seu ambiente de desenvolvimento:

- Python 3
- Node.js
- React Native CLI
- Docker

Certifique-se de atualizar no código o endereço IP Flutuante a ser utilizado posteriormente por apk, assim como os novos endpoints.

## Configuração e Execução

Para rodar a aplicação em ambientes locais e utilizando Docker, siga os passos abaixo:

### Executando Localmente

1. **Backend (Flask)**:

   a. Navegue até o diretório `backend`:
      ```bash
      cd gpcr-back
      ```

   b. Instale as dependências:
      ```bash
      pip install -r requirements.txt
      ```

   c. Execute a aplicação Flask:
      ```bash
      python app.py
      ```

   O servidor Flask estará rodando em `http://localhost:5000`.

2. **Frontend (React Native)**:

   a. Navegue até o diretório `frontend`:
      ```bash
      cd gpcr
      ```

   b. Instale as dependências:
      ```bash
      npm install
      ```

   c. Execute a aplicação React Native:
      ```bash
      npx react-native run-android
      ```

   Certifique-se de ter um dispositivo Android conectado via USB ou um emulador Android em execução.

### Executando com Docker

1. **Construindo a Imagem Docker**:

   a. No diretório raiz do projeto, onde está localizado o arquivo `Dockerfile`, execute o seguinte comando para construir a imagem Docker:
      ```bash
      docker build -t nome-da-imagem .
      ```

2. **Executando o Contêiner Docker**:

   a. Após a construção da imagem, execute o contêiner Docker com o seguinte comando:
      ```bash
      docker run -p 5000:5000 nome-da-imagem
      ```

   O servidor Flask estará rodando dentro do contêiner Docker, mapeado para a porta `5000` do host local.

## Acessando a Aplicação

Após iniciar o servidor Flask localmente ou com Docker e executar a aplicação React Native, você poderá acessar a aplicação em um navegador web ou em um dispositivo/emulador Android conforme necessário.

**Backend (Flask)**: `http://localhost:5000`

**Frontend (React Native)**: A aplicação React Native será executada no dispositivo/emulador Android conectado.

## Observações

Certifique-se de configurar corretamente as variáveis de ambiente necessárias, como URLs da API e credenciais de banco de dados, conforme especificado nos arquivos de código fonte do projeto.

Para mais detalhes sobre como configurar e executar a aplicação, consulte a documentação do Flask e React Native respectivamente.
