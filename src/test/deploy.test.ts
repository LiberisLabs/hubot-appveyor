import { test } from 'ava';
import * as sinon from 'sinon';

import { MockRobot, MockRobotBrain, MockResponse, MockScopedHttpClient, MockSlackAdapter } from './helpers/mocks';
import { IHttpClientHandler } from 'hubot';
import { ICustomMessage } from 'hubot-slack';
import { Config } from '../lib/config';
import DeployScript from '../scripts/deploy';

test('finbot > starts a deploy', (t) => {
  // arrange
  const project = 'a project slug';
  const version = 'a.b.c';
  const environment = 'dev-env';
  const token = '12345';
  const account = 'some account';
  const room = 'a-room';
  const deploymentId = 1234567890;
  
  Config.appveyor.token = token;
  Config.appveyor.account = account;

  const robot = new MockRobot();
  const respondStub = sinon.stub(robot, 'respond');

  const response = new MockResponse();
  const replyStub = sinon.stub(response, 'reply');

  response.match = [null, project, version, environment];
  response.message = {
    room: room,
    user: { name: null }
  };

  const httpClient = new MockScopedHttpClient();
  const headerSpy = sinon.spy(httpClient, 'header');
  const httpStub = sinon.stub(robot, 'http');

  httpStub.returns(httpClient);

  const postStub = sinon.stub(httpClient, 'post');

  postStub.returns((handler: IHttpClientHandler) => {
    handler(null, { statusCode: 200 }, JSON.stringify({ deploymentId: deploymentId }));
  });

  respondStub.callsArgWith(1, response);

  const expectedPostBody = JSON.stringify({
    environmentName: environment,
    accountName: account,
    projectSlug: project,
    buildVersion: version
  });

  const slackAdapter = new MockSlackAdapter();
  const customMessageSpy = sinon.spy(slackAdapter, 'customMessage');
  
  robot.adapter = slackAdapter;

  const expectedLink = `https://ci.appveyor.com/project/${account}/${project}/deployment/${deploymentId}`
  const expectedCustomMessage: ICustomMessage = {
    channel: room,
    text: 'Deploy started',
    attachments: [
      {
        fallback: `Started deploy of '${project}' v${version} to '${environment}': ${expectedLink}`,
        title: `Started deploy of '${project}' v${version}`,
        title_link: expectedLink,
        text: `v${version}`,
        color: '#2795b6'
      }
    ]
  };

  // act
  DeployScript(robot);

  // assert
  sinon.assert.calledWith(respondStub, /deploy (.+) v(.+) to (.+)/i, sinon.match.func);
  sinon.assert.calledWith(replyStub, `Starting deploy of '${project}' to '${environment}'...`);
  sinon.assert.calledWith(httpStub, 'https://ci.appveyor.com/api/deployments');
  sinon.assert.calledWith(headerSpy, 'Authorization', `Bearer ${Config.appveyor.token}`);
  sinon.assert.calledWith(headerSpy, 'Content-Type', 'application/json');
  sinon.assert.calledWith(headerSpy, 'Accept', 'application/json');
  sinon.assert.calledWith(postStub, expectedPostBody);
  
  sinon.assert.calledWith(customMessageSpy, sinon.match(expectedCustomMessage));
});