// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { Line } from '../UI/Grid';
import ResourcesLoader from '../ResourcesLoader';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { resizeImage, isResizeSupported } from './ImageResizer';
import { showErrorBox } from '../UI/Messages/MessageBox';
import optionalRequire from '../Utils/OptionalRequire';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
const path = optionalRequire('path');
const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};

type State = {|
  thumbnailResourceName: string,
  desktopIconResourceNames: Array<string>,
  androidIconResourceNames: Array<string>,
  androidWindowSplashScreenAnimatedIconResourceName: string,
  iosIconResourceNames: Array<string>,
  displayLiluoThumbnailWarning: boolean,
|};

const desktopSizes = [512];
const androidSizes = [192, 144, 96, 72, 48, 36];
/**
 * The recommended size for the image containing the Android SplashScreen icon.
 * It's based on the recommended 288dp for a xxdpi (=480 dpi) screen, which results in
 * 288 * 480 / 160 = "288 @ 3x" = 864px.
 */
const androidWindowSplashScreenAnimatedIconRecommendedSize = 864;
const iosSizes = [
  1024,
  180,
  167,
  152,
  144,
  120,
  114,
  100,
  87,
  80,
  76,
  72,
  60,
  58,
  57,
  50,
  40,
  29,
  20,
];

export default class PlatformSpecificAssetsDialog extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.project);
  }

  _loadFrom(project: gdProject): State {
    const platformSpecificAssets = project.getPlatformSpecificAssets();
    return {
      thumbnailResourceName: platformSpecificAssets.get('liluo', `thumbnail`),
      desktopIconResourceNames: desktopSizes.map(size =>
        platformSpecificAssets.get('desktop', `icon-${size}`)
      ),
      androidIconResourceNames: androidSizes.map(size =>
        platformSpecificAssets.get('android', `icon-${size}`)
      ),
      androidWindowSplashScreenAnimatedIconResourceName: project
        .getPlatformSpecificAssets()
        .get('android', `windowSplashScreenAnimatedIcon`),
      iosIconResourceNames: iosSizes.map(size =>
        platformSpecificAssets.get('ios', `icon-${size}`)
      ),
      displayLiluoThumbnailWarning: false,
    };
  }

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _generateFromFile = () => {
    const { project, resourceSources, onChooseResource } = this.props;

    const sources = resourceSources.filter(source => source.kind === 'image');
    if (!sources.length) return;

    onChooseResource({
      // Should be updated once new sources are introduced in the desktop app.
      // Search for "sources[0]" in the codebase for other places like this.
      initialSourceName: sources[0].name,
      multiSelection: false,
      resourceKind: 'image',
    }).then(resources => {
      if (!resources.length || !path) {
        return;
      }

      const resourcesManager = project.getResourcesManager();
      const projectPath = path.dirname(project.getProjectFile());
      const fullPath = path.resolve(projectPath, resources[0].getFile());

      // Important, we are responsible for deleting the resources that were given to us.
      // Otherwise we have a memory leak.
      resources.forEach(resource => resource.delete());

      Promise.all([
        ...desktopSizes.map(size =>
          resizeImage(
            fullPath,
            path.join(projectPath, `desktop-icon-${size}.png`),
            {
              width: size,
              height: size,
            }
          )
        ),
        ...androidSizes.map(size =>
          resizeImage(
            fullPath,
            path.join(projectPath, `android-icon-${size}.png`),
            {
              width: size,
              height: size,
            }
          )
        ),
        resizeImage(
          fullPath,
          path.join(projectPath, 'android-windowSplashScreenAnimatedIcon.png'),
          {
            width: androidWindowSplashScreenAnimatedIconRecommendedSize,
            height: androidWindowSplashScreenAnimatedIconRecommendedSize,
            transparentBorderSize:
              androidWindowSplashScreenAnimatedIconRecommendedSize / 6,
          }
        ),
        ...iosSizes.map(size =>
          resizeImage(
            fullPath,
            path.join(projectPath, `ios-icon-${size}.png`),
            {
              width: size,
              height: size,
            }
          )
        ),
      ]).then(results => {
        if (results.indexOf(false) !== -1) {
          showErrorBox({
            message: 'Some icons could not be generated!',
            rawError: undefined,
            errorId: 'icon-generation-error',
            doNotReport: true,
          });
          return;
        }

        // Add resources to the game
        const allResourcesNames = [
          ...desktopSizes.map(size => `desktop-icon-${size}.png`),
          ...androidSizes.map(size => `android-icon-${size}.png`),
          'android-windowSplashScreenAnimatedIcon.png',
          ...iosSizes.map(size => `ios-icon-${size}.png`),
        ];
        allResourcesNames.forEach(resourceName => {
          if (!resourcesManager.hasResource(resourceName)) {
            const imageResource = new gd.ImageResource();
            imageResource.setFile(resourceName);
            imageResource.setName(resourceName);

            resourcesManager.addResource(imageResource);

            // Important, we are responsible for deleting the resources that we created
            // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
            imageResource.delete();
          } else {
            resourcesManager.getResource(resourceName).setFile(resourceName);
          }
        });

        // Make sure the resources are (re)loaded.
        ResourcesLoader.burstUrlsCacheForResources(project, allResourcesNames);
        setTimeout(() => {
          this.setState({
            desktopIconResourceNames: desktopSizes.map(
              size => `desktop-icon-${size}.png`
            ),
            androidIconResourceNames: androidSizes.map(
              size => `android-icon-${size}.png`
            ),
            androidWindowSplashScreenAnimatedIconResourceName:
              'android-windowSplashScreenAnimatedIcon.png',
            iosIconResourceNames: iosSizes.map(size => `ios-icon-${size}.png`),
          });
        }, 200 /* Let a bit of time so that image files can be found */);
      });
    });
  };

  onApply = () => {
    const { project } = this.props;
    const {
      thumbnailResourceName,
      desktopIconResourceNames,
      androidIconResourceNames,
      androidWindowSplashScreenAnimatedIconResourceName,
      iosIconResourceNames,
    } = this.state;

    const platformSpecificAssets = project.getPlatformSpecificAssets();

    platformSpecificAssets.set('liluo', `thumbnail`, thumbnailResourceName);

    desktopSizes.forEach((size, index) => {
      platformSpecificAssets.set(
        'desktop',
        `icon-${size}`,
        desktopIconResourceNames[index]
      );
    });
    androidSizes.forEach((size, index) => {
      platformSpecificAssets.set(
        'android',
        `icon-${size}`,
        androidIconResourceNames[index]
      );
    });
    platformSpecificAssets.set(
      'android',
      `windowSplashScreenAnimatedIcon`,
      androidWindowSplashScreenAnimatedIconResourceName
    );
    iosSizes.forEach((size, index) => {
      platformSpecificAssets.set(
        'ios',
        `icon-${size}`,
        iosIconResourceNames[index]
      );
    });

    this.props.onApply();
  };

  render() {
    const actions = [
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        primary={false}
        onClick={this.props.onClose}
      />,
      <DialogPrimaryButton
        key="apply"
        label={<Trans>Apply</Trans>}
        primary={true}
        onClick={this.onApply}
      />,
    ];
    const {
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const {
      thumbnailResourceName,
      desktopIconResourceNames,
      androidIconResourceNames,
      androidWindowSplashScreenAnimatedIconResourceName,
      iosIconResourceNames,
      displayLiluoThumbnailWarning,
    } = this.state;

    return (
      <Dialog
        title={<Trans>Project icons</Trans>}
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        onApply={this.onApply}
      >
        <ColumnStackLayout noMargin>
          <Text size="sub-title">
            <Trans>Liluo.io thumbnail</Trans>
          </Text>
          <ResourceSelectorWithThumbnail
            floatingLabelText={`Liluo.io thumbnail (1920x1080 px)`}
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
            resourceKind="image"
            resourceName={thumbnailResourceName}
            onChange={resourceName => {
              this.setState({
                thumbnailResourceName: resourceName,
                displayLiluoThumbnailWarning:
                  resourceName !== this.state.thumbnailResourceName,
              });
            }}
          />
          {displayLiluoThumbnailWarning ? (
            <Line>
              <AlertMessage kind="warning">
                <Trans>
                  You're about to change the thumbnail displayed on Liluo.io for
                  your game. Once you have applied changes here, you will then
                  need to publish a new version of your game on Liluo.io so that
                  this new thumbnail is used.
                </Trans>
              </AlertMessage>
            </Line>
          ) : null}
          <Line justifyContent="center">
            {isResizeSupported() ? (
              <RaisedButton
                primary
                label={<Trans>Generate icons from a file</Trans>}
                onClick={this._generateFromFile}
              />
            ) : (
              <Text>
                <Trans>
                  Download GDevelop desktop version to generate the Android and
                  iOS icons of your game.
                </Trans>
              </Text>
            )}
          </Line>
          <Text size="sub-title">
            <Trans>Desktop (Windows, macOS and Linux) icon</Trans>
          </Text>
          {desktopSizes.map((size, index) => (
            <ResourceSelectorWithThumbnail
              key={size}
              floatingLabelText={`Desktop icon (${size}x${size} px)`}
              project={project}
              resourceSources={resourceSources}
              onChooseResource={onChooseResource}
              resourceExternalEditors={resourceExternalEditors}
              resourceKind="image"
              resourceName={desktopIconResourceNames[index]}
              onChange={resourceName => {
                const newIcons = [...desktopIconResourceNames];
                newIcons[index] = resourceName;
                this.setState({
                  desktopIconResourceNames: newIcons,
                });
              }}
            />
          ))}
          <Text size="sub-title">
            <Trans>Android icons and Android 12+ splashscreen</Trans>
          </Text>
          <I18n>
            {({ i18n }) => (
              <ResourceSelectorWithThumbnail
                floatingLabelText={`Android 12+ splashscreen icon (576x576 px)`}
                project={project}
                resourceSources={resourceSources}
                onChooseResource={onChooseResource}
                resourceExternalEditors={resourceExternalEditors}
                resourceKind="image"
                resourceName={androidWindowSplashScreenAnimatedIconResourceName}
                onChange={resourceName => {
                  this.setState({
                    androidWindowSplashScreenAnimatedIconResourceName: resourceName,
                  });
                }}
                helperMarkdownText={i18n._(
                  t`The image should be at least 864x864px, and the logo must fit [within a circle of 576px](https://developer.android.com/guide/topics/ui/splash-screen#splash_screen_dimensions). Transparent borders are automatically added when generated to help ensuring this.`
                )}
              />
            )}
          </I18n>
          {androidSizes.map((size, index) => (
            <ResourceSelectorWithThumbnail
              key={size}
              floatingLabelText={`Android icon (${size}x${size} px)`}
              project={project}
              resourceSources={resourceSources}
              onChooseResource={onChooseResource}
              resourceExternalEditors={resourceExternalEditors}
              resourceKind="image"
              resourceName={androidIconResourceNames[index]}
              onChange={resourceName => {
                const newIcons = [...androidIconResourceNames];
                newIcons[index] = resourceName;
                this.setState({
                  androidIconResourceNames: newIcons,
                });
              }}
            />
          ))}
          <Text size="sub-title">
            <Trans>iOS (iPhone and iPad) icons</Trans>
          </Text>
          {iosSizes.map((size, index) => (
            <ResourceSelectorWithThumbnail
              key={size}
              floatingLabelText={`iOS icon (${size}x${size} px)`}
              project={project}
              resourceSources={resourceSources}
              onChooseResource={onChooseResource}
              resourceKind="image"
              resourceName={iosIconResourceNames[index]}
              resourceExternalEditors={resourceExternalEditors}
              onChange={resourceName => {
                const newIcons = [...iosIconResourceNames];
                newIcons[index] = resourceName;
                this.setState({
                  iosIconResourceNames: newIcons,
                });
              }}
            />
          ))}
        </ColumnStackLayout>
      </Dialog>
    );
  }
}
