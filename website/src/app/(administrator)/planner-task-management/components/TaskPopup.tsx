// components/TaskPopup.tsx
import React, { useState } from 'react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/solid';

interface TaskPopupProps {
  task: string;
  value: number;
  category: 'moisture' | 'temperature';
  week: 1 | 2 | 3 | 4;
  taskImagePath: string;
  plantingImagePath: string;
  predictiveAnalysis?: string;
  onClose: () => void;
  createdAt: string;
}

const TaskPopup: React.FC<TaskPopupProps> = ({   
  task,
  value,
  category,
  week,
  taskImagePath,
  plantingImagePath,
  predictiveAnalysis,
  onClose,
  createdAt
}) => {
  const [note, setNote] = useState('');
  const [question, setQuestion] = useState('');

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Pergunta enviada:', question);
    setQuestion('');
  };

  // Formatar a data de criação
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Detalhes da Tarefa</h2>
        
        <div className="flex items-center mb-4">
          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">{formattedDate}</span>
        </div>
        
        <p className="mb-2">
          <strong>{category === 'moisture' ? 'Umidade:' : 'Temperatura:'}</strong> {value.toFixed(2)}
          {category === 'moisture' ? '%' : '°C'}
        </p>
        <p className="mb-2"><strong>Tarefa:</strong> {task}</p>
        <p className="mb-4"><strong>Semana:</strong> {week}</p>
        <p className="mb-4"><strong>Tarefa:</strong> {task}</p>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Anotações</h3>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Adicione suas anotações aqui..."
          />
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Pergunte ao Assistente</h3>
          <form onSubmit={handleSubmitQuestion}>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite sua pergunta..."
            />
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
              Enviar Pergunta
            </button>
          </form>
        </div>
        
        <div className="mb-4 mt-8">
          <h3 className="text-lg font-semibold mb-2">Mapa de Locais de Compra</h3>
          <p>Link para o mapa: [Implementar link para o mapa]</p>
        </div>
        
        <div className="mb-4 mt-8">
          <h3 className="text-lg font-semibold mb-2">Gamificação</h3>
          <p>[Informações sobre gamificação virão aqui]</p>
        </div>
        
        <div className="mb-4 mt-8">
          <h3 className="text-lg font-semibold mb-2">Como Executar</h3>
          <p>[GIF de execução virá aqui]</p>
        </div>
        
        <div className="mb-4 mt-8">
          <h3 className="text-lg font-semibold mb-2">Recomendações de Plantio</h3>
          <p>[Imagens de recomendações virão aqui]</p>
        </div>
        
        <div className="mb-4 mt-8">
          <h3 className="text-lg font-semibold mb-2">Integração com Alexa</h3>
          <p>[Informação sobre integração com Alexa virá aqui]</p>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;