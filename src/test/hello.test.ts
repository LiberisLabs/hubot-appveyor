import { test } from 'ava';
import * as sinon from 'sinon';

import { MockRobot, MockResponse } from './helpers/mocks';
import HelloScript from '../scripts/hello';

test('finbot > says hello', (t) => {
  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');
  
  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  respondStub.callsArgWith(1, response);

  HelloScript(robot);

  t.true(respondStub.calledWith(/hello/i, sinon.match.func));
  t.true(replyStub.calledWith('Yeah, hello etc...'));
});