// src/RevealSanta.js
import React, { useState } from 'react';

function RevealSanta({ API_BASE_URL }) {
  const [nameToReveal, setNameToReveal] = useState('');
  const [revealedSanta, setRevealedSanta] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReveal = async () => {
    if (!nameToReveal.trim()) {
      setMessage("Por favor, digite seu nome.");
      return;
    }
    setLoading(true);
    setRevealedSanta(null); // Reseta o resultado anterior
    setMessage(''); // Limpa mensagens anteriores

    try {
      const response = await fetch(`${API_BASE_URL}/reveal-santa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameToReveal }),
      });
      const data = await response.json();

      if (response.ok) {
        setRevealedSanta(data.receiver);
        setMessage(`🎉 ${nameToReveal}, você tirou: ${data.receiver}! 🎉`);
      } else {
        setMessage(data.error || "Erro ao tentar revelar. Nome incorreto ou sorteio não realizado.");
      }
    } catch (error) {
      console.error("Erro ao comunicar com o backend:", error);
      setMessage("Erro de conexão. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl shadow-2xl mb-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-semibold mb-6">Descobrir Meu Amigo Secreto</h2>
      <p className="text-white text-opacity-80 mb-4">
        Digite seu nome para descobrir quem você tirou no sorteio!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Digite seu nome"
          className="flex-grow p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={nameToReveal}
          onChange={(e) => setNameToReveal(e.target.value)}
        />
        <button
          onClick={handleReveal}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Revelando...' : 'Revelar Agora'}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg shadow-md ${revealedSanta ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      {revealedSanta && (
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
          <p className="text-xl font-bold">Você tirou: {revealedSanta}</p>
        </div>
      )}
    </div>
  );
}

export default RevealSanta;