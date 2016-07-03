import * as crypto from 'crypto';
import { Robot } from 'hubot';

class Cipher {
  private _cipher: crypto.Cipher;
  private _decipher: crypto.Decipher;

  constructor(private _key: string) { }

  private get cipher(): crypto.Cipher {
    return this._cipher || (this._cipher = crypto.createCipher('aes256', this._key)); 
  }

  private get decipher(): crypto.Decipher {
    return this._decipher || (this._decipher = crypto.createDecipher('aes256', this._key)); 
  }

  encrypt(value: string) {
    return this.cipher.update(value, 'utf8', 'hex') + this.cipher.final('hex');
  }

  decrypt(value: string) {
    return this.decipher.update(value, 'hex', 'utf8') + this.decipher.final('utf8');
  }
}

export interface ISecureBrain {
  get(key: string): any;
  set(key: string, value: any): ISecureBrain;
}

export class SecureBrain implements ISecureBrain {
  private _cipher: Cipher;

  constructor(private _robot: Robot, key: string) {
    this._cipher = new Cipher(key);
  }
  
  get(key: string): any {
    const brainValue = this._robot.brain.get(key);
    
    if (brainValue === null)
      return null;

    let decipheredValue: string;

    try {
      decipheredValue = this._cipher.decrypt(brainValue);
    } catch (_) {
      return brainValue;
    }

    return JSON.parse(decipheredValue);    
  }
  
  set(key: string, value: any): ISecureBrain {
    const secureValue = this._cipher.encrypt(JSON.stringify(value));
    this._robot.brain.set(key, secureValue);
    return this;
  }
}