import { isApiConfigured } from './config/env.js';
import './App.css';

export default function App() {
  return (
    <main className="base-card">
      <p className="brand">CampusLab</p>
      <h1>Base del proyecto Web</h1>
      <p>Sistema de Control de Laboratorios de Cómputo</p>
      <div className="status">React + Vite · Estructura inicial</div>
      <p className="note">{isApiConfigured ? 'Variables de la API configuradas.' : 'API pendiente de los datos del docente.'}</p>
    </main>
  );
}
