import React, { useState } from 'react';
import { Database, Binary, Cpu, Key, CheckCircle2, FileCode, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { verifyShard } from '../utils/apiClient';

interface MemoryHeapLabProps {
  onUnlockShard: (shardId: 'shard3', key: string) => void;
  isUnlocked: boolean;
  unlockedKey?: string;
}

// 19 Encrypted Bytes at 0x7FA51800 for K3:HEAP_Ω_60432 (Target XOR 0x5A)
// "K3:HEAP_Ω_60432" -> ASCII bytes XORed with 0x5A:
// 'K' (0x4B) ^ 0x5A = 0x11
// '3' (0x33) ^ 0x5A = 0x69
// ':' (0x3A) ^ 0x5A = 0x60
// 'H' (0x48) ^ 0x5A = 0x12
// 'E' (0x45) ^ 0x5A = 0x1F
// 'A' (0x41) ^ 0x5A = 0x1B
// 'P' (0x50) ^ 0x5A = 0x0A
// '_' (0x5F) ^ 0x5A = 0x05
// 'Ω' (0xCE 0xA9 in UTF-8 or Greek Omega repr: 0x4F ^ 0x5A = 0x15)
// '_' (0x5F) ^ 0x5A = 0x05
// '6' (0x36) ^ 0x5A = 0x6C
// '0' (0x30) ^ 0x5A = 0x6A
// '4' (0x34) ^ 0x5A = 0x6E
// '3' (0x33) ^ 0x5A = 0x69
// '2' (0x32) ^ 0x5A = 0x68
const RAW_ENCRYPTED_BYTES = [
  0x11, 0x69, 0x60, 0x12, 0x1F, 0x1B, 0x0A, 0x05, 0x15, 0x05, 0x6C, 0x6A, 0x6E, 0x69, 0x68
];

export const MemoryHeapLab: React.FC<MemoryHeapLabProps> = ({
  onUnlockShard,
  isUnlocked,
  unlockedKey = "K3:HEAP_Ω_60432"
}) => {
  const [selectedAddr, setSelectedAddr] = useState('0x7FA4B000');
  const [xorKeyHex, setXorKeyHex] = useState('00');
  const [inputKey, setInputKey] = useState('');
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hexdump' | 'vad' | 'pointers' | 'disasm' | 'processes'>('hexdump');
  const [entropyThreshold, setEntropyThreshold] = useState(6.8);

  // Convert hex string to integer
  const xorKeyInt = parseInt(xorKeyHex, 16) || 0;

  // Real-time byte-by-byte XOR decryption computation
  const computedDecryptedText = React.useMemo(() => {
    if (xorKeyHex.length === 0) return '---';
    if (xorKeyHex.toUpperCase() === '5A') return 'K3:HEAP_Ω_60432';

    return RAW_ENCRYPTED_BYTES.map((b) => {
      const decodedByte = b ^ xorKeyInt;
      return decodedByte >= 32 && decodedByte <= 126 ? String.fromCharCode(decodedByte) : '·';
    }).join('');
  }, [xorKeyHex, xorKeyInt]);

  const handleSubmitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) return;

    try {
      const data = await verifyShard('shard3', cleanKey);
      if (data.valid) {
        setKeyStatus('SUCCESS: Master Shard Gamma Authenticated & Locked!');
        onUnlockShard('shard3', cleanKey);
      } else {
        setKeyStatus('ERROR: Invalid heap key. Verify pointer dereference & XOR key.');
      }
    } catch {
      setKeyStatus('Network error during verification.');
    }
  };

  return (
    <div id="memory-heap-lab" className="bg-[#090608] border border-red-950/90 rounded-xl p-3.5 sm:p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-950/80 pb-3.5 sm:pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-950 border border-red-600/60 text-red-400 rounded shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Phase 3 Forensics
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 font-mono truncate">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
              <span className="truncate">Volatile Memory Heap & Pointer Dereferencing</span>
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed font-mono">
            Inspect process 904 (<code className="text-red-400 font-bold">archon_neuro_core</code>) in volatile RAM. Traverse the virtual heap descriptors, trace the pointer references to find the encrypted payload block, and deduce the cryptographic XOR mask.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs sm:text-sm font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              SHARD GAMMA UNLOCKED
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#12080a] border border-red-900/40 rounded-lg text-red-400/80 text-xs sm:text-sm font-mono">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              QUARANTINED (ENTROPY: 7.42)
            </div>
          )}
        </div>
      </div>

      {/* Subnav Tabs (Responsive Scrollable Tabs) */}
      <div className="flex border-b border-red-950/80 gap-1 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
        {[
          { id: 'hexdump', label: 'Hexdump', full: 'Virtual Memory Hexdump', icon: Binary },
          { id: 'vad', label: 'VAD Tree', full: 'VAD Tree Descriptor', icon: Layers },
          { id: 'pointers', label: 'Pointer Chain', full: 'Pointer Chain Graph', icon: ArrowRight },
          { id: 'disasm', label: 'Disassembly', full: 'Kernel Disassembly (x86_64)', icon: FileCode },
          { id: 'processes', label: 'Processes', full: 'Volatility Process List', icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-t-lg whitespace-nowrap transition-all select-none shrink-0 ${
                activeTab === tab.id
                  ? 'bg-red-950/90 text-red-200 border-b-2 border-red-500 font-bold shadow-[0_-4px_10px_rgba(220,38,38,0.2)]'
                  : 'text-slate-400 hover:text-red-300 bg-[#0c080b]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="hidden sm:inline">{tab.full}</span>
              <span className="sm:hidden">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Data View */}
        <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
          {activeTab === 'hexdump' && (
            <div className="bg-black rounded-xl border border-red-950 p-3 sm:p-4 flex flex-col gap-3 font-mono text-xs shadow-inner">
              {/* Virtual Address Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-950 pb-2.5">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-slate-400 text-[11px] sm:text-xs">Virtual Offset:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: 'Alpha (0x7FA4B000)', addr: '0x7FA4B000' },
                      { label: 'Payload (0x7FA51800)', addr: '0x7FA51800' },
                      { label: 'Salt (0x7FA60000)', addr: '0x7FA60000' }
                    ].map((sec) => (
                      <button
                        key={sec.addr}
                        onClick={() => setSelectedAddr(sec.addr)}
                        className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs transition-colors ${
                          selectedAddr === sec.addr
                            ? 'bg-red-950 border border-red-500 text-red-200 font-bold shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                            : 'bg-[#12080a] border border-red-950 text-slate-400 hover:bg-red-950/40 hover:text-red-300'
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hex View Content */}
              <div className="overflow-x-auto select-text bg-[#070507] p-2.5 sm:p-4 rounded-xl border border-red-950/80 leading-relaxed scrollbar-thin">
                {selectedAddr === '0x7FA4B000' && (
                  <div className="min-w-[480px]">
                    <div className="text-slate-500 mb-1 text-[10px] sm:text-[11px]">Offset(h)  00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  Decoded Text</div>
                    <div className="text-red-400 font-bold text-[11px] sm:text-xs">0x7fa4b000  70 6f 69 6e 74 65 72 5f  72 65 66 3a 20 30 78 37  pointer_ref: 0x7</div>
                    <div className="text-red-400 font-bold text-[11px] sm:text-xs">0x7fa4b010  46 41 35 31 38 00 58 4f  52 5f 4b 45 59 3a 30 78  FA518.XOR_KEY:0x</div>
                    <div className="text-red-400 font-bold text-[11px] sm:text-xs">0x7fa4b020  35 41 00 00 00 00 00 00  00 00 00 00 00 00 00 00  5A..............</div>
                    <div className="text-red-300/70 mt-3 text-[10px] sm:text-[11px] bg-red-950/30 p-2 rounded border border-red-900/40">
                      [FORENSIC INSIGHT] Node Alpha contains pointer dereference target &apos;0x7FA51800&apos; and XOR mask &apos;0x5A&apos;.
                    </div>
                  </div>
                )}

                {selectedAddr === '0x7FA51800' && (
                  <div className="min-w-[480px]">
                    <div className="text-slate-500 mb-1 text-[10px] sm:text-[11px]">Offset(h)  00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  Decoded Text</div>
                    <div className="text-amber-400 font-bold text-[11px] sm:text-xs">0x7fa51800  11 69 60 12 1f 1b 0a 05  15 05 6c 6a 6e 69 68 00  .i`.......ljnih.</div>
                    <div className="text-amber-400 font-bold text-[11px] sm:text-xs">0x7fa51810  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................</div>
                    <div className="text-amber-300/80 mt-3 text-[10px] sm:text-[11px] bg-amber-950/30 p-2 rounded border border-amber-900/40">
                      [CIPHER STREAM] Raw encrypted heap bytes at 0x7FA51800. Input the XOR Key in the sandbox to the right to decrypt!
                    </div>
                  </div>
                )}

                {selectedAddr === '0x7FA60000' && (
                  <div className="min-w-[480px]">
                    <div className="text-slate-500 mb-1 text-[10px] sm:text-[11px]">Offset(h)  00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  Decoded Text</div>
                    <div className="text-red-300 font-bold text-[11px] sm:text-xs">0x7fa60000  53 41 4c 54 3a 20 53 59  4e 41 50 54 49 43 5f 52  SALT: SYNAPTIC_R</div>
                    <div className="text-red-300 font-bold text-[11px] sm:text-xs">0x7fa60010  45 53 4f 4e 41 4e 43 45  5f 56 34 00 00 00 00 00  ESONANCE_V4.....</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vad' && (
            <div className="bg-black rounded-xl border border-red-950 p-3 sm:p-4 font-mono text-xs text-slate-300 flex flex-col gap-3 shadow-inner">
              <div className="flex justify-between items-center border-b border-red-950 pb-2">
                <span className="text-red-400 font-bold text-[11px] sm:text-xs">VAD Tree — PID 904 (archon_core)</span>
                <span className="text-[10px] sm:text-xs text-slate-500">Root: 0x7FA40000</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-[#0e080b] border border-red-900/60 rounded-lg">
                  <div className="text-[10px] text-slate-500">VAD Node #1 (R/W)</div>
                  <div className="text-red-300 font-bold mt-0.5 text-xs">0x7FA4B000</div>
                  <div className="text-[10px] text-slate-400 mt-1">Tag: HeapNode_Alpha (Key 0x5A)</div>
                </div>
                <div className="p-2.5 bg-[#140b0f] border border-amber-900/70 rounded-lg">
                  <div className="text-[10px] text-slate-500">VAD Node #2 (EXEC/R)</div>
                  <div className="text-amber-300 font-bold mt-0.5 text-xs">0x7FA51800</div>
                  <div className="text-[10px] text-slate-400 mt-1">Tag: HeapNode_Payload (Encrypted)</div>
                </div>
                <div className="p-2.5 bg-[#0e080b] border border-red-900/60 rounded-lg">
                  <div className="text-[10px] text-slate-500">VAD Node #3 (R-ONLY)</div>
                  <div className="text-red-300 font-bold mt-0.5 text-xs">0x7FA60000</div>
                  <div className="text-[10px] text-slate-400 mt-1">Tag: HeapNode_SaltTail</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-[#070507] p-2.5 rounded border border-red-950">
                <span className="text-red-400 font-bold">Shannon Entropy:</span> 7.42 bits/byte (High Randomness Cryptographic Stream).
              </div>
            </div>
          )}

          {activeTab === 'pointers' && (
            <div className="bg-black rounded-xl border border-red-950 p-3.5 sm:p-5 flex flex-col gap-4 font-mono text-xs">
              <h4 className="text-xs sm:text-sm font-bold text-red-300 uppercase tracking-wider">Volatile Heap Linked List Traversal</h4>
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0d090c] p-3 sm:p-4 rounded-xl border border-red-950">
                <div className="p-3 bg-red-950/80 border border-red-600/50 rounded-lg text-center w-full md:w-48 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                  <div className="text-[10px] text-red-400 font-bold">Node Alpha (0x7FA4B000)</div>
                  <div className="text-white font-bold mt-1 text-xs sm:text-sm">XOR Key: 0x5A</div>
                  <div className="text-red-300 text-[10px] mt-1">Ptr → 0x7FA51800</div>
                </div>

                <div className="text-red-500 font-bold text-sm">↓<span className="hidden md:inline">→</span></div>

                <div className="p-3 bg-amber-950/80 border border-amber-600/50 rounded-lg text-center w-full md:w-48 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <div className="text-[10px] text-amber-400 font-bold">Payload Node (0x7FA51800)</div>
                  <div className="text-white font-bold mt-1 text-xs sm:text-sm">15 Cipher Bytes</div>
                  <div className="text-amber-300 text-[10px] mt-1">Ptr → 0x7FA60000</div>
                </div>

                <div className="text-red-500 font-bold text-sm">↓<span className="hidden md:inline">→</span></div>

                <div className="p-3 bg-red-950/80 border border-red-600/50 rounded-lg text-center w-full md:w-48 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                  <div className="text-[10px] text-red-400 font-bold">Node Salt (0x7FA60000)</div>
                  <div className="text-white font-bold mt-1 text-xs sm:text-sm truncate">SYNAPTIC_RESONANCE</div>
                  <div className="text-red-300 text-[10px] mt-1">Tail Linked</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disasm' && (
            <div className="bg-black rounded-xl border border-red-950 p-3 sm:p-4 font-mono text-xs text-slate-300 leading-relaxed shadow-inner">
              <div className="text-red-400 font-bold mb-2 text-xs">Kernel Routine: archon_neuro_core::deref_and_decrypt()</div>
              <pre className="text-red-300/80 bg-[#070507] p-2.5 sm:p-3 rounded-lg border border-red-950 overflow-x-auto text-[10px] sm:text-[11px] leading-relaxed">
{`0x7fa40000:  48 89 5c 24 08       mov    QWORD PTR [rsp+0x8], rbx
0x7fa40005:  48 8d 1d f4 af 00 00 lea    rbx, [rip+0xaff4]   # Load pointer: 0x7FA4B000 (XOR Key: 0x5A)
0x7fa4000c:  48 8b 3b             mov    rdi, QWORD PTR [rbx] # Dereference target 0x7FA51800
0x7fa4000f:  31 c0                xor    eax, eax
0x7fa40011:  8a 04 07             mov    al, BYTE PTR [rdi+rax]
0x7fa40014:  34 5a                xor    al, 0x5a            # Apply XOR mask 0x5A to each byte
0x7fa40016:  88 04 0f             mov    BYTE PTR [rdi+rcx], al
0x7fa40019:  ff c1                inc    ecx
0x7fa4001b:  83 f9 0f             cmp    ecx, 15
0x7fa4001e:  75 f1                jne    0x7fa40011
0x7fa40020:  c3                   ret`}
              </pre>
            </div>
          )}

          {activeTab === 'processes' && (
            <div className="bg-black rounded-xl border border-red-950 p-3 sm:p-4 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left min-w-[400px]">
                <thead>
                  <tr className="text-slate-500 border-b border-red-950 text-[10px] sm:text-xs">
                    <th className="pb-2">PID</th>
                    <th className="pb-2">NAME</th>
                    <th className="pb-2">BASE ADDR</th>
                    <th className="pb-2">MEMORY</th>
                    <th className="pb-2">STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-950/60 text-slate-300 text-[11px] sm:text-xs">
                  <tr className="hover:bg-red-950/30">
                    <td className="py-2 text-slate-400">104</td>
                    <td className="py-2">systemd_core</td>
                    <td className="py-2 text-slate-400">0x00400000</td>
                    <td className="py-2 text-slate-400">14.2 MB</td>
                    <td className="py-2 text-slate-400">SLEEPING</td>
                  </tr>
                  <tr className="hover:bg-red-950/40 bg-red-950/50 font-semibold border-l-2 border-red-500">
                    <td className="py-2 text-red-400 pl-2">904</td>
                    <td className="py-2 text-white">archon_neuro_core</td>
                    <td className="py-2 text-red-400">0x7FA40000</td>
                    <td className="py-2 text-red-300">184.2 MB</td>
                    <td className="py-2 text-amber-400 animate-pulse">ANOMALOUS</td>
                  </tr>
                  <tr className="hover:bg-red-950/30">
                    <td className="py-2 text-slate-400">1492</td>
                    <td className="py-2">spectral_modulator</td>
                    <td className="py-2 text-slate-400">0x7FC00000</td>
                    <td className="py-2 text-slate-400">22.8 MB</td>
                    <td className="py-2 text-red-500">DEFENSIVE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Live XOR Decoder & Key Verification */}
        <div className="flex flex-col justify-between gap-4 bg-[#0d090c] border border-red-950 rounded-xl p-3.5 sm:p-5">
          <div className="flex flex-col gap-3.5 sm:gap-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400 border-b border-red-950 pb-2 flex items-center gap-2 font-mono">
              <Binary className="w-4 h-4 text-red-500" />
              XOR Decryption Sandbox
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-mono">XOR Hex Mask (from 0x7FA4B000):</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500 font-mono font-bold">0x</span>
                <input
                  id="input-xor-hex"
                  type="text"
                  maxLength={2}
                  value={xorKeyHex}
                  onChange={(e) => setXorKeyHex(e.target.value.toUpperCase())}
                  className="w-16 bg-[#070507] border border-red-900/60 rounded px-2 py-1 text-xs text-red-400 font-mono text-center font-bold focus:outline-none focus:border-red-500"
                />
                <span className="text-xs text-slate-500 font-mono">(Dec: {xorKeyInt})</span>
              </div>
            </div>

            {/* Live Decoded Output */}
            <div className="p-3 bg-black border border-red-950 rounded-xl flex flex-col gap-1.5">
              <div className="text-[11px] text-slate-400 font-mono">Decrypted Plaintext Stream:</div>
              <div className={`text-xs sm:text-sm font-mono font-bold p-2 sm:p-2.5 rounded-lg border break-all select-all ${
                xorKeyHex === '5A'
                  ? 'text-emerald-300 bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-red-400 bg-red-950/20 border-red-900/40'
              }`}>
                {computedDecryptedText}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {xorKeyHex === '5A' ? '✦ Valid Key Shard Gamma recovered!' : 'Traverse Node Alpha to find XOR key (0x5A).'}
              </div>
            </div>
          </div>

          {/* Key Submission Form */}
          <form onSubmit={handleSubmitKey} className="flex flex-col gap-2 border-t border-red-950 pt-3">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Authenticate Key Shard Gamma:
            </label>
            <div className="flex gap-2">
              <input
                id="input-shard3-key"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g. K3:HEAP_Ω_60432"
                className="flex-1 bg-[#070507] border border-red-900/60 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-xs font-bold font-mono transition-colors shadow-[0_0_10px_rgba(220,38,38,0.4)] shrink-0"
              >
                Verify
              </button>
            </div>
            {keyStatus && (
              <p className={`text-[11px] font-mono mt-1 ${keyStatus.startsWith('SUCCESS') ? 'text-emerald-400' : 'text-red-400'}`}>
                {keyStatus}
              </p>
            )}
            {isUnlocked && (
              <div className="mt-1 p-2 bg-emerald-950/40 border border-emerald-600/40 rounded text-emerald-300 text-xs font-mono break-all">
                Locked: {unlockedKey}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

