import React from 'react';
import { MedicalStrategy } from '../types';

interface StrategySelectorProps {
  strategies: MedicalStrategy[];
  value: string;
  onChange: (id: string) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({ strategies, value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="strategy-selector">
    {strategies.map(s => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </select>
);

export default StrategySelector;
