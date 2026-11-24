import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Activity, ArrowDown, ArrowLeft, ArrowRight, Bot, Check, ChevronRight, Cpu, Crosshair, Crown, Flame, Globe2, Heart, MapPin, Menu, Search, Send, Shield, ShieldCheck, Skull, Sparkles, Swords, Users, X, Zap } from 'lucide-react';
import { apiRequest, type ApiHealth, type ApiHero, type ApiMission, type JarvisContext } from './api';

const gold = '#cfb078';
const frame = 'border border-[#c5a56d]/20 bg-[#121310]/85';
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 border border-[#c5a56d]/40 px-5 py-3 text-xs font-medium uppercase tracking-[.16em] transition duration-300 hover:border-[#dec18a] hover:bg-[#c5a56d]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dec18a] disabled:cursor-not-allowed disabled:opacity-50';
const primary = `${btn} border-[#c5a56d] bg-[#cfb078] text-[#16150f] hover:bg-[#e4c998] hover:text-black`;
const avengersLogo = '/brand/avengers-mark.png';
const art = (name: string) => `/art/${name.toLowerCase().replace(/ /g, '-')}.${name === 'Zemo' || name === 'Maximus' ? 'svg' : 'jpg'}`;
const heroes = [
  { name: 'Iron Man', real: 'Tony Stark', title: 'The futurist', power: 'Repulsor Blast', hp: 240, attack: 44, defence: 16, speed: 80, intelligence: 100, bio: 'Genius. Inventor. Avenger. Behind the armor is a man determined to build a better world—even if he has to save it first.' },
  { name: 'Captain America', real: 'Steve Rogers', title: 'The first Avenger', power: 'Shield Strike', hp: 280, attack: 36, defence: 24, speed: 72, intelligence: 85, bio: 'A good man before he was a great soldier. With an unbreakable shield and an unwavering moral compass, Steve Rogers leads from the front.' },
  { name: 'Thor', real: 'Thor Odinson', title: 'The god of thunder', power: 'Lightning Storm', hp: 300, attack: 52, defence: 18, speed: 65, intelligence: 75, bio: 'Born to the golden halls of Asgard, forged by loss and lightning. The son of Odin brings the might of the storm to Earth’s defense.' },
  { name: 'Hulk', real: 'Bruce Banner', title: 'The strongest there is', power: 'Gamma Smash', hp: 360, attack: 58, defence: 20, speed: 40, intelligence: 95, bio: 'A brilliant mind and an unstoppable force. Bruce Banner turns a lifetime of inner conflict into overwhelming strength when the world needs it most.' },
  { name: 'Black Widow', real: 'Natasha Romanoff', title: 'The silent guardian', power: 'Tactical Strike', hp: 210, attack: 39, defence: 12, speed: 95, intelligence: 92, bio: 'A master spy who chose her own destiny. Natasha’s precision, courage, and tactical insight make her indispensable to the Avengers.' },
  { name: 'Hawkeye', real: 'Clint Barton', title: 'The perfect shot', power: 'Precision Shot', hp: 220, attack: 42, defence: 12, speed: 88, intelligence: 82, bio: 'No armor. No superpowers. Just extraordinary skill and a refusal to miss when everything is on the line.' },
];
const enemyData = [
  ['Doctor Doom', 'MULTIVERSAL', 'Sorcery & advanced technology', 'Doom Protocol'], ['Magneto', 'PLANETARY', 'Absolute magnetic control', 'Magnetic Collapse'],
  ['Loki', 'GLOBAL', 'Illusion & Asgardian sorcery', 'Illusory Dominion'], ['Red Skull', 'GLOBAL', 'Enhanced strength & strategy', 'Hydra Barrage'],
  ['Thanos', 'COSMIC', 'Titan physiology & cosmic power', 'Infinity Rupture'], ['Ultron', 'GLOBAL', 'Artificial intelligence & robotics', 'Sentry Onslaught'],
  ['Kang', 'MULTIVERSAL', 'Time manipulation', 'Temporal Fracture'], ['Apocalypse', 'PLANETARY', 'Molecular transformation', 'Age of Apocalypse'],
  ['Green Goblin', 'CITY', 'Enhanced strength & weaponry', 'Pumpkin Barrage'], ['Kingpin', 'STREET', 'Criminal empire & brute force', 'Crushing Blow'],
  ['Zemo', 'GLOBAL', 'Psychological warfare', 'Divided We Fall'], ['Doctor Octopus', 'CITY', 'Mechanical tentacle combat', 'Octo Assault'],
  ['Mystique', 'CITY', 'Shapeshifting & infiltration', 'Perfect Deception'], ['Venom', 'CITY', 'Alien symbiote physiology', 'Symbiote Frenzy'],
  ['Annihilus', 'COSMIC', 'Cosmic control rod', 'Annihilation Wave'], ['Mandarin', 'GLOBAL', 'Power of the ten rings', 'Ten Rings Unleashed'],
  ['Mister Sinister', 'GLOBAL', 'Genetic manipulation', 'Genetic Overload'], ['Bullseye', 'STREET', 'Unerring marksmanship', 'Deadly Precision'],
  ['Mephisto', 'COSMIC', 'Demonic sorcery', 'Hellfire Storm'], ['Galactus', 'COSMIC', 'The Power Cosmic', 'World Devourer'],
  ['Maximus', 'PLANETARY', 'Mind control & invention', 'Psychic Dominion'], ['Sabretooth', 'CITY', 'Regeneration & feral strength', 'Savage Frenzy'],
  ['Dormammu', 'MULTIVERSAL', 'Dark Dimension magic', 'Eternal Darkness'], ['Leader', 'GLOBAL', 'Superhuman intellect', 'Gamma Contagion'],
  ['Juggernaut', 'GLOBAL', 'Unstoppable mystical strength', 'Unstoppable Charge'],
];
const villains = enemyData.map(([name, threat, power, ability], i) => ({
  name, threat, power, ability, hp: 680 + (i % 5) * 110, attack: 48 + (i % 6) * 6, defence: 12 + i % 12, difficulty: 3 + i % 3,
}));
const initialMissions = [
  { name: 'Operation Infinity', villain: 4, location: 'New York', threat: 'CRITICAL', scene: '/art/new-york.png', desc: 'The stones have called him to Earth. Stop the Mad Titan before the universe pays the price.', status: 'PENDING', team: [] as number[] },
  { name: 'Operation Ultron', villain: 5, location: 'Washington DC', threat: 'HIGH', scene: '/art/laboratory.png', desc: 'A world built in his image. Break Ultron’s network before humanity becomes a memory.', status: 'PENDING', team: [] as number[] },
  { name: 'Operation Loki', villain: 2, location: 'New Mexico', threat: 'MEDIUM', scene: '/art/asgard.png', desc: 'An ancient power. A familiar deception. Close the portal and end the trickster’s reign.', status: 'PENDING', team: [] as number[] },
];
type Mission = typeof initialMissions[number] & { databaseId?: string; teamId?: string };
type Fighter = { id: number; hp: number; energy: number; cooldown: number; guard: boolean };
type Battle = { fighters: Fighter[]; enemyHP: number; round: number; acted: number[]; log: string[]; result: string; popup: string; enemyTurn: boolean };
const chapters = ['The World', 'The Heroes', 'The Assembly', 'The Quest', 'The Deployment', 'The Battle', 'The Chronicles', 'JARVIS'];
const subtitles = ['Earth’s last line of defense.', 'Extraordinary is only the beginning.', 'Alone, remarkable. Together, unstoppable.', 'Every world needs its defenders.', 'Purpose gives power its direction.', 'Legends are forged in battle.', 'Every victory becomes a story.', 'Your tactical intelligence interface.'];
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
function load<T,>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function mapRemoteMissions(remoteMissions: ApiMission[]): Mission[] {
  const mapped = initialMissions.map(initial => {
    const remote = remoteMissions.find(item => item.name === initial.name);
    if (!remote) throw new Error(`Supabase is missing the seeded mission "${initial.name}".`);
    const villainIndex = villains.findIndex(item => item.name === remote.villain);
    if (villainIndex < 0) throw new Error(`Unknown villain "${remote.villain}" in mission "${remote.name}".`);
    const assignment = remote.teams.find(item => item.heroes.length > 0);
    const members = assignment?.heroes.map(member => heroes.findIndex(hero => hero.name === member.name)) ?? [];
    return {
      ...initial,
      villain: villainIndex,
      location: remote.location,
      threat: remote.threat_level.toUpperCase(),
      desc: remote.description || initial.desc,
      status: remote.status.toUpperCase().replace(/ /g, '_'),
      team: members.filter(id => id >= 0),
      databaseId: remote.id,
      teamId: assignment?.id,
    };
  });
  return mapped;
}
function formatThreatLevel(threat: Mission['threat']): JarvisContext['missions'][number]['threat_level'] {
  const formatted = threat.toUpperCase();
  if (formatted === 'CRITICAL') return 'Critical';
  if (formatted === 'HIGH') return 'High';
  if (formatted === 'MEDIUM') return 'Medium';
  if (formatted === 'LOW') return 'Low';
  throw new Error(`Unknown mission threat level: ${threat}`);
}
function Picture({ src, name, className = '' }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? <div className={`grid place-items-center bg-[radial-gradient(ellipse_at_top,#493b28,#10120f)] ${className}`}><svg viewBox="0 0 120 160" className="h-full max-h-64 w-full text-[#b99c68]" role="img" aria-label={`${name} classified character illustration`}><path d="m60 15 35 18v47c0 32-35 57-35 57S25 112 25 80V33Z" fill="none" stroke="currentColor" strokeWidth="1" /><circle cx="60" cy="56" r="16" fill="#9c8258" /><path d="M34 110V97q0-25 26-25t26 25v13" fill="#665638" /><path d="m60 88 7 10-7 10-7-10Z" fill="#ddc392" /></svg><span className="sr-only">{name}</span></div> : <img src={src || art(name)} alt={name} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
function Badge({ children }: { children: React.ReactNode }) {
  const color = children === 'CRITICAL' ? 'border-red-400/30 bg-[#281413] text-red-300' : children === 'HIGH' ? 'border-orange-300/30 bg-[#292014] text-orange-200' : children === 'COMPLETED' || children === 'AVAILABLE' ? 'border-emerald-300/25 bg-[#14251e] text-emerald-200' : 'border-[#c5a56d]/35 bg-[#201d15] text-[#e2c994]';
  return <span className={`inline-flex items-center gap-2 border px-2.5 py-1 text-xs tracking-[.12em] ${color}`}><span className="h-1 w-1 bg-current" />{children}</span>;
}
function Bar({ value, max = 100, color = gold }: { value: number; max?: number; color?: string }) {
  return <div className="h-1 w-full overflow-hidden bg-white/10"><div className="h-full transition-all duration-700" style={{ width: `${Math.max(0, value / max * 100)}%`, background: color }} /></div>;
}
function Ornament() { return <div aria-hidden="true" className="flex items-center justify-center gap-4 text-[#c5a56d]"><span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c5a56d]/60" /><span className="h-1.5 w-1.5 rotate-45 border border-[#c5a56d]" /><span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c5a56d]/60" /></div>; }
function Modal({ title, close, children, wide = false }: { title: string; close: () => void; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement; ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      const items = ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, [tabindex="0"]');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <div onClick={close} className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md"><motion.div initial={{ y: 24 }} animate={{ y: 0 }} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()} className={`${frame} max-h-[90vh] w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} overflow-y-auto p-5 text-[#f0eadf] shadow-2xl md:p-8`}><div className="mb-6 flex items-center justify-between gap-3"><h2 id="modal-title" className="font-display text-3xl">{title}</h2><button className={btn} aria-label="Close dialog" onClick={close}><X size={18} /></button></div>{children}</motion.div></div>;
}
function Radar({ missions }: { missions: Mission[] }) {
  const active = missions.filter(m => m.status !== 'COMPLETED');
  return <div className={`${frame} relative min-h-80 overflow-hidden p-6`}><div className="flex justify-between"><span className="text-xs uppercase tracking-[.2em] text-[#d8bd8b]">The watch never ends</span><span className="text-xs text-stone-300">LIVE / {active.length} SIGNALS</span></div><div className="absolute inset-0 mt-12 bg-[linear-gradient(#b5975e0a_1px,transparent_1px),linear-gradient(90deg,#b5975e0a_1px,transparent_1px)] bg-[size:32px_32px]" /><div role="img" aria-label={`${active.length} active threats: ${active.map(m => `${m.threat} in ${m.location}`).join(', ')}`} className="relative mx-auto my-5 grid h-52 w-52 place-items-center rounded-full border border-[#c5a56d]/30"><div className="absolute h-36 w-36 rounded-full border border-[#c5a56d]/25" /><div className="absolute h-20 w-20 rounded-full border border-[#c5a56d]/20" /><div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_65%,#cfb07808_80%,#cfb07844)] motion-reduce:animate-none" /><div className="absolute h-full border-l border-[#c5a56d]/10" /><div className="absolute w-full border-t border-[#c5a56d]/10" /><Globe2 size={30} className="text-[#c5a56d]" />{active.map((m, i) => <span key={m.name} className={`absolute h-2 w-2 animate-pulse rounded-full ${i === 0 ? 'left-10 top-14 bg-red-400 shadow-[0_0_18px_#ef4444]' : i === 1 ? 'right-9 top-24 bg-orange-300' : 'bottom-10 left-20 bg-[#dfc084]'}`} />)}</div><div className="relative flex flex-wrap justify-center gap-5 text-xs text-stone-300">{['CRITICAL', 'HIGH', 'MEDIUM'].map(t => <span key={t}>{t} <span className="ml-1 text-[#dfc084]">{active.filter(m => m.threat === t).length.toString().padStart(2, '0')}</span></span>)}</div></div>;
}
function JarvisCore({ compact = false }: { compact?: boolean }) {
  return <div className={`jarvis-core ${compact ? 'h-14 w-14' : 'h-48 w-48 md:h-64 md:w-64'}`} aria-hidden="true">
    <span className="jarvis-orbit jarvis-orbit-one" />
    <span className="jarvis-orbit jarvis-orbit-two" />
    <span className="jarvis-orbit jarvis-orbit-three" />
    <span className="jarvis-eye"><Bot className={compact ? 'h-5 w-5' : 'h-12 w-12 md:h-16 md:w-16'} strokeWidth={1.2} /></span>
  </div>;
}
export default function App() {
  const [page, setPage] = useState(0), [mobile, setMobile] = useState(false), [query, setQuery] = useState(''), [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<number[]>([]), [team, setTeam] = useState<number[]>(() => load('shield-team', []));
  const [teamName, setTeamName] = useState(() => load('shield-name', 'Avengers Alpha'));
  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = load<Mission[] | null>('shield-quests-v2', null);
    if (saved?.length === 3) return saved;
    const previous = load<{ status: string; team: number[] }[]>('shield-missions', []);
    return initialMissions.map((m, i) => ({ ...m, status: previous[i]?.status || m.status, team: previous[i]?.team || [] }));
  });
  const [heroIds, setHeroIds] = useState<Record<string, string>>({});
  const [heroStatuses, setHeroStatuses] = useState<ApiHero['status'][]>(heroes.map(() => 'Available'));
  const [backendTeamId, setBackendTeamId] = useState(() => load('shield-team-id', ''));
  const [apiReady, setApiReady] = useState(false), [geminiReady, setGeminiReady] = useState(false);
  const [apiError, setApiError] = useState(''), [aiModel, setAiModel] = useState('gemini-3.5-flash-lite');
  const [apiBusy, setApiBusy] = useState(false), [jarvisBusy, setJarvisBusy] = useState(false);
  const [mission, setMission] = useState(0), [enemy, setEnemy] = useState(4), [gallery, setGallery] = useState(false);
  const [heroModal, setHeroModal] = useState<number | null>(null), [detail, setDetail] = useState<number | null>(null);
  const [toast, setToast] = useState(''), [timeline, setTimeline] = useState<string[]>(['The Avengers Initiative is active. The world is watching.']);
  const [battle, setBattle] = useState<Battle | null>(null), [active, setActive] = useState(0), [heroOffset, setHeroOffset] = useState(0);
  const [villainOffset, setVillainOffset] = useState(0), [jarvisInput, setJarvisInput] = useState('');
  const [jarvisMessages, setJarvisMessages] = useState<{ role: 'user' | 'jarvis'; text: string }[]>([
    { role: 'jarvis', text: 'Good evening, Director. The JARVIS tactical console is ready. I can assess threats, recommend a squad, or explain combat systems.' },
  ]);
  const content = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion(), { scrollY } = useScroll(), parallax = useTransform(scrollY, [0, 850], [0, 170]);
  const assigned = apiReady
    ? heroStatuses.flatMap((status, id) => status === 'Assigned' ? [id] : [])
    : missions.filter(m => m.status === 'IN PROGRESS').flatMap(m => m.team);
  const available = heroes.length - new Set(assigned).size;
  const go = (p: number) => { setPage(p); setMobile(false); setQuery(''); setFilter('ALL'); window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' }); };
  const notify = (text: string) => { setToast(text); setTimeline(t => [`${new Date().toLocaleTimeString()} · ${text}`, ...t].slice(0, 20)); };
  const refreshBackendData = async () => {
    const health = await apiRequest<ApiHealth>('/health');
    setGeminiReady(health.gemini_configured);
    setAiModel(health.model);
    if (!health.supabase_configured) throw new Error('Supabase credentials are missing. Add them to the ignored .env file or Render environment.');
    const [remoteHeroes, remoteMissions] = await Promise.all([
      apiRequest<ApiHero[]>('/heroes'),
      apiRequest<ApiMission[]>('/missions'),
    ]);
    const idsByName: Record<string, string> = {};
    for (const hero of remoteHeroes) idsByName[hero.name] = hero.id;
    const missingHeroes = heroes.filter(hero => !idsByName[hero.name]).map(hero => hero.name);
    if (missingHeroes.length) throw new Error(`Supabase is missing seeded heroes: ${missingHeroes.join(', ')}.`);
    const statuses = heroes.map(hero => remoteHeroes.find(item => item.name === hero.name)!.status);
    const syncedMissions = mapRemoteMissions(remoteMissions);
    setHeroIds(idsByName);
    setHeroStatuses(statuses);
    setMissions(syncedMissions);
    setApiReady(true);
    setApiError('');
  };
  useEffect(() => {
    void refreshBackendData().catch(error => {
      setApiReady(false);
      setApiError(error instanceof Error ? error.message : 'The command backend could not be reached.');
    });
  }, []);
  useEffect(() => { try { localStorage.setItem('shield-team', JSON.stringify(team)); localStorage.setItem('shield-name', JSON.stringify(teamName)); localStorage.setItem('shield-quests-v2', JSON.stringify(missions)); localStorage.setItem('shield-team-id', JSON.stringify(backendTeamId)); } catch { /* Local state remains usable without storage. */ } }, [team, teamName, missions, backendTeamId]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer); } }, [toast]);
  useEffect(() => {
    if (page !== 0 || reduce) return;
    const heroTimer = window.setInterval(() => setHeroOffset(value => (value + 1) % heroes.length), 4200);
    const villainTimer = window.setInterval(() => setVillainOffset(value => (value + 1) % villains.length), 5200);
    return () => { window.clearInterval(heroTimer); window.clearInterval(villainTimer); };
  }, [page, reduce]);
  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  const chooseMission = (i: number) => { setMission(i); setEnemy(missions[i].villain); setBattle(null); };
  const assembleTeam = async () => {
    if (!apiReady || apiBusy || selected.length < 4 || !teamName.trim()) return;
    const selectedIds = selected.map(id => heroIds[heroes[id].name]);
    if (selectedIds.some(id => !id)) return notify('One or more selected Avengers are not available in the database.');
    setApiBusy(true);
    try {
      const created = await apiRequest<{ id: string; team_name: string }>('/teams', {
        method: 'POST',
        body: JSON.stringify({ name: teamName.trim(), hero_ids: selectedIds }),
      });
      setTeam([...selected]);
      setBackendTeamId(created.id);
      notify(`${created.team_name} assembled and saved to the command database.`);
      await refreshBackendData();
    } catch (error) {
      notify(`Team could not be saved: ${error instanceof Error ? error.message : 'Backend error.'}`);
    } finally {
      setApiBusy(false);
    }
  };
  const allocate = async () => {
    if (team.length < 4 || team.some(i => assigned.includes(i))) return notify('Assemble at least four available heroes to deploy.');
    if (!apiReady || !backendTeamId || !missions[mission].databaseId || apiBusy) return notify('Save a squad and connect the command database before deployment.');
    setApiBusy(true);
    try {
      await apiRequest(`/missions/${missions[mission].databaseId}/allocate`, {
        method: 'POST',
        body: JSON.stringify({ team_id: backendTeamId }),
      });
      await refreshBackendData();
      notify(`${teamName} deployed. ${missions[mission].name} is in progress.`);
    } catch (error) {
      notify(`Deployment failed: ${error instanceof Error ? error.message : 'Backend error.'}`);
    } finally {
      setApiBusy(false);
    }
  };
  const updateStatus = async (i: number, status: string) => {
    const selectedMission = missions[i];
    if (status === 'IN PROGRESS' && (!selectedMission.team.length || !selectedMission.databaseId)) {
      chooseMission(i);
      go(4);
      notify('Choose and deploy a saved squad before starting this mission.');
      return;
    }
    if (!apiReady || !selectedMission.databaseId || apiBusy) return notify('Connect the command database before updating mission status.');
    setApiBusy(true);
    try {
      if (status === 'IN PROGRESS') {
        const teamId = selectedMission.teamId || backendTeamId;
        if (!teamId) throw new Error('Save a squad before deploying.');
        await apiRequest(`/missions/${selectedMission.databaseId}/allocate`, {
          method: 'POST',
          body: JSON.stringify({ team_id: teamId }),
        });
      } else {
        const databaseStatus = status === 'COMPLETED' ? 'Completed' : 'Pending';
        await apiRequest(`/missions/${selectedMission.databaseId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: databaseStatus }),
        });
      }
      await refreshBackendData();
      notify(`${selectedMission.name}: ${status === 'COMPLETED' ? 'mission accomplished. Your heroes return.' : status.toLowerCase()}`);
    } catch (error) {
      notify(`Mission update failed: ${error instanceof Error ? error.message : 'Backend error.'}`);
    } finally {
      setApiBusy(false);
    }
  };
  const askJarvis = async (prompt = jarvisInput) => {
    const text = prompt.trim();
    if (!text || jarvisBusy) return;
    const history = jarvisMessages.map(message => ({
      role: message.role === 'jarvis' ? 'assistant' as const : 'user' as const,
      content: message.text,
    })).slice(-12);
    const context: JarvisContext = {
      heroes: heroes.map((hero, index) => ({
        name: hero.name,
        real_name: hero.real,
        status: heroStatuses[index],
      })),
      missions: missions.map(item => ({
        name: item.name,
        villain: villains[item.villain].name,
        location: item.location,
        threat_level: formatThreatLevel(item.threat),
        status: item.status === 'IN PROGRESS' ? 'In Progress' : item.status === 'COMPLETED' ? 'Completed' : 'Pending',
      })),
      selected_mission: missions[mission]?.name ?? null,
      selected_adversary: villains[enemy]?.name ?? null,
      battle_summary: battle ? `Round ${battle.round}; ${battle.enemyHP} enemy HP remaining; ${battle.result || 'battle in progress'}. Recent events: ${battle.log.slice(0, 4).join(' | ')}` : null,
    };
    setJarvisMessages(messages => [...messages, { role: 'user', text }]);
    setJarvisInput('');
    setJarvisBusy(true);
    try {
      const result = await apiRequest<{ reply: string; model: string }>('/jarvis/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, history, context }),
      });
      setJarvisMessages(messages => [...messages, { role: 'jarvis', text: result.reply }]);
    } catch (error) {
      setJarvisMessages(messages => [...messages, {
        role: 'jarvis',
        text: `Unable to reach JARVIS: ${error instanceof Error ? error.message : 'The backend request failed.'}`,
      }]);
    } finally {
      setJarvisBusy(false);
    }
  };
  const startBattle = () => {
    const ids = (team.length >= 4 ? team : [0, 1, 2, 3]).slice().sort((a, b) => heroes[b].speed - heroes[a].speed);
    setActive(ids[0]); setBattle({ fighters: ids.map(id => ({ id, hp: heroes[id].hp, energy: 100, cooldown: 0, guard: false })), enemyHP: villains[enemy].hp, round: 1, acted: [], log: ['Initiative established. Your fastest hero leads.', `${villains[enemy].name} enters the battlefield.`], result: '', popup: '', enemyTurn: false });
  };
  useEffect(() => {
    if (!battle?.enemyTurn || battle.result) return;
    const timer = setTimeout(() => {
      setBattle(previous => {
        if (!previous?.enemyTurn) return previous;
        const fighters = previous.fighters.map(f => ({ ...f })), living = fighters.filter(f => f.hp > 0), special = previous.round % 3 === 0;
        const targets = special ? living : [living[Math.floor(Math.random() * living.length)]];
        const events = targets.map(f => { const damage = Math.max(10, Math.round((villains[enemy].attack * (special ? 1.3 : 1) - heroes[f.id].defence * .5) * (f.guard ? .35 : 1))); f.hp = Math.max(0, f.hp - damage); return `${villains[enemy].name}: ${special ? villains[enemy].ability : 'counterattack'} → ${heroes[f.id].name} −${damage} HP${f.guard ? ' · BLOCKED' : ''}`; });
        fighters.forEach(f => { f.guard = false; f.cooldown = Math.max(0, f.cooldown - 1); });
        const next = fighters.find(f => f.hp > 0); if (next) setActive(next.id);
        return { ...previous, fighters, acted: [], round: previous.round + 1, enemyTurn: false, result: next ? '' : 'DEFEAT', popup: special ? villains[enemy].ability : 'ENEMY COUNTERATTACK', log: [...events, ...previous.log].slice(0, 40) };
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [battle?.enemyTurn, battle?.result, enemy]);
  const act = (action: string) => {
    if (!battle || battle.result || battle.enemyTurn) return;
    const current = battle.fighters.find(f => f.id === active);
    if (!current || current.hp <= 0 || battle.acted.includes(active)) return;
    if (action === 'special' && (current.energy < 30 || current.cooldown > 0)) return;
    if (action === 'team' && (battle.round < 2 || battle.fighters.filter(f => f.hp > 0 && f.energy >= 40).length < 3)) return;
    const fighters = battle.fighters.map(f => ({ ...f })), f = fighters.find(f => f.id === active)!;
    const critical = Math.random() < .22, damage = action === 'defend' ? 0 : Math.max(8, Math.round((heroes[active].attack * (action === 'special' ? 2.5 : action === 'team' ? 4.5 : 1) - villains[enemy].defence) * (critical ? 1.6 : 1)));
    const healed = Math.min(20, heroes[active].hp - f.hp);
    if (action === 'defend') { f.guard = true; f.energy = Math.min(100, f.energy + 25); f.hp += healed; }
    else if (action === 'special') { f.energy -= 30; f.cooldown = 3; }
    else if (action === 'team') fighters.filter(x => x.hp > 0).forEach(x => { x.energy = Math.max(0, x.energy - 40); });
    else f.energy = Math.min(100, f.energy + 12);
    const enemyHP = Math.max(0, battle.enemyHP - damage), acted = [...battle.acted, active], result = enemyHP === 0 ? 'VICTORY' : '';
    const event = action === 'defend' ? `${heroes[active].name} fortifies: +${healed} HP, +25 energy, 65% damage reduction.` : `${heroes[active].name}: ${action === 'special' ? heroes[active].power : action === 'team' ? 'Avengers Assemble' : 'attack'} → ${damage} damage${critical ? ' · CRITICAL' : ''}`;
    const next = fighters.find(f => f.hp > 0 && !acted.includes(f.id)); if (next) setActive(next.id);
    setBattle({ ...battle, fighters, enemyHP, acted, result, popup: damage ? `−${damage}${critical ? ' · CRITICAL' : ''}` : `+${healed} HP · DEFENDED`, enemyTurn: !next && !result, log: [`${new Date().toLocaleTimeString()} · ${event}`, ...battle.log].slice(0, 40) });
    if (result) { notify(`${villains[enemy].name} defeated. A new chapter begins.`); const i = missions.findIndex(m => m.villain === enemy && m.status === 'IN PROGRESS'); if (i >= 0) updateStatus(i, 'COMPLETED'); }
  };
  const heroCard = (id: number, select = false) => <button key={id} onClick={() => select ? toggle(id) : setHeroModal(id)} aria-label={`${select ? 'Select' : 'View profile of'} ${heroes[id].name}`} aria-pressed={select ? selected.includes(id) : undefined} className={`group relative min-w-0 overflow-hidden border text-left transition duration-500 motion-safe:hover:-translate-y-2 motion-safe:hover:[transform:perspective(1200px)_rotateY(-3deg)_translateY(-6px)] ${select && selected.includes(id) ? 'border-[#e0c38b] shadow-[0_0_30px_#c5a56d20]' : 'border-[#c5a56d]/20 hover:border-[#c5a56d]/70'}`}><div className="relative h-[350px] overflow-hidden"><Picture name={heroes[id].name} className="h-full w-full object-top saturate-[.65] transition duration-700 group-hover:scale-105 group-hover:saturate-100" /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0a] via-black/5 to-black/10" /><span className="absolute left-4 top-4 text-xs tracking-[.16em] text-[#f0ddb7]">0{id + 1} / AVENGER</span>{select && selected.includes(id) && <Check className="absolute right-4 top-4 h-7 w-7 bg-[#cfb078] p-1 text-black" />}<div className="absolute inset-x-0 bottom-0 p-5"><p className="mb-2 text-xs uppercase tracking-[.17em] text-[#d9bd89]">{heroes[id].title}</p><h3 className="font-display text-3xl text-[#f7f0e3]">{heroes[id].name}</h3><div className="mt-3 flex items-center justify-between"><span className="text-sm text-stone-300">{heroes[id].real}</span><ArrowRight size={17} className="text-[#dfc694] transition group-hover:translate-x-1" /></div></div></div><div className="border-t border-[#c5a56d]/15 bg-[#11120f] px-5 py-4"><div className="mb-2 flex justify-between text-xs text-stone-300"><span>{heroes[id].power}</span><span className={assigned.includes(id) ? 'text-orange-200' : 'text-[#d6c095]'}>{assigned.includes(id) ? 'ASSIGNED' : 'AVAILABLE'}</span></div><Bar value={heroes[id].attack} max={60} /></div></button>;
  const missionCard = (m: Mission, i: number) => <article key={m.name} className={`${frame} group min-w-0 overflow-hidden transition duration-500 hover:border-[#cfb078]/60`}><div className="relative h-64 overflow-hidden"><Picture name={villains[m.villain].name} className="h-full w-full object-[center_20%] saturate-[.6] transition duration-700 group-hover:scale-105 group-hover:saturate-100" /><div className="absolute inset-0 bg-gradient-to-t from-[#121310] via-transparent to-black/25" /><div className="absolute left-5 top-5"><Badge>{m.threat}</Badge></div><p className="absolute bottom-4 left-5 text-xs uppercase tracking-[.22em] text-[#dfc694]">Nemesis / {villains[m.villain].name}</p></div><div className="p-6"><p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[.15em] text-stone-300"><MapPin size={13} />{m.location} <span className="ml-auto text-[#ddc28e]">{'✦'.repeat(5 - i)}</span></p><h3 className="font-display text-3xl">{m.name}</h3><p className="mt-4 min-h-16 text-sm leading-7 text-stone-300">{m.desc}</p><div className="my-5 flex items-center justify-between"><Badge>{m.status}</Badge><span className="text-xs text-stone-300">4+ HEROES</span></div><div className="flex gap-2"><button className={`${btn} flex-1 px-2`} onClick={() => setDetail(i)}>Intel <ChevronRight size={14} /></button><button className={`${primary} flex-1 px-2`} onClick={() => { chooseMission(i); go(4); }}>Accept quest</button></div></div></article>;
  const current = battle?.fighters.find(f => f.id === active);
  const galleryHeroes = heroes.map((h, id) => ({ ...h, id })).filter(h => `${h.name} ${h.real} ${h.power}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'ALL' || (assigned.includes(h.id) ? 'ASSIGNED' : 'AVAILABLE') === filter));
  return <div className="min-h-screen overflow-x-hidden bg-[#0b0c0a] font-sans text-[#eee9df] selection:bg-[#c5a56d]/40">
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20180%20180%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%22.9%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Cpath%20fill=%22%23fff%22%20opacity=%22.025%22%20filter=%22url(%23n)%22%20d=%22M0%200h180v180H0z%22/%3E%3C/svg%3E')]" />
    <header className="absolute inset-x-0 top-0 z-30 border-b border-[#cfb078]/20 bg-gradient-to-b from-black/65 to-transparent">
      <div className="mx-auto flex h-24 max-w-[1600px] items-center justify-between gap-5 px-5 md:px-10 xl:px-16"><button onClick={() => go(0)} className="flex min-h-11 shrink-0 items-center gap-3" aria-label="Avengers home"><span className="h-12 w-12 overflow-hidden rounded-full border border-[#c5a56d]/70 shadow-[0_0_22px_#dcaa5c55]"><img src={avengersLogo} alt="" className="h-full w-full object-cover object-center" /></span><span className="text-left"><span className="block font-display text-xl tracking-[.2em] text-[#e4c999]">AVENGERS</span><span className="mt-1 block text-xs tracking-[.22em] text-stone-300">THE AVENGERS INITIATIVE</span></span></button><nav className="hidden items-center gap-4 lg:flex xl:gap-6">{chapters.map((name, i) => <button key={name} onClick={() => go(i)} aria-current={page === i ? 'page' : undefined} className={`relative min-h-12 whitespace-nowrap text-xs tracking-[.05em] transition hover:text-[#e4c999] ${page === i ? 'text-[#e4c999]' : 'text-stone-300'}`}>{name}{page === i && <span className="absolute inset-x-2 bottom-1 h-px bg-[#c5a56d]" />}</button>)}</nav><button onClick={() => go(2)} className={`${btn} hidden shrink-0 px-4 2xl:inline-flex`}>Assemble <ArrowRight size={14} /></button><button onClick={() => setMobile(!mobile)} aria-label="Toggle navigation" aria-expanded={mobile} className={`${btn} px-3 lg:hidden`}>{mobile ? <X size={22} /> : <Menu size={22} />}</button></div>
      {mobile && <nav className="border-t border-[#c5a56d]/20 bg-[#0d0e0c] px-6 py-4 lg:hidden">{chapters.map((name, i) => <button key={name} onClick={() => go(i)} className={`block min-h-12 w-full border-b border-[#c5a56d]/10 text-left text-sm ${page === i ? 'text-[#dfc18c]' : 'text-stone-300'}`}><span className="mr-4 font-display text-[#c5a56d]">{numerals[i]}.</span>{name}</button>)}</nav>}
    </header>
    {apiError && <div role="alert" className="relative z-20 border-b border-amber-300/25 bg-amber-950/85 px-5 py-3 text-center text-xs leading-5 text-amber-100 md:text-sm">{apiError} Check <code className="rounded bg-black/30 px-1.5 py-0.5">.env</code> locally or set the same variables in Render.</div>}
    <AnimatePresence mode="wait"><motion.div key={page} initial={{ y: reduce ? 0 : 8 }} animate={{ y: 0 }} exit={{ opacity: reduce ? 1 : 0 }} transition={{ duration: .25 }}>
      {page === 0 ? <section className="relative isolate flex min-h-[850px] flex-col justify-center overflow-hidden md:min-h-[max(820px,100svh)]">
        <motion.div style={{ y: reduce ? 0 : parallax }} className="absolute -inset-x-4 -top-4 bottom-0 -z-20"><Picture src="/art/avengers-cinematic.jpg" name="The Avengers assembled against a cinematic battlefield" className="h-full w-full object-[60%_center] brightness-[.65] saturate-[.55] md:object-center" /></motion.div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#080a09ed_0%,#080a09b8_28%,#080a0930_65%,#080a0920_100%)]" /><div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b0c0a] via-transparent to-black/20" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">{Array.from({ length: 14 }, (_, i) => <span key={i} className="absolute h-px w-px animate-[embers_9s_ease-in-out_infinite] bg-[#f4d49a] shadow-[0_0_6px_#f0bb56] motion-reduce:animate-none" style={{ left: `${8 + i * 6.5}%`, top: `${35 + i % 5 * 11}%`, animationDelay: `${i * -.7}s` }} />)}</div>
        <div className="mx-auto w-full max-w-[1600px] px-6 pb-52 pt-44 md:px-16 lg:px-24">
          <p className="mb-7 flex items-center gap-4 text-xs uppercase tracking-[.36em] text-[#e0c28c]"><span className="h-px w-10 bg-[#c5a56d]" />A world worth fighting for</p>
          <h1 className="max-w-[760px] font-display text-[62px] font-normal leading-[1.05] tracking-[-.035em] sm:text-7xl md:text-[86px] lg:text-[102px]">Earth’s last<br />line of <em className="font-light text-[#dfc18c]">defense.</em></h1>
          <p className="mt-7 max-w-[370px] text-sm font-light leading-7 text-stone-300">When the impossible becomes inevitable,<br className="hidden md:block" /> extraordinary individuals become something more.</p>
          <div className="mt-9 flex flex-wrap items-center gap-5"><button className={primary} onClick={() => go(2)}>Assemble the Avengers <ArrowRight size={16} /></button><button className={`${btn} border-transparent px-0 hover:border-transparent hover:bg-transparent`} onClick={() => go(3)}>Discover the missions <ArrowRight size={16} /></button></div>
        </div>
        <div className="absolute bottom-40 right-16 hidden text-right lg:block"><div className="mb-3 ml-auto h-px w-12 bg-[#d3b578]" /><p className="font-display text-2xl italic text-[#e8d8ba]">“Whatever it takes.”</p><p className="mt-2 text-xs uppercase tracking-[.22em] text-stone-300">The Avengers</p></div>
        <div className="absolute inset-x-6 bottom-8 mx-auto max-w-[1408px] border-y border-[#c5a56d]/25 bg-black/15 backdrop-blur-sm md:inset-x-16"><div className="grid grid-cols-2 md:grid-cols-4">{[{ n: heroes.length, label: 'Extraordinary heroes' }, { n: missions.filter(m => m.status !== 'COMPLETED').length, label: 'Active operations' }, { n: available, label: 'Ready to assemble' }, { n: villains.length, label: 'Known adversaries' }].map((stat, i) => <div key={stat.label} className={`flex items-center justify-center gap-4 px-3 py-5 ${i !== 3 ? 'md:border-r md:border-[#c5a56d]/20' : ''}`}><span className="font-display text-4xl text-[#dfc18c]">{String(stat.n).padStart(2, '0')}</span><span className="max-w-24 text-xs uppercase leading-5 tracking-[.13em] text-stone-300">{stat.label}</span></div>)}</div></div>
      </section> : <section className="relative isolate overflow-hidden px-6 pb-14 pt-44 text-center md:pt-48"><div className="absolute inset-0 -z-20"><Picture src={page === 3 ? '/art/asgard.png' : page === 5 ? '/art/battlefield.png' : '/art/sanctum.png'} name="Cinematic chapter backdrop" className="h-full w-full object-center brightness-[.2] saturate-[.45]" /></div><div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b0c0a] via-[#0b0c0a]/25 to-black/20" /><p className="mb-5 text-xs uppercase tracking-[.35em] text-[#d7b980]">The Avengers Initiative / Chapter {numerals[page]}</p><h1 className="font-display text-6xl md:text-7xl">{chapters[page]}</h1><p className="mb-7 mt-5 text-sm text-stone-300">{subtitles[page]}</p><Ornament /></section>}
      <main ref={content} className="mx-auto max-w-[1440px] px-5 pb-20 pt-8 md:px-12 lg:px-16">
        {page === 0 && <>
          <div className="mb-14 flex justify-center"><button onClick={() => content.current?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' })} className="flex min-h-11 items-center gap-3 text-xs uppercase tracking-[.23em] text-[#ddc18d]">Enter the initiative <ArrowDown size={15} /></button></div>
          <SectionHeading eyebrow="Extraordinary people. A singular purpose." title={<>Not born to follow.<br /><em className="text-[#d7b980]">Called to protect.</em></>} text="They came from different worlds. They chose to stand for this one. Meet the remarkable few who answer when humanity calls." />
          <div className="mb-5 mt-9 flex justify-between"><button className="min-h-11 text-xs uppercase tracking-[.18em] text-[#d8bd8b]" onClick={() => go(1)}>Explore all heroes <ArrowRight className="ml-2 inline" size={15} /></button><div className="flex gap-2"><button aria-label="Previous heroes" className={`${btn} px-3`} onClick={() => setHeroOffset(value => (value - 1 + heroes.length) % heroes.length)}><ArrowLeft size={17} /></button><button aria-label="Next heroes" className={`${btn} px-3`} onClick={() => setHeroOffset(value => (value + 1) % heroes.length)}><ArrowRight size={17} /></button></div></div>
          <div className="carousel-stage hero-stage">
            {[-2, -1, 0, 1, 2].map(position => { const id = (heroOffset + position + heroes.length) % heroes.length; return <div key={`${heroOffset}-${id}`} className={`hero-3d-card position-${position + 2}`}>{heroCard(id)}</div>; })}
          </div>
          <div className="mb-10 mt-24"><SectionHeading eyebrow="Threat archive / rotating intelligence" title={<>Know your <em className="text-[#d7b980]">enemy.</em></>} text="A three-dimensional threat matrix tracks the most dangerous minds in the known universe." /></div>
          <div className="mb-5 flex items-center justify-between"><button className="min-h-11 text-xs uppercase tracking-[.18em] text-[#d8bd8b]" onClick={() => setGallery(true)}>Explore all villains <ArrowRight className="ml-2 inline" size={15} /></button><div className="flex gap-2"><button aria-label="Previous villains" className={`${btn} px-3`} onClick={() => setVillainOffset(v => (v - 1 + villains.length) % villains.length)}><ArrowLeft size={17} /></button><button aria-label="Next villains" className={`${btn} px-3`} onClick={() => setVillainOffset(v => (v + 1) % villains.length)}><ArrowRight size={17} /></button></div></div>
          <div className="carousel-stage">
            {[-2, -1, 0, 1, 2].map(position => { const id = (villainOffset + position + villains.length) % villains.length; const v = villains[id]; return <button key={`${villainOffset}-${id}`} onClick={() => { setEnemy(id); setGallery(true); }} className={`villain-3d-card position-${position + 2}`} aria-label={`Inspect ${v.name}`}><Picture name={v.name} className="h-full w-full object-top" /><span className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" /><span className="absolute inset-x-0 bottom-0 p-5 text-left"><span className="block text-xs tracking-[.2em] text-red-200">{v.threat} THREAT</span><span className="mt-2 block font-display text-3xl text-white">{v.name}</span><span className="mt-2 block text-xs text-stone-300">{v.ability}</span></span></button>; })}
          </div>
          <div className="my-20"><Ornament /></div>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]"><div><p className="text-xs uppercase tracking-[.25em] text-[#d4b77e]">The world / live intelligence</p><h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">A fragile world.<br /><em className="text-[#d7b980]">An unbreakable resolve.</em></h2><p className="mt-5 max-w-md text-sm leading-7 text-stone-300">The horizon is never quiet. Our global network watches every signal, every disturbance, every shadow—so the Avengers can be there when it matters.</p><div className="my-6"><Badge>{missions.some(m => m.status !== 'COMPLETED' && m.threat === 'CRITICAL') ? 'CRITICAL' : 'MONITORING'}</Badge><span className="ml-3 text-xs uppercase tracking-widest text-stone-300">Global threat assessment</span></div><button className={btn} onClick={() => go(3)}>View active operations <ArrowRight size={15} /></button></div><Radar missions={missions} /></div>
          <div className="mb-10 mt-24"><SectionHeading eyebrow="For a world that cannot wait" title={<>The next <em className="text-[#d7b980]">calling.</em></>} text="Every mission carries a risk. Every choice carries the fate of millions." /></div><div className="grid gap-6 md:grid-cols-3">{missions.map(missionCard)}</div>
          <section className="relative isolate mt-24 overflow-hidden border-y border-[#c5a56d]/25 px-6 py-20 text-center"><Picture src="/art/asgard.png" name="The golden realm of Asgard" className="absolute inset-0 -z-20 h-full w-full brightness-[.3] saturate-[.5]" /><div className="absolute inset-0 -z-10 bg-black/35" /><Crown className="mx-auto mb-5 text-[#d8bb83]" size={30} strokeWidth={1} /><p className="mb-5 text-xs uppercase tracking-[.3em] text-[#e2c994]">A greater purpose awaits</p><h2 className="font-display text-4xl leading-tight md:text-6xl">The world doesn’t need a hero.<br /><em className="text-[#dfc18c]">It needs a team.</em></h2><button className={`${primary} mt-9`} onClick={() => go(2)}>Begin your assembly <ArrowRight size={16} /></button></section>
        </>}
        {(page === 1 || page === 2) && <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">{page === 1 ? <><label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 border-b border-[#c5a56d]/30"><Search size={18} className="text-[#d8bb83]" /><input aria-label="Search heroes" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a hero, identity, or power..." className="w-full bg-transparent py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#c5a56d]" /></label><select aria-label="Filter hero availability" value={filter} onChange={e => setFilter(e.target.value)} className={`${btn} bg-[#141510]`}><option value="ALL">All heroes</option><option>AVAILABLE</option><option>ASSIGNED</option></select></> : <><p className="text-sm text-stone-300">Choose at least <span className="text-[#dfc18c]">four Avengers</span>. Greatness is never a solitary pursuit.</p><span className="font-display text-3xl text-[#dfc18c]">{selected.length}<span className="ml-2 text-base text-stone-300">/ 6 chosen</span></span></>}</div>
          <div className="grid gap-6 md:grid-cols-3">{galleryHeroes.map(h => heroCard(h.id, page === 2))}</div>{!galleryHeroes.length && <p className="py-20 text-center text-stone-300">No heroes match your search.</p>}
          {page === 2 && <section className={`${frame} mt-10 p-6 md:p-9`}><p className="mb-3 text-xs uppercase tracking-[.2em] text-[#dfc18c]">Your chosen few</p><h2 className="font-display text-3xl">The beginning of something greater.</h2><div className="my-6 grid gap-4 md:grid-cols-2">{selected.map(id => <div key={id} className="flex items-center gap-4 border-b border-[#c5a56d]/15 pb-4"><Picture name={heroes[id].name} className="h-16 w-14 object-top" /><div className="min-w-0 flex-1"><div className="mb-2 flex justify-between gap-2 text-sm"><span>{heroes[id].name}</span><span className="text-[#d8bd8b]">{heroes[id].hp} HP</span></div><Bar value={100} /><p className="mt-2 text-xs text-stone-300">{heroes[id].power}</p></div><button aria-label={`Remove ${heroes[id].name}`} className={`${btn} px-3`} onClick={() => toggle(id)}><X size={14} /></button></div>)}</div><div className="flex flex-wrap gap-4"><input aria-label="Team name" maxLength={40} value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Name your team" className={`${btn} min-w-0 flex-1 bg-black/20 text-sm normal-case tracking-normal`} /><button disabled={selected.length < 4 || !teamName.trim() || !apiReady || apiBusy} className={primary} onClick={assembleTeam}>Assemble team <ArrowRight size={15} /></button></div><p className="mt-4 text-xs text-stone-300">{apiReady ? 'Teams are saved to Supabase.' : 'Connect Supabase to save and deploy your team.'} {team.length > 0 ? `Current squad: ${team.length} Avengers.` : 'Select four heroes to unlock your team.'}</p></section>}
        </>}
        {page === 3 && <><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-stone-300">Three threats. Countless lives. Your move, Director.</p><button className={btn} onClick={() => { setQuery(''); setGallery(true); }}><Skull size={16} />The adversaries / 25</button></div><div className="grid gap-6 md:grid-cols-3">{missions.map(missionCard)}</div><div className={`${frame} mt-10 flex flex-wrap items-center justify-between gap-5 p-7`}><div><p className="mb-2 text-xs uppercase tracking-[.2em] text-[#dfc18c]">Beyond the known horizon</p><h2 className="font-display text-2xl">Twenty-five enemies. One world to protect.</h2><p className="mt-3 text-sm text-stone-300">Study their powers, choose your opponent, and test your squad in the arena.</p></div><button className={primary} onClick={() => setGallery(true)}>Open villain archive <ArrowRight size={16} /></button></div></>}
        {page === 4 && <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]"><section className={`${frame} p-6 md:p-9`}><p className="text-xs uppercase tracking-[.2em] text-[#dfc18c]">The right people. The right purpose.</p><h2 className="mb-8 mt-3 font-display text-3xl">Choose your deployment.</h2><label htmlFor="squad" className="mb-3 block text-sm text-stone-300">Your assembled squad</label><select id="squad" className={`${btn} w-full bg-[#171811]`}><option>{team.length ? `${teamName} / ${team.length} heroes` : 'No team assembled yet'}</option></select>{!team.length && <button className={`${btn} mt-4`} onClick={() => go(2)}>Begin the assembly <ArrowRight size={15} /></button>}<label htmlFor="objective" className="mb-3 mt-7 block text-sm text-stone-300">Mission objective</label><select id="objective" className={`${btn} w-full bg-[#171811]`} value={mission} onChange={e => chooseMission(Number(e.target.value))}>{missions.map((m, i) => <option key={m.name} value={i}>{m.name} / {m.threat}</option>)}</select><div className="mt-7 space-y-4">{team.map(id => <div key={id} className="flex items-center gap-4 border-b border-[#c5a56d]/15 pb-4"><Picture name={heroes[id].name} className="h-14 w-12 object-top" /><span className="flex-1 text-sm">{heroes[id].name}</span><Badge>{assigned.includes(id) ? 'ASSIGNED' : 'AVAILABLE'}</Badge></div>)}</div><button className={`${primary} mt-8 w-full`} disabled={!apiReady || !backendTeamId || apiBusy || team.length < 4 || team.some(id => assigned.includes(id)) || missions[mission].status !== 'PENDING'} onClick={allocate}>Deploy the Avengers <ArrowRight size={16} /></button><p className="mt-4 text-xs leading-6 text-stone-300">Heroes on active duty cannot be assigned elsewhere. Complete their mission to bring them home.</p>{missions[mission].status === 'IN PROGRESS' && <button className={`${btn} mt-4 w-full`} onClick={() => { setEnemy(missions[mission].villain); setBattle(null); go(5); }}>Enter mission battle <Swords size={16} /></button>}</section><div>{missionCard(missions[mission], mission)}</div></div>}
        {page === 5 && <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><Badge>{battle ? `ROUND ${battle.round}` : 'ARENA READY'}</Badge><span className="text-sm text-stone-300">Adversary / <span className="text-[#dfc18c]">{villains[enemy].name}</span></span></div><div className="flex gap-3"><button className={btn} onClick={() => { setQuery(''); setGallery(true); }}>Choose adversary</button><button className={primary} onClick={startBattle}>{battle ? 'Restart battle' : 'Begin battle'}<Swords size={15} /></button></div></div>
          <div className="grid gap-6 xl:grid-cols-[1fr_280px]"><section className={`${frame} relative isolate min-w-0 overflow-hidden p-4 md:p-7`}><Picture src="/art/battlefield.png" name="Cinematic battlefield" className="absolute inset-0 -z-20 h-full w-full brightness-[.18] saturate-[.4]" /><div className="absolute inset-0 -z-10 bg-[#0b0c0a]/55" />
            {!battle ? <div className="grid min-h-[520px] place-items-center text-center"><div><Swords className="mx-auto mb-6 text-[#d8bb83]" size={44} strokeWidth={1} /><p className="mb-4 text-xs uppercase tracking-[.25em] text-[#dfc18c]">The battlefield awaits</p><h2 className="font-display text-4xl md:text-5xl">Courage is a choice.</h2><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-stone-300">Command your squad through a turn-based encounter. Use special powers, conserve energy, and defend against the enemy’s third-round onslaught.</p><p className="mt-4 text-xs text-[#dfc18c]">{team.length >= 4 ? `${teamName} is ready.` : 'A four-hero training squad will join you.'}</p><button className={`${primary} mt-7`} onClick={startBattle}>Enter the arena <ArrowRight size={15} /></button></div></div> : <>
              <div className="mb-5 flex flex-wrap items-center gap-2"><span className={`mr-2 text-xs uppercase tracking-[.15em] ${battle.enemyTurn ? 'text-red-300' : 'text-[#dfc18c]'}`}>{battle.enemyTurn ? 'Enemy turn' : 'Initiative'}</span>{battle.fighters.map(f => <button key={f.id} disabled={f.hp <= 0 || battle.acted.includes(f.id) || battle.enemyTurn || !!battle.result} onClick={() => setActive(f.id)} className={`${btn} px-2 py-2 text-xs tracking-normal ${active === f.id ? 'border-[#dec18a] bg-[#c5a56d]/15' : ''}`}>{heroes[f.id].name}{battle.acted.includes(f.id) && <Check size={12} />}</button>)}</div>
              <div className="grid items-center gap-4 md:grid-cols-[1fr_40px_1fr]"><div className="grid grid-cols-2 gap-3">{battle.fighters.map(f => <button key={f.id} aria-label={`Command ${heroes[f.id].name}`} disabled={f.hp <= 0 || battle.acted.includes(f.id) || battle.enemyTurn || !!battle.result} onClick={() => setActive(f.id)} className={`min-w-0 overflow-hidden border bg-[#10110e] text-left transition ${active === f.id ? 'border-[#d8b779] shadow-[0_0_22px_#c5a56d20]' : 'border-[#c5a56d]/15'} ${f.hp <= 0 ? 'grayscale' : ''}`}><Picture name={heroes[f.id].name} className="h-28 w-full object-top md:h-36" /><div className="p-2"><p className="mb-2 truncate text-xs">{heroes[f.id].name}{f.guard ? ' / DEFENDED' : ''}</p><Bar value={f.hp} max={heroes[f.id].hp} color="#84bb96" /><div className="my-2 flex justify-between text-xs text-stone-300"><span>{f.hp} HP</span><span>{f.energy} EP</span></div><Bar value={f.energy} color="#9cadd2" /></div></button>)}</div><div className="text-center font-display text-3xl italic text-[#d8bb83]">vs.</div><div className={battle.enemyTurn ? 'animate-[enemyGlow_1s_ease-in-out]' : ''}><div className="relative"><Picture name={villains[enemy].name} className="h-64 w-full border border-red-300/20 object-top md:h-80" /><div className="absolute inset-x-0 bottom-4 text-center"><span key={battle.log.length} className="inline-block animate-[damage_.7s_ease-out] bg-black/85 px-3 py-1 font-display text-xl text-[#f0d292] motion-reduce:animate-none">{battle.popup}</span></div></div><h3 className="my-3 font-display text-3xl">{villains[enemy].name}</h3><Bar value={battle.enemyHP} max={villains[enemy].hp} color="#c56e65" /><p className="mt-3 text-xs text-stone-300">{battle.enemyHP} / {villains[enemy].hp} HP · {villains[enemy].ability}</p></div></div>
              <div className="mt-7 border-t border-[#c5a56d]/25 pt-5"><div className="mb-4 flex flex-wrap justify-between gap-2"><h3 className="font-display text-2xl text-[#dfc18c]">{battle.enemyTurn ? 'The enemy makes their move…' : `${heroes[active].name}, your move.`}</h3><span className="text-xs text-stone-300">ENERGY {current?.energy} / 100</span></div><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{[{ name: 'Attack', action: 'attack', icon: Crosshair, info: '+12 energy' }, { name: 'Special power', action: 'special', icon: Zap, info: current?.cooldown ? `${current.cooldown} turn cooldown` : '30 energy' }, { name: 'Defend', action: 'defend', icon: Shield, info: 'Heal & block 65%' }, { name: 'Team attack', action: 'team', icon: Sparkles, info: '3 heroes / 40 EP' }].map(a => <button key={a.action} className={`${btn} flex-col px-2 py-4 tracking-normal`} onClick={() => act(a.action)} disabled={battle.enemyTurn || !!battle.result || (a.action === 'special' && ((current?.energy || 0) < 30 || !!current?.cooldown)) || (a.action === 'team' && (battle.round < 2 || battle.fighters.filter(f => f.hp > 0 && f.energy >= 40).length < 3))}><a.icon size={19} strokeWidth={1.5} /><span className="mt-1 text-xs uppercase tracking-wider">{a.name}</span><span className="text-xs normal-case text-stone-300">{a.info}</span></button>)}</div><p className="mt-4 text-xs leading-6 text-stone-300">Signature ability: {heroes[active].power}. Critical chance: 22%. Team attack unlocks in round two. Enemy special triggers every third round.</p></div>
              {battle.result && <div className="absolute inset-0 z-10 grid place-items-center bg-[#0b0c0a]/95 p-6 text-center"><motion.div initial={{ scale: reduce ? 1 : .9 }} animate={{ scale: 1 }}><Crown className={`mx-auto mb-6 h-16 w-16 ${battle.result === 'VICTORY' ? 'text-[#dfc18c]' : 'text-red-300'}`} strokeWidth={1} /><Ornament /><p className="mb-4 mt-6 text-xs uppercase tracking-[.3em] text-[#dfc18c]">The battle is over</p><h2 className="font-display text-6xl">{battle.result === 'VICTORY' ? 'A world defended.' : 'Not the final chapter.'}</h2><p className="mt-5 text-sm text-stone-300">{battle.result === 'VICTORY' ? 'Threat neutralized. Your heroes have written their legend.' : 'Regroup your heroes. Courage means trying again.'}</p><button className={`${primary} mt-8`} onClick={startBattle}>Fight again <Swords size={15} /></button></motion.div></div>}
            </>}
          </section><aside className={`${frame} min-w-0 p-6`}><p className="text-xs uppercase tracking-[.2em] text-[#dfc18c]">From the front line</p><h2 className="mb-6 mt-3 font-display text-2xl">The battle record.</h2><div role="log" aria-live="polite" className="max-h-[650px] space-y-5 overflow-y-auto pr-1">{(battle?.log || ['Awaiting your command.', 'A secure simulation. An extraordinary challenge.']).map((entry, i) => <p key={`${i}-${entry}`} className="border-l border-[#c5a56d]/30 pl-3 text-sm leading-6 text-stone-300">{entry}</p>)}</div></aside></div>
        </>}
        {page === 6 && <><div className="grid gap-6 lg:grid-cols-3">{['PENDING', 'IN PROGRESS', 'COMPLETED'].map(status => <section key={status} className={`${frame} p-5`}><div className="mb-6 flex items-center justify-between"><Badge>{status}</Badge><span className="font-display text-2xl text-[#dfc18c]">{String(missions.filter(m => m.status === status).length).padStart(2, '0')}</span></div><div className="space-y-5">{missions.map((m, i) => m.status === status && <article key={m.name} className="border-t border-[#c5a56d]/20 pt-5"><h3 className="font-display text-2xl">{m.name}</h3><p className="my-3 text-sm text-stone-300">{villains[m.villain].name} / {m.location}</p><Badge>{m.threat}</Badge><div className="my-5"><Bar value={status === 'COMPLETED' ? 100 : status === 'IN PROGRESS' ? 50 : 0} color={status === 'COMPLETED' ? '#84bb96' : gold} /></div><p className="mb-4 text-xs leading-6 text-stone-300">{m.team.length ? m.team.map(id => heroes[id].name).join(' · ') : 'Awaiting an extraordinary team.'}</p><select aria-label={`Update ${m.name} status`} value={status} disabled={!apiReady || apiBusy} onChange={e => updateStatus(i, e.target.value)} className={`${btn} w-full bg-[#171811]`}><option>PENDING</option><option>IN PROGRESS</option><option>COMPLETED</option></select></article>)}</div>{!missions.some(m => m.status === status) && <p className="py-12 text-center font-display text-xl italic text-stone-300">The story is yet to be written.</p>}</section>)}</div><section className={`${frame} mt-10 p-7`}><p className="mb-3 text-xs uppercase tracking-[.2em] text-[#dfc18c]">The living archive</p><h2 className="mb-7 font-display text-3xl">Moments that matter.</h2><div className="space-y-5">{timeline.map((entry, i) => <div key={`${i}-${entry}`} className="flex items-start gap-4 text-sm leading-6 text-stone-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#c5a56d]" />{entry}</div>)}</div></section></>}
        {page === 7 && <div className="grid gap-8 xl:grid-cols-[.85fr_1.35fr]">
          <section className={`${frame} relative isolate overflow-hidden p-7 text-center md:p-10`}><div className="jarvis-grid absolute inset-0 -z-10 opacity-35" /><p className="text-xs uppercase tracking-[.3em] text-cyan-200">Artificial intelligence / {geminiReady ? 'online' : 'setup required'}</p><div className="my-8 flex justify-center"><JarvisCore /></div><h2 className="font-display text-4xl text-white">Just A Rather Very<br /><em className="text-cyan-200">Intelligent System.</em></h2><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-stone-300">A tactical interface connected to your current squad, mission state, adversary archive, and combat simulator.</p><div className="mt-8 grid grid-cols-3 gap-3">{[['Systems', apiReady ? 'ONLINE' : 'SETUP'], ['Threats', String(missions.filter(m => m.status !== 'COMPLETED').length).padStart(2, '0')], ['Squad', String(team.length).padStart(2, '0')]].map(([label, value]) => <div key={label} className="border border-cyan-200/15 bg-cyan-300/5 p-3"><p className="font-display text-2xl text-cyan-100">{value}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-stone-300">{label}</p></div>)}</div></section>
          <section className={`${frame} flex min-h-[620px] flex-col overflow-hidden`}><div className="flex items-center justify-between border-b border-cyan-200/15 bg-cyan-300/5 px-5 py-4"><div className="flex items-center gap-3"><Activity className="text-cyan-200" size={18} /><div><p className="text-xs uppercase tracking-[.2em] text-cyan-100">JARVIS command terminal</p><p className="mt-1 text-xs text-stone-300">{aiModel} · {geminiReady ? 'Gemini connected' : 'Gemini API key required'}</p></div></div><span className={`flex items-center gap-2 text-xs ${geminiReady ? 'text-emerald-200' : 'text-amber-200'}`}><span className={`h-2 w-2 rounded-full ${geminiReady ? 'animate-pulse bg-emerald-300' : 'bg-amber-300'}`} />{geminiReady ? 'AI ONLINE' : 'GEMINI SETUP'}</span></div>
            <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">{jarvisMessages.map((message, i) => <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={`${i}-${message.text}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>{message.role === 'jarvis' && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-200/25 bg-cyan-300/10"><Cpu size={16} className="text-cyan-100" /></span>}<div className={`max-w-[82%] border px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'border-[#c5a56d]/30 bg-[#c5a56d]/10 text-[#f0e7d7]' : 'border-cyan-200/15 bg-cyan-300/5 text-stone-200'}`}><p className="mb-1 text-[10px] uppercase tracking-[.2em] text-cyan-200">{message.role === 'user' ? 'Director' : 'JARVIS'}</p>{message.text}</div></motion.div>)}</div>
            <div className="border-t border-cyan-200/15 p-4 md:p-5"><div className="mb-3 flex flex-wrap gap-2">{['Assess current threat', 'Recommend a squad', 'How do I win a battle?'].map(prompt => <button key={prompt} disabled={jarvisBusy} onClick={() => askJarvis(prompt)} className="border border-cyan-200/20 px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50">{prompt}</button>)}</div><form onSubmit={e => { e.preventDefault(); void askJarvis(); }} className="flex gap-2"><input value={jarvisInput} onChange={e => setJarvisInput(e.target.value)} aria-label="Message JARVIS" placeholder="Enter a tactical query..." disabled={jarvisBusy} className="min-h-12 min-w-0 flex-1 border border-cyan-200/20 bg-black/30 px-4 text-sm outline-none focus:border-cyan-100 disabled:opacity-60" /><button disabled={jarvisBusy || !jarvisInput.trim()} className="grid min-h-12 min-w-12 place-items-center border border-cyan-100/40 bg-cyan-300/10 text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-50" aria-label="Send to JARVIS"><Send size={18} /></button></form>{jarvisBusy && <p role="status" className="mt-3 text-xs text-cyan-100">JARVIS is analyzing the current command data…</p>}</div>
          </section>
        </div>}
      </main>
    </motion.div></AnimatePresence>
    <footer className="border-t border-[#c5a56d]/20 bg-[#090a08] px-6 pb-7 pt-12 text-center"><img src={avengersLogo} alt="" className="mx-auto mb-4 h-12 w-12 rounded-full border border-[#c5a56d]/50 object-cover" /><p className="font-display text-2xl tracking-[.18em] text-[#dbc08d]">AVENGERS</p><p className="mt-3 text-xs uppercase tracking-[.22em] text-stone-300">Some protect a city. We protect a world.</p><div className="mx-auto my-7 flex max-w-2xl flex-wrap justify-center gap-x-7 gap-y-2">{chapters.map((name, i) => <button key={name} onClick={() => go(i)} className="min-h-11 text-xs text-stone-300 transition hover:text-[#e4c999]">{name}</button>)}</div><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 border-t border-[#c5a56d]/10 pt-6 text-xs text-stone-300"><span>AN INTERACTIVE AVENGERS FAN EXPERIENCE</span><span>LOCAL SIMULATION · YOUR PROGRESS STAYS IN THIS BROWSER</span><span>WHATEVER IT TAKES.</span></div></footer>
    {heroModal !== null && <Modal title={heroes[heroModal].name} close={() => setHeroModal(null)} wide><div className="grid gap-8 md:grid-cols-2"><Picture name={heroes[heroModal].name} className="h-full max-h-[550px] min-h-80 w-full object-top" /><div><p className="text-xs uppercase tracking-[.2em] text-[#dfc18c]">{heroes[heroModal].title}</p><h3 className="mb-5 mt-3 font-display text-3xl">{heroes[heroModal].real}</h3><Badge>{assigned.includes(heroModal) ? 'ASSIGNED' : 'AVAILABLE'}</Badge><p className="my-5 text-sm leading-7 text-stone-300">{heroes[heroModal].bio}</p><p className="mb-5 flex items-center gap-2 text-sm text-[#dfc18c]"><Zap size={17} />{heroes[heroModal].power}</p><div className="grid grid-cols-2 gap-x-5 gap-y-4">{[['Health', heroes[heroModal].hp, 360], ['Energy', 100, 100], ['Attack', heroes[heroModal].attack, 60], ['Defense', heroes[heroModal].defence, 30], ['Speed', heroes[heroModal].speed, 100], ['Intelligence', heroes[heroModal].intelligence, 100]].map(([label, value, max]) => <div key={label}><p className="mb-2 flex justify-between text-sm text-stone-300"><span>{label}</span><span className="text-[#dfc18c]">{value}</span></p><Bar value={Number(value)} max={Number(max)} /></div>)}</div><button className={`${primary} mt-7 w-full`} onClick={() => { if (!selected.includes(heroModal)) toggle(heroModal); setHeroModal(null); go(2); }}>Choose this Avenger <ArrowRight size={15} /></button></div></div></Modal>}
    {detail !== null && <Modal title={missions[detail].name} close={() => setDetail(null)}><Picture name={villains[missions[detail].villain].name} className="mb-6 h-60 w-full object-[center_20%]" /><Badge>{missions[detail].threat}</Badge><h3 className="mt-5 font-display text-3xl">{villains[missions[detail].villain].name}</h3><p className="my-5 text-sm leading-7 text-stone-300">{missions[detail].desc}</p><p className="text-sm text-[#dfc18c]">{missions[detail].location} · Recommended team: 4–6 heroes · Strength {250 - detail * 30}+</p><p className="mt-3 text-sm text-stone-300">Enemy special: {villains[missions[detail].villain].ability}. Triggers every third combat round.</p><button className={`${primary} mt-7`} onClick={() => { chooseMission(detail); setDetail(null); go(4); }}>Accept this quest <ArrowRight size={15} /></button></Modal>}
    {gallery && <Modal title="The Adversaries" close={() => { setGallery(false); setQuery(''); }} wide><p className="mb-6 text-sm text-stone-300">Twenty-five threats. Study their power. Choose your encounter.</p><label className="mb-7 flex items-center gap-3 border-b border-[#c5a56d]/30"><Search size={18} className="text-[#dfc18c]" /><input aria-label="Search villains" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the archive..." className="min-h-12 w-full bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#c5a56d]" /></label><div className="grid gap-5 md:grid-cols-3">{villains.map((v, i) => ({ ...v, id: i })).filter(v => `${v.name} ${v.threat}`.toLowerCase().includes(query.toLowerCase())).map(v => <article key={v.name} className={`${frame} group overflow-hidden`}><Picture name={v.name} className="h-48 w-full object-top saturate-[.65] transition duration-500 group-hover:saturate-100" /><div className="p-4"><p className="text-xs tracking-widest text-[#dfc18c]">{v.threat} / {'✦'.repeat(v.difficulty)}</p><h3 className="mb-3 mt-2 font-display text-2xl">{v.name}</h3><p className="min-h-10 text-sm text-stone-300">{v.power}</p><p className="my-3 text-xs text-[#dfc18c]">{v.hp} HP · {v.attack} ATK · {v.defence} DEF</p><p className="mb-4 text-xs leading-6 text-stone-300">Special: {v.ability}</p><button className={`${enemy === v.id ? btn : primary} w-full px-2`} onClick={() => { setEnemy(v.id); setBattle(null); setGallery(false); go(5); notify(`${v.name} awaits you in the arena.`); }}>Select adversary <ArrowRight size={14} /></button></div></article>)}</div>{!villains.some(v => `${v.name} ${v.threat}`.toLowerCase().includes(query.toLowerCase())) && <p className="py-10 text-center text-stone-300">No adversaries match this search.</p>}</Modal>}
    {page !== 7 && <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.07 }} onClick={() => go(7)} aria-label="Open JARVIS tactical assistant" className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-cyan-200/30 bg-[#071014]/90 p-2 pr-4 shadow-[0_0_35px_#56d9e544] backdrop-blur-xl"><JarvisCore compact /><span className="hidden text-left sm:block"><span className="block text-xs uppercase tracking-[.22em] text-cyan-100">JARVIS</span><span className="mt-1 block text-[10px] text-stone-300">Tactical assistant</span></span></motion.button>}
    <AnimatePresence>{toast && <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20, opacity: 0 }} role="status" className="fixed bottom-24 right-5 z-[60] flex max-w-[calc(100vw-40px)] items-center gap-3 border border-[#c5a56d]/60 bg-[#171810] px-5 py-3 text-sm text-[#eee5d5] shadow-2xl"><ShieldCheck size={22} className="shrink-0 text-[#dfc18c]" /><span>{toast}</span><button aria-label="Dismiss notification" className="min-h-11 px-2 focus-visible:ring-2 focus-visible:ring-[#c5a56d]" onClick={() => setToast('')}><X size={16} /></button></motion.div>}</AnimatePresence>
  </div>;
}
function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text: string }) {
  return <div className="mx-auto max-w-2xl text-center"><p className="mb-5 text-xs uppercase tracking-[.25em] text-[#d4b77e]">{eyebrow}</p><h2 className="font-display text-4xl leading-[1.15] md:text-5xl">{title}</h2><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-stone-300">{text}</p></div>;
}
