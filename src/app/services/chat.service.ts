import { Injectable, OnInit } from '@angular/core';
import {Headers, Http} from '@angular/http';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../models/user';
import {Message} from '../models/message';

import * as data from './../config.json';
import {forEach} from '@angular/router/src/utils/collection';

const conf = (<any>data);


@Injectable()
export class ChatService implements OnInit {
  private apiAuth = 'http://' + conf.url + ':5000/api/auth';
  private apiConn = 'http://' + conf.url + ':5000/api/connexions';
  private apiMsg = 'http://' + conf.url + ':5001/api/chat/envoyer-message';
  private headers = new Headers({'Content-Type': 'application/json'});
  public userCo: User[] = [];
  public contact: User;

  constructor(private http: Http) {
  }

  ngOnInit() {
    this.userCo = [];
  }

  envoi(msg: Message): Promise<any> {
    const url = `${this.apiMsg}`;
    return this.http.post(url, msg, {headers: this.headers}).toPromise();
  }

  connectList(): Promise<any> {
    this.userCo = [];
    const url = `${this.apiConn}/utilisateurs-co`;
    return this.http.get(url, {headers: this.headers}).toPromise().then(
      res => { // Success
        res.json().forEach((value) => {
          value.authority = value.authorities[0].authority;
          this.userCo.push(Object.assign(new User(), value));
      });
      }
    );
  }

  getContact(email): Promise<any> {
    const url = `${this.apiAuth}/detail/` + email;
    return this.http.get(url, {headers: this.headers}).toPromise();
  }
}
