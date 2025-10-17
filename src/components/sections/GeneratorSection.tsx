import { useState } from 'react';
import { Copy, RefreshCw, Check, KeyRound } from 'lucide-react';
import { generatePassword } from '../../lib/passwordGenerator';

export const GeneratorSection = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newPassword = generatePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
    });
    setPassword(newPassword);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '' };

    let strength = 0;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Débil', color: 'bg-red-500' };
    if (strength <= 4) return { label: 'Media', color: 'bg-yellow-500' };
    return { label: 'Fuerte', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Generador de Contraseñas</h2>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full px-4 py-4 pr-24 text-lg font-mono bg-gray-50 border-2 border-gray-300 rounded-lg outline-none"
              placeholder="Genera una contraseña segura"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                onClick={handleGenerate}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
                title="Generar nueva contraseña"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
                title="Copiar contraseña"
                disabled={!password}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {password && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Fortaleza:</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{
                    width: strength.label === 'Débil' ? '33%' : strength.label === 'Media' ? '66%' : '100%'
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{strength.label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Opciones</h3>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Longitud: {length}
            </label>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Mayúsculas (A-Z)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Minúsculas (a-z)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Números (0-9)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Símbolos (!@#$%)</span>
          </label>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition"
        >
          Generar Contraseña
        </button>
      </div>
    </div>
  );
};
