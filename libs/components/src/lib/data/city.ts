import { type Entity } from '../table/table.models';

export interface City {
  uuid: string;
  name: string;
  countryUuid: string;
  subdivisionUuid: string | null;
  subdivisionCode: string | null;
  subdivisionName: string | null;
  subdivisionTypeName: string | null;
  countryThreeCharCode: string;
  countryName: string;
  dtodCityUuid: string | null;
  dtodCityName: string | null;
  dtodCountyName: string | null;
  dtodStateCountryCode: string | null;
  dtodRegionName: string | null;
  dtodCityDescription: string | null;
  dtodCityDesc: string | null;
  dtodCityNotFound: boolean;
  calculatedSddcBookingOfficeUuid: string;
  calculatedSddcBookingOfficeName: string;
  postalCodeRequirementsCode: string;
  inUseFlag: boolean;
  ibsInactive: string | null;
  versionToken: number;
  modifiedBy: string;
  createDate: string;
  updateDate: string;
  userComment: string | null;
}

export const getCityEntity = (): Entity<City> => ({
  name: 'cities',
  title: 'Cities',
  primaryKey: 'uuid',
  columns: [
    {
      name: 'name',
      title: 'Name',
      cell: (element: City) => `${element.name}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'subdivisionCode',
      title: 'Subdivision Code',
      cell: (element: City) => `${element.subdivisionCode}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'subdivisionName',
      title: 'Subdivision Name',
      cell: (element: City) => `${element.subdivisionName}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'countryThreeCharCode',
      title: 'Country Code',
      cell: (element: City) => `${element.countryThreeCharCode}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'countryName',
      title: 'Country Name',
      cell: (element: City) => `${element.countryName}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'dtodCityName',
      title: 'DTOD City Name',
      cell: (element: City) => `${element.dtodCityName}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'dtodCountyName',
      title: 'DTOD County Name',
      cell: (element: City) => `${element.dtodCountyName}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'dtodStateCountryCode',
      title: 'DTOD State Country Code',
      cell: (element: City) => `${element.dtodStateCountryCode}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'dtodRegionName',
      title: 'DTOD Region Name',
      cell: (element: City) => `${element.dtodRegionName}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'dtodCityDescription',
      title: 'DTOD City Description',
      cell: (element: City) => `${element.dtodCityDescription}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'dtodCityNotFound',
      title: 'DTOD City Not Found',
      cell: (element: City) => `${element.dtodCityNotFound ? 'Yes' : 'No'}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'calculatedSddcBookingOfficeName',
      title: 'SDDC Booking Office',
      cell: (element: City) => `${element.calculatedSddcBookingOfficeName}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'inUseFlag',
      title: 'In Use',
      cell: (element: City) => `${element.inUseFlag ? 'Yes' : 'No'}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'ibsInactive',
      title: 'Inactive',
      cell: (element: City) => `${element.ibsInactive ? 'Yes' : 'No'}`,
      isActive: true,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'modifiedBy',
      title: 'Modified By',
      cell: (element: City) => `${element.modifiedBy}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'createDate',
      title: 'Create Date',
      cell: (element: City) => `${element.createDate}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
    {
      name: 'updateDate',
      title: 'Update Date',
      cell: (element: City) => `${element.updateDate}`,
      isActive: false,
      defaultFilter: '',
      disableFilter: false,
    },
  ],
});
