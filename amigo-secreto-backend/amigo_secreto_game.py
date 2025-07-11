import random

class SecretSantaGame:
    def __init__(self):
        # Lista de participantes no jogo
        self.participants = []
        # Dicionário para armazenar os pares de amigo secreto (quem tirou quem)
        self.secret_santa_pairs = {}
        # Dicionário para armazenar os pontos de cada participante nos desafios
        self.challenge_scores = {}

    def add_participant(self, name):
        """
        Adiciona um novo participante ao jogo.
        """
        if name not in self.participants:
            self.participants.append(name)
            self.challenge_scores[name] = 0  # Inicializa a pontuação do novo participante
            print(f"'{name}' foi adicionado aos participantes.")
        else:
            print(f"'{name}' já está na lista de participantes.")

    def remove_participant(self, name):
        """
        Remove um participante do jogo.
        """
        if name in self.participants:
            self.participants.remove(name)
            if name in self.challenge_scores:
                del self.challenge_scores[name]
            print(f"'{name}' foi removido dos participantes.")
        else:
            print(f"'{name}' não encontrado na lista de participantes.")

    def draw_secret_santa(self):
        """
        Realiza o sorteio do amigo secreto.
        Garante que ninguém tire a si mesmo.
        """
        if len(self.participants) < 2:
            print("São necessários pelo menos 2 participantes para o sorteio do amigo secreto.")
            self.secret_santa_pairs = {}
            return

        # Cria uma cópia embaralhada da lista de participantes
        givers = list(self.participants)
        random.shuffle(givers)
        
        # Cria uma cópia embaralhada dos receptores
        receivers = list(self.participants)
        random.shuffle(receivers)

        # Reseta os pares anteriores
        self.secret_santa_pairs = {}

        # Tenta criar os pares, garantindo que ninguém tire a si mesmo
        attempts = 0
        max_attempts = 100  # Limite para evitar loops infinitos em casos complexos
        
        while attempts < max_attempts:
            current_pairs = {}
            # Para cada doador, tenta encontrar um receptor
            for i in range(len(givers)):
                giver = givers[i]
                # O receptor é o próximo na lista embaralhada, ciclicamente
                receiver = receivers[(i + 1) % len(receivers)]
                
                # Se o doador e o receptor forem a mesma pessoa, ou se o receptor já foi sorteado
                # para outro doador nesta tentativa, reinicia o embaralhamento e tenta novamente.
                # Esta lógica simples pode falhar em casos específicos com poucos participantes,
                # mas é robusta para a maioria dos cenários.
                if giver == receiver:
                    break # Reinicia o loop externo para re-embaralhar
                
                # Verifica se o receptor já foi atribuído nesta rodada
                if receiver in current_pairs.values():
                    break # Reinicia o loop externo para re-embaralhar

                current_pairs[giver] = receiver
            
            # Se todos os pares foram formados sem conflitos, saia do loop
            if len(current_pairs) == len(self.participants):
                self.secret_santa_pairs = current_pairs
                print("\nSorteio do Amigo Secreto realizado com sucesso!")
                for giver, receiver in self.secret_santa_pairs.items():
                    print(f"{giver} tirou {receiver}")
                return
            
            # Se não conseguiu formar todos os pares, re-embaralha e tenta novamente
            random.shuffle(givers)
            random.shuffle(receivers)
            attempts += 1
        
        print("\nNão foi possível realizar o sorteio do Amigo Secreto após várias tentativas. Tente novamente ou adicione mais participantes.")
        self.secret_santa_pairs = {}


    def record_challenge_completion(self, participant_name, points=1):
        """
        Registra que um participante completou um desafio, adicionando pontos.
        """
        if participant_name in self.challenge_scores:
            self.challenge_scores[participant_name] += points
            print(f"'{participant_name}' completou um desafio! Pontuação atual: {self.challenge_scores[participant_name]}")
        else:
            print(f"'{participant_name}' não é um participante válido.")

    def display_leaderboard(self):
        """
        Exibe o placar de líderes, ordenado pela pontuação.
        """
        if not self.challenge_scores:
            print("\nNenhum desafio foi completado ainda. O placar está vazio.")
            return

        print("\n--- Placar de Líderes ---")
        # Ordena os participantes pela pontuação em ordem decrescente
        sorted_leaderboard = sorted(self.challenge_scores.items(), key=lambda item: item[1], reverse=True)
        
        for i, (name, score) in enumerate(sorted_leaderboard):
            print(f"{i+1}. {name}: {score} pontos")
        print("-------------------------")

    def display_menu(self):
        """
        Exibe o menu principal do jogo.
        """
        print("\n--- Menu do Jogo Amigo Secreto ---")
        print("1. Adicionar participante")
        print("2. Remover participante")
        print("3. Listar participantes")
        print("4. Realizar sorteio do Amigo Secreto")
        print("5. Registrar desafio completado")
        print("6. Exibir placar de líderes")
        print("7. Sair")
        print("----------------------------------")

    def run(self):
        """
        Inicia o loop principal do jogo.
        """
        while True:
            self.display_menu()
            choice = input("Escolha uma opção: ")

            if choice == '1':
                name = input("Digite o nome do participante a adicionar: ")
                self.add_participant(name)
            elif choice == '2':
                name = input("Digite o nome do participante a remover: ")
                self.remove_participant(name)
            elif choice == '3':
                if self.participants:
                    print("\n--- Participantes ---")
                    for p in self.participants:
                        print(p)
                    print("---------------------")
                else:
                    print("\nNenhum participante adicionado ainda.")
            elif choice == '4':
                self.draw_secret_santa()
            elif choice == '5':
                name = input("Digite o nome do participante que completou o desafio: ")
                points_str = input("Quantos pontos este desafio vale? (Pressione Enter para 1 ponto): ")
                try:
                    points = int(points_str) if points_str else 1
                    self.record_challenge_completion(name, points)
                except ValueError:
                    print("Entrada inválida para pontos. Por favor, digite um número inteiro.")
            elif choice == '6':
                self.display_leaderboard()
            elif choice == '7':
                print("Saindo do jogo. Até a próxima!")
                break
            else:
                print("Opção inválida. Por favor, tente novamente.")

# Para rodar o jogo:
if __name__ == "__main__":
    game = SecretSantaGame()
    game.run()
