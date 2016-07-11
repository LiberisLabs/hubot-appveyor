import * as hubot from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Application } from 'express';
import { IAppVeyor, IBuildResponse, IDeployResponse } from '../../lib/appveyor';
import { ISecureBrain } from '../../lib/secure_brain';

export class MockRobot implements hubot.Robot {
  adapter: hubot.Adapter;
  brain: hubot.Brain;
  router: Application;
  logger: hubot.Log;
  name: string;

  respond(regex: RegExp, callback: (res: hubot.Response) => void) { }
  http(url: string) { return null; }
  messageRoom(room: string, msg: string) { }
  error(handler: (err: Error, res: hubot.Response) => void) { }
  emit(event: string, args: any[]) { return false; }
}

export class MockResponse implements hubot.Response {
  match: string[];
  message: hubot.Message;
  robot: hubot.Robot;
  envelope: hubot.IEnvelope;

  reply(msg: string) { }
}

export class MockScopedHttpClient implements hubot.IScopedHttpClient {
  header(name: string, value: string) {
    return this;
  }

  post(body: string) {
    return (handler: hubot.IHttpClientHandler) => {
      handler(null, { statusCode: 200 }, '');
    };
  }

  get() {
    return (handler: hubot.IHttpClientHandler) => {
      handler(null, { statusCode: 200 }, '');
    }
  }
}

export class MockSlackAdapter implements ISlackAdapter {
  customMessage(msg: ICustomMessageData) { return null; }
}

export class MockRobotBrain implements hubot.Brain {
  users(): { [id: string]: hubot.User; } { return null; }
  userForName(name: string): hubot.User { return null; }
  userForId(id: string, options: any): hubot.User { return null; }
  get(key: string): string { return null; }
  set(key: string, value: string): hubot.Brain { return null; }
  remove(key: string): hubot.Brain { return null; }
  close() { }
  save() { }
  setAutoSave(enabled: boolean) { }
}

export class MockAppVeyor implements IAppVeyor {
  build(projectSlug) { return null; }
  builds(projectSlug) { return null; }
  deploy(projectSlug, version, environment) { return null; }
}

export class MockHubotLogger implements hubot.Log {
  log(levelStr: string, args: any[]) { }
  error(msg: any[]) { }
  emergency(msg: any[]) { }
  alert(msg: any[]) { }
  critical(msg: any[]) { }
  warning(msg: any[]) { }
  notice(msg: any[]) { }
  info(msg: any[]) { }
  debug(msg: any[]) { }
}

export class MockSecureBrain implements ISecureBrain {
  get(key: string): any { return null; }
  set(key: string, value: any): ISecureBrain { return null; }
}