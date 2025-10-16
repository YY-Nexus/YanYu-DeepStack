
import type { Model, ModelStatusKey } from '@/types/llm';
import { useState } from 'react';

const initialModels: Model[] = [
  {
    id: 'model-1',
    name: 'GPT-4 Turbo',
    version: 'v1.0.0',
    status: 'RUNNING',
    startTime: new Date().toISOString(),
    qps: 15.2,
    params: {
      learningRate: 0.001,
      batchSize: 32,
      maxSeqLength: 8192,
      temperature: 0.7,
    },
  },
  {
    id: 'model-2',
    name: 'Llama 3',
    version: 'v2.1.0',
    status: 'STOPPED',
    params: {
      learningRate: 0.0005,
      batchSize: 16,
      maxSeqLength: 4096,
      temperature: 0.8,
    },
  },
  {
    id: 'model-3',
    name: 'Claude 3',
    version: 'v1.2.0',
    status: 'STARTING',
    params: {
      learningRate: 0.002,
      batchSize: 8,
      maxSeqLength: 2048,
      temperature: 0.6,
    },
  },
];

export function useLlmStore() {
  const [models, setModels] = useState<Model[]>(initialModels);

  const fetchModels = async () => {
    setModels([...initialModels]);
  };

  const startModel = async (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'RUNNING', startTime: new Date().toISOString() } : m))
    );
  };

  const stopModel = async (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'STOPPED' } : m))
    );
  };

  const deleteModel = async (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
  };

  const updateModel = async (id: string, data: Partial<Model>) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
  };

  const testModel = async (id: string) => {
    return { latency: '100ms', qps: 20 };
  };

  const scanModels = async () => {
    const newModel: Model = {
      id: `model-${models.length + 1}`,
      name: `New Model ${models.length + 1}`,
      version: 'v1.0.0',
      status: 'STOPPED',
      params: {
        learningRate: 0.001,
        batchSize: 4,
        maxSeqLength: 1024,
        temperature: 0.7,
      },
    };
    setModels((prev) => [...prev, newModel]);
    return [newModel];
  };

  return {
    models,
    fetchModels,
    startModel,
    stopModel,
    deleteModel,
    updateModel,
    testModel,
    scanModels,
  };
}