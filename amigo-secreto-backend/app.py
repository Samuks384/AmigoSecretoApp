# app.py (Backend Flask Atualizado)

from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app) # Habilita o CORS para permitir requisições do frontend

class SecretSantaGame:
    def __init__(self):
        self.participants = []
        self.secret_santa_pairs = {}
        self.challenge_scores = {}
        self.challenge_deadline = None # Variável para a data limite do desafio

    def add_participant(self, name):
        if name not in self.participants:
            self.participants.append(name)
            self.challenge_scores[name] = 0
            return True, f"'{name}' foi adicionado aos participantes."
        return False, f"'{name}' já está na lista de participantes."

    def remove_participant(self, name):
        if name in self.participants:
            self.participants.remove(name)
            if name in self.challenge_scores:
                del self.challenge_scores[name]
            # Remove o participante dos pares de amigo secreto, se existir
            self.secret_santa_pairs = {k: v for k, v in self.secret_santa_pairs.items() if k != name and v != name}
            return True, f"'{name}' foi removido dos participantes."
        return False, f"'{name}' não encontrado na lista de participantes."

    def draw_secret_santa(self):
        if len(self.participants) < 2:
            return False, "São necessários pelo menos 2 participantes para o sorteio do amigo secreto."

        givers = list(self.participants)
        random.shuffle(givers)
        
        receivers = list(self.participants)
        random.shuffle(receivers)

        self.secret_santa_pairs = {}
        attempts = 0
        max_attempts = 100
        
        while attempts < max_attempts:
            current_pairs = {}
            valid_draw = True
            
            temp_receivers = list(receivers) # Cópia mutável
            
            for giver in givers:
                possible_receivers = [r for r in temp_receivers if r != giver]
                
                if not possible_receivers:
                    valid_draw = False # Não há receptor válido para este doador
                    break
                
                receiver = random.choice(possible_receivers)
                current_pairs[giver] = receiver
                temp_receivers.remove(receiver) # Remove o receptor já atribuído

            if valid_draw and len(current_pairs) == len(self.participants):
                self.secret_santa_pairs = current_pairs
                return True, "Sorteio do Amigo Secreto realizado com sucesso!"
            
            random.shuffle(givers)
            random.shuffle(receivers)
            attempts += 1
        
        return False, "Não foi possível realizar o sorteio do Amigo Secreto após várias tentativas. Tente novamente ou adicione mais participantes."

    def record_challenge_completion(self, participant_name, points=1):
        if self.challenge_deadline and datetime.now() > self.challenge_deadline:
            return False, "A data limite para completar desafios já passou!"

        if participant_name in self.challenge_scores:
            self.challenge_scores[participant_name] += points
            return True, f"'{participant_name}' completou um desafio! Pontuação atual: {self.challenge_scores[participant_name]}"
        return False, f"'{participant_name}' não é um participante válido."

    def get_leaderboard(self):
        if not self.challenge_scores:
            return []

        sorted_leaderboard = sorted(self.challenge_scores.items(), key=lambda item: item[1], reverse=True)
        return [{"name": name, "score": score} for name, score in sorted_leaderboard]

    def set_deadline(self, deadline_str):
        try:
            # Tenta o formato YYYY-MM-DDTHH:MM (padrão de input type="datetime-local")
            self.challenge_deadline = datetime.strptime(deadline_str, '%Y-%m-%dT%H:%M')
            return True, f"Data limite do desafio definida para: {deadline_str.replace('T', ' ')}"
        except ValueError:
            # Se falhar, tenta o formato YYYY-MM-DD HH:MM (caso a string venha de outro lugar ou seja modificada)
            try:
                self.challenge_deadline = datetime.strptime(deadline_str, '%Y-%m-%d %H:%M')
                return True, f"Data limite do desafio definida para: {deadline_str}"
            except ValueError:
                return False, "Formato de data e hora inválido. Use YYYY-MM-DDTHH:MM ou YYYY-MM-DD HH:MM."

    def get_deadline_info(self):
        if self.challenge_deadline:
            return {"deadline": self.challenge_deadline.strftime('%Y-%m-%d %H:%M'), "passed": datetime.now() > self.challenge_deadline}
        return {"deadline": None, "passed": False}

    def get_secret_santa_for(self, giver_name):
        # Apenas revela o par de uma pessoa específica
        if giver_name in self.secret_santa_pairs:
            return self.secret_santa_pairs[giver_name]
        return None


# Instância global do jogo
game = SecretSantaGame()

@app.route('/participants', methods=['GET'])
def get_participants():
    return jsonify(game.participants)

@app.route('/participants', methods=['POST'])
def add_participant():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"error": "Nome do participante é obrigatório"}), 400
    success, message = game.add_participant(name)
    if success:
        return jsonify({"message": message, "participants": game.participants}), 201
    return jsonify({"message": message}), 409 # Conflict

@app.route('/participants/<name>', methods=['DELETE'])
def remove_participant(name):
    success, message = game.remove_participant(name)
    if success:
        return jsonify({"message": message, "participants": game.participants})
    return jsonify({"message": message}), 404

@app.route('/draw', methods=['POST'])
def draw_secret_santa():
    success, message = game.draw_secret_santa()
    if success:
        # Não retorna os pares aqui para evitar revelação acidental.
        # Eles serão revelados individualmente via /reveal-santa
        return jsonify({"message": message}) 
    return jsonify({"message": message}), 400

@app.route('/challenges', methods=['POST'])
def record_challenge():
    data = request.get_json()
    participant_name = data.get('participant_name')
    points = data.get('points', 1)
    if not participant_name:
        return jsonify({"error": "Nome do participante é obrigatório"}), 400
    success, message = game.record_challenge_completion(participant_name, points)
    if success:
        return jsonify({"message": message, "challenge_scores": game.challenge_scores})
    return jsonify({"message": message}), 400 # 400 para erros de lógica/deadline

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    return jsonify(game.get_leaderboard())

@app.route('/deadline', methods=['POST'])
def set_deadline():
    data = request.get_json()
    deadline_str = data.get('deadline')
    if not deadline_str:
        return jsonify({"error": "Data limite é obrigatória"}), 400
    success, message = game.set_deadline(deadline_str)
    if success:
        return jsonify({"message": message, "deadline": game.get_deadline_info()["deadline"]}), 200
    return jsonify({"message": message}), 400

@app.route('/deadline', methods=['GET'])
def get_deadline():
    return jsonify(game.get_deadline_info())

@app.route('/reveal-santa', methods=['POST'])
def reveal_santa():
    data = request.get_json()
    giver_name = data.get('name')
    if not giver_name:
        return jsonify({"error": "Nome é obrigatório para revelar"}), 400
    
    receiver = game.get_secret_santa_for(giver_name)
    if receiver:
        return jsonify({"giver": giver_name, "receiver": receiver}), 200
    elif giver_name not in game.participants:
        return jsonify({"error": "Nome não encontrado entre os participantes."}), 404
    else:
        return jsonify({"error": "Sorteio ainda não foi realizado ou seu nome não está nos pares."}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5000) # Roda o servidor Flask na porta 5000
