import {Injectable} from '@angular/core';
import {InjectableRxStompConfig, RxStompService} from '@stomp/ng2-stompjs';
import {RxStompConfig} from '@stomp/rx-stomp';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export const myRxStompConfig: InjectableRxStompConfig = {
  brokerURL: 'ws://localhost:9090/ws',
  connectHeaders: {},
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  reconnectDelay: 5000,
  debug: (msg: string): void => {
    console.log(new Date(), msg);
  },
};
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  constructor(private rxStompService: RxStompService) {}


  subscribeToMovieUpdates(): Observable<any> {
    return this.rxStompService.watch('/topic/movie').pipe(
      map((message) => JSON.parse(message.body))
    );
  }

  subscribeToPersonUpdates(): Observable<any> {
    return this.rxStompService.watch('/topic/person').pipe(
      map((message) => JSON.parse(message.body))
    );
  }
}
