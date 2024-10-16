export interface SystemType {
  description: string;
  id: SystemId;
  name: string;
}

export enum SystemId {
  LinuxArm32 = 'linux-arm32',
  LinuxArm64 = 'linux-arm64',
  LinuxBit32 = 'linux-bit32',
  LinuxBit64 = 'linux-bit64',
  MacArm32 = 'mac-arm32',
  MacArm64 = 'mac-arm64',
  MacBit32 = 'mac-bit32',
  MacBit64 = 'mac-bit64',
  WindowsArm32 = 'win-arm32',
  WindowsArm64 = 'win-arm64',
  WindowsBit32 = 'win-bit32',
  WindowsBit64 = 'win-bit64',
}

// TODO add all systems.

export const systems: SystemType[] = [
  {
    description: '',
    id: SystemId.LinuxArm32,
    name: 'Linux Arm 32 bit',
  },
];
