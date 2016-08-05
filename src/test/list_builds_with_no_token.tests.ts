import { test } from 'ava';
import * as sinon from 'sinon';
import * as assert from 'assert';

import { MockRobot, MockSecureBrain, MockResponse } from './helpers/mocks';
import BuildsScript from '../scripts/builds';

test('finbot > list builds > when no token set', (t) => {
  // arrange
  const robotName = 'irobot';

  const robot = new MockRobot();
  robot.name = robotName;
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  const secureBrain = new MockSecureBrain();
  sinon.stub(secureBrain, 'get').returns(null);

  response.message = {
    room: undefined,
    user: {
      id: 'asdsad',
      name: undefined,
      room: undefined
    },
    text: undefined,
    id: undefined,
    done: false
  };

  BuildsScript(robot, undefined, secureBrain);

  // act
  const responders = robot.getRespondMatches('list builds of a project slug');
  const [responder, match] = responders[0];
  response.match = match;
  responder.callback(response);

  // assert
  assert.strictEqual(responders.length, 1);
  sinon.assert.calledWith(replyStub, `You must whisper me your AppVeyor API token with "/msg @${robotName} set token <token>" first`);
});
