import type { Socket } from '../socket';
import { SocketState } from '../socket-options'

export function pingPlugin(socket: Socket) {
    if (typeof window !=='object') {
        return;
    }
    let timer: NodeJS.Timeout | null = null;
    let hasNewMessage: boolean | null = null;
    const defaultData ={
        type: 'heartbeat'
    }
    const start = () => {
        if (!timer) {
            const { pingData = defaultData, pingInterval = 0 } = socket.options;
            if (pingInterval > 0) {
                timer = setTimeout(() => {
                    timer = null;

                    if (hasNewMessage === false) {
                        socket.disconnect();
                        socket.connect();
                        return;
                    }

                    hasNewMessage = false;
                    socket.send(pingData)
                    start();
                }, pingInterval);
            }
        }
    };
    const end = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
    socket.subscribeState((state) => {
        if (state === SocketState.open) {
            start();
        } else {
            end();
        }
    })
    socket.subscribeMessage(() => {
        hasNewMessage = true;
    })
}
