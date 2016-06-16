import { install } from 'source-map-support';
install();

import { IRobot } from 'hubot';

import HelloScript from './scripts/hello';
import BuildScript from './scripts/build';
import DeployScript from './scripts/deploy';

import { AppVeyor } from './lib/appveyor';
import { Config } from './lib/config';

module.exports = (robot: IRobot) => {
  const appveyor = new AppVeyor(robot.http, Config.appveyor.token, Config.appveyor.account);

  HelloScript(robot);
  BuildScript(robot, appveyor);
  DeployScript(robot, appveyor);
};
