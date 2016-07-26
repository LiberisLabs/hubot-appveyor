import { test } from 'ava';
import * as sinon from 'sinon';
import * as express from 'express';

import { MockRobot, MockRobotBrain, MockSecureBrain, MockResponse, MockScopedHttpClient, MockSlackAdapter, MockAppVeyor } from './helpers/mocks';
import { IHttpClientHandler } from 'hubot';
import { ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import BuildsScript from '../scripts/builds';

test('finbot > list builds', (t) => {
  // arrange
  const userId = 'asdsad';
  const project = 'a project slug';
  const room = 'a room';
  const version = 'this is a version';
  const token = '12345';
  const account = 'some account';
  const username = 'a name';

  const robot = new MockRobot();

  const robotRouter = express();
  robot.router = robotRouter;

  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  const secureBrain = new MockSecureBrain();
  const secureBrainGetStub = sinon.stub(secureBrain, 'get').returns({ token: token });

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainSetSpy = sinon.spy(robotBrain, 'set');

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

  const buildResponse = {
    ok: true,
    statusCode: 200,
    body: {
      projectSlug: project,
      accountName: account,
      builds: [
        { version: '1.2.3', status: 'success', branch: 'master', committer: 'findev', link: 'http://link/1', colour: '#7CD197', expectedStatus: 'Success' },
        { version: '2.2.3', status: 'success', branch: 'master', committer: 'findev', link: 'http://link/2', colour: '#7CD197', expectedStatus: 'Success' },
        { version: '3.2.3', status: 'failed', branch: 'master', committer: 'findev', link: 'http://link/3', colour: '#D17C8C', expectedStatus: 'Failed' },
        { version: '4.2.3', status: 'wot', branch: 'master', committer: 'findev', link: 'http://link/4', colour: '#CCCCCC', expectedStatus: 'Wot' },
        { version: '5.2.3', status: 'success', branch: 'master', committer: 'findev', link: 'http://link/5', colour: '#7CD197', expectedStatus: 'Success' },
      ]
    }
  };
  const buildPromise = Promise.resolve(buildResponse);
  sinon.stub(buildPromise, 'then')
    .callsArgWith(0, buildResponse)
    .returns(Promise.resolve());

  const appVeyor = new MockAppVeyor();
  const buildsStub = sinon.stub(appVeyor, 'builds').returns(buildPromise);

  const slackAdapter = new MockSlackAdapter();
  const customMessageSpy = sinon.spy(slackAdapter, 'customMessage');

  robot.adapter = slackAdapter;

  // act
  BuildsScript(robot, appVeyor, secureBrain);

  // assert
  sinon.assert.calledWith(respondStub, /list (\d+ )?builds of (.*)/i, sinon.match.func);
  sinon.assert.calledWith(replyStub, 'One moment please...');
  sinon.assert.calledWith(secureBrainGetStub, `appveyor.settings.${userId}`);
  sinon.assert.calledWith(buildsStub, project, 3, token);
  sinon.assert.calledOnce(customMessageSpy);

  const actualCustomMessage: ICustomMessageData = customMessageSpy.getCall(0).args[0];
  t.is(actualCustomMessage.channel, room);
  t.is(actualCustomMessage.attachments.length, 5);

  for (let i = 0; i < 5; i++) {
    const attachment = actualCustomMessage.attachments[i];
    t.is(attachment.fallback, `Build v${buildResponse.body.builds[i].version}: ${buildResponse.body.builds[i].status} ${buildResponse.body.builds[i].link}`);
    t.is(attachment.title, `Build v${buildResponse.body.builds[i].version}`);
    t.is(attachment.title_link, buildResponse.body.builds[i].link);
    t.is(attachment.color, buildResponse.body.builds[i].colour);

    t.is(attachment.fields[0].title, buildResponse.body.builds[i].branch);
    t.is(attachment.fields[0].short, true);
    t.is(attachment.fields[1].value, buildResponse.body.builds[i].committer);
    t.is(attachment.fields[1].short, true);
  }
});

test('finbot > list builds > when no token set', (t) => {
  // arrange
  const robotName = 'irobot';

  const robot = new MockRobot();
  
  const robotRouter = express();
  robot.router = robotRouter;

  robot.name = robotName;
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  const secureBrain = new MockSecureBrain();
  sinon.stub(secureBrain, 'get').returns(null);

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
  BuildsScript(robot, null, secureBrain);

  // assert
  sinon.assert.calledWith(replyStub, `You must whisper me your AppVeyor API token with "/msg @${robotName} set token <token>" first`);
});
