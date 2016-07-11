import { test } from 'ava';
import * as sinon from 'sinon';

import { MockRobot, MockRobotBrain, MockSecureBrain, MockResponse, MockScopedHttpClient, MockSlackAdapter, MockAppVeyor } from './helpers/mocks';
import { IHttpClientHandler, Message } from 'hubot';
import { ICustomMessageData } from 'hubot-slack';
import * as express from 'express';
import { IBuildResponse } from '../lib/appveyor';
import { Config } from '../lib/config';
import BuildScript from '../scripts/build';

test('finbot > start build', (t) => {
  // arrange
  const userId = 'asdsad';
  const project = 'a project slug';
  const room = 'a room';
  const version = 'this is a version';
  const token = '12345';
  const account = 'some account';
  const username = 'a name';

  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  const secureBrain = new MockSecureBrain();
  const secureBrainGetStub = sinon.stub(secureBrain, 'get').returns({ token: token });

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainSetSpy = sinon.spy(robotBrain, 'set');

  const robotRouter = express();
  robot.router = robotRouter;

  response.match = [null, project];
  response.message = {
    room: room,
    user: {
      id: userId,
      name: username,
      room: 'asdaskjdh'
    },
    text: null,
    id: null,
    done: false
  };

  const expectedLink = `https://ci.appveyor.com/project/${account}/${project}/build/${version}`;

  const buildResponse: IBuildResponse = {
    ok: true,
    statusCode: 324324,
    body: {
      projectSlug: project,
      accountName: account,
      version: version,
      link: expectedLink
    }
  };
  const buildPromise = Promise.resolve(buildResponse);
  sinon.stub(buildPromise, 'then')
    .callsArgWith(0, buildResponse)
    .returns(Promise.resolve());

  const appVeyor = new MockAppVeyor();
  const buildStub = sinon.stub(appVeyor, 'build').returns(buildPromise);

  const slackAdapter = new MockSlackAdapter();
  const customMessageSpy = sinon.spy(slackAdapter, 'customMessage');

  robot.adapter = slackAdapter;

  // act
  BuildScript(robot, appVeyor, secureBrain);

  // assert
  sinon.assert.calledWith(respondStub, /start build (.*)/i, sinon.match.func);
  sinon.assert.calledWith(replyStub, 'One moment please...');
  sinon.assert.calledWith(secureBrainGetStub, `appveyor.settings.${userId}`);
  sinon.assert.calledWith(buildStub, project, token);
  sinon.assert.calledOnce(customMessageSpy);

  const actualCustomMessage: ICustomMessageData = customMessageSpy.getCall(0).args[0];
  t.is(actualCustomMessage.channel, room);
  t.is(actualCustomMessage.text, 'Build started');

  const attachment = actualCustomMessage.attachments[0];
  t.is(attachment.fallback, `Started build of '${project}' v${version}: ${expectedLink}`);
  t.is(attachment.title, `Started build of '${project}'`);
  t.is(attachment.title_link, expectedLink);
  t.is(attachment.text, `v${version}`);
  t.is(attachment.color, '#7CD197');

  sinon.assert.calledWith(brainSetSpy, `appveyor.build.${project}-${version}`, { username: username });
});

test('finbot > on build completion > notifies user', (t) => {
  // arrange
  const channel = 'a-channel';
  const token = '0123456789abc';
  const project = 'my-awesome-project';
  const version = '999.885.222';
  const username = 'some_guy';

  Config.announce_channel = channel;
  Config.appveyor.webhook.token = token;

  const robot = new MockRobot();
  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const robotRouter = express();

  robot.router = robotRouter;

  const brainGetStub = sinon.stub(robotBrain, 'get');
  brainGetStub.returns({ username: username });

  const messageRoomStub = sinon.stub(robot, 'messageRoom');

  const request: express.Request = <any>{
    headers: {
      authorization: token
    },
    body: {
      eventName: 'build_success',
      eventData: {
        projectName: project,
        buildVersion: version
      }
    }
  };

  const sendStub = sinon.stub();
  const response: express.Response = <any>{ send: sendStub };

  const postStub = sinon.stub(robotRouter, 'post');
  postStub.callsArgWith(1, request, response);

  const appVeyor = new MockAppVeyor();

  const expectedMessage = `Build v${version} of '${project} succeeded. @${username}`;

  // act
  BuildScript(robot, appVeyor, robotBrain);

  // assert
  sinon.assert.calledWith(postStub, '/hubot/appveyor/webhook', sinon.match.func);
  sinon.assert.calledWithExactly(brainGetStub, `appveyor.build.${project}-${version}`);
  sinon.assert.calledWithExactly(messageRoomStub, channel, expectedMessage);
  sinon.assert.calledWithExactly(sendStub, 200);
});

test('finbot > start build > handles non-200 response', (t) => {
  // arrange
  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  const secureBrain = new MockSecureBrain();
  const brainGetStub = sinon.stub(secureBrain, 'get').returns({ token: 'asdsad' });

  robot.router = express();

  response.match = [null, 'dsgfasgfsdfsdf'];
  response.message = {
    room: 'asads',
    user: {
      id: 'asdsad',
      name: 'asdasd',
      room: 'asdaskjdh'
    },
    text: null,
    id: null,
    done: false
  };

  const buildResponse = {
    ok: false,
    statusCode: 403
  };
  const buildPromise = Promise.resolve(buildResponse);
  sinon.stub(buildPromise, 'then')
    .callsArgWith(0, buildResponse)
    .returns(Promise.resolve());

  const appVeyor = new MockAppVeyor();
  sinon.stub(appVeyor, 'build').returns(buildPromise);

  // act
  BuildScript(robot, appVeyor, secureBrain);

  // assert
  sinon.assert.calledWith(replyStub, `Could not start build. Got status code 403`);
});

test('finbot > start build > when no token set', (t) => {
  // arrange
  const robotName = 'irobot';

  const robot = new MockRobot();
  robot.name = robotName;
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  const secureBrain = new MockSecureBrain();
  sinon.stub(secureBrain, 'get').returns(null);

  const robotRouter = express();
  robot.router = robotRouter;

  response.match = [null, 'a project slug'];
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
  BuildScript(robot, null, secureBrain);

  // assert
  sinon.assert.calledWith(replyStub, `You must whisper me your AppVeyor API token with "/msg @${robotName} set token <token>" first`);
});