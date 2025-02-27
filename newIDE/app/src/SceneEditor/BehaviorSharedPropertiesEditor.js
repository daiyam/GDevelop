// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../UI/EmptyMessage';
import { Column } from '../UI/Grid';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';

type Props = {|
  behaviorSharedData: gdBehaviorsSharedData,
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};

export default class BehaviorSharedPropertiesEditor extends React.Component<Props> {
  render() {
    const { behaviorSharedData } = this.props;

    const propertiesSchema = propertiesMapToSchema(
      behaviorSharedData.getProperties(),
      behavior => behavior.getProperties(),
      (behavior, name, value) => {
        behavior.updateProperty(name, value);
      }
    );

    return (
      <Column expand>
        {propertiesSchema.length ? (
          <PropertiesEditor
            schema={propertiesSchema}
            instances={[behaviorSharedData]}
          />
        ) : (
          <EmptyMessage>
            <Trans>
              There is nothing to configure for this behavior. You can still use
              events to interact with the object and this behavior.
            </Trans>
          </EmptyMessage>
        )}
      </Column>
    );
  }
}
