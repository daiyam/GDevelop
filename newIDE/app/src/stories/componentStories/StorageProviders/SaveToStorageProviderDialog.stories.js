// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import SaveToStorageProviderDialog from '../../../ProjectsStorage/SaveToStorageProviderDialog';
import GoogleDriveStorageProvider from '../../../ProjectsStorage/GoogleDriveStorageProvider';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import muiDecorator from '../../ThemeDecorator';
import UrlStorageProvider from '../../../ProjectsStorage/UrlStorageProvider';
import DownloadFileStorageProvider from '../../../ProjectsStorage/DownloadFileStorageProvider';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeNotAuthenticatedAuthenticatedUser,
  fakeAuthenticatedAndEmailVerifiedUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Storage Providers/Writers/SaveToStorageProviderDialog',
  component: SaveToStorageProviderDialog,
  decorators: [muiDecorator],
};

export const UserNotAuthenticated = () => (
  <AuthenticatedUserContext.Provider
    value={fakeNotAuthenticatedAuthenticatedUser}
  >
    <SaveToStorageProviderDialog
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onChooseProvider={action('onChooseProvider')}
      onClose={action('onClose')}
    />
  </AuthenticatedUserContext.Provider>
);

export const UserAuthenticated = () => (
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedAndEmailVerifiedUser}
  >
    <SaveToStorageProviderDialog
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onChooseProvider={action('onChooseProvider')}
      onClose={action('onClose')}
    />
  </AuthenticatedUserContext.Provider>
);
