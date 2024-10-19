import { Architecture } from './Architecture.js';
import { Platform } from './Platform.js';

export enum System {
  LinuxArm32 = Platform.Linux + '-' + Architecture.Arm32,
  LinuxArm64 = Platform.Linux + '-' + Architecture.Arm64,
  LinuxBit32 = Platform.Linux + '-' + Architecture.Bit32,
  LinuxBit64 = Platform.Linux + '-' + Architecture.Bit64,
  MacArm32 = Platform.Macintosh + '-' + Architecture.Arm32,
  MacArm64 = Platform.Macintosh + '-' + Architecture.Arm64,
  MacBit32 = Platform.Macintosh + '-' + Architecture.Bit32,
  MacBit64 = Platform.Macintosh + '-' + Architecture.Bit64,
  WindowsArm32 = Platform.Windows + '-' + Architecture.Arm32,
  WindowsArm64 = Platform.Windows + '-' + Architecture.Arm64,
  WindowsBit32 = Platform.Windows + '-' + Architecture.Bit32,
  WindowsBit64 = Platform.Windows + '-' + Architecture.Bit64,
}

export interface SystemOption {
  description: string;
  value: System;
  name: string;
}

export const systems: SystemOption[] = [
  {
    description: 'Used for embedded systems and older ARM devices.',
    value: System.LinuxArm32,
    name: 'Linux Arm 32 bit',
  },
  {
    description: 'Common for modern ARM-based servers and devices.',
    value: System.LinuxArm64,
    name: 'Linux Arm 64 bit',
  },
  {
    description: 'Used on older PCs and lower-power devices.',
    value: System.LinuxBit32,
    name: 'Linux 32 bit',
  },
  {
    description: 'Standard for modern desktop and server environments.',
    value: System.LinuxBit64,
    name: 'Linux 64 bit',
  },
  {
    description: 'Used in early ARM-based Apple devices.',
    value: System.MacArm32,
    name: 'Mac Arm 32 bit',
  },
  {
    description: 'Used in modern Apple Silicon devices.',
    value: System.MacArm64,
    name: 'Mac Arm 64 bit',
  },
  {
    description: 'Used in older Mac devices.',
    value: System.MacBit32,
    name: 'Mac 32 bit',
  },
  {
    description: 'Standard on Intel-based Macs before Apple Silicon.',
    value: System.MacBit64,
    name: 'Mac 64 bit',
  },
  {
    description: 'Used on select ARM-based Windows devices.',
    value: System.WindowsArm32,
    name: 'Windows Arm 32 bit',
  },
  {
    description: 'ARM-based PCs and tablets running Windows.',
    value: System.WindowsArm64,
    name: 'Windows Arm 64 bit',
  },
  {
    description: 'Used on older PCs and legacy systems.',
    value: System.WindowsBit32,
    name: 'Windows 32 bit',
  },
  {
    description: 'Standard for modern desktop and server use.',
    value: System.WindowsBit64,
    name: 'Windows 64 bit',
  },
];
