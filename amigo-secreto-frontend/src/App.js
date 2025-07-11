// src/App.js (Frontend React Atualizado)

import React, { useState, useEffect } from 'react';
import RevealSanta from './RevealSanta'; // Importa o novo componente

function App() {
  const API_BASE_URL = 'http://127.0.0.1:5000'; // URL do seu backend Flask

  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [challengeParticipantName, setChallengeParticipantName] = useState('');
  const [challengePoints, setChallengePoints] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('admin'); // 'admin' ou 'reveal'
  const [challengeDeadline, setChallengeDeadline] = useState('');
  const [isDeadlineSet, setIsDeadlineSet] = useState(false);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [newDeadlineInput, setNewDeadlineInput] = useState(''); // Para a nova data limite

  // Funções de busca de dados
  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/participants`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
      setMessage("Erro ao carregar participantes. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Erro ao buscar placar de líderes:", error);
      setMessage("Erro ao carregar placar de líderes. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeadline = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/deadline`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.deadline) {
        setChallengeDeadline(data.deadline);
        setIsDeadlineSet(true);
        setIsDeadlinePassed(data.passed);
      } else {
        setIsDeadlineSet(false);
        setChallengeDeadline('');
        setIsDeadlinePassed(false);
      }
    } catch (error) {
      console.error("Erro ao buscar data limite:", error);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchLeaderboard();
    fetchDeadline();
  }, []);

  // Funções de Ação
  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) {
      setMessage("O nome do participante não pode estar vazio.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newParticipantName }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setNewParticipantName('');
        fetchParticipants(); 
      } else {
        setMessage(data.message || "Erro ao adicionar participante.");
      }
    } catch (error) {
      console.error("Erro ao adicionar participante:", error);
      setMessage("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (name) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/participants/${name}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        fetchParticipants(); 
      } else {
        setMessage(data.message || "Erro ao remover participante.");
      }
    } catch (error) {
      console.error("Erro ao remover participante:", error);
      setMessage("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrawSecretSanta = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message + " Os pares foram sorteados! Use a aba 'Descobrir Amigo' para revelar.");
      } else {
        setMessage(data.message || "Erro ao realizar sorteio.");
      }
    } catch (error) {
      console.error("Erro ao realizar sorteio:", error);
      setMessage("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordChallenge = async () => {
    if (!challengeParticipantName.trim()) {
      setMessage("O nome do participante do desafio não pode estar vazio.");
      return;
    }
    if (isDeadlinePassed) {
        setMessage("A data limite para completar desafios já passou!");
        return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_name: challengeParticipantName, points: parseInt(challengePoints) }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setChallengeParticipantName('');
        setChallengePoints(1);
        fetchLeaderboard(); 
      } else {
        setMessage(data.message || "Erro ao registrar desafio.");
      }
    } catch (error) {
      console.error("Erro ao registrar desafio:", error);
      setMessage("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDeadline = async () => {
    if (!newDeadlineInput.trim()) {
        setMessage("Por favor, insira uma data e hora para a data limite.");
        return;
    }
    setLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/deadline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deadline: newDeadlineInput }),
        });
        const data = await response.json();
        if (response.ok) {
            setMessage(data.message);
            setNewDeadlineInput('');
            fetchDeadline(); // Atualiza a data limite no frontend
        } else {
            setMessage(data.message || "Erro ao definir data limite.");
        }
    } catch (error) {
        console.error("Erro ao definir data limite:", error);
        setMessage("Erro na comunicação com o servidor.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white font-inter p-4 sm:p-8 flex flex-col items-center">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.tailwindcss.com"></script>
      
      <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center drop-shadow-lg">
        Jogo Amigo Secreto
      </h1>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      )}

      {message && (
        <div className="bg-yellow-400 text-gray-800 p-3 rounded-lg shadow-md mb-6 w-full max-w-md text-center">
          {message}
        </div>
      )}

      {/* Tabs de Navegação */}
      <div className="flex justify-center gap-4 mb-8 w-full max-w-md">
        <button
          onClick={() => setCurrentTab('admin')}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors duration-300 ${
            currentTab === 'admin' ? 'bg-white text-blue-600' : 'bg-white bg-opacity-30 text-white hover:bg-opacity-50'
          }`}
        >
          Administração
        </button>
        <button
          onClick={() => setCurrentTab('reveal')}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors duration-300 ${
            currentTab === 'reveal' ? 'bg-white text-blue-600' : 'bg-white bg-opacity-30 text-white hover:bg-opacity-50'
          }`}
        >
          Descobrir Amigo
        </button>
      </div>

      {currentTab === 'admin' && (
        <>
          {/* Seção de Participantes */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl shadow-2xl mb-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">Gerenciar Participantes</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Nome do participante"
                className="flex-grow p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
              />
              <button
                onClick={handleAddParticipant}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Adicionar
              </button>
            </div>
            <h3 className="text-xl font-medium mb-3">Lista de Participantes:</h3>
            {participants.length === 0 ? (
              <p className="text-white text-opacity-80">Nenhum participante adicionado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {participants.map((p, index) => (
                  <li key={index} className="flex justify-between items-center bg-white bg-opacity-10 p-3 rounded-lg">
                    <span className="text-lg">{p}</span>
                    <button
                      onClick={() => handleRemoveParticipant(p)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Seção de Sorteio */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl shadow-2xl mb-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-semibold mb-4">Sorteio do Amigo Secreto</h2>
            <button
              onClick={handleDrawSecretSanta}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 mb-4"
            >
              Realizar Sorteio
            </button>
            <p className="text-white text-opacity-80 mt-2">
              Os pares não serão exibidos aqui. Use a aba "Descobrir Amigo" para que cada um revele o seu.
            </p>
          </div>

          {/* Seção de Data Limite */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl shadow-2xl mb-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">Data Limite dos Desafios</h2>
            {isDeadlineSet ? (
                <p className={`text-lg mb-4 ${isDeadlinePassed ? 'text-red-300' : 'text-green-300'}`}>
                    **Data limite:** {challengeDeadline} {isDeadlinePassed ? '(VENCIDA)' : '(ATIVO)'}
                </p>
            ) : (
                <p className="text-lg mb-4 text-white text-opacity-80">Nenhuma data limite definida.</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="datetime-local"
                    className="flex-grow p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                    value={newDeadlineInput}
                    onChange={(e) => setNewDeadlineInput(e.target.value)}
                />
                <button
                    onClick={handleSetDeadline}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Definir Data Limite
                </button>
            </div>
          </div>

          {/* Seção de Desafios */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl shadow-2xl mb-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">Registrar Desafio</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Nome do participante"
                className="flex-grow p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={challengeParticipantName}
                onChange={(e) => setChallengeParticipantName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Pontos (ex: 1)"
                className="w-24 p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={challengePoints}
                onChange={(e) => setChallengePoints(e.target.value)}
                min="1"
              />
              <button
                onClick={handleRecordChallenge}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Registrar
              </button>
            </div>
          </div>

          {/* Seção de Placar de Líderes */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">Placar de Líderes</h2>
            {leaderboard.length === 0 ? (
              <p className="text-white text-opacity-80">Nenhum desafio foi completado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <li key={index} className="flex justify-between items-center bg-white bg-opacity-10 p-3 rounded-lg">
                    <span className="text-lg font-semibold">{index + 1}. {entry.name}</span>
                    <span className="text-lg">{entry.score} pontos</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {currentTab === 'reveal' && (
        <RevealSanta API_BASE_URL={API_BASE_URL} />
      )}
    </div>
  );
}

export default App;
