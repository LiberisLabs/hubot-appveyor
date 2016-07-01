import { test } from 'ava';
import * as sinon from 'sinon';
import * as assert from 'assert';

import { MockRobot, MockRobotBrain } from './helpers/mocks';
import { SecureBrain } from '../lib/secure_brain';

test('secure_brain > sets an object value', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainSetSpy = sinon.spy(robotBrain, 'set');

  const secureBrain = new SecureBrain(robot, 'key');

  const returnValue = secureBrain.set('some key', { some: 'value' });

  
  sinon.assert.calledWith(brainSetSpy, 'some key', '621b48edf4ddc327eb7e721b5d266f982d392465dd5c5b2574887a61ac01581f');
  assert.strictEqual(returnValue, secureBrain);
});

test('secure_brain > gets an object value', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainGetStub = sinon.stub(robotBrain, 'get').returns('621b48edf4ddc327eb7e721b5d266f982d392465dd5c5b2574887a61ac01581f');

  const secureBrain = new SecureBrain(robot, 'key');

  const returnValue = secureBrain.get('some key');

  
  sinon.assert.calledWith(brainGetStub, 'some key');
  assert.deepStrictEqual(returnValue, { some: 'value' });
});

test('secure_brain > sets a string value', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainSetSpy = sinon.spy(robotBrain, 'set');

  const secureBrain = new SecureBrain(robot, 'secret');

  const returnValue = secureBrain.set('my key', 'this is a string');

  
  sinon.assert.calledWith(brainSetSpy, 'my key', 'b4216c9c0b30be78126100989f6a5f15850fe11e00b1951b07d5422cf017aa78');
  assert.strictEqual(returnValue, secureBrain);
});

test('secure_brain > gets a string value', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainGetStub = sinon.stub(robotBrain, 'get').returns('b4216c9c0b30be78126100989f6a5f15850fe11e00b1951b07d5422cf017aa78');

  const secureBrain = new SecureBrain(robot, 'secret');

  const returnValue = secureBrain.get('my key');

  
  sinon.assert.calledWith(brainGetStub, 'my key');
  assert.strictEqual(returnValue, 'this is a string');
});

test('secure_brain > gets an unknown key', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainGetStub = sinon.stub(robotBrain, 'get').returns(null);

  const secureBrain = new SecureBrain(robot, 'secret');

  const returnValue = secureBrain.get('my key');

  
  sinon.assert.calledWith(brainGetStub, 'my key');
  assert.strictEqual(returnValue, null);
});

test('secure_brain > gets a malformed value', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainGetStub = sinon.stub(robotBrain, 'get').returns('zzzzzzzzz');

  const secureBrain = new SecureBrain(robot, 'secret');

  const returnValue = secureBrain.get('my key');

  
  sinon.assert.calledWith(brainGetStub, 'my key');
  assert.strictEqual(returnValue, null);
});