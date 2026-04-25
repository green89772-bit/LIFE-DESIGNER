/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Activity, 
  Users, 
  Gamepad2, 
  Heart, 
  Briefcase, 
  BookOpen, 
  Lightbulb, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw,
  Plus,
  Trash2,
  BrainCircuit,
  Rocket
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { reframeDysfunctionalBelief, generateMindMapIdeas } from './services/geminiService';

// --- Types ---

type Step = 'intro' | 'dashboard' | 'compass' | 'journal' | 'mindmap' | 'odyssey' | 'action';

interface DashboardStats {
  health: number;
  work: number;
  play: number;
  love: number;
}

interface JournalEntry {
  id: string;
  activity: string;
  engagement: number; // 0-100
  energy: number; // -100 to 100
  flow: boolean;
  date: string;
}

interface OdysseyPlan {
  id: string;
  title: string;
  timeline: string[];
  resources: number;
  likability: number;
  confidence: number;
  coherence: number;
}

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden mb-8">
    <motion.div 
      className="bg-neutral-900 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
    />
  </div>
);

const Gauge = ({ value, label, icon: Icon, color, onChange }: { 
  value: number; 
  label: string; 
  icon: any; 
  color: string;
  onChange: (val: number) => void;
}) => (
  <div className="group space-y-3 p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-3.5 h-3.5", color.replace('bg-', 'text-'))} />
        <span className="text-gray-400">{label}</span>
      </div>
      <span className="text-gray-900">{value}%</span>
    </div>
    <div className="relative h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
      <motion.div 
        className={cn("h-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-gray-900 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-1.5"
    />
  </div>
);

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [dashboard, setDashboard] = useState<DashboardStats>({
    health: 50,
    work: 50,
    play: 50,
    love: 50
  });
  const [workView, setWorkView] = useState('');
  const [lifeView, setLifeView] = useState('');
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [mindmapTheme, setMindmapTheme] = useState('');
  const [mindmapIdeas, setMindmapIdeas] = useState<string[]>([]);
  const [isGeneratingMindmap, setIsGeneratingMindmap] = useState(false);
  const [odysseyPlans, setOdysseyPlans] = useState<OdysseyPlan[]>([
    { id: '1', title: '人生一：目前的現況延伸', timeline: ['', '', '', '', ''], resources: 50, likability: 50, confidence: 50, coherence: 50 },
    { id: '2', title: '人生二：萬一事情生變 (如 AI 取代)', timeline: ['', '', '', '', ''], resources: 50, likability: 50, confidence: 50, coherence: 50 },
    { id: '3', title: '人生三：如果錢和面子都不是問題', timeline: ['', '', '', '', ''], resources: 50, likability: 50, confidence: 50, coherence: 50 },
  ]);

  const [reframedBelief, setReframedBelief] = useState('');
  const [isReframing, setIsReframing] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('life-designer-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDashboard(data.dashboard);
        setWorkView(data.workView);
        setLifeView(data.lifeView);
        setJournal(data.journal);
        setOdysseyPlans(data.odysseyPlans);
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  useEffect(() => {
    const data = { dashboard, workView, lifeView, journal, odysseyPlans };
    localStorage.setItem('life-designer-data', JSON.stringify(data));
  }, [dashboard, workView, lifeView, journal, odysseyPlans]);

  const steps: Step[] = ['intro', 'dashboard', 'compass', 'journal', 'mindmap', 'odyssey', 'action'];
  const currentIndex = steps.indexOf(step);

  const nextStep = () => {
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
  };

  const prevStep = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  };

  const handleMindmapGenerate = async () => {
    if (!mindmapTheme) return;
    setIsGeneratingMindmap(true);
    const result = await generateMindMapIdeas(mindmapTheme);
    setMindmapIdeas(result.split('\n').map(s => s.replace(/^[*-]\s*/, '').trim()).filter(Boolean));
    setIsGeneratingMindmap(false);
  };

  const radarData = [
    { subject: '健康', A: dashboard.health, fullMark: 100 },
    { subject: '工作', A: dashboard.work, fullMark: 100 },
    { subject: '遊戲', A: dashboard.play, fullMark: 100 },
    { subject: '愛', A: dashboard.love, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a] font-sans antialiased p-6 md:p-12">
      <div className="max-w-5xl mx-auto flex flex-col min-h-[85vh]">
        <header className="flex justify-between items-end border-b border-gray-100 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-gray-900">
              Life Design Dashboard <span className="text-gray-400 font-extralight italic">/ 做自己的生命設計師</span>
            </h1>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Reframing your path through Scientific Design Thinking</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className="text-[9px] font-bold px-2 py-0.5 bg-black text-white rounded tracking-tighter">VER 4.0</span>
            <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold leading-none">
              Step {currentIndex + 1} <span className="opacity-30">/ {steps.length}</span>
            </div>
          </div>
        </header>

        <main className="relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-light mb-6 leading-tight text-gray-900 tracking-tight">
                    設計你的最棒人生，<br/>
                    <span className="font-serif italic text-gray-400">永遠都不嫌晚。</span>
                  </h2>
                  <p className="text-base text-gray-500 leading-relaxed max-w-lg">
                    如同 Bill Burnett 所說：「熱情是良好生命設計帶來的結果，而不是源頭。」
                    這個工具將帶領你透過 7 個科學步驟，打破「失功能信念」，一步步設計出屬於你的快樂事業。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 bg-black text-white rounded-2xl space-y-6 shadow-xl">
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Core Concept</h3>
                    <div className="space-y-2">
                       <h4 className="text-xl font-medium">什麼是「快樂事業」？</h4>
                       <ul className="space-y-3 opacity-60 text-xs font-medium">
                         <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"/> 找到你喜歡又擅長的事</li>
                         <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"/> 能夠幫助到別人的價值</li>
                         <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"/> 換取合理的報酬</li>
                         <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"/> 能夠一直做下去不退休</li>
                       </ul>
                    </div>
                  </div>
                  
                  <div className="p-10 border border-gray-100 rounded-2xl space-y-6 bg-gray-50/30 min-h-[320px] flex flex-col">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Reframer</h3>
                    <div className="space-y-4 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">輸入一個困住你的想法：</p>
                      <div className="flex flex-col gap-3">
                        <input 
                          type="text" 
                          id="belief-input"
                          placeholder="例如：我太老了..."
                          className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black transition-all"
                        />
                        <button 
                          onClick={async () => {
                            const input = document.getElementById('belief-input') as HTMLInputElement;
                            if (!input.value) return;
                            setIsReframing(true);
                            const reframed = await reframeDysfunctionalBelief(input.value);
                            setReframedBelief(reframed);
                            setIsReframing(false);
                          }}
                          disabled={isReframing}
                          className="w-full bg-black text-white text-[10px] py-3 rounded-lg font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {isReframing ? 'REFRAMING...' : 'REFRAME BELIEF'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {reframedBelief && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-6 p-4 bg-white border border-gray-100 rounded-xl relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-black" />
                            <h4 className="text-[9px] font-bold uppercase tracking-widest mb-2 flex justify-between items-center">
                              <span>Reframed Truth</span>
                              <button onClick={() => setReframedBelief('')} className="text-gray-300 hover:text-black">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </h4>
                            <p className="text-xs italic text-gray-600 leading-relaxed">
                              {reframedBelief}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={nextStep}
                    className="group flex items-center space-x-4 bg-black text-white px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                  >
                    <span>Begin Design Journey</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="max-w-md">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">01. Life Indicators (儀表板)</h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">檢視你目前人生的四大能量油箱。這是一切設計的基礎。</p>
                    <div className="grid grid-cols-1 gap-4">
                      <Gauge label="Health / 健康 (Foundation)" value={dashboard.health} onChange={(v) => setDashboard({...dashboard, health: v})} icon={Activity} color="bg-emerald-500" />
                      <Gauge label="Work / 事業" value={dashboard.work} onChange={(v) => setDashboard({...dashboard, work: v})} icon={Briefcase} color="bg-blue-500" />
                      <Gauge label="Play / 遊戲" value={dashboard.play} onChange={(v) => setDashboard({...dashboard, play: v})} icon={Gamepad2} color="bg-orange-400" />
                      <Gauge label="Love / 愛" value={dashboard.love} onChange={(v) => setDashboard({...dashboard, love: v})} icon={Heart} color="bg-rose-400" />
                    </div>
                  </div>
                  <div className="w-full md:w-80 p-8 bg-gray-50/50 border border-gray-100 rounded-3xl">
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#e5e5e5" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                          <Radar name="Dashboard" dataKey="A" stroke="#171717" fill="#171717" fillOpacity={0.1} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-100 italic text-center">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        "Your life indicators are not a score, but a map showing where energy is flowing."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4">
                  <BookOpen className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-1">DESIGNER NOTE: REFRAMING GRAVITY</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      那些你無法改變的事實是「重力問題」。設計師不會試圖解決重力，而是設計一套能對抗重力的系統。
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'compass' && (
              <motion.div 
                key="compass"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">02. Life Compass (人生羅盤)</h2>
                  <p className="text-sm text-gray-500">釐清你的「工作觀」與「人生觀」，確保生活的一致性。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-gray-900 uppercase text-[10px] tracking-widest font-bold">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>Work View / 工作觀</span>
                    </div>
                    <textarea 
                      value={workView}
                      onChange={(e) => setWorkView(e.target.value)}
                      placeholder="工作對你的意義是什麼？什麼才算是『好』工作？"
                      className="w-full h-56 p-6 rounded-2xl border border-gray-100 bg-white focus:border-gray-300 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-gray-900 uppercase text-[10px] tracking-widest font-bold">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span>Life View / 人生觀</span>
                    </div>
                    <textarea 
                      value={lifeView}
                      onChange={(e) => setLifeView(e.target.value)}
                      placeholder="你人生的價值來自哪裡？你如何看待這個世界？"
                      className="w-full h-56 p-6 rounded-2xl border border-gray-100 bg-white focus:border-gray-300 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>
                </div>

                <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col md:flex-row items-center gap-8">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <RefreshCw className="text-gray-400 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-1">Consistency Check / 一致性檢查</h4>
                    <p className="text-xs text-gray-500 italic leading-relaxed">
                      「你的工作觀是否呼應了你的人生觀？你做的事情是否讓你離理想中的世界更近一步？」
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'journal' && (
              <motion.div 
                key="journal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">03. Good Time Journal (好時光日誌)</h2>
                  <p className="text-sm text-gray-500">追蹤你的精力 (Energy) 與投入度 (Engagement)。</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-400 text-[10px] tracking-widest uppercase font-bold">
                      <tr>
                        <th className="px-8 py-5">Activity</th>
                        <th className="px-8 py-5">Engagement</th>
                        <th className="px-8 py-5">Energy</th>
                        <th className="px-8 py-5 text-center">Flow</th>
                        <th className="px-8 py-5 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {journal.map((entry) => (
                        <tr key={entry.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5 text-sm font-medium text-gray-900">{entry.activity}</td>
                          <td className="px-8 py-5">
                            <div className="w-24 bg-gray-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-black h-full" style={{ width: `${entry.engagement}%` }} />
                            </div>
                          </td>
                          <td className="px-8 py-5 font-mono text-xs text-gray-500">
                             {entry.energy > 0 ? `+${entry.energy}` : entry.energy}
                          </td>
                          <td className="px-8 py-5 text-center">
                            {entry.flow && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto" />}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => setJournal(journal.filter(j => j.id !== entry.id))} className="text-gray-200 hover:text-black transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={5} className="px-8 py-5">
                          <button 
                            onClick={() => {
                              const activity = prompt('輸入今天的活動名稱:');
                              if (activity) setJournal([...journal, { 
                                id: Date.now().toString(), 
                                activity, 
                                engagement: 80, 
                                energy: 20, 
                                flow: false, 
                                date: new Date().toISOString() 
                              }]);
                            }}
                            className="text-gray-400 hover:text-black flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add New Entry</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 flex items-center space-x-2 mb-3">
                      <Activity className="w-4 h-4" />
                      <span>Energy Recall / 精力回顧</span>
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">追蹤那些讓你做完感覺精力充沛的活動，即便身體勞累，但內心是滿足的。</p>
                  </div>
                  <div className="p-8 bg-black rounded-2xl text-white shadow-xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center space-x-2 mb-3">
                       <RefreshCw className="w-4 h-4" />
                       <span>AEIOU Analysis</span>
                    </h4>
                    <p className="text-xs opacity-70 leading-relaxed">檢視活動的（人物、事物、環境、互動、物品），找出讓你心流的規律。</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'mindmap' && (
              <motion.div 
                key="mindmap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">04. Mind Mapping (心智圖發想)</h2>
                  <p className="text-sm text-gray-500">跳過理性的審查，讓大腦天馬行空地聯想。</p>
                </div>

                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={mindmapTheme}
                    onChange={(e) => setMindmapTheme(e.target.value)}
                    placeholder="輸入一個活動或主題 (如：騎腳踏車)"
                    className="flex-1 px-6 py-4 rounded-xl border border-gray-100 bg-white outline-none focus:border-gray-900 transition-all text-sm"
                  />
                  <button 
                    onClick={handleMindmapGenerate}
                    disabled={isGeneratingMindmap || !mindmapTheme}
                    className="bg-black text-white px-6 rounded-xl disabled:opacity-50 hover:bg-gray-800 transition-all"
                  >
                    {isGeneratingMindmap ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative min-h-[460px] bg-gray-50/50 rounded-[40px] border border-gray-100 p-12 flex items-center justify-center overflow-hidden">
                  {mindmapTheme && (
                    <div className="z-10 bg-white px-8 py-4 rounded-full shadow-lg border border-black font-bold text-sm uppercase tracking-widest">
                      {mindmapTheme}
                    </div>
                  )}

                  <AnimatePresence>
                    {mindmapIdeas.map((idea, i) => {
                      const angle = (i / mindmapIdeas.length) * 2 * Math.PI;
                      const x = Math.cos(angle) * 160;
                      const y = Math.sin(angle) * 160;
                      return (
                        <motion.div 
                          key={idea}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1, x, y }}
                          className="absolute bg-white px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium shadow-sm hover:scale-110 transition-transform cursor-pointer"
                        >
                          {idea}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {mindmapIdeas.length === 0 && !isGeneratingMindmap && (
                    <div className="text-neutral-300 italic text-center max-w-xs">
                      在上方輸入主題並按下 AI 圖標，<br/>
                      我們將幫你挖掘深層聯想。
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'odyssey' && (
              <motion.div 
                key="odyssey"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">05. Odyssey Plans (奧德賽計畫)</h2>
                  <p className="text-sm text-gray-500">繪製三個不同版本的人生藍圖：現況、備案與夢想。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {odysseyPlans.map((plan, idx) => (
                    <div key={plan.id} className={cn(
                      "bg-white rounded-2xl border border-gray-100 p-6 space-y-6 flex flex-col shadow-sm transition-all hover:shadow-md",
                      idx === 1 && "bg-gray-50/50"
                    )}>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Version {idx + 1}</span>
                        <h4 className="font-bold text-sm leading-tight text-gray-900">{plan.title}</h4>
                      </div>

                      <div className="flex-1 space-y-4">
                         {plan.timeline.map((event, i) => (
                           <div key={i} className="flex items-start space-x-3">
                             <div className="mt-1.5 w-1 h-1 rounded-full bg-gray-200 shrink-0" />
                             <input 
                               value={event}
                               onChange={(e) => {
                                 const newPlans = [...odysseyPlans];
                                 newPlans[idx].timeline[i] = e.target.value;
                                 setOdysseyPlans(newPlans);
                               }}
                               placeholder={`Year ${i+1} goal...`}
                               className="text-xs bg-transparent outline-none w-full border-b border-transparent focus:border-gray-100 text-gray-600 placeholder:text-gray-300"
                             />
                           </div>
                         ))}
                      </div>

                      <div className="space-y-3 pt-6 border-t border-gray-50">
                        {[
                          { label: '資源', key: 'resources', color: 'bg-black' },
                          { label: '喜歡度', key: 'likability', color: 'bg-rose-500' },
                          { label: '自信', key: 'confidence', color: 'bg-emerald-500' },
                          { label: '一致', key: 'coherence', color: 'bg-blue-500' }
                        ].map((m) => (
                          <div key={m.key} className="space-y-1.5">
                            <div className="flex justify-between text-[8px] text-gray-400 uppercase font-bold tracking-tighter">
                              <span>{m.label}</span>
                              <span className="text-gray-900">{plan[m.key as keyof OdysseyPlan] as number}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-0.5 rounded-full overflow-hidden">
                              <div className={cn("h-full", m.color)} style={{ width: `${plan[m.key as keyof OdysseyPlan] as number}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'action' && (
              <motion.div 
                key="action"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                   <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">06 & 07. Prototype & Team (實踐與團隊)</h2>
                   <p className="text-sm text-gray-500">不要魯莽行動，先透過原型驗證想法，並組建你的支援系統。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-10 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                      <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold">原型訪談與體驗</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        在做大決定前，先去找正在過那種生活的人談談（原型訪談）。
                        爭取短期實習或義工的機會（原型體驗），親身感受職業背後的真實。
                      </p>
                    </div>

                    <div className="p-10 bg-black text-white rounded-2xl space-y-4 shadow-xl">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold">組建生命設計小組</h3>
                      <p className="text-xs opacity-60 leading-relaxed">
                        找 3-5 位志同道合的朋友，定期分享進度、互相提供建設性意見。
                        好的設計是在群體互動中被激發出來的。
                      </p>
                    </div>

                    <div className="p-10 bg-white border border-gray-100 rounded-2xl space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Progress Report</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-50">
                          <span className="block text-[8px] text-gray-400 uppercase font-bold mb-1">Health</span>
                          <div className="text-xl font-bold">{dashboard.health}%</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-50">
                          <span className="block text-[8px] text-gray-400 uppercase font-bold mb-1">Journal</span>
                          <div className="text-xl font-bold">{journal.length} <span className="text-[10px] font-normal">Entries</span></div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const blob = new Blob([JSON.stringify({ dashboard, workView, lifeView, journal, odysseyPlans }, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'life-design-plan.json';
                          a.click();
                        }}
                        className="w-full text-center py-4 rounded-xl bg-gray-100 text-gray-900 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
                      >
                         Export blueprint (JSON)
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-10 space-y-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Final Encouragement</h3>
                    <div className="space-y-6">
                      <blockquote className="border-l-2 border-black pl-6 py-1 italic text-lg text-gray-700 font-light leading-relaxed">
                        「你很棒，放輕鬆，別太逼自己了。人生是很長的，打造屬於自己的夢幻人生，永遠不嫌晚！」
                      </blockquote>
                      <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-2xl">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-900 mb-2">Editor's Note: 快樂事業</h4>
                        <p className="text-xs text-orange-800 leading-relaxed">
                          這不是一蹴而就的，而是一個持續迭代的過程。只要你持續思考、持續行動，你就在設計的路上。
                        </p>
                      </div>
                      <a 
                        href="https://shosho.tw/free" 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full text-center py-5 rounded-full bg-black text-white font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                      >
                        Subscribe to Newsletter
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-auto pt-10 border-t border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={prevStep}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 text-gray-400 hover:text-black disabled:opacity-0 transition-all font-bold text-[10px] uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button 
              onClick={() => {
                if (confirm('確定要清除所有設計記錄嗎？這將無法復原。')) {
                  localStorage.removeItem('life-designer-data');
                  window.location.reload();
                }
              }}
              className="px-4 text-[8px] font-bold uppercase tracking-widest text-gray-300 hover:text-rose-500 transition-colors"
            >
              Reset Data
            </button>
            <button 
              onClick={nextStep}
              disabled={currentIndex === steps.length - 1}
              className="flex items-center space-x-2 text-black hover:text-gray-600 disabled:opacity-0 transition-all font-bold text-[10px] uppercase tracking-widest"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute h-[1px] bg-gray-100 left-8 right-8 top-1/2 z-0"></div>
            <div className="flex justify-between items-center px-4 relative z-10 max-w-4xl mx-auto">
              {steps.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm mb-2",
                    i === currentIndex ? "bg-black text-white scale-110 shadow-md" : "bg-white text-gray-300 border border-gray-100 group-hover:border-gray-300 group-hover:text-gray-500"
                  )}>
                    {i + 1}
                  </div>
                  <span className={cn(
                    "text-[8px] uppercase tracking-tighter font-bold transition-colors",
                    i === currentIndex ? "text-black" : "text-gray-300"
                  )}>
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
