import { test } from 'ava';
import * as sinon from 'sinon';

import { MockRobot, MockRobotBrain, MockResponse, MockScopedHttpClient, MockSlackAdapter, MockAppVeyor } from './helpers/mocks';
import { IHttpClientHandler } from 'hubot';
import { ICustomMessageData } from 'hubot-slack';
import * as express from 'express';
import { Config } from '../lib/config';
import BuildsScript from '../scripts/builds';

test('finbot > lists builds', (t) => {
  // arrange
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

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainSetSpy = sinon.spy(robotBrain, 'set');

  const robotRouter = express();
  robot.router = robotRouter;

  response.match = [null, project];
  response.message = {
    room: room,
    user: { name: username }
  };

  const buildResponse = {
    ok: true,
    statusCode: 200,
    body: {
      projectSlug: project,
      accountName: account,
      builds: [
      { version: '1.2.3', status: 'success', branch: 'master', committer: 'findev', link: 'http://link/1', colour: '#7CD197' },
      { version: '2.2.3', status: 'success', branch: 'master', committer: 'findev', link: 'http://link/2', colour: '#7CD197' },
      { version: '3.2.3', status: 'failed', branch: 'master', committer: 'findev', link: 'http://link/3', colour: '#D17C8C' },
      { version: '4.2.3', status: 'wot', branch: 'master', committer: 'findev', link: 'http://link/4', colour: '#CCCCCC' },
      { version: '5.2.3', status: 'success', branch: 'master', committer: 'findev', link: 'http://link/5', colour: '#7CD197' },
      ]
    }
  };
  const buildPromise = Promise.resolve(buildResponse);
  sinon.stub(buildPromise, 'then')
    .callsArgWith(0, buildResponse)
    .returns(Promise.resolve());

  const appVeyor = new MockAppVeyor();
  sinon.stub(appVeyor, 'builds').returns(buildPromise);

  const slackAdapter = new MockSlackAdapter();
  const customMessageSpy = sinon.spy(slackAdapter, 'customMessage');

  robot.adapter = slackAdapter;

  // act
  BuildsScript(robot, appVeyor);

  // assert
  sinon.assert.calledWith(respondStub, /list builds of (.*)/i, sinon.match.func);
  sinon.assert.calledWith(replyStub, 'One moment please...');
  sinon.assert.calledOnce(customMessageSpy);

  const actualCustomMessage: ICustomMessageData = customMessageSpy.getCall(0).args[0];
  t.is(actualCustomMessage.channel, room);
  t.is(actualCustomMessage.text, `Builds: ${project}`);
  t.is(actualCustomMessage.attachments.length, 5);

  for (let i = 0; i < 5; i++) {
    const attachment = actualCustomMessage.attachments[i];
    t.is(attachment.fallback, `Build v${buildResponse.body.builds[i].version}: ${buildResponse.body.builds[i].status} ${buildResponse.body.builds[i].link}`);
    t.is(attachment.title, `Build v${buildResponse.body.builds[i].version}`);
    t.is(attachment.title_link, buildResponse.body.builds[i].link);
    t.is(attachment.text,`${buildResponse.body.builds[i].status} - ${buildResponse.body.builds[i].branch} - ${buildResponse.body.builds[i].committer}` );
    t.is(attachment.color, buildResponse.body.builds[i].colour);
  }
});
