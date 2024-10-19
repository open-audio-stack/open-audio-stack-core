export enum License {
  AcademicFreeLicensev3 = 'afl-3.0',
  ApacheLicense2 = 'apache-2.0',
  BSDZeroClauseLicense = '0bsd',
  GNUAfferoGeneralPublicLicensev3 = 'agpl-3.0',
  ArtisticLicense2 = 'artistic-2.0',
  BlueOakModelLicense1 = 'blueoak-1.0.0',
  BSD2ClausePlusPatentLicense = 'bsd-2-clause-patent',
  BSD2ClauseSimplifiedLicense = 'bsd-2-clause',
  BSD3ClauseClearLicense = 'bsd-3-clause-clear',
  BSD3ClauseNeworRevisedLicense = 'bsd-3-clause',
  BSD4ClauseOriginalorOldLicense = 'bsd-4-clause',
  BoostSoftwareLicense1 = 'bsl-1.0',
  CreativeCommonsAttribution4International = 'cc-by-4.0',
  CreativeCommonsAttributionShareAlike4International = 'cc-by-sa-4.0',
  CreativeCommonsZerov1Universal = 'cc0-1.0',
  CeCILLFreeSoftwareLicenseAgreementv2_1 = 'cecill-2.1',
  CERNOpenHardwareLicenceVersion2Permissive = 'cern-ohl-p-2.0',
  CERNOpenHardwareLicenceVersion2StronglyReciprocal = 'cern-ohl-s-2.0',
  CERNOpenHardwareLicenceVersion2WeaklyReciprocal = 'cern-ohl-w-2.0',
  EducationalCommunityLicensev2 = 'ecl-2.0',
  EclipsePublicLicense1 = 'epl-1.0',
  EclipsePublicLicense2 = 'epl-2.0',
  EuropeanUnionPublicLicense1_1 = 'eupl-1.1',
  EuropeanUnionPublicLicense1_2 = 'eupl-1.2',
  GNUFreeDocumentationLicensev1_3 = 'gfdl-1.3',
  GNUGeneralPublicLicensev2 = 'gpl-2.0',
  GNUGeneralPublicLicensev3 = 'gpl-3.0',
  ISCLicense = 'isc',
  GNULesserGeneralPublicLicensev2_1 = 'lgpl-2.1',
  GNULesserGeneralPublicLicensev3 = 'lgpl-3.0',
  LaTeXProjectPublicLicensev1_3c = 'lppl-1.3c',
  MITNoAttribution = 'mit-0',
  MITLicense = 'mit',
  MozillaPublicLicense2 = 'mpl-2.0',
  MicrosoftPublicLicense = 'ms-pl',
  MicrosoftReciprocalLicense = 'ms-rl',
  MulanPermissiveSoftwareLicenseVersion2 = 'mulanpsl-2.0',
  UniversityofIllinoisNCSAOpenSourceLicense = 'ncsa',
  OpenDataCommonsOpenDatabaseLicensev1 = 'odbl-1.0',
  SILOpenFontLicense1_1 = 'ofl-1.1',
  OpenSoftwareLicense3 = 'osl-3.0',
  PostgreSQLLicense = 'postgresql',
  TheUnlicense = 'unlicense',
  UniversalPermissiveLicensev1 = 'upl-1.0',
  VimLicense = 'vim',
  DoWhatTheFYouWantToPublicLicense = 'wtfpl',
  zlibLicense = 'zlib',
  Other = 'other',
}

export interface LicenseOption {
  description: string;
  value: License;
  name: string;
}

export const licenses: LicenseOption[] = [
  {
    description: 'Permissive license that allows for almost unrestricted use, modification, and distribution.',
    value: License.AcademicFreeLicensev3,
    name: 'Academic Free License v3.0',
  },
  {
    description: 'Permissive license allows use, modification, and distribution of the software, with conditions.',
    value: License.ApacheLicense2,
    name: 'Apache License 2.0',
  },
  {
    description: 'Allows you to use, modify, and distribute the software with no restrictions.',
    value: License.BSDZeroClauseLicense,
    name: 'BSD Zero Clause License',
  },
  {
    description: 'Copyleft license requires modifications and derived works to be licensed under the same terms.',
    value: License.GNUAfferoGeneralPublicLicensev3,
    name: 'GNU Affero General Public License v3.0',
  },
  {
    description: 'Allows creation and distribution of derivative works, with some restrictions on attribution.',
    value: License.ArtisticLicense2,
    name: 'Artistic License 2.0',
  },
  {
    description: 'Permissive license encourages collaboration while maintaining rights for the original author.',
    value: License.BlueOakModelLicense1,
    name: 'Blue Oak Model License 1.0.0',
  },
  {
    description: 'Allows use and distribution of the software, but includes a patent grant to users.',
    value: License.BSD2ClausePlusPatentLicense,
    name: 'BSD-2-Clause Plus Patent License',
  },
  {
    description: 'Simplified version of BSD License allows for modification and redistribution with few restrictions.',
    value: License.BSD2ClauseSimplifiedLicense,
    name: 'BSD 2-Clause "Simplified" License',
  },
  {
    description: 'Permissive license allows use and redistribution, with a disclaimer of warranties.',
    value: License.BSD3ClauseClearLicense,
    name: 'BSD 3-Clause Clear License',
  },
  {
    description:
      'Allows use and distribution, while preventing the use of the name of the original project in advertising.',
    value: License.BSD3ClauseNeworRevisedLicense,
    name: 'BSD 3-Clause "New" or "Revised" License',
  },
  {
    description:
      'An older version of the BSD license that includes clauses that are no longer common in newer licenses.',
    value: License.BSD4ClauseOriginalorOldLicense,
    name: 'BSD 4-Clause "Original" or "Old" License',
  },
  {
    description: 'A permissive license that allows for software modification and redistribution without restrictions.',
    value: License.BoostSoftwareLicense1,
    name: 'Boost Software License 1.0',
  },
  {
    description: 'Allows for sharing and adapting the work, even for commercial purposes, as long as credit is given.',
    value: License.CreativeCommonsAttribution4International,
    name: 'Creative Commons Attribution 4.0 International',
  },
  {
    description:
      'Allows for sharing and adapting the work, even for commercial purposes, under the same license terms.',
    value: License.CreativeCommonsAttributionShareAlike4International,
    name: 'Creative Commons Attribution Share Alike 4.0 International',
  },
  {
    description:
      'A license that allows for the use, modification, and distribution of the software without restrictions.',
    value: License.CreativeCommonsZerov1Universal,
    name: 'Creative Commons Zero v1.0 Universal',
  },
  {
    description:
      'A free software license that aims to provide the same freedoms as the GNU GPL while being compatible with other licenses.',
    value: License.CeCILLFreeSoftwareLicenseAgreementv2_1,
    name: 'CeCILL Free Software License Agreement v2.1',
  },
  {
    description: 'A permissive license for open hardware, allowing for modification and distribution.',
    value: License.CERNOpenHardwareLicenceVersion2Permissive,
    name: 'CERN Open Hardware Licence Version 2 - Permissive',
  },
  {
    description: 'A license that requires derivative works to maintain the same licensing terms.',
    value: License.CERNOpenHardwareLicenceVersion2StronglyReciprocal,
    name: 'CERN Open Hardware Licence Version 2 - Strongly Reciprocal',
  },
  {
    description: 'A license that encourages sharing and collaboration while maintaining some restrictions.',
    value: License.CERNOpenHardwareLicenceVersion2WeaklyReciprocal,
    name: 'CERN Open Hardware Licence Version 2 - Weakly Reciprocal',
  },
  {
    description: 'A license designed for educational use, allowing for modification and redistribution.',
    value: License.EducationalCommunityLicensev2,
    name: 'Educational Community License v2.0',
  },
  {
    description: 'A license that allows software to be used and modified under certain conditions.',
    value: License.EclipsePublicLicense1,
    name: 'Eclipse Public License 1.0',
  },
  {
    description:
      'A more permissive version of the Eclipse Public License, allowing for greater freedom in use and distribution.',
    value: License.EclipsePublicLicense2,
    name: 'Eclipse Public License 2.0',
  },
  {
    description:
      'A license developed by the European Union for public sector information, allowing for reuse and modification.',
    value: License.EuropeanUnionPublicLicense1_1,
    name: 'European Union Public License 1.1',
  },
  {
    description: 'An updated version of the EU Public License with minor clarifications and improvements.',
    value: License.EuropeanUnionPublicLicense1_2,
    name: 'European Union Public License 1.2',
  },
  {
    description:
      'A copyleft license that allows for the distribution and modification of documentation under the same terms.',
    value: License.GNUFreeDocumentationLicensev1_3,
    name: 'GNU Free Documentation License v1.3',
  },
  {
    description:
      'A copyleft license that allows for the use, modification, and distribution of software under the same terms.',
    value: License.GNUGeneralPublicLicensev2,
    name: 'GNU General Public License v2.0',
  },
  {
    description:
      'A more modern version of the GPL that adds compatibility with other licenses and additional provisions.',
    value: License.GNUGeneralPublicLicensev3,
    name: 'GNU General Public License v3.0',
  },
  {
    description: 'A permissive license that allows for simple reuse and modification of software.',
    value: License.ISCLicense,
    name: 'ISC License',
  },
  {
    description: 'A copyleft license that is a weaker form of the GPL, designed for libraries and reusable code.',
    value: License.GNULesserGeneralPublicLicensev2_1,
    name: 'GNU Lesser General Public License v2.1',
  },
  {
    description: 'An updated version of the LGPL, allowing for more flexible linking to proprietary software.',
    value: License.GNULesserGeneralPublicLicensev3,
    name: 'GNU Lesser General Public License v3.0',
  },
  {
    description: 'A license for LaTeX packages that allows for distribution and modification under certain conditions.',
    value: License.LaTeXProjectPublicLicensev1_3c,
    name: 'LaTeX Project Public License v1.3c',
  },
  {
    description: 'A permissive license that allows for software use without requiring attribution.',
    value: License.MITNoAttribution,
    name: 'MIT No Attribution',
  },
  {
    description: 'A widely used permissive license that allows for software reuse, modification, and distribution.',
    value: License.MITLicense,
    name: 'MIT License',
  },
  {
    description:
      'A license that allows for use, modification, and distribution of software, with some restrictions on the distribution of modified versions.',
    value: License.MozillaPublicLicense2,
    name: 'Mozilla Public License 2.0',
  },
  {
    description: 'A permissive license that allows for broad use and distribution, often used for libraries and tools.',
    value: License.MicrosoftPublicLicense,
    name: 'Microsoft Public License',
  },
  {
    description:
      'A license that allows for software redistribution, modification, and incorporation into proprietary software with conditions.',
    value: License.MicrosoftReciprocalLicense,
    name: 'Microsoft Reciprocal License',
  },
  {
    description:
      'A permissive license allowing for use, modification, and distribution of software, primarily in China.',
    value: License.MulanPermissiveSoftwareLicenseVersion2,
    name: 'Mulan Permissive Software License, Version 2',
  },
  {
    description: 'A permissive license that allows for software reuse and modification with few restrictions.',
    value: License.UniversityofIllinoisNCSAOpenSourceLicense,
    name: 'University of Illinois/NCSA Open Source License',
  },
  {
    description: 'A license that allows for sharing and adapting databases, provided that attribution is given.',
    value: License.OpenDataCommonsOpenDatabaseLicensev1,
    name: 'Open Data Commons Open Database License v1.0',
  },
  {
    description:
      'A license specifically for fonts, allowing for modification and redistribution under certain conditions.',
    value: License.SILOpenFontLicense1_1,
    name: 'SIL Open Font License 1.1',
  },
  {
    description:
      'A license that permits modification and distribution while ensuring that derivative works are also open.',
    value: License.OpenSoftwareLicense3,
    name: 'Open Software License 3.0',
  },
  {
    description:
      'A permissive license that allows for software modification and redistribution, commonly used for databases.',
    value: License.PostgreSQLLicense,
    name: 'PostgreSQL License',
  },
  {
    description:
      'A license that effectively places software in the public domain, allowing for unrestricted use and distribution.',
    value: License.TheUnlicense,
    name: 'The Unlicense',
  },
  {
    description:
      'A permissive license allowing for modification and redistribution of software with minimal restrictions.',
    value: License.UniversalPermissiveLicensev1,
    name: 'Universal Permissive License v1.0',
  },
  {
    description: 'A permissive license for software, allowing for use, modification, and redistribution.',
    value: License.VimLicense,
    name: 'Vim License',
  },
  {
    description:
      'A humorous license that allows for any kind of use or distribution of the software without restrictions.',
    value: License.DoWhatTheFYouWantToPublicLicense,
    name: 'Do What The F*ck You Want To Public License',
  },
  {
    description:
      'A permissive license that allows for software modification and redistribution with minimal conditions.',
    value: License.zlibLicense,
    name: 'zlib License',
  },
  {
    description: 'A placeholder for any other licenses not specifically listed here.',
    value: License.Other,
    name: 'Other',
  },
];
