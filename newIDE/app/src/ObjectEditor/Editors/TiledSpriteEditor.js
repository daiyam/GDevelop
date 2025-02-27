// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { type EditorProps } from './EditorProps.flow';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
const gd = global.gd;

export default class TiledSpriteEditor extends React.Component<
  EditorProps,
  void
> {
  render() {
    const {
      objectConfiguration,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const tiledSpriteConfiguration = gd.asTiledSpriteConfiguration(
      objectConfiguration
    );

    return (
      <ColumnStackLayout noMargin>
        <ResourceSelectorWithThumbnail
          project={project}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          resourceKind="image"
          resourceName={tiledSpriteConfiguration.getTexture()}
          resourceExternalEditors={resourceExternalEditors}
          onChange={resourceName => {
            tiledSpriteConfiguration.setTexture(resourceName);
            this.forceUpdate();
          }}
          floatingLabelText={<Trans>Select an image</Trans>}
        />
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default width (in pixels)</Trans>}
            fullWidth
            type="number"
            value={tiledSpriteConfiguration.getWidth()}
            onChange={value => {
              tiledSpriteConfiguration.setWidth(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default height (in pixels)</Trans>}
            fullWidth
            type="number"
            value={tiledSpriteConfiguration.getHeight()}
            onChange={value => {
              tiledSpriteConfiguration.setHeight(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    );
  }
}
