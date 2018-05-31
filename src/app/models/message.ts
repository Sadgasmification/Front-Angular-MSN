import {User} from './user';

export class Message {
  constructor(
    public destinataire: string,
    public emetteur: string,
    public message: string,
    public date?: Date,
    public id?: string
    ) {
  }
}
