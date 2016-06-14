import { IRobot, IRobotBrain, IListener, IResponse, IMessageDetail, IScopedHttpClient, IHttpResponse, IHttpClientHandler } from 'hubot';
import { ISlackAdapter, ICustomMessage } from 'hubot-slack';
import { Application } from 'express';

export class MockRobot implements IRobot {
  public adapter: any;
  public brain: IRobotBrain;
  public router: Application;

  public respond(matcher: RegExp, listener: IListener) {}
  public http(url: string) { return null; }
  public messageRoom(room: string, msg: string) {}
}

export class MockResponse implements IResponse {
  public match: string[];
  public message: IMessageDetail;

  public reply(msg: string) {}
}

export class MockScopedHttpClient implements IScopedHttpClient {
  public header(name: string, value: string) {
    return this;
  }

  public post(body: string) {
    return (handler: IHttpClientHandler) => {
      handler(null, { statusCode: 200 }, '');
    };
  }
}

export class MockSlackAdapter implements ISlackAdapter {
  public customMessage(msg: ICustomMessage) { return null; }
}

export class MockRobotBrain implements IRobotBrain {
  public get(key: string) { return null; }
  public set(key: string, value: string) {}
}