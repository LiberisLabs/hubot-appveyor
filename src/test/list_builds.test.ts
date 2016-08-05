import { test, ContextualTestContext } from 'ava';
import * as sinon from 'sinon';
import * as assert from 'assert';

import { MockRobot, MockRobotBrain, MockSecureBrain, MockResponse, MockScopedHttpClient, MockSlackAdapter, MockAppVeyor } from './helpers/mocks';
import { IHttpClientHandler, Response } from 'hubot';
import { ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import BuildsScript from '../scripts/builds';

test('finbot > list builds', listBuildsTest, 'list 5 builds of some-project', 5, 'some-project');
test('finbot > list builds', listBuildsTest, 'list 3 builds of my-project', 3, 'my-project');
test('finbot > list builds without count', listBuildsTest, 'list builds of asdasd...asdad', 3, 'asdasd...asdad');

function listBuildsTest(t: ContextualTestContext, message: string, count: number, project: string) {
  // arrange
  const userId = 'asdsad';
  const room = 'a room';
  const version = 'this is a version';
  const token = '12345';
  const account = 'some account';
  const username = 'a name';

  const robot = new MockRobot();

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  const secureBrain = new MockSecureBrain();
  const secureBrainGetStub = sinon.stub(secureBrain, 'get').returns({ token: token });

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainSetSpy = sinon.spy(robotBrain, 'set');

  response.message = {
    room: room,
    user: {
      id: userId,
      name: username,
      room: 'asdaskjdh'
    },
    text: undefined,
    id: undefined,
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

  BuildsScript(robot, appVeyor, secureBrain);

  // act
  const responders = robot.getRespondMatches(message);
  const [responder, match] = responders[0];
  response.match = match;
  responder.callback(response);

  // assert
  assert.strictEqual(responders.length, 1);
  assert.deepEqual(responder.regex, /list (\d+ )?builds of (.*)/i);

  sinon.assert.calledWith(replyStub, 'One moment please...');
  sinon.assert.calledWith(secureBrainGetStub, `appveyor.settings.${userId}`);
  sinon.assert.calledWith(buildsStub, project, count, token);
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
}
