// Description:
//   Automates build and deploy actions on AppVeyor.
//
// Dependencies:
//   "source-map-support": "^0.4.0"
//
// Configuration:
//   APPVEYOR_ACCOUNT
//   APPVEYOR_WEBHOOK_TOKEN
//   SECURE_BRAIN_KEY

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
import { SecureBrain } from './lib/secure_brain';
import { Config } from './lib/config';

module.exports = (robot: Robot) => {

  const requiredVariables = [
    'APPVEYOR_ACCOUNT',
    'APPVEYOR_WEBHOOK_TOKEN',
    'SECURE_BRAIN_KEY'
  ];

  requiredVariables.forEach(e => {
    if (process.env[e] === undefined) {
      console.error(`Please define the environment variable for ${e}`);
      process.exit(1);
    }
  });

  const appveyor = new AppVeyor(robot.http.bind(robot), Config.appveyor.account);
  const secureBrain = new SecureBrain(robot, Config.secure_brain.key);

  ErrorScript(robot);
  HelloScript(robot);
  BuildScript(robot, appveyor, secureBrain);
  BuildsScript(robot, appveyor, secureBrain);
  DeployScript(robot, appveyor, secureBrain);
  SettingsScript(robot, secureBrain);
};
