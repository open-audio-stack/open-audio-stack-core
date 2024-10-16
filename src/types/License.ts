export interface LicenseType {
  description: string;
  id: LicenseId;
  name: string;
}

export enum LicenseId {
  BSDZeroClauseLicense = '0bsd',
  AcademicFreeLicensev3 = 'afl-3.0',
  GNUAfferoGeneralPublicLicensev3 = 'agpl-3.0',
  ApacheLicense2 = 'apache-2.0',
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

// TODO add all licenses.

export const licenses: LicenseType[] = [
  {
    description: '',
    id: LicenseId.BSDZeroClauseLicense,
    name: 'BSD Zero Clause License',
  },
];
