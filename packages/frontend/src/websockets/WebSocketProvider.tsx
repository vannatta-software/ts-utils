import { ApiClient } from "@vannatta-software/ts-core";
import React, { FunctionComponent, PropsWithChildren } from "react";
import { WebSocketConnection, WebSocketService, WebSockets } from "./WebSocketUtils";

const socketService = new WebSocketService();
const WebSocketContext = React.createContext({ 
    service: socketService, 
    connected: false, 
    status: { ...socketService.status } 
});

interface Props extends PropsWithChildren {
    connections: WebSockets,
    remember?: boolean,
    keepAlive?: boolean,
    retryTimeout?: number
    bypass?: boolean
}

const WebSocketProvider: FunctionComponent<Props> = props => {
    const [ service ] = React.useState(new WebSocketService(props.connections));
    const [ intervals ] = React.useState<{ [socket: string]: any }>({});
    const [ socketContext, setSocketContext ] = React.useState({ service, connected: false, status: { ...socketService.status } }); 
    const retryTimeout = props.retryTimeout ?? 3000;

    const update = () => {
        const status = { ...service.status };
        let connected = true;

        if (props.bypass)
            Object.keys(service.status).forEach(key => status[key] = true);

        Object.values(service.status).forEach(status => connected = connected && status)        

        setSocketContext({ connected, service, status});
    }

    const connect = (socket: WebSocketConnection) => {    
        socket.onRetry(() => reconnect(socket));       

        return socket.start()
            .then(() => {
                if (props.remember) {
                    socket.remember();
                    socket.login("userId")
                }

                update();
                
                if (intervals[socket.address])
                    clearInterval(intervals[socket.address])

                socket.onRetry(() => reconnect(socket));     
            })
            .catch(() => reconnect(socket));
    }

    const reconnect = (socket: WebSocketConnection) => {
        update();
        clearInterval(intervals[socket.address]);

        if (!props.keepAlive)
            return socket;

        intervals[socket.address] = setInterval(() => connect(socket), retryTimeout);

        return socket;
    }

    React.useEffect(() => {
        if (props.bypass)
            return update();    

        const onClose = () => {
            service.forEach(socket => {
                if (props.remember){
                    socket.forget();
                    socket.logout("userId")
                }
                
                socket.stop();
            });     
            Object.values(intervals).forEach(clearInterval);
        }   

        service.forEach(s => connect(s));        
        ApiClient.websocketConnection(WebSocketConnection.instanceId);
        window.addEventListener("beforeunload", onClose);

        return () => {        
            onClose();
            ApiClient.websocketConnection(undefined);
            window.removeEventListener("beforeunload", onClose);
        }
    }, [ ]);

    return (
        <WebSocketContext.Provider value={socketContext}>
            { props.children }
        </WebSocketContext.Provider>
    );
}

export { WebSocketContext, WebSocketProvider };
