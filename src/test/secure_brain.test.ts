import { test } from 'ava';
import * as sinon from 'sinon';
import * as assert from 'assert';

import { MockRobot, MockRobotBrain } from './helpers/mocks';
import { SecureBrain } from '../lib/secure_brain';

test('secure_brain > sets object values', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainSetSpy = sinon.spy(robotBrain, 'set');

  const secureBrain = new SecureBrain(robot, 'key');

  let returnValue = secureBrain.set('some key', { some: 'value' });
  assert.strictEqual(returnValue, secureBrain);
  sinon.assert.calledWith(brainSetSpy, 'some key', '621b48edf4ddc327eb7e721b5d266f982d392465dd5c5b2574887a61ac01581f');

  brainSetSpy.reset();

  returnValue = secureBrain.set('some key', { some: { other: 'value' } });
  assert.strictEqual(returnValue, secureBrain);
  sinon.assert.calledWith(brainSetSpy, 'some key', '59ed1e0f05a7a27a84c4016596647f4e4e4e57ac30bdf43d09e462ebc4a6ce7d');
});

test('secure_brain > gets object values', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainGetStub = sinon.stub(robotBrain, 'get').returns('621b48edf4ddc327eb7e721b5d266f982d392465dd5c5b2574887a61ac01581f');

  const secureBrain = new SecureBrain(robot, 'key');

  let returnValue = secureBrain.get('some key');
  sinon.assert.calledWith(brainGetStub, 'some key');
  assert.deepStrictEqual(returnValue, { some: 'value' });
  
  brainGetStub.reset();
  brainGetStub.returns('59ed1e0f05a7a27a84c4016596647f4e4e4e57ac30bdf43d09e462ebc4a6ce7d');

  returnValue = secureBrain.get('some key');
  sinon.assert.calledWith(brainGetStub, 'some key');
  assert.deepStrictEqual(returnValue, { some: { other: 'value' } });
});

test('secure_brain > gets an unencrypted value', (t) => {
  const robot = new MockRobot();

  const robotBrain = new MockRobotBrain();
  robot.brain = robotBrain;
  const brainGetStub = sinon.stub(robotBrain, 'get').returns('hello');

  const secureBrain = new SecureBrain(robot, 'key');

  const returnValue = secureBrain.get('some key');


  sinon.assert.calledWith(brainGetStub, 'some key');
  assert.deepStrictEqual(returnValue, 'hello');
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
  const brainGetStub = sinon.stub(robotBrain, 'get').returns('b4216c9c0b30be78126100989f6a5f15850fe11e00b1951b07d5422cf017aa79');

  const secureBrain = new SecureBrain(robot, 'secret');

  const returnValue = secureBrain.get('my key');


  sinon.assert.calledWith(brainGetStub, 'my key');
  assert.strictEqual(returnValue, 'b4216c9c0b30be78126100989f6a5f15850fe11e00b1951b07d5422cf017aa79');
});