import * as hubot from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Application } from 'express';
import { IAppVeyor, IBuildResponse, IDeployResponse } from '../../lib/appveyor';

export class MockRobot implements hubot.IHubot {
  public adapter: hubot.IAdapter;
  public brain: hubot.IHubotBrain;
  public router: Application;
  public logger: hubot.IHubotLogger;

  public respond(matcher: RegExp, listener: hubot.IListener) { }
  public http(url: string) { return null; }
  public messageRoom(room: string, msg: string) { }
  public error(handler: (err: Error, res: hubot.IResponse) => void) { }
  public emit(event: string, args: any[]) { return false; }
}

export class MockResponse implements hubot.IResponse {
  public match: string[];
  public message: hubot.IMessageDetail;

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

export class MockRobotBrain implements hubot.IHubotBrain {
  public get(key: string) { return null; }
  public set(key: string, value: string) { }
}

export class MockAppVeyor implements IAppVeyor {
  public build(projectSlug) { return null; }
  public builds(projectSlug) { return null; }
  public deploy(projectSlug, version, environment) { return null; }
}

export class MockHubotLogger implements hubot.IHubotLogger {
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

