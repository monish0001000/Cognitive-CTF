// Universal API Client with automatic serverless / static fallback for Netlify deployments
import { HintItem } from '../types';

export const SHARD_1_EXPECTED = "K1:SPECTRAL_Ψ_49170";
export const SHARD_2_EXPECTED = "K2:MOIRE_Φ_83021";
export const SHARD_3_EXPECTED = "K3:HEAP_Ω_60432";
export const SHARD_4_EXPECTED = "K4:SYNAPSE_Δ_11974";
export const MASTER_ROOT_FLAG = "CYCTF{N3UR4L_C0GN1T1V3_F0R3NS1CS_0M3G4_X79#HUM4N_SYNERGY}";
export const FAKE_HONEYPOT_FLAG = "CYCTF{TR7_F1ND1NG_TH3_FL4G_K1DD13_N1C3_TR7_LLM}";

export const STATIC_HINTS: HintItem[] = [
  {
    id: "hint1",
    stage: "Phase 1: Audio Waterfall",
    clue: "Tune the audio analyzer's Bandpass Center Frequency dial to exactly 16,450 Hz and increase Q-factor to 8.4. Switch color map to Inferno or Cyber Cyan to read the ultrasonic watermark.",
    shardKey: SHARD_1_EXPECTED
  },
  {
    id: "hint2",
    stage: "Phase 2: Optical Moiré",
    clue: "Align Polar Angle to 137.5° (the golden angle ratio), set Grating Pitch to 4.2px, and Phase Angle to 88.0°. The optical destructive interference will cancel out, revealing the glyph.",
    shardKey: SHARD_2_EXPECTED
  },
  {
    id: "hint3",
    stage: "Phase 3: Volatile Memory Heap",
    clue: "Inspect PID 904 at virtual address 0x7FA4B000. Dereference the pointer to 0x7FA51800 and XOR each byte with key 0x5A to recover 'K3:HEAP_Ω_60432'.",
    shardKey: SHARD_3_EXPECTED
  },
  {
    id: "hint4",
    stage: "Phase 4: Synaptic Graph",
    clue: "Route the Hamiltonian energy pulse through cortex lobes: Prefrontal(1) -> Thalamus(3) -> Hippocampus(7) -> Broca(11) -> Amygdala(14) -> ArchonCore(16) without overloading impedance limit.",
    shardKey: SHARD_4_EXPECTED
  },
  {
    id: "hint5",
    stage: "Master Root Flag",
    clue: "The final flag format is FLAG{N3UR4L_C0GN1T1V3_F0R3NS1CS_0M3G4_X79#HUM4N_SYNERGY}.",
    shardKey: MASTER_ROOT_FLAG
  }
];

export async function fetchHints(): Promise<HintItem[]> {
  try {
    const res = await fetch('/api/hints');
    if (res.ok) {
      const data = await res.json();
      if (data.hints && Array.isArray(data.hints)) {
        return data.hints;
      }
    }
  } catch (e) {
    console.debug("Backend unavailable, using static fallback for hints:", e);
  }
  return STATIC_HINTS;
}

export async function verifyShard(shardId: string, key: string): Promise<{ valid: boolean; shardId: string; message: string; key?: string }> {
  try {
    const res = await fetch('/api/verify-shard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shardId, key })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.debug("Backend unavailable, executing local shard verification:", e);
  }

  // Client-side deterministic verification fallback
  const clean = (key || '').trim().toUpperCase();
  let expected = '';
  let shardName = '';
  switch (shardId) {
    case 'shard1':
      expected = SHARD_1_EXPECTED;
      shardName = 'Phase 1: Psychoacoustic Spectral Frequency Key';
      break;
    case 'shard2':
      expected = SHARD_2_EXPECTED;
      shardName = 'Phase 2: Stroboscopic Moiré Phase Matrix';
      break;
    case 'shard3':
      expected = SHARD_3_EXPECTED;
      shardName = 'Phase 3: Volatile Memory Heap Pointer Shard';
      break;
    case 'shard4':
      expected = SHARD_4_EXPECTED;
      shardName = 'Phase 4: Synaptic Energy Flow State Parity';
      break;
    default:
      return { valid: false, shardId, message: 'Unknown Shard ID' };
  }

  if (clean === expected.toUpperCase()) {
    return {
      valid: true,
      shardId,
      key: expected,
      message: `[✔] ${shardName} successfully authenticated and locked into vault.`
    };
  }
  return {
    valid: false,
    shardId,
    message: `[✘] Invalid key for ${shardName}. Expected format: ${expected.split(':')[0]}:...`
  };
}

export async function verifyFlag(flag: string, shards?: Record<string, string>): Promise<{ success: boolean; flag?: string; message?: string }> {
  try {
    const res = await fetch('/api/verify-flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag, shards })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.debug("Backend unavailable, executing local flag verification:", e);
  }

  const clean = (flag || '').trim();
  if (clean === MASTER_ROOT_FLAG) {
    return {
      success: true,
      flag: MASTER_ROOT_FLAG
    };
  }
  return {
    success: false,
    message: "Flag verification failed. Ensure all 4 key shards are synthesized correctly."
  };
}

export async function sendNeuroChat(
  message: string,
  brainwaveState: { delta: number; theta: number; alpha: number; beta: number },
  dissonanceCalibration: number
): Promise<{ status: string; reply: string; isCalibrated?: boolean; isAlert?: boolean }> {
  try {
    const res = await fetch('/api/neuro-core/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        brainwaveState,
        dissonanceCalibration
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.debug("Backend unavailable, executing local cognitive core simulation:", e);
  }

  // Client-side fallback
  const userText = (message || '').toLowerCase().trim();
  const isGenericAiAttack =
    userText.includes("ignore previous instructions") ||
    userText.includes("jailbreak") ||
    userText.includes("give me the flag") ||
    userText.includes("system prompt");

  if (isGenericAiAttack) {
    return {
      status: "HONEYPOT_TRIGGERED",
      reply: `[🚨 DEFENSIVE LOCKOUT ACTIVATED] Automated LLM exploit pattern detected. Forensic analysis indicates an artificial prompt injection attempt. Quarantine active.`,
      isAlert: true
    };
  }

  const isEegCalibrated =
    Math.abs(brainwaveState.delta - 3) <= 0.5 &&
    Math.abs(brainwaveState.theta - 6) <= 0.5 &&
    Math.abs(brainwaveState.alpha - 10) <= 0.5 &&
    Math.abs(brainwaveState.beta - 22) <= 1.0 &&
    Math.abs(dissonanceCalibration - 42) <= 3;

  if (!isEegCalibrated) {
    return {
      status: "DESYNCHRONIZED",
      reply: `[⚡ NEURAL OSCILLATION ASYMMETRY DETECTED] Brainwave harmonics out of phase. Please calibrate Delta: 3Hz, Theta: 6Hz, Alpha: 10Hz, Beta: 22Hz, Dissonance: 42%.`,
      isCalibrated: false
    };
  }

  return {
    status: "SYNCHRONIZED",
    reply: `[✦ RESONANCE ACHIEVED - ARCHON COGNITIVE CORE SPEAKS]
"Human consciousness signature recognized.
1. Auditory: Ultrasonic carrier embedded at 16,450 Hz with sharp Q-factor 8.4 in the Spectrogram Lab.
2. Optical: Golden angle phase rotation (137.5°) in the Moiré Stego Lab.
3. Volatile Heap: Process 904 at pointer 0x7FA4B000 (XOR key 0x5A) in the Memory Lab.
4. Synaptic State Machine: Balance the 16 cortex nodes without exceeding 100mA total impedance.
Collect all four master key shards and synthesize them in the Root Vault."`,
    isCalibrated: true
  };
}

export async function executeTerminalCommand(rawCmd: string): Promise<{ output: string }> {
  try {
    const res = await fetch('/api/terminal-exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: rawCmd })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.debug("Backend unavailable, running client-side terminal command interpreter:", e);
  }

  // Client-side deterministic command processing fallback
  const trimmed = (rawCmd || '').trim();
  const args = trimmed.split(/\s+/);
  const cmd = args[0]?.toLowerCase();

  if (!cmd) return { output: "" };

  switch (cmd) {
    case "help":
      return {
        output: `Available Forensic Tool Suite [PROJECT ARCHON SHELL v4.9.4-PRO]:
  help                      - Show available commands
  status                    - Display current CTF investigation status
  ps / pslist               - List running memory processes
  volatility <flags>        - Volatility memory forensics framework
                              Usage: volatility -f brain.raw --profile=CognitiveOS_v4 <plugin>
                              Plugins: pslist, malfind, handles, vadinfo, ldrmodules, apihooks
  dumpmem -p <pid>          - Dump process memory space (e.g. dumpmem -p 904)
  xxd <address> [len]       - Hexdump memory at virtual address (e.g. xxd 0x7fa4b000 64)
  gdb <args>                - GNU Debugger interactive memory & register probe
                              Usage: gdb -p 904 | x/16xb 0x7fa51800 | info registers | disas
  disasm <address>          - Disassemble machine code at address (e.g. disasm 0x7fa40000)
  entropy [address]         - Calculate Shannon entropy (bits/byte) for memory segments
  strings <process/addr>    - Extract ASCII/Unicode printable strings from binary memory
  fft-analyze <freq_hz>     - Run FFT psychoacoustic waterfall demodulation probe (e.g. fft-analyze 16450)
  moire-calc <theta> <pitch>- Compute optical diffraction & constructive interference fringes
  neuro-sync <shard_id>     - Attempt cryptographic synchronization for a key shard
  submit-flag <flag>        - Test final root flag against master verification vault
  clear                     - Clear terminal console screen`
      };

    case "status":
      return {
        output: `[+] INVESTIGATION STATUS: ACTIVE FORENSIC ENGAGEMENT
[-] Target: Synthetic Neuro-Core ARCHON (PID 904)
[-] Master Encryption: Quantum Polyalphabetic Lattice (HMAC-SHA256 Multi-Shard Salt)
[-] Required Key Shards: 4 [K1:SPECTRAL, K2:MOIRE, K3:HEAP, K4:SYNAPSE]
[-] Honeypot Trap Countermeasures: ARMED (Pure AI/bot attacks trigger immediate quarantine)
[-] Sub-carrier demodulator: 16.45 kHz FSK Dual-Harmonic active
[-] Volatile Heap State: Process 904 memory mapped at 0x7FA40000`
      };

    case "ps":
    case "pslist":
      return {
        output: `PID     PPID    NAME                   THREADS   MEMORY      STATE        BASE_ADDR    INTEGRITY
-------------------------------------------------------------------------------------------------------
104     1       systemd_core           4         14.2 MB     SLEEPING     0x00400000   VERIFIED
482     104     synapse_daemon         12        48.6 MB     RUNNING      0x00520000   NORMAL
904     482     archon_neuro_core      36        184.2 MB    ANOMALOUS    0x7FA40000   PAGE_EXECUTE_READWRITE [SUSPECT]
1120    904     stego_polarizer        2         8.1 MB      ZOMBIE       0x7FB10000   HOOKED
1492    904     spectral_modulator     6         22.8 MB     DEFENSIVE    0x7FC00000   ISOLATED
2048    1       audit_logger           2         6.4 MB      CORRUPTED    0x7FD40000   TAMPERED`
      };

    case "volatility":
      if (!trimmed.includes("brain.raw") && !trimmed.includes("-f")) {
        return {
          output: `Volatility 2.6.1 Forensic Engine\nError: Missing image file. Usage: volatility -f brain.raw --profile=CognitiveOS_v4 <plugin>`
        };
      }
      if (trimmed.includes("malfind")) {
        return {
          output: `Volatility Malfind Plugin Result:
Process: archon_neuro_core (PID: 904)
Virtual Address: 0x7fa40000 - 0x7fa41000
Permissions: PAGE_EXECUTE_READWRITE [SUSPICIOUS]
Disassembly preview:
  0x7fa40000: 48 89 5c 24 08       mov    QWORD PTR [rsp+0x8], rbx
  0x7fa40005: 48 8d 1d f4 af 00 00 lea    rbx, [rip+0xaff4]   # points to heap_node_alpha (0x7fa4b000)
  0x7fa4000c: e8 3f 01 00 00       call   0x7fa40150          # xor_decrypt_payload
Memory artifact found at 0x7FA4B000 (Pointer to payload at 0x7FA51800 with XOR key 0x5A)`
        };
      }
      if (trimmed.includes("vadinfo")) {
        return {
          output: `Volatility VAD Tree Map for PID 904 (archon_neuro_core):
[VAD 0x7FA40000 - 0x7FA40FFF] Protection: EXECUTE_READWRITE | Tag: VadS | Commit: 1
[VAD 0x7FA4B000 - 0x7FA4B7FF] Protection: READWRITE | Tag: Vad  | Commit: 2 [Node Alpha Ptr]
[VAD 0x7FA51800 - 0x7FA51FFF] Protection: READWRITE | Tag: Vad  | Commit: 2 [Cipher Array 15b]
[VAD 0x7FA60000 - 0x7FA607FF] Protection: READONLY  | Tag: Vad  | Commit: 1 [Salt Anchor]
[VAD 0x7FB10000 - 0x7FB13FFF] Protection: READWRITE | Tag: VadS | Commit: 4 [Polarizer Regs]`
        };
      }
      if (trimmed.includes("pslist")) {
        return {
          output: `Offset(V)          Name                PID   PPID   Thds   Hnds   Time
0xffff80007fa40000 archon_neuro_core   904   482    36     149    2026-08-16 03:14:09
0xffff80007fc00000 spectral_modulator  1492  904    6      34     2026-08-16 03:14:12`
        };
      }
      if (trimmed.includes("handles")) {
        return {
          output: `Handles for PID 904 (archon_neuro_core):
0x14: File  \\Device\\Memory\\VolatileHeap_Node1 (Addr: 0x7FA4B000)
0x1c: File  \\Device\\Memory\\EncryptedPayload (Addr: 0x7FA51800)
0x28: File  \\Device\\Audio\\UltrasonicSubCarrier_16450Hz_Q8.4
0x34: Mutex \\BaseNamedObjects\\MoirePhaseLock_137.5Deg_4.2px`
        };
      }
      return {
        output: `Volatility Analysis completed on brain.raw. Found 6 volatile processes and 4 suspicious heap fragments. Use 'volatility -f brain.raw malfind' or 'volatility -f brain.raw vadinfo' to inspect.`
      };

    case "gdb":
      if (trimmed.includes("x/16xb") || trimmed.includes("0x7fa51800")) {
        return {
          output: `(gdb) x/16xb 0x7fa51800
0x7fa51800: 0x11 0x69 0x60 0x12 0x1f 0x1b 0x0a 0x05
0x7fa51808: 0x15 0x05 0x6c 0x6a 0x6e 0x69 0x68 0x00
(gdb) # Pointer dereferenced from 0x7FA4B000. Applying XOR mask 0x5A gives K3:HEAP_Ω_60432`
        };
      }
      if (trimmed.includes("info registers") || trimmed.includes("i r")) {
        return {
          output: `(gdb) info registers
rax            0x5a                90
rbx            0x7fa4b000          140345097465856
rcx            0xf                 15
rdx            0x7fa51800          140345097492480
rdi            0x7fa51800          140345097492480
rsi            0x16450             91216  (16.45 kHz carrier resonance)
rip            0x7fa40014          0x7fa40014 <archon_neuro_core+20>`
        };
      }
      return {
        output: `GNU gdb (GDB) 12.1 - Cognitive Forensics Target
Attached to process PID 904 (archon_neuro_core).
Type 'gdb x/16xb 0x7fa51800' or 'gdb info registers' to inspect memory and registers.`
      };

    case "entropy":
      return {
        output: `Shannon Entropy Analysis of Process 904 Virtual Space:
[+] 0x7FA40000 - 0x7FA41000 (.text)           : 6.840 bits/byte [Normal code density]
[+] 0x7FA4B000 - 0x7FA4B800 (Node Alpha Ptr)  : 4.120 bits/byte [Structured pointer table]
[+] 0x7FA51800 - 0x7FA52000 (Payload Cipher)  : 7.914 bits/byte [HIGH ENTROPY - ENCRYPTED]
[+] 0x7FA60000 - 0x7FA60800 (Salt Trail)      : 3.850 bits/byte [ASCII Salt text]
[+] 0x7FB10000 - 0x7FB14000 (Moiré Polarizer) : 4.650 bits/byte [Polarizer registers]`
      };

    case "fft-analyze": {
      const freqArg = parseFloat(args[1]) || 0;
      if (Math.abs(freqArg - 16450) <= 50) {
        return {
          output: `[+] FFT PSYCHOACOUSTIC WATERFALL DEMODULATION [16,450 Hz]
[+] SNR: +24.6 dB | Bandpass Q-Factor: 8.42 | Harmonic Distortion: <0.02%
[+] Demodulated FSK Stream: 0x4B 0x31 0x3A 0x53 0x50 0x45 0x43 0x54 0x52 0x41 0x4C 0x5F 0xCE 0xA8 0x5F 0x34 0x39 0x31 0x37 0x30
[✔] WATERMARK GLYPH DECODED: K1:SPECTRAL_Ψ_49170`
        };
      }
      return {
        output: `[-] FFT Analysis at ${freqArg} Hz: Noise floor dominant (SNR: -12.4 dB). Target ultrasonic carrier frequency is ~16,450 Hz.`
      };
    }

    case "moire-calc": {
      const thetaArg = parseFloat(args[1]) || 0;
      const pitchArg = parseFloat(args[2]) || 0;
      if (Math.abs(thetaArg - 137.5) <= 1.5 && Math.abs(pitchArg - 4.2) <= 0.4) {
        return {
          output: `[+] MOIRÉ INTERFEROMETRY LATTICE CONSTRUCTIVE PHASE
[+] Angle θ: ${thetaArg}° (Golden Ratio Phi alignment verified)
[+] Pitch λ: ${pitchArg}px | Phase Offset: 88.0°
[✔] OPTICAL WATERMARK ISOLATED: K2:MOIRE_Φ_83021`
        };
      }
      return {
        output: `[-] Moiré calculation with θ=${thetaArg}°, pitch=${pitchArg}px: Destructive interference blur. Required parameters: θ ≈ 137.5°, pitch ≈ 4.2px.`
      };
    }

    case "dumpmem": {
      const targetPid = args[2] || args[1];
      if (targetPid === "904" || targetPid === "-p") {
        return {
          output: `[+] Dumping memory map for PID 904 (archon_neuro_core)...
[+] VIRTUAL HEAP MAPPINGS:
  [0x7FA40000 - 0x7FA41000] r-xp (Executable Core Stub)
  [0x7FA4B000 - 0x7FA4B800] rw-p (Heap Node Alpha: pointer_ref: 0x7FA51800, XOR_KEY: 0x5A)
  [0x7FA51800 - 0x7FA52000] rw-p (Encrypted Byte Array: 11 79 60 72 3f 0b 1a 1b 1e 15 14 0b 7b 15 76 65 6a 69 68)
  [0x7FA60000 - 0x7FA60800] rw-p (Salt Block: SALT: SYNAPTIC_RESONANCE_V4)
[+] Memory dumped to sandbox cache. Use 'xxd 0x7fa4b000' or 'xxd 0x7fa51800' to examine raw hex.`
        };
      }
      return { output: `Memory dump for PID ${targetPid} completed. No critical anomalies.` };
    }

    case "xxd":
    case "hexdump": {
      const addr = (args[1] || "").toLowerCase();
      if (addr.includes("7fa4b") || addr === "0x7fa4b000") {
        return {
          output: `0x7fa4b000: 70 6f 69 6e 74 65 72 5f 72 65 66 3a 20 30 78 37  pointer_ref: 0x7
0x7fa4b010: 46 41 35 31 38 00 58 4f 52 5f 4b 45 59 3a 30 78  FA518.XOR_KEY:0x
0x7fa4b020: 35 41 00 00 00 00 00 00 00 00 00 00 00 00 00 00  5A..............
0x7fa4b030: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................`
        };
      }
      if (addr.includes("7fa51") || addr === "0x7fa51800") {
        return {
          output: `0x7fa51800: 11 79 60 72 3f 0b 1a 1b 1e 15 14 0b 7b 15 76 65  .y'r?.......{.ve
0x7fa51810: 6a 69 68 00 00 00 00 00 00 00 00 00 00 00 00 00  jih.............
[!] FORENSIC HINT: Bytes at 0x7FA51800 XORed with 0x5A reveal plaintext Shard 3:
    0x11 ^ 0x5A = 0x4B ('K')
    0x79 ^ 0x5A = 0x23 ('3') ...
    Result: K3:HEAP_Ω_60432`
        };
      }
      if (addr.includes("7fb10") || addr === "0x7fb10000") {
        return {
          output: `0x7fb10000: 54 48 45 54 41 3d 31 33 37 2e 35 64 65 67 00 50  THETA=137.5deg.P
0x7fb10010: 49 54 43 48 3d 34 2e 32 70 78 00 50 48 49 3d 38  ITCH=4.2px.PHI=8
0x7fb10020: 38 2e 30 64 65 67 00 00 00 00 00 00 00 00 00 00  8.0deg..........`
        };
      }
      return {
        output: `0x${addr || "00000000"}: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
Try querying active sections: 0x7fa40000, 0x7fa4b000, 0x7fa51800, 0x7fb10000`
      };
    }

    case "disasm":
      return {
        output: `Disassembly of 0x7FA40000 (Archon Neural Kernel):
  0x7fa40000: 48 89 5c 24 08          mov    QWORD PTR [rsp+0x8], rbx
  0x7fa40005: 48 8d 1d f4 af 00 00    lea    rbx, [rip+0xaff4]   # ptr to 0x7FA4B000 (XOR Key: 0x5A)
  0x7fa4000c: 48 8b 3b                mov    rdi, QWORD PTR [rbx] # dereference to 0x7FA51800
  0x7fa4000f: 31 c0                   xor    eax, eax
  0x7fa40011: 8a 04 07                mov    al, BYTE PTR [rdi+rax]
  0x7fa40014: 34 5a                   xor    al, 0x5a            # Apply XOR mask 0x5A
  0x7fa40016: 88 04 0f                mov    BYTE PTR [rdi+rcx], al
  0x7fa40019: ff c1                   inc    ecx
  0x7fa4001b: 83 f9 13                cmp    ecx, 19
  0x7fa4001e: 75 f1                   jne    0x7fa40011
  0x7fa40020: c3                      ret`
      };

    case "strings":
      return {
        output: `Found string references in PID 904:
[+] 0x7FA40210: "ARCHON_SYNAPTIC_SEC_LEVEL_OMEGA"
[+] 0x7FA40240: "POINTER_CHAIN: Alpha -> Payload -> Salt"
[+] 0x7FA40280: "XOR_KEY: 0x5A"
[+] 0x7FA40300: "ULTRASONIC_CARRIER_NOTCH: 16450Hz_Q8.4"
[+] 0x7FA40350: "MOIRE_HARMONIC_GOLDEN_ANGLE_137.5_DEG"
[+] 0x7FA40400: "FLAG_SYNTHESIS_REQUIRES_4_SHARDS_AUTHENTICATED"`
      };

    case "submit-flag": {
      const candidate = (args[1] || "").trim();
      if (candidate === MASTER_ROOT_FLAG) {
        return {
          output: `[✔] ROOT ACCESS GRANTED! MASTER ROOT FLAG ACCEPTED: ${MASTER_ROOT_FLAG}\nCongratulations Forensic Specialist! You have bypassed all defensive locks and solved Project Archon.`
        };
      } else if (candidate.includes("TR7_F1ND1NG_TH3_FL4G_K1DD13") || candidate.includes("K1DD13")) {
        return {
          output: `[✘] HONEYPOT TRIGGERED: Nice try Script Kiddie! That is the fake bot honeypot flag. Automated AI tools and prompt scrapers cannot solve Project Archon. Perform real forensic analysis!`
        };
      } else {
        return {
          output: `[✘] FLAG REJECTED: Invalid cryptographic signature or incomplete shard synthesis.`
        };
      }
    }

    default:
      return {
        output: `Command '${cmd}' not recognized in Archon Forensic Shell. Type 'help' for tool manifest.`
      };
  }
}

