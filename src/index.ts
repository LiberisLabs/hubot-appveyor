import { install } from 'source-map-support';
install();

import { IRobot } from 'hubot';
import HelloScript from './scripts/hello';
import BuildScript from './scripts/build';
import DeployScript from './scripts/deploy';

module.exports = (robot: IRobot) => {
  HelloScript(robot);
  BuildScript(robot);
  DeployScript(robot);
};