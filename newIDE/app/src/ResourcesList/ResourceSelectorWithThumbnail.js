// @flow
import * as React from 'react';
import ResourcesLoader from '../ResourcesLoader';
import ResourceSelector from './ResourceSelector';
import {
  type ResourceSource,
  type ChooseResourceFunction,
  type ResourceKind,
} from './ResourceSource';
import ResourceThumbnail from './ResourceThumbnail';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { LineStackLayout } from '../UI/Layout';

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  resourceKind: ResourceKind,
  resourceName: string,
  onChange: string => void,
  floatingLabelText?: React.Node,
  hintText?: MessageDescriptor,
  helperMarkdownText?: ?string,
|};

const ResourceSelectorWithThumbnail = ({
  project,
  resourceSources,
  onChooseResource,
  resourceExternalEditors,
  resourceKind,
  resourceName,
  onChange,
  floatingLabelText,
  hintText,
  helperMarkdownText,
}: Props) => {
  return (
    <LineStackLayout noMargin expand alignItems="flex-end">
      <ResourceSelector
        project={project}
        resourceSources={resourceSources}
        onChooseResource={onChooseResource}
        resourceExternalEditors={resourceExternalEditors}
        resourcesLoader={ResourcesLoader}
        resourceKind={resourceKind}
        fullWidth
        initialResourceName={resourceName}
        onChange={onChange}
        floatingLabelText={floatingLabelText}
        hintText={hintText}
        helperMarkdownText={helperMarkdownText}
      />
      <ResourceThumbnail
        resourceName={resourceName}
        resourcesLoader={ResourcesLoader}
        project={project}
      />
    </LineStackLayout>
  );
};

export default ResourceSelectorWithThumbnail;
