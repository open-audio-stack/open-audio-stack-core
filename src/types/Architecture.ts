export interface ArchitectureType {
  description: string;
  id: ArchitectureId;
  name: string;
}

export enum ArchitectureId {
  Arm32 = 'arm32',
  Arm64 = 'arm64',
  Bit32 = 'bit32',
  Bit64 = 'bit64',
}

export const architectures: ArchitectureType[] = [
  {
    description: 'ARM processors are commonly used in battery-powered devices, such as smartphones and tablets.',
    id: ArchitectureId.Arm32,
    name: 'Advanced RISC Machine - 32-bit',
  },
  {
    description: 'ARM processors are commonly used in battery-powered devices, such as smartphones and tablets.',
    id: ArchitectureId.Arm64,
    name: 'Advanced RISC Machine - 64-bit',
  },
  {
    description: 'X86 processors are commonly used in desktop computers and laptops.',
    id: ArchitectureId.Bit32,
    name: 'x86 machine - 32-bit',
  },
  {
    description: 'X86 processors are commonly used in desktop computers and laptops.',
    id: ArchitectureId.Bit64,
    name: 'x86 machine - 64-bit',
  },
];
