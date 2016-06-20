import * as hubot from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Application } from 'express';
import { IAppVeyor, IBuildResponse, IDeployResponse } from '../../lib/appveyor';

export class MockRobot implements hubot.Robot {
  public adapter: hubot.Adapter;
  public brain: hubot.Brain;
  public router: Application;
  public logger: hubot.Log;

  public respond(regex: RegExp, callback: (res: hubot.Response) => void) { }
  public http(url: string) { return null; }
  public messageRoom(room: string, msg: string) { }
  public error(handler: (err: Error, res: hubot.Response) => void) { }
  public emit(event: string, args: any[]) { return false; }
}

export class MockResponse implements hubot.Response {
  public match: string[];
  public message: hubot.Message;
  public robot: hubot.Robot;
  public envelope: hubot.IEnvelope;

  public reply(msg: string) { }
}

export class MockScopedHttpClient implements hubot.IScopedHttpClient {
  public header(name: string, value: string) {
    return this;
  }

  public post(body: string) {
    return (handler: hubot.IHttpClientHandler) => {
      handler(null, { statusCode: 200 }, '');
    };
  }

  public get() {
    return (handler: hubot.IHttpClientHandler) => {
      handler(null, { statusCode: 200 }, '');
    }
  }
}

export class MockSlackAdapter implements ISlackAdapter {
  public customMessage(msg: ICustomMessageData) { return null; }
}

export class MockRobotBrain implements hubot.Brain {
  public users(): { [id: string]: hubot.User; } { return null; }
  public userForName(name: string): hubot.User { return null; }
  public userForId(id: string, options: any): hubot.User { return null; }
  public get(key: string): string { return null; }
  public set(key: string, value: string): hubot.Brain { return null; }
  public remove(key: string): hubot.Brain { return null; }
  public close() { }
  public save() { }
  public setAutoSave(enabled: boolean) { }
}

export class MockAppVeyor implements IAppVeyor {
  public build(projectSlug) { return null; }
  public builds(projectSlug) { return null; }
  public deploy(projectSlug, version, environment) { return null; }
}

export class MockHubotLogger implements hubot.Log {
  public log(levelStr: string, args: any[]) {}
  public error(msg: any[]) {}
  public emergency(msg: any[]) {}
  public alert(msg: any[]) {}
  public critical(msg: any[]) {}
  public warning(msg: any[]) {}
  public notice(msg: any[]) {}
  public info(msg: any[]) {}
  public debug(msg: any[]) {}
}

