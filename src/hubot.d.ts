declare module "hubot" {
  import { Application as ExpressApp } from 'express';

  interface IHttpResponse {
    statusCode: number;
  }

  interface IHttpClientHandler {
    (err: Error, res: IHttpResponse, body: string): void;
  }

  interface IScopedHttpClient {
    header(name: string, value: string): IScopedHttpClient;
    post(body: string): (handler: IHttpClientHandler) => void;
    get(): (handler: IHttpClientHandler) => void;
  }

  interface IEnvelope {
    room: string;
    user: User;
    message: Message;
  }

  export class User {
    id: string;
    name: string;
    room: string;
  }

  export class Message {
    user: User;
    text: string;
    id: string;
    room: string;
    done: boolean;
  }

  export class EnterMessage extends Message { }
  export class LeaveMessage extends Message { }
  export class TopicMessage extends Message { }
  export class TextMessage extends Message { }
  export class CatchAllMessage extends Message {
    message: Message;
  }

  export class Response {
    robot: Robot;
    match: string[];
    message: Message;
    envelope: IEnvelope;

    constructor(robot: Robot, message: Message, match: RegExpMatchArray);

    reply(msg: string);
  }

  export class Brain {
    constructor(robot: Robot);

    users(): { [id: string]: User; };
    userForName(name: string): User;
    userForId(id: string, options: any): User;
    get(key: string): string;
    set(key: string, value: string): Brain;
    remove(key: string): Brain;
    close();
    save();
    setAutoSave(enabled: boolean);
  }

  export class Adapter {
    constructor(robot: Robot);
  }

  class Log {
    log(levelStr: string, args: any[]);
    error(...msg: any[]);
    emergency(...msg: any[]);
    alert(...msg: any[]);
    critical(...msg: any[]);
    warning(...msg: any[]);
    notice(...msg: any[]);
    info(...msg: any[]);
    debug(...msg: any[]);
  }

  export class Robot {
    adapter: Adapter;
    brain: Brain;
    router: ExpressApp;
    logger: Log;

    constructor(adapterPath: string, adapter: string, httpd: boolean, name?: string, alias?: boolean);

    respond(regex: RegExp, options: any, callback: (res: Response) => void);
    respond(regex: RegExp, callback: (res: Response) => void);
    http(url: string): IScopedHttpClient;
    messageRoom(room: string, msg: string);
    error(handler: (err: Error, res: Response) => void)
    emit(event: string, ...args: any[]): boolean;
  }
}