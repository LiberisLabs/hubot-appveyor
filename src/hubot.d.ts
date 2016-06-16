declare module "hubot" {
  import * as express from 'express';

  interface IHttpResponse {
    statusCode: number;
  }

  interface IHttpClientHandler {
    (err: Error, res: IHttpResponse, body: string): void;
  }

  interface IScopedHttpClient {
    header(name: string, value: string): IScopedHttpClient;
    post(body: string): (handler: IHttpClientHandler) => void;
  }

  interface IMessageDetail {
    room: string;
    user: {
      name: string;
    }
  }

  interface IResponse {
    match: string[];
    message: IMessageDetail;

    reply(msg: string);
  }

  interface IListener {
    (res: IResponse): any;
  }

  interface IRobotBrain {
    get(key: string): string;
    set(key: string, value: string);
  }

  interface IAdapter {

  }

  interface IRobot {
    adapter: IAdapter;
    brain: IRobotBrain;
    router: express.Application;

    respond(matcher: RegExp, listener: IListener);
    http(url: string): IScopedHttpClient;
    messageRoom(room: string, msg: string);
  }
}