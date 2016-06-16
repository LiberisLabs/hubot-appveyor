import { install } from 'source-map-support';
install();

import { IHubot } from 'hubot';

import HelloScript from './scripts/hello';
import BuildScript from './scripts/build';
import DeployScript from './scripts/deploy';
import ErrorScript from './scripts/error';

import { AppVeyor } from './lib/appveyor';
import { Config } from './lib/config';

module.exports = (robot: IHubot) => {
  const appveyor = new AppVeyor(robot.http.bind(robot), Config.appveyor.token, Config.appveyor.account);

  ErrorScript(robot);
  HelloScript(robot);
  BuildScript(robot, appveyor);
  DeployScript(robot, appveyor);
};
