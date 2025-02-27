// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapReverseFor } from '../Utils/MapFor';
import LayerRow, { styles } from './LayerRow';
import BackgroundColorRow from './BackgroundColorRow';
import { Column, Line } from '../UI/Grid';
import Add from '@material-ui/icons/Add';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import ScrollView from '../UI/ScrollView';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import useForceUpdate from '../Utils/UseForceUpdate';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';

const DropTarget = makeDropTarget('layers-list');

type LayersListBodyProps = {|
  layersContainer: gdLayout,
  unsavedChanges?: ?UnsavedChanges,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onRenameLayer: (
    oldName: string,
    newName: string,
    cb: (done: boolean) => void
  ) => void,
  onEditEffects: (layer: ?gdLayer) => void,
  onEdit: (layer: ?gdLayer) => void,
  width: number,
|};

const LayersListBody = (props: LayersListBodyProps) => {
  const forceUpdate = useForceUpdate();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [nameErrors, setNameErrors] = React.useState<{
    [key: string]: React.Node,
  }>({});
  const draggedLayerIndexRef = React.useRef<number | null>(null);

  const {
    layersContainer,
    onEditEffects,
    onEdit,
    width,
    onRenameLayer,
    onRemoveLayer,
    unsavedChanges,
  } = props;

  const onLayerModified = () => {
    if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
    forceUpdate();
  };

  const onDropLayer = (targetIndex: number) => {
    const { current: draggedLayerIndex } = draggedLayerIndexRef;
    if (draggedLayerIndex === null) return;

    if (targetIndex !== draggedLayerIndex) {
      layersContainer.moveLayer(
        draggedLayerIndex,
        targetIndex < draggedLayerIndex ? targetIndex + 1 : targetIndex
      );
      onLayerModified();
    }
    draggedLayerIndexRef.current = null;
  };

  const layersCount = layersContainer.getLayersCount();
  const containerLayersList = mapReverseFor(0, layersCount, i => {
    const layer = layersContainer.getLayerAt(i);
    const layerName = layer.getName();

    return (
      <LayerRow
        key={'layer-' + layer.ptr}
        layer={layer}
        nameError={nameErrors[layerName]}
        effectsCount={layer.getEffects().getEffectsCount()}
        onEditEffects={() => onEditEffects(layer)}
        onEdit={() => onEdit(layer)}
        onBeginDrag={() => {
          draggedLayerIndexRef.current = i;
        }}
        onDrop={() => onDropLayer(i)}
        onBlur={newName => {
          setNameErrors(currentValue => ({
            ...currentValue,
            [layerName]: null,
          }));

          if (layerName === newName) return;

          const isNameAlreadyTaken = layersContainer.hasLayerNamed(newName);
          if (isNameAlreadyTaken) {
            setNameErrors(currentValue => ({
              ...currentValue,
              [layerName]: <Trans>The name {newName} is already taken</Trans>,
            }));
          } else {
            onRenameLayer(layerName, newName, doRename => {
              if (doRename)
                layersContainer.getLayer(layerName).setName(newName);
            });
          }
        }}
        onRemove={() => {
          onRemoveLayer(layerName, doRemove => {
            if (!doRemove) return;

            layersContainer.removeLayer(layerName);
            onLayerModified();
          });
        }}
        isVisible={layer.getVisibility()}
        onChangeVisibility={visible => {
          layer.setVisibility(visible);
          onLayerModified();
        }}
        width={width}
      />
    );
  });

  return (
    <Column noMargin expand>
      {containerLayersList}
      <DropTarget
        canDrop={() => true}
        drop={() => {
          onDropLayer(-1);
        }}
      >
        {({ connectDropTarget, isOver, canDrop }) =>
          connectDropTarget(
            <div>
              {isOver && (
                <div
                  style={{
                    ...styles.dropIndicator,
                    outlineColor: gdevelopTheme.dropIndicator.canDrop,
                  }}
                />
              )}
              <BackgroundColorRow
                layout={layersContainer}
                onBackgroundColorChanged={onLayerModified}
              />
            </div>
          )
        }
      </DropTarget>
    </Column>
  );
};

type Props = {|
  project: gdProject,
  layersContainer: gdLayout,
  onEditLayerEffects: (layer: ?gdLayer) => void,
  onEditLayer: (layer: ?gdLayer) => void,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onRenameLayer: (
    oldName: string,
    newName: string,
    cb: (done: boolean) => void
  ) => void,
  onCreateLayer: () => void,
  unsavedChanges?: ?UnsavedChanges,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

export type LayersListInterface = {
  forceUpdate: () => void,
};

const hasLightingLayer = (layout: gdLayout) => {
  const layersCount = layout.getLayersCount();
  return (
    mapReverseFor(0, layersCount, i =>
      layout.getLayerAt(i).isLightingLayer()
    ).filter(Boolean).length > 0
  );
};

const LayersList = React.forwardRef<Props, LayersListInterface>(
  (props, ref) => {
    const forceUpdate = useForceUpdate();

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    const addLayer = () => {
      const { layersContainer } = props;
      const name = newNameGenerator('Layer', name =>
        layersContainer.hasLayerNamed(name)
      );
      layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
      onLayerModified();
      props.onCreateLayer();
    };

    const addLightingLayer = () => {
      const { layersContainer } = props;
      const name = newNameGenerator('Lighting', name =>
        layersContainer.hasLayerNamed(name)
      );
      layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
      const layer = layersContainer.getLayer(name);
      layer.setLightingLayer(true);
      layer.setFollowBaseLayerCamera(true);
      layer.setAmbientLightColor(200, 200, 200);
      onLayerModified();
      props.onCreateLayer();
    };

    const onLayerModified = () => {
      if (props.unsavedChanges) props.unsavedChanges.triggerUnsavedChanges();
      forceUpdate();
    };

    // Force the list to be mounted again if layersContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = props.layersContainer.ptr;
    const isLightingLayerPresent = hasLightingLayer(props.layersContainer);

    return (
      <Background>
        <ScrollView autoHideScrollbar>
          <FullSizeMeasurer>
            {({ width }) => (
              // TODO: The list is costly to render when there are many layers, consider
              // using SortableVirtualizedItemList.
              <LayersListBody
                key={listKey}
                layersContainer={props.layersContainer}
                onEditEffects={props.onEditLayerEffects}
                onEdit={props.onEditLayer}
                onRemoveLayer={props.onRemoveLayer}
                onRenameLayer={props.onRenameLayer}
                unsavedChanges={props.unsavedChanges}
                width={width}
              />
            )}
          </FullSizeMeasurer>
          <Column>
            <Line justifyContent="flex-end" expand>
              <RaisedButtonWithSplitMenu
                label={<Trans>Add a layer</Trans>}
                primary
                onClick={addLayer}
                icon={<Add />}
                buildMenuTemplate={i18n => [
                  {
                    label: i18n._(t`Add lighting layer`),
                    enabled: !isLightingLayerPresent,
                    click: addLightingLayer,
                  },
                ]}
              />
            </Line>
          </Column>
        </ScrollView>
      </Background>
    );
  }
);

export default LayersList;
