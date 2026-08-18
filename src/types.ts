export interface KeyShardState {
  id: 'shard1' | 'shard2' | 'shard3' | 'shard4';
  title: string;
  subtitle: string;
  foundKey: string;
  expectedKey: string;
  isUnlocked: boolean;
  signature?: string;
}

export interface CaseInfo {
  incidentId: string;
  classification: string;
  facility: string;
  threatLevel: string;
  briefing: string;
  shards: Array<{
    id: string;
    name: string;
    status: string;
    method: string;
  }>;
}

export interface ProcessItem {
  pid: number;
  ppid: number;
  name: string;
  threads: number;
  memory: string;
  state: string;
  base: string;
  vadCount?: number;
  integrity?: string;
}

export interface MemorySection {
  address: string;
  size: string;
  perms: string;
  name: string;
  data: string;
  entropy?: number;
  nodeType?: 'KERNEL' | 'POINTER_ALPHA' | 'PAYLOAD_CIPHER' | 'SALT_BLOCK' | 'OPTICAL_REG';
}

export interface BrainwaveState {
  delta: number; // target: 3.0 Hz
  theta: number; // target: 6.0 Hz
  alpha: number; // target: 10.0 Hz
  beta: number;  // target: 22.0 Hz
  gamma?: number; // target: 40.0 Hz
}

export interface TerminalLog {
  id: string;
  command: string;
  output: string;
  timestamp: string;
  isError?: boolean;
}

export interface CortexNode {
  id: number;
  name: string;
  type: 'cortex' | 'subcortex' | 'relay' | 'core';
  impedanceOhms: number;
  reactanceOhms?: number;
  voltageNominal?: number;
  neurotransmitter?: 'GABA' | 'Dopamine' | 'Serotonin' | 'Acetylcholine';
  x: number;
  y: number;
  active: boolean;
  connections: number[];
}

export interface HintItem {
  id: string;
  stage: string;
  clue: string;
  shardKey: string;
}

