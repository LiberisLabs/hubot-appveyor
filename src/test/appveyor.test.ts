import { test } from 'ava';
import * as sinon from 'sinon';

import { MockRobot, MockRobotBrain, MockResponse, MockScopedHttpClient, MockSlackAdapter } from './helpers/mocks';
import { IHttpClientHandler } from 'hubot';
import { ICustomMessageData } from 'hubot-slack';
import * as express from 'express';
import { Config } from '../lib/config';
import { AppVeyor } from '../lib/appveyor';
import BuildScript from '../scripts/build';

test.cb('appveyor > build', (t) => {
  const token = 'my-token';
  const account = 'my-account';
  const project = 'my-project';
  const response = {
    "buildId": 136709,
    "jobs": [],
    "buildNumber": 7,
    "version": "1.0.7",
    "message": "replaced with command [skip ci]",
    "branch": "master",
    "commitId": "c2892a70d60c96c1b65a7c665ab806b7731fea8a",
    "authorName": "Feodor Fitsner",
    "authorUsername": "FeodorFitsner",
    "committerName": "Feodor Fitsner",
    "committerUsername": "FeodorFitsner",
    "committed": "2014-08-15T22:05:54+00:00",
    "messages": [],
    "status": "queued",
    "created": "2014-08-16T00:40:38.1703914+00:00"
  };

  const httpClient = new MockScopedHttpClient();

  const headerSpy = sinon.spy(httpClient, 'header');

  const postStub = sinon.stub(httpClient, 'post');
  postStub.returns((handler: IHttpClientHandler) => {
    handler(null, { statusCode: 200 }, JSON.stringify(response));
  });

  const httpStub = sinon.stub().returns(httpClient);

  const appveyor = new AppVeyor(httpStub, account);
  const result = appveyor.build(project, token);

  sinon.assert.calledWith(httpStub, 'https://ci.appveyor.com/api/builds');
  sinon.assert.calledWith(headerSpy, 'Authorization', `Bearer ${token}`);
  sinon.assert.calledWith(headerSpy, 'Content-Type', 'application/json');
  sinon.assert.calledWith(headerSpy, 'Accept', 'application/json');
  sinon.assert.calledWith(postStub, `{"accountName":"${account}","projectSlug":"${project}"}`);

  result.then((data) => {
    t.is(data.ok, true);
    t.is(data.statusCode, 200);
    t.is(data.body.accountName, account);
    t.is(data.body.projectSlug, project);
    t.is(data.body.version, response.version);
    t.is(data.body.link, `https://ci.appveyor.com/project/${account}/${project}/build/${response.version}`);

    t.end();
  }).catch(t.end);
});

test.cb('appveyor > builds', (t) => {
  const token = 'my-token';
  const account = 'my-account';
  const project = 'my-project';
  const response = {
    "project": {
      "accountName": "appvyr",
      "slug": "wix-test",
    },
    "builds": [
      {
        "version": "1.0.5",
        "message": "Enabled diag mode",
        "branch": "master",
        "committerName": "Feodor Fitsner",
        "status": "success",
      },
      {
        "version": "1.0.3",
        "message": "Added appveyor.yml",
        "branch": "master",
        "committerName": "Feodor Fitsner",
        "status": "success",
      }
    ]
  };

  const httpClient = new MockScopedHttpClient();

  const headerSpy = sinon.spy(httpClient, 'header');

  const getStub = sinon.stub(httpClient, 'get');
  getStub.returns((handler: IHttpClientHandler) => {
    handler(null, { statusCode: 200 }, JSON.stringify(response));
  });

  const httpStub = sinon.stub().returns(httpClient);

  const appveyor = new AppVeyor(httpStub, account);
  const result = appveyor.builds(project, 2, token);

  sinon.assert.calledWith(httpStub, `https://ci.appveyor.com/api/projects/${account}/${project}/history?recordsNumber=2`);
  sinon.assert.calledWith(headerSpy, 'Authorization', `Bearer ${token}`);
  sinon.assert.calledWith(headerSpy, 'Content-Type', 'application/json');
  sinon.assert.calledWith(headerSpy, 'Accept', 'application/json');
  sinon.assert.calledOnce(getStub);

  result.then((data) => {
    t.is(data.body.accountName, account);
    t.is(data.body.projectSlug, project);

    t.is(data.body.builds[0].version, response.builds[0].version);
    t.is(data.body.builds[0].message, response.builds[0].message);
    t.is(data.body.builds[0].branch, response.builds[0].branch);
    t.is(data.body.builds[0].committer, response.builds[0].committerName);
    t.is(data.body.builds[0].link, `https://ci.appveyor.com/project/${account}/${project}/build/${response.builds[0].version}`);

    t.is(data.body.builds[1].version, response.builds[1].version);
    t.is(data.body.builds[1].message, response.builds[1].message);
    t.is(data.body.builds[1].branch, response.builds[1].branch);
    t.is(data.body.builds[1].committer, response.builds[1].committerName);
    t.is(data.body.builds[1].link, `https://ci.appveyor.com/project/${account}/${project}/build/${response.builds[1].version}`);

    t.end();
  }).catch(t.end);
});

test.cb('appveyor > deploy', (t) => {
  const token = 'my-token';
  const account = 'my-account';
  const project = 'my-project';
  const version = 'a.b.c';
  const environment = 'dev-env';
  const deploymentId = 1234567890;
  const response = { deploymentId: deploymentId };

  const httpClient = new MockScopedHttpClient();

  const headerSpy = sinon.spy(httpClient, 'header');

  const postStub = sinon.stub(httpClient, 'post');
  postStub.returns((handler: IHttpClientHandler) => {
    handler(null, { statusCode: 200 }, JSON.stringify(response));
  });

  const expectedPostBody = JSON.stringify({
    environmentName: environment,
    accountName: account,
    projectSlug: project,
    buildVersion: version
  });

  const httpStub = sinon.stub().returns(httpClient);

  const appveyor = new AppVeyor(httpStub, account);
  const result = appveyor.deploy(project, version, environment, token);

  sinon.assert.calledWith(httpStub, 'https://ci.appveyor.com/api/deployments');
  sinon.assert.calledWith(headerSpy, 'Authorization', `Bearer ${token}`);
  sinon.assert.calledWith(headerSpy, 'Content-Type', 'application/json');
  sinon.assert.calledWith(headerSpy, 'Accept', 'application/json');
  sinon.assert.calledWith(postStub, expectedPostBody);

  result.then((data) => {
    t.is(data.ok, true);
    t.is(data.statusCode, 200);
    t.is(data.body.link, `https://ci.appveyor.com/project/${account}/${project}/deployment/${deploymentId}`);

    t.end();
  }).catch(t.end);
});
