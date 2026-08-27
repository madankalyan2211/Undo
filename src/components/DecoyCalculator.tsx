import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, EyeOff, Lock } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DecoyCalculatorProps {
  correctPin: string;
  onUnlock: () => void;
  onExitStealth: () => void;
}

export const DecoyCalculator: React.FC<DecoyCalculatorProps> = ({
  correctPin = '1234',
  onUnlock,
  onExitStealth,
}) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [pinBuffer, setPinBuffer] = useState('');

  const handleDigit = (digit: string) => {
    soundEffects.playClickSound();
    const newPin = pinBuffer + digit;
    setPinBuffer(newPin);

    // If entered PIN matches secret PIN, unlock into Undo!
    if (newPin.endsWith(correctPin)) {
      soundEffects.playSaveSound();
      onUnlock();
      return;
    }

    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOperator = (nextOperator: string) => {
    soundEffects.playClickSound();
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const current = prevValue || 0;
      let result = current;
      if (operator === '+') result = current + inputValue;
      if (operator === '−') result = current - inputValue;
      if (operator === '×') result = current * inputValue;
      if (operator === '÷') result = inputValue !== 0 ? current / inputValue : 0;
      setPrevValue(result);
      setDisplay(String(Number(result.toFixed(6))));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    soundEffects.playClickSound();
    // Check PIN buffer on equals
    if (pinBuffer.endsWith(correctPin) || display === correctPin) {
      soundEffects.playSaveSound();
      onUnlock();
      return;
    }

    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      let result = prevValue;
      if (operator === '+') result = prevValue + inputValue;
      if (operator === '−') result = prevValue - inputValue;
      if (operator === '×') result = prevValue * inputValue;
      if (operator === '÷') result = inputValue !== 0 ? prevValue / inputValue : 0;
      setDisplay(String(Number(result.toFixed(6))));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    soundEffects.playClickSound();
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setPinBuffer('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-sm mx-auto flex flex-col justify-between p-6 rounded-[36px] bg-[#121212] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none text-white mt-4"
    >
      {/* Stealth Top Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/50 text-xs">
          <EyeOff className="w-3.5 h-3.5 text-white/40" />
          <span className="font-mono uppercase tracking-wider text-[10px]">Stealth Calculator</span>
        </div>
        <button
          onClick={onExitStealth}
          type="button"
          title="Exit Stealth Disguise"
          className="text-[10px] text-white/40 hover:text-white px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer"
        >
          Exit Disguise
        </button>
      </div>

      {/* Screen Display */}
      <div className="w-full h-20 flex items-end justify-end px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 mb-5 overflow-hidden">
        <span className="text-4xl font-light font-mono tracking-tight text-white truncate">
          {display}
        </span>
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-lg flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          AC
        </button>
        <button
          onClick={() => {
            soundEffects.playClickSound();
            setDisplay(String(-parseFloat(display)));
          }}
          className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-lg flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          ±
        </button>
        <button
          onClick={() => {
            soundEffects.playClickSound();
            setDisplay(String(parseFloat(display) / 100));
          }}
          className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-lg flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-14 rounded-2xl bg-amber-500/80 hover:bg-amber-500 text-white font-bold text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button onClick={() => handleDigit('7')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">7</button>
        <button onClick={() => handleDigit('8')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">8</button>
        <button onClick={() => handleDigit('9')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">9</button>
        <button onClick={() => handleOperator('×')} className="h-14 rounded-2xl bg-amber-500/80 hover:bg-amber-500 text-white font-bold text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">×</button>

        {/* Row 3 */}
        <button onClick={() => handleDigit('4')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">4</button>
        <button onClick={() => handleDigit('5')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">5</button>
        <button onClick={() => handleDigit('6')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">6</button>
        <button onClick={() => handleOperator('−')} className="h-14 rounded-2xl bg-amber-500/80 hover:bg-amber-500 text-white font-bold text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">−</button>

        {/* Row 4 */}
        <button onClick={() => handleDigit('1')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">1</button>
        <button onClick={() => handleDigit('2')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">2</button>
        <button onClick={() => handleDigit('3')} className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">3</button>
        <button onClick={() => handleOperator('+')} className="h-14 rounded-2xl bg-amber-500/80 hover:bg-amber-500 text-white font-bold text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">+</button>

        {/* Row 5 */}
        <button onClick={() => handleDigit('0')} className="col-span-2 h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95">0</button>
        <button
          onClick={() => {
            soundEffects.playClickSound();
            if (!display.includes('.')) setDisplay(display + '.');
          }}
          className="h-14 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white font-medium text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="h-14 rounded-2xl bg-white text-black font-bold text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        >
          =
        </button>
      </div>

      {/* Secret Hint Tip */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
        <span className="text-[10px] text-white/30 font-mono">
          Enter PIN '{correctPin}' to unlock Undo
        </span>
      </div>
    </motion.div>
  );
};
