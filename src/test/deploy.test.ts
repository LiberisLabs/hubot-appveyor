import { test } from 'ava';
import * as sinon from 'sinon';

import { MockRobot, MockRobotBrain, MockResponse, MockScopedHttpClient, MockSlackAdapter, MockAppVeyor } from './helpers/mocks';
import { IDeployResponse } from '../lib/appveyor';
import { IHttpClientHandler } from 'hubot';
import { ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import DeployScript from '../scripts/deploy';

test('finbot > deploy', (t) => {
  // arrange
  const userId = 'cookie-monster!';
  const project = 'a project slug';
  const version = 'a.b.c';
  const environment = 'dev-env';
  const token = '12345';
  const account = 'some account';
  const room = 'a-room';
  const deploymentId = 1234567890;

  Config.appveyor.account = account;

  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  response.match = [null, project, version, environment];
  response.message = {
    room: room,
    user: {
      id: userId,
      name: null,
      room: 'asdaskjdh'
    },
    text: null,
    id: null,
    done: false
  };

  respondStub.callsArgWith(1, response);

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainGetStub = sinon.stub(robotBrain, 'get').returns({ token: token });

  const expectedLink = `https://ci.appveyor.com/project/${account}/${project}/deployment/${deploymentId}`;

  const deployResponse: IDeployResponse = {
    ok: true,
    statusCode: 200,
    body: {
      link: expectedLink
    }
  };
  const deployPromise = Promise.resolve(deployResponse);
  sinon.stub(deployPromise, 'then')
    .callsArgWith(0, deployResponse)
    .returns(Promise.resolve());

  const appVeyor = new MockAppVeyor();
  const deployStub = sinon.stub(appVeyor, 'deploy').returns(deployPromise);

  const slackAdapter = new MockSlackAdapter();
  const customMessageSpy = sinon.spy(slackAdapter, 'customMessage');

  robot.adapter = slackAdapter;

  // act
  DeployScript(robot, appVeyor);

  // assert
  sinon.assert.calledWith(respondStub, /deploy (.+) v(.+) to (.+)/i, sinon.match.func);
  sinon.assert.calledWith(replyStub, `Starting deploy of '${project}' to '${environment}'...`);
  sinon.assert.calledWith(brainGetStub, `appveyor.settings.${userId}`);
  sinon.assert.calledWith(deployStub, project, version, environment)
  sinon.assert.calledOnce(customMessageSpy);

  const actualCustomMessage: ICustomMessageData = customMessageSpy.getCall(0).args[0];
  t.is(actualCustomMessage.channel, room);
  t.is(actualCustomMessage.text, 'Deploy started');
  t.is(actualCustomMessage.attachments.length, 1);

  const attachment = actualCustomMessage.attachments[0];
  t.is(attachment.fallback, `Started deploy of '${project}' v${version} to '${environment}': ${expectedLink}`);
  t.is(attachment.title, `Started deploy of '${project}' v${version}`);
  t.is(attachment.title_link, expectedLink);
  t.is(attachment.text, `v${version}`);
  t.is(attachment.color, '#2795b6');
});

test('finbot > deploy > handles non-200 response', (t) => {
  // arrange
  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  sinon.stub(robotBrain, 'get').returns({ token: 'asdasd' });

  response.match = [null, 'project', 'version', 'environment'];
  response.message = {
    room: 'dasdssdadsad',
    user: {
      id: 'asdsad',
      name: 'a name',
      room: 'asdaskjdh'
    },
    text: null,
    id: null,
    done: false
  };

  const deployResponse = {
    ok: false,
    statusCode: 403
  };
  const deployPromise = Promise.resolve(deployResponse);
  sinon.stub(deployPromise, 'then')
    .callsArgWith(0, deployResponse)
    .returns(Promise.resolve());

  const appVeyor = new MockAppVeyor();
  sinon.stub(appVeyor, 'deploy').returns(deployPromise);

  // act
  DeployScript(robot, appVeyor);

  // assert
  sinon.assert.calledWith(replyStub, `Could not deploy. Got status code 403`);
});

test('finbot > deploy > when no token set', (t) => {
  // arrange
  const robotName = 'irobot';

  const robot = new MockRobot();
  robot.name = robotName;
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  sinon.stub(robotBrain, 'get').returns(null);

  response.match = [null, 'a project slug', 'version 1', 'home'];
  response.message = {
    room: null,
    user: {
      id: 'asdsad',
      name: null,
      room: null
    },
    text: null,
    id: null,
    done: false
  };

  // act
  DeployScript(robot, null);

  // assert
  sinon.assert.calledWith(replyStub, `You must whisper me your AppVeyor API token with "/msg @${robotName} set token <token>" first`);
});
