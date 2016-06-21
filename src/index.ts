import { install } from 'source-map-support';
install();

import { Robot } from 'hubot';

import HelloScript from './scripts/hello';
import BuildScript from './scripts/build';
import BuildsScript from './scripts/builds';
import DeployScript from './scripts/deploy';
import ErrorScript from './scripts/error';
import SettingsScript from './scripts/settings';

import { AppVeyor } from './lib/appveyor';
import { Config } from './lib/config';

module.exports = (robot: Robot) => {
  const appveyor = new AppVeyor(robot.http.bind(robot), Config.appveyor.account);

  ErrorScript(robot);
  HelloScript(robot);
  BuildScript(robot, appveyor);
  BuildsScript(robot, appveyor);
  DeployScript(robot, appveyor);
  SettingsScript(robot);
};
