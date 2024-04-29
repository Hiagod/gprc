from sqlite3 import IntegrityError
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = ''
db = SQLAlchemy(app)

class Professor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    token = db.Column(db.String(100), nullable=False, unique=True)
    turmas = db.relationship('Turma', backref='professor', lazy=True)

class Turma(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    numero = db.Column(db.String(10), nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey('professor.id'), nullable=False)
    alunos = db.relationship('Aluno', backref='turma', lazy=True)

    def serialize(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'numero': self.numero,
            'professor_id': self.professor_id
        }

class Aluno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    matricula = db.Column(db.String(20), nullable=False)
    foto = db.Column(db.String(100), nullable=False)  
    turma_id = db.Column(db.Integer, db.ForeignKey('turma.id'), nullable=False)

class Presenca(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('aluno.id'), nullable=False)
    turma_id = db.Column(db.Integer, db.ForeignKey('turma.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    presente = db.Column(db.Boolean, nullable=False)


@app.route('/')
def index():
    return 'Hello, world!'

@app.route('/professores', methods=['POST'])
def cadastrar_professor():
    data = request.json
    token = data.get('token')
    
    professor = Professor.query.filter_by(token=token).first()
    if professor:
        return jsonify({'id': professor.id}), 200
    
    novo_professor = Professor(nome=data['nome'], email=data['email'], token=token)
    db.session.add(novo_professor)
    
    try:
        db.session.commit()
        return jsonify({'id': novo_professor.id}), 201
    except IntegrityError:
        db.session.rollback()
        professor_existente = Professor.query.filter_by(token=token).first()
        return jsonify({'id': professor_existente.id}), 200

@app.route('/professores/token/<string:token>', methods=['GET'])
def get_professor_id_by_token(token):
    professor = Professor.query.filter_by(token=token).first()
    if professor:
        return jsonify({'id': professor.id}), 200
    else:
        return jsonify({'error': 'Nenhum professor encontrado com o token fornecido.'}), 404


@app.route('/turmas', methods=['POST'])
def cadastrar_turma():
    data = request.json
    nome = data.get('nome')
    numero = data.get('numero')
    professor_id = data.get('professor_id')

    nova_turma = Turma(nome=nome, numero=numero, professor_id=professor_id)

    db.session.add(nova_turma)
    
    try:
        db.session.commit()
        return jsonify({'id': nova_turma.id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erro ao cadastrar turma.'}), 400

@app.route('/professores/<int:professor_id>/turmas', methods=['GET'])
def listar_turmas_professor(professor_id):
    professor = Professor.query.get_or_404(professor_id)
    turmas = professor.turmas
    return jsonify([turma.serialize() for turma in turmas])

@app.route('/alunos', methods=['POST'])
def cadastrar_alunos():
    data = request.json
    turma_id = data.get('turma_id')
    alunos = data.get('alunos')

    for aluno_data in alunos:
        novo_aluno = Aluno(nome=aluno_data['nome'], matricula=aluno_data['matricula'], foto=aluno_data['foto'], turma_id=turma_id)
        db.session.add(novo_aluno)

    try:
        db.session.commit()
        return jsonify({'message': 'Alunos cadastrados com sucesso.'}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erro ao cadastrar alunos.'}), 400
    
@app.route('/turmas/<int:turma_id>/alunos', methods=['GET'])
def listar_alunos_turma(turma_id):
    turma = Turma.query.get_or_404(turma_id)
    alunos = turma.alunos   
    return jsonify([{
        'id': aluno.id,
        'nome': aluno.nome,
        'matricula': aluno.matricula,
        'foto': aluno.foto
    } for aluno in alunos])

@app.route('/marcar-presenca', methods=['POST'])
def marcar_presenca():
    data = request.json
    aluno_id = data.get('aluno_id')
    turma_id = data.get('turma_id')
    data_presenca = data.get('data')
    presente = data.get('presente', True)  

    falta_existente = Presenca.query.filter_by(aluno_id=aluno_id, turma_id=turma_id, data=data_presenca, presente=False).first()
    if falta_existente:
        falta_existente.presente = True
    else:
        nova_presenca = Presenca(aluno_id=aluno_id, turma_id=turma_id, data=data_presenca, presente=presente)
        db.session.add(nova_presenca)
    try:
        db.session.commit()
        return jsonify({'message': 'Presença marcada com sucesso.'}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erro ao marcar presença.'}), 400

@app.route('/verificar-presenca', methods=['GET'])
def verificar_presenca():
    aluno_id = request.args.get('aluno_id')
    data_presenca = request.args.get('data')

    presenca = Presenca.query.filter_by(aluno_id=aluno_id, data=data_presenca).first()

    if presenca:
        return jsonify({'presente': presenca.presente}), 200
    else:
        return jsonify({'message': 'Presença não registrada para esta data.'}), 404

@app.route('/presencas-faltas/<int:turma_id>', methods=['GET'])
def presencas_faltas_turma(turma_id):
    presencas = Presenca.query.filter_by(turma_id=turma_id).all()

    presencas_data = []
    for presenca in presencas:
        presencas_data.append({
            'aluno_id': presenca.aluno_id,
            'data': presenca.data,
            'presente': presenca.presente
        })

    return jsonify({'presencas': presencas_data}), 200

@app.route('/presencas-faltas/<int:turma_id>/<int:aluno_id>', methods=['GET'])
def presencas_faltas_aluno(turma_id, aluno_id):
    presencas = Presenca.query.filter_by(turma_id=turma_id, aluno_id=aluno_id).all()

    presencas_count = {'presencas': 0, 'faltas': 0}
    for presenca in presencas:
        if presenca.presente:
            presencas_count['presencas'] += 1
        else:
            presencas_count['faltas'] += 1

    return jsonify(presencas_count), 200



@app.route('/marcar-falta-resto', methods=['POST'])
def marcar_falta_resto():
    data = request.json
    turma_id = data.get('turma_id')
    data_presenca = data.get('data')

    try:
        data_presenca = datetime.strptime(data_presenca, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de data inválido. Use o formato YYYY-MM-DD.'}), 400

    alunos = Aluno.query.filter_by(turma_id=turma_id).all()

    for aluno in alunos:
        presenca_existente = Presenca.query.filter_by(aluno_id=aluno.id, turma_id=turma_id, data=data_presenca).first()
        if not presenca_existente:
            nova_falta = Presenca(aluno_id=aluno.id, turma_id=turma_id, data=data_presenca, presente=False)
            db.session.add(nova_falta)

    try:
        db.session.commit()
        return jsonify({'message': 'Faltas marcadas para o resto dos alunos na turma.'}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erro ao marcar faltas.'}), 400



if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
