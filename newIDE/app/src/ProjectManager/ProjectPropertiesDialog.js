// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Checkbox from '../UI/Checkbox';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import {
  getProjectPropertiesErrors,
  displayProjectErrorsBox,
  validatePackageName,
} from '../Utils/ProjectErrorsChecker';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import HelpButton from '../UI/HelpButton';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import ExtensionsProperties from './ExtensionsProperties';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';
import { I18n } from '@lingui/react';
import AlertMessage from '../UI/AlertMessage';
import { GameRegistration } from '../GameDashboard/GameRegistration';
import { Tabs } from '../UI/Tabs';
import { LoadingScreenEditor } from './LoadingScreenEditor';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import {
  type HotReloadPreviewButtonProps,
  NewPreviewIcon,
} from '../HotReload/HotReloadPreviewButton';
import PublicGameProperties from '../GameDashboard/PublicGameProperties';

type Props = {|
  project: gdProject,
  open: boolean,
  initialTab: 'properties' | 'loading-screen',
  onClose: () => void,
  onApply: (options: { newName?: string }) => Promise<boolean>,
  onPropertiesApplied: (options: { newName?: string }) => void,
  onChangeSubscription: () => void,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,

  // For resources:
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};

type ProjectProperties = {|
  gameResolutionWidth: number,
  gameResolutionHeight: number,
  adaptGameResolutionAtRuntime: boolean,
  name: string,
  description: string,
  author: string,
  authorIds: string[],
  version: string,
  packageName: string,
  orientation: string,
  scaleMode: string,
  pixelsRounding: boolean,
  sizeOnStartupMode: string,
  minFPS: number,
  maxFPS: number,
  isFolderProject: boolean,
  useDeprecatedZeroAsDefaultZOrder: boolean,
|};

function loadPropertiesFromProject(project: gdProject): ProjectProperties {
  return {
    gameResolutionWidth: project.getGameResolutionWidth(),
    gameResolutionHeight: project.getGameResolutionHeight(),
    adaptGameResolutionAtRuntime: project.getAdaptGameResolutionAtRuntime(),
    name: project.getName(),
    description: project.getDescription(),
    author: project.getAuthor(),
    authorIds: project.getAuthorIds().toJSArray(),
    version: project.getVersion(),
    packageName: project.getPackageName(),
    orientation: project.getOrientation(),
    scaleMode: project.getScaleMode(),
    pixelsRounding: project.getPixelsRounding(),
    sizeOnStartupMode: project.getSizeOnStartupMode(),
    minFPS: project.getMinimumFPS(),
    maxFPS: project.getMaximumFPS(),
    isFolderProject: project.isFolderProject(),
    useDeprecatedZeroAsDefaultZOrder: project.getUseDeprecatedZeroAsDefaultZOrder(),
  };
}

function applyPropertiesToProject(
  project: gdProject,
  newProperties: ProjectProperties
) {
  const t = str => str; //TODO
  const {
    gameResolutionWidth,
    gameResolutionHeight,
    adaptGameResolutionAtRuntime,
    name,
    description,
    authorIds,
    author,
    version,
    packageName,
    orientation,
    scaleMode,
    pixelsRounding,
    sizeOnStartupMode,
    minFPS,
    maxFPS,
    isFolderProject,
    useDeprecatedZeroAsDefaultZOrder,
  } = newProperties;
  project.setGameResolutionSize(gameResolutionWidth, gameResolutionHeight);
  project.setAdaptGameResolutionAtRuntime(adaptGameResolutionAtRuntime);
  project.setName(name);
  project.setDescription(description);
  const projectAuthorIds = project.getAuthorIds();
  projectAuthorIds.clear();
  authorIds.forEach(authorId => projectAuthorIds.push_back(authorId));
  project.setAuthor(author);
  project.setVersion(version);
  project.setPackageName(packageName);
  project.setOrientation(orientation);
  project.setScaleMode(scaleMode);
  project.setPixelsRounding(pixelsRounding);
  project.setSizeOnStartupMode(sizeOnStartupMode);
  project.setMinimumFPS(minFPS);
  project.setMaximumFPS(maxFPS);
  project.setFolderProject(isFolderProject);
  project.setUseDeprecatedZeroAsDefaultZOrder(useDeprecatedZeroAsDefaultZOrder);

  return displayProjectErrorsBox(t, getProjectPropertiesErrors(t, project));
}

function ProjectPropertiesDialog(props: Props) {
  const { project, hotReloadPreviewButtonProps } = props;

  const initialProperties = React.useMemo(
    () => loadPropertiesFromProject(project),
    [project]
  );
  let [name, setName] = React.useState(initialProperties.name);
  let [description, setDescription] = React.useState(
    initialProperties.description
  );
  let [authorIds, setAuthorIds] = React.useState(initialProperties.authorIds);
  let [gameResolutionWidth, setGameResolutionWidth] = React.useState(
    initialProperties.gameResolutionWidth
  );
  let [gameResolutionHeight, setGameResolutionHeight] = React.useState(
    initialProperties.gameResolutionHeight
  );
  let [
    adaptGameResolutionAtRuntime,
    setAdaptGameResolutionAtRuntime,
  ] = React.useState(initialProperties.adaptGameResolutionAtRuntime);
  let [author, setAuthor] = React.useState(initialProperties.author);
  let [version, setVersion] = React.useState(initialProperties.version);
  let [packageName, setPackageName] = React.useState(
    initialProperties.packageName
  );
  let [orientation, setOrientation] = React.useState(
    initialProperties.orientation
  );
  let [scaleMode, setScaleMode] = React.useState(initialProperties.scaleMode);
  let [pixelsRounding, setPixelsRounding] = React.useState(
    initialProperties.pixelsRounding
  );
  let [sizeOnStartupMode, setSizeOnStartupMode] = React.useState(
    initialProperties.sizeOnStartupMode
  );
  let [minFPS, setMinFPS] = React.useState(initialProperties.minFPS);
  let [maxFPS, setMaxFPS] = React.useState(initialProperties.maxFPS);
  let [isFolderProject, setIsFolderProject] = React.useState(
    initialProperties.isFolderProject
  );
  let [
    useDeprecatedZeroAsDefaultZOrder,
    setUseDeprecatedZeroAsDefaultZOrder,
  ] = React.useState(initialProperties.useDeprecatedZeroAsDefaultZOrder);

  const defaultPackageName = 'com.example.mygame';
  const defaultVersion = '1.0.0';

  const [currentTab, setCurrentTab] = React.useState<
    'properties' | 'loading-screen'
  >(props.initialTab);

  const {
    onCancelChanges: onCancelLoadingScreenChanges,
    notifyOfChange: notifyOfLoadingScreenChange,
  } = useSerializableObjectCancelableEditor({
    serializableObject: project.getLoadingScreen(),
    onCancel: props.onClose,
  });
  const {
    onCancelChanges,
    notifyOfChange,
  } = useSerializableObjectCancelableEditor({
    serializableObject: project.getExtensionProperties(),
    onCancel: onCancelLoadingScreenChanges,
  });

  const onApply = async () => {
    const specialPropertiesChanged =
      name !== initialProperties.name ? { newName: name } : {};

    const proceed = await props.onApply(specialPropertiesChanged);
    if (!proceed) return;

    const wasProjectPropertiesApplied = applyPropertiesToProject(project, {
      gameResolutionWidth,
      gameResolutionHeight,
      adaptGameResolutionAtRuntime,
      name,
      description,
      author,
      authorIds,
      version,
      packageName,
      orientation,
      scaleMode,
      pixelsRounding,
      sizeOnStartupMode,
      minFPS,
      maxFPS,
      isFolderProject,
      useDeprecatedZeroAsDefaultZOrder,
    });

    if (wasProjectPropertiesApplied) {
      props.onPropertiesApplied(specialPropertiesChanged);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <React.Fragment>
          <Dialog
            title={<Trans>Game properties</Trans>}
            actions={[
              <FlatButton
                label={<Trans>Cancel</Trans>}
                primary={false}
                onClick={onCancelChanges}
                key="cancel"
              />,
              <DialogPrimaryButton
                label={<Trans>Apply</Trans>}
                primary={true}
                onClick={onApply}
                key="apply"
              />,
            ]}
            secondaryActions={[
              <HelpButton
                helpPagePath="/interface/project-manager/properties"
                key="help"
              />,
              hotReloadPreviewButtonProps ? (
                <FlatButton
                  key="hot-reload-preview-button"
                  leftIcon={<NewPreviewIcon />}
                  label={<Trans>Run a preview (with loading screen)</Trans>}
                  onClick={
                    hotReloadPreviewButtonProps.launchProjectWithLoadingScreenPreview
                  }
                />
              ) : null,
            ]}
            onRequestClose={onCancelChanges}
            onApply={onApply}
            open={props.open}
            fullHeight
            fixedContent={
              <Tabs
                value={currentTab}
                onChange={setCurrentTab}
                options={[
                  { label: <Trans>Properties</Trans>, value: 'properties' },
                  {
                    label: <Trans>Loading screen</Trans>,
                    value: 'loading-screen',
                  },
                ]}
              />
            }
          >
            {currentTab === 'properties' && (
              <ColumnStackLayout expand noMargin>
                <Text size="block-title">
                  <Trans>Game Info</Trans>
                </Text>
                <PublicGameProperties
                  name={name}
                  setName={newName => {
                    if (newName.trim() === name) {
                      return;
                    }
                    setName(newName.trim());
                    notifyOfChange();
                  }}
                  description={description}
                  setDescription={newDescription => {
                    if (newDescription === description) {
                      return;
                    }
                    setDescription(newDescription.trim());
                    notifyOfChange();
                  }}
                  project={project}
                  authorIds={authorIds}
                  setAuthorIds={newAuthorIds => {
                    setAuthorIds(newAuthorIds);
                    notifyOfChange();
                  }}
                  orientation={orientation}
                  setOrientation={newOrientation => {
                    if (newOrientation === orientation) {
                      return;
                    }
                    setOrientation(newOrientation);
                    notifyOfChange();
                  }}
                />
                <Text size="block-title">
                  <Trans>Packaging</Trans>
                </Text>
                <SemiControlledTextField
                  floatingLabelText={
                    <Trans>Package name (for iOS and Android)</Trans>
                  }
                  fullWidth
                  hintText={defaultPackageName}
                  type="text"
                  value={packageName}
                  onChange={newPackageName => {
                    if (newPackageName === packageName) {
                      return;
                    }
                    setPackageName(newPackageName);
                    notifyOfChange();
                  }}
                  errorText={
                    validatePackageName(packageName) ? (
                      undefined
                    ) : (
                      <Trans>
                        The package name is containing invalid characters or not
                        following the convention "xxx.yyy.zzz" (numbers allowed
                        after a letter only).
                      </Trans>
                    )
                  }
                />
                <SemiControlledTextField
                  floatingLabelText={<Trans>Version number (X.Y.Z)</Trans>}
                  fullWidth
                  hintText={defaultVersion}
                  type="text"
                  value={version}
                  onChange={newVersion => {
                    if (newVersion === version) {
                      return;
                    }
                    setVersion(newVersion);
                    notifyOfChange();
                  }}
                />
                <SemiControlledTextField
                  floatingLabelText={<Trans>Publisher name</Trans>}
                  fullWidth
                  translatableHintText={t`Your name`}
                  helperMarkdownText={i18n._(
                    t`This will be used when packaging and submitting your application to the stores.`
                  )}
                  type="text"
                  value={author}
                  onChange={newAuthor => {
                    if (newAuthor === author) {
                      return;
                    }
                    setAuthor(newAuthor);
                    notifyOfChange();
                  }}
                />
                {useDeprecatedZeroAsDefaultZOrder ? (
                  <React.Fragment>
                    <Text size="block-title">
                      <Trans>Z Order of objects created from events</Trans>
                    </Text>
                    <AlertMessage kind="info">
                      <Trans>
                        When you create an object using an action, GDevelop now
                        sets the Z order of the object to the maximum value that
                        was found when starting the scene for each layer. This
                        allow to make sure that objects that you create are in
                        front of others. This game was created before this
                        change, so GDevelop maintains the old behavior: newly
                        created objects Z order is set to 0. It's recommended
                        that you switch to the new behavior by clicking the
                        following button.
                      </Trans>
                    </AlertMessage>
                    <RaisedButton
                      onClick={() => {
                        const answer = Window.showConfirmDialog(
                          i18n._(
                            t`Make sure to verify all your events creating objects, and optionally add an action to set the Z order back to 0 if it's important for your game. Do you want to continue (recommened)?`
                          )
                        );
                        if (!answer) return;

                        setUseDeprecatedZeroAsDefaultZOrder(false);
                        notifyOfChange();
                      }}
                      label={
                        <Trans>
                          Switch to create objects with the highest Z order of
                          the layer
                        </Trans>
                      }
                    />
                  </React.Fragment>
                ) : null}
                <Text size="block-title">
                  <Trans>Analytics</Trans>
                </Text>
                <GameRegistration project={project} />
                <Text size="block-title">
                  <Trans>Resolution and rendering</Trans>
                </Text>
                <ResponsiveLineStackLayout noMargin>
                  <SemiControlledTextField
                    floatingLabelText={<Trans>Game resolution width</Trans>}
                    fullWidth
                    type="number"
                    value={'' + gameResolutionWidth}
                    onChange={value => {
                      const newResolutionWidth = Math.max(
                        1,
                        parseInt(value, 10)
                      );
                      if (newResolutionWidth === gameResolutionWidth) {
                        return;
                      }
                      setGameResolutionWidth(newResolutionWidth);
                      notifyOfChange();
                    }}
                  />
                  <SemiControlledTextField
                    floatingLabelText={<Trans>Game resolution height</Trans>}
                    fullWidth
                    type="number"
                    value={'' + gameResolutionHeight}
                    onChange={value => {
                      const newResolutionHeight = Math.max(
                        1,
                        parseInt(value, 10)
                      );
                      if (newResolutionHeight === gameResolutionHeight) {
                        return;
                      }
                      setGameResolutionHeight(newResolutionHeight);
                      notifyOfChange();
                    }}
                  />
                </ResponsiveLineStackLayout>
                <SelectField
                  fullWidth
                  floatingLabelText={
                    <Trans>
                      Game resolution resize mode (fullscreen or window)
                    </Trans>
                  }
                  value={sizeOnStartupMode}
                  onChange={(e, i, newSizeOnStartupMode: string) => {
                    if (newSizeOnStartupMode === sizeOnStartupMode) {
                      return;
                    }
                    setSizeOnStartupMode(newSizeOnStartupMode);
                    notifyOfChange();
                  }}
                >
                  <SelectOption
                    value=""
                    primaryText={t`No changes to the game size`}
                  />
                  <SelectOption
                    value="adaptWidth"
                    primaryText={t`Change width to fit the screen or window size`}
                  />
                  <SelectOption
                    value="adaptHeight"
                    primaryText={t`Change height to fit the screen or window size`}
                  />
                </SelectField>
                <Checkbox
                  label={
                    <Trans>
                      Update resolution during the game to fit the screen or
                      window size
                    </Trans>
                  }
                  disabled={sizeOnStartupMode === ''}
                  checked={adaptGameResolutionAtRuntime}
                  onCheck={(e, checked) => {
                    setAdaptGameResolutionAtRuntime(checked);
                    notifyOfChange();
                  }}
                />
                <ResponsiveLineStackLayout noMargin>
                  <SemiControlledTextField
                    floatingLabelText={<Trans>Minimum FPS</Trans>}
                    fullWidth
                    type="number"
                    value={'' + minFPS}
                    onChange={value => {
                      const newMinFPS = Math.max(0, parseInt(value, 10));
                      if (newMinFPS === minFPS) {
                        return;
                      }
                      setMinFPS(newMinFPS);
                      notifyOfChange();
                    }}
                  />
                  <SemiControlledTextField
                    floatingLabelText={
                      <Trans>Maximum FPS (0 for unlimited)</Trans>
                    }
                    fullWidth
                    type="number"
                    value={'' + maxFPS}
                    onChange={value => {
                      const newMaxFPS = Math.max(0, parseInt(value, 10));
                      if (newMaxFPS === maxFPS) {
                        return;
                      }
                      setMaxFPS(newMaxFPS);
                      notifyOfChange();
                    }}
                  />
                </ResponsiveLineStackLayout>
                {maxFPS > 0 && maxFPS < 60 && (
                  <DismissableAlertMessage
                    identifier="maximum-fps-too-low"
                    kind="warning"
                  >
                    <Trans>
                      Most monitors have a refresh rate of 60 FPS. Setting a
                      maximum number of FPS under 60 will force the game to skip
                      frames, and the real number of FPS will be way below 60,
                      making the game laggy and impacting the gameplay
                      negatively. Consider putting 60 or more for the maximum
                      number or FPS, or disable it by setting 0.
                    </Trans>
                  </DismissableAlertMessage>
                )}
                {minFPS < 20 && (
                  <DismissableAlertMessage
                    identifier="minimum-fps-too-low"
                    kind="warning"
                  >
                    <Trans>
                      Setting the minimum number of FPS below 20 will increase a
                      lot the time that is allowed between the simulation of two
                      frames of the game. If case of a sudden slowdown, or on
                      slow computers, this can create buggy behaviors like
                      objects passing beyond a wall. Consider setting 20 as the
                      minimum FPS.
                    </Trans>
                  </DismissableAlertMessage>
                )}
                <SelectField
                  fullWidth
                  floatingLabelText={
                    <Trans>Scale mode (also called "Sampling")</Trans>
                  }
                  value={scaleMode}
                  onChange={(e, i, newScaleMode: string) => {
                    if (newScaleMode === scaleMode) {
                      return;
                    }
                    setScaleMode(newScaleMode);
                    notifyOfChange();
                  }}
                >
                  <SelectOption
                    value="linear"
                    primaryText={t`Linear (antialiased rendering, good for most games)`}
                  />
                  <SelectOption
                    value="nearest"
                    primaryText={t`Nearest (no antialiasing, good for pixel perfect games)`}
                  />
                </SelectField>
                <Checkbox
                  label={
                    <Trans>
                      Round pixels when rendering, useful for pixel perfect
                      games.
                    </Trans>
                  }
                  checked={pixelsRounding}
                  onCheck={(e, checked) => {
                    setPixelsRounding(checked);
                    notifyOfChange();
                  }}
                />
                {scaleMode === 'nearest' && (
                  <DismissableAlertMessage
                    identifier="use-non-smoothed-textures"
                    kind="info"
                  >
                    <Trans>
                      To obtain the best pixel-perfect effect possible, go in
                      the resources editor and disable the Smoothing for all
                      images of your game. It will be done automatically for new
                      images added from now.
                    </Trans>
                  </DismissableAlertMessage>
                )}
                {pixelsRounding && (
                  <DismissableAlertMessage
                    identifier="use-pixel-rounding"
                    kind="info"
                  >
                    <Trans>
                      To avoid flickering on objects followed by the camera, use
                      sprites with even dimensions.
                    </Trans>
                  </DismissableAlertMessage>
                )}

                <Text size="block-title">
                  <Trans>Project files</Trans>
                </Text>
                <SelectField
                  fullWidth
                  floatingLabelText={<Trans>Project file type</Trans>}
                  value={isFolderProject ? 'folder-project' : 'single-file'}
                  onChange={(e, i, value: string) => {
                    const newIsFolderProject = value === 'folder-project';
                    if (newIsFolderProject === isFolderProject) {
                      return;
                    }
                    setIsFolderProject(newIsFolderProject);
                    notifyOfChange();
                  }}
                  helperMarkdownText={i18n._(
                    t`Note that this option will only have an effect when saving your project on your computer's filesystem from the desktop app.`
                  )}
                >
                  <SelectOption
                    value={'single-file'}
                    primaryText={t`Single file (default)`}
                  />
                  <SelectOption
                    value={'folder-project'}
                    primaryText={t`Multiple files, saved in folder next to the main file`}
                  />
                </SelectField>
                <ExtensionsProperties project={project} />
              </ColumnStackLayout>
            )}
            {currentTab === 'loading-screen' && (
              <LoadingScreenEditor
                loadingScreen={project.getLoadingScreen()}
                onLoadingScreenUpdated={notifyOfLoadingScreenChange}
                onChangeSubscription={() => {
                  onCancelChanges();
                  props.onChangeSubscription();
                }}
                project={project}
                resourceSources={props.resourceSources}
                onChooseResource={props.onChooseResource}
                resourceExternalEditors={props.resourceExternalEditors}
              />
            )}
          </Dialog>
        </React.Fragment>
      )}
    </I18n>
  );
}

export default ProjectPropertiesDialog;
