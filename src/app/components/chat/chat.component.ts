import {AfterContentInit, Component, OnInit, AfterViewChecked, ElementRef, ViewChild} from '@angular/core';
import {ChatService} from '../../services/chat.service';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {AuthService} from '../../services/auth.service';
import {User} from '../../models/user';
import {Message} from '../../models/message';
import {Conversation} from '../../models/conversation';
import {forEach} from '@angular/router/src/utils/collection';
import * as data from './../../config.json';
const conf = (<any>data);

declare function require(name: string);

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  private serverUrl = 'http://' + conf.url + ':5001/ws';
  private stompClient;
  users: User[] = [];
  profil: User;
  conv: Conversation;
  contact: User;
  message: Message = new Message('', '', '');
  messageRecu: Message = new Message('', '', '');
  messageList: any[][] = [];
  messageListRecu: any[][] = [];
  unread: any[] = [];
  files: FileList;
  getFiles(event) {
    this.files = event.target.files;
  }

  constructor(private chat: ChatService) {
    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    const that = this;
    this.stompClient.connect({}, (frame) => {
      that.stompClient.subscribe('/topic/' + this.profil.username + '.public.messages', (message) => {
        if (message.body) {
          if (!this.messageListRecu[JSON.parse(message.body).emetteur]) {
            this.messageListRecu[JSON.parse(message.body).emetteur] = [];
          }
          this.messageRecu.emetteur = JSON.parse(message.body).emetteur;
          this.messageRecu.destinataire = JSON.parse(message.body).destinataire;
          this.messageRecu.message = JSON.parse(message.body).message;
          this.messageRecu.date = new Date();
          this.messageListRecu[this.messageRecu.emetteur].push(this.messageRecu);
          if ((this.conv && this.messageRecu.emetteur !== this.conv.contact.username) || !this.conv) {
            this.unread[this.messageRecu.emetteur] = true;
          } else {
            this.unread[this.messageRecu.emetteur] = false;
          }
          this.messageRecu = new Message('', '', '');
        }
      });
    });
  }

  selectConv(email) {
    if (!this.messageList[email]) {
      this.messageList[email] = [];
    }
    if (this.unread[email] === true) {
      this.unread[email] = false;
    }
    this.chat.getContact(email).then((res) => {
      this.contact = (Object.assign(new User(), res.json()));
      this.conv = new Conversation(this.contact.id, this.contact, this.profil, '50');
      this.message.destinataire = this.contact.username;
      this.message.emetteur = this.profil.username;
    });
  }

  ngOnInit() {
    this.users = [];
    this.chat.connectList();
    this.users = this.chat.userCo;
    if (localStorage.getItem('profile')) {
      this.profil = Object.assign(new User(), JSON.parse(localStorage.getItem('profile')));
    }
  }

  onSubmit() {
    if (this.message.message) {
      this.message.date = new Date();
      this.messageList[this.message.destinataire].push(this.message);
      this.chat.envoi(this.message);
    }
    this.message = new Message(this.message.destinataire, this.message.emetteur, '');
  }
}
