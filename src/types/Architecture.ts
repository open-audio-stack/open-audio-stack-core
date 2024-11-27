export enum Architecture {
  Arm32 = 'arm32',
  Arm64 = 'arm64',
  X32 = 'x32',
  X64 = 'x64',
}

export interface ArchitectureOption {
  description: string;
  value: Architecture;
  name: string;
}

export const architectures: ArchitectureOption[] = [
  {
    description: 'ARM processors are commonly used in battery-powered devices, such as smartphones and tablets.',
    value: Architecture.Arm32,
    name: 'Advanced RISC Machine - 32-bit',
  },
  {
    description: 'ARM processors are commonly used in battery-powered devices, such as smartphones and tablets.',
    value: Architecture.Arm64,
    name: 'Advanced RISC Machine - 64-bit',
  },
  {
    description: 'X86 processors are commonly used in desktop computers and laptops.',
    value: Architecture.X32,
    name: 'x86 machine - 32-bit',
  },
  {
    description: 'X86 processors are commonly used in desktop computers and laptops.',
    value: Architecture.X64,
    name: 'x86 machine - 64-bit',
  },
];
