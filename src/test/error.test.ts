import { test } from 'ava';
import * as sinon from 'sinon';

import { ICustomMessageData } from 'hubot-slack';

import { MockRobot, MockResponse, MockSlackAdapter, MockHubotLogger } from './helpers/mocks';
import { Config } from '../lib/config';
import ErrorScript from '../scripts/error';

test('finbot > catches unhandled errors', (t) => {
  // arrange
  const err = new Error('I am an error');
  const errorChannel = 'my-room';

  Config.error_channel = errorChannel;

  const robot = new MockRobot();
  const errorStub = sinon.stub(robot, 'error');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  errorStub.callsArgWith(0, err, response);

  const slackAdapter = new MockSlackAdapter();
  const customMessageSpy = sinon.spy(slackAdapter, 'customMessage');

  robot.adapter = slackAdapter;

  const logger = new MockHubotLogger();
  const errorSpy = sinon.spy(logger, 'error');

  robot.logger = logger;

  // act
  ErrorScript(robot);

  // assert
  sinon.assert.calledWith(errorSpy, `Caught unhandled error.`, err);
  sinon.assert.calledOnce(customMessageSpy);

  const actualCustomMessage: ICustomMessageData = customMessageSpy.getCall(0).args[0];
  t.is(actualCustomMessage.channel, errorChannel);
  t.is(actualCustomMessage.attachments.length, 1);

  const attachment = actualCustomMessage.attachments[0];
  t.is(attachment.fallback, `I've just encountered this error: ${err}`);
  t.is(attachment.title, "I've just encountered an error");
  t.is(attachment.text, `\`\`\`\n${err.stack}\n\`\`\``);
  t.is(attachment.color, '#801515');
  t.deepEqual(attachment.mrkdwn_in, ['title']);

  sinon.assert.calledWith(replyStub, 'Uhh, sorry, I just experienced an error :goberserk:');
});

test('finbot > catches unhandled errors > when response is not set', (t) => {
  // arrange
  const err = new Error('I am an error');

  const robot = new MockRobot();
  const errorStub = sinon.stub(robot, 'error');

  const response = new MockResponse();
  const replySpy = sinon.spy(response, 'reply');

  errorStub.callsArgWith(0, err);

  robot.adapter = new MockSlackAdapter();
  robot.logger = new MockHubotLogger();

  // act
  ErrorScript(robot);

  // assert
  sinon.assert.notCalled(replySpy);
});