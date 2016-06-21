import { IScopedHttpClient, IHttpResponse } from 'hubot';

export interface IAppVeyorResponse {
  ok: boolean;
  statusCode: number;
  body?: any;
}

export interface IBuildResponse extends IAppVeyorResponse {
  body?: {
    accountName: string;
    projectSlug: string;
    version: string;
    link: string;
  }
}

export interface IDeployResponse extends IAppVeyorResponse {
  body?: {
    link: string;
  }
}

export interface IBuildsResponse extends IAppVeyorResponse {
  body?: {
    accountName: string;
    projectSlug: string;
    builds: Array<IBuildsBuildResponse>
  }
}

interface IBuildsBuildResponse {
  version: string;
  message: string;
  branch: string;
  committer: string;
  status: string;
  link: string;
}

export interface IAppVeyor {
  build(projectSlug: string): Promise<IBuildResponse>;
  builds(projectSlug: string, count: number): Promise<IBuildsResponse>;
  deploy(projectSlug: string, version: string, environment: string): Promise<IDeployResponse>;
}

export class AppVeyor implements IAppVeyor {
  constructor(private http: (url: string) => IScopedHttpClient, private token: string, private accountName: string) { }

  public build(projectSlug) {
    const body = JSON.stringify({
      accountName: this.accountName,
      projectSlug: projectSlug
    });

    return new Promise<IBuildResponse>((resolve, reject) => {
      this.post('https://ci.appveyor.com/api/builds', body, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return resolve({
          ok: false,
          statusCode: resp.statusCode
        });

        const o = JSON.parse(data);

        resolve({
          ok: true,
          statusCode: resp.statusCode,
          body: {
            accountName: this.accountName,
            projectSlug: projectSlug,
            version: o.version,
            link: `https://ci.appveyor.com/project/${this.accountName}/${projectSlug}/build/${o.version}`
          }
        });
      });
    });
  }

  public builds(projectSlug, count) {
    return new Promise<IBuildsResponse>((resolve, reject) => {
      this.get(`https://ci.appveyor.com/api/projects/${this.accountName}/${projectSlug}/history?recordsNumber=${count}`, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return resolve({ ok: false, statusCode: resp.statusCode });

        const o = JSON.parse(data);

        resolve({
          ok: true,
          statusCode: resp.statusCode,
          body: {
            accountName: this.accountName,
            projectSlug: projectSlug,
            builds: o.builds.map((build) => ({
              version: build.version,
              message: build.message,
              branch: build.branch,
              committer: build.committerName,
              status: build.status,
              link: `https://ci.appveyor.com/project/${this.accountName}/${projectSlug}/build/${build.version}`
            }))
          }
        });
      });
    });
  }

  public deploy(projectSlug, version, environment) {
    const body = JSON.stringify({
      environmentName: environment,
      accountName: this.accountName,
      projectSlug: projectSlug,
      buildVersion: version
    });

    return new Promise<IDeployResponse>((resolve, reject) => {
      this.post('https://ci.appveyor.com/api/deployments', body, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return resolve({
          ok: false,
          statusCode: resp.statusCode
        });

        const o = JSON.parse(data);

        resolve({
          ok: true,
          statusCode: resp.statusCode,
          body: {
            link: `https://ci.appveyor.com/project/${this.accountName}/${projectSlug}/deployment/${o.deploymentId}`
          }
        });
      });
    });
  }

  private post(url: string, body: string, callback: (err: Error, resp: IHttpResponse, data: string) => void) {
    this.http(url)
      .header('Authorization', `Bearer ${this.token}`)
      .header('Content-Type', 'application/json')
      .header('Accept', 'application/json')
      .post(body)(callback);
  }

  private get(url: string, callback: (err: Error, resp: IHttpResponse, data: string) => void) {
    this.http(url)
      .header('Authorization', `Bearer ${this.token}`)
      .header('Content-Type', 'application/json')
      .header('Accept', 'application/json')
      .get()(callback);
  }
}
