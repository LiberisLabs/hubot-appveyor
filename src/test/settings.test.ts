import { test } from 'ava';
import * as sinon from 'sinon';

import { MockRobot, MockResponse, MockSecureBrain } from './helpers/mocks';
import SettingScript from '../scripts/settings';

test('finbot > sets the appveyor token for a user', (t) => {
  const userId = 'U1234567';
  const token = '-123456789-123456789';

  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  response.message = {
    id: null,
    done: null,
    room: null,
    user: {
      id: userId,
      name: null,
      room: null
    },
    text: null
  };

  response.match = [null, token];

  respondStub.callsArgWith(1, response);

  const secureBrain = new MockSecureBrain();
  const brainSetSpy = sinon.spy(secureBrain, 'set');

  SettingScript(robot, secureBrain);

  sinon.assert.calledWith(respondStub, /set token (.+)/i, sinon.match.func);
  sinon.assert.calledWith(replyStub, 'Your token has been set');

  sinon.assert.calledWith(brainSetSpy, `appveyor.settings.${userId}`, { token: token });
});

test('finbot > rejects a token which is too short', (t) => {
  const token = '0123456789012345678';

  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  response.match = [null, token];

  respondStub.callsArgWith(1, response);

  const secureBrain = new MockSecureBrain();
  const brainSetSpy = sinon.spy(secureBrain, 'set');

  SettingScript(robot, secureBrain);

  sinon.assert.calledWith(respondStub, /set token (.+)/i, sinon.match.func);
  sinon.assert.calledWith(replyStub, 'Token looks to be too short');

  sinon.assert.callCount(brainSetSpy, 0);
});