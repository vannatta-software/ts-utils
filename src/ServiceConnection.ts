type Connections<T extends string> = Record<T, ServiceConnection>;

interface ConnectionSetting {
    host?: string;
    path?: string;
    port?: number;
    hubs?: Record<string, string>
}

export class ServiceHub {
    constructor (
        public baseAddress: string,
        public hub: string,
        public name: string
    ){
        if (this.hub[0] != "/") 
            this.hub = "/" + this.hub;
    }

    public get address() {            
        return `${this.baseAddress}${this.hub}`;
    }
}

export class ServiceConnection {
    public readonly name: string;
    private readonly _host: string;
    private readonly _path: string;
    private readonly _port: number;
    private _namespace: string;
    private _notificationsHubs: Record<string, string>;

    constructor(name: string, setting: ConnectionSetting) {
        const url = window?.location;
        
        this._host = setting.host ?? `${url.protocol}//${url.hostname}`;
        this._path = setting.path ?? "";
        this._port = setting.port ?? parseInt(url.port);
        this._namespace = "";
        this._notificationsHubs = setting.hubs ?? {};
        this.name = name;

        if (isNaN(this._port))
            this._port = 80;

        if (this._path == "/")
            this._path = "";
    }

    private get port() {
        return this._port == 80 ? "" : `:${this._port}`;
    }

    public get address() {       
        return `${this._host}${this.port}${this._namespace}${this._path}`;
    }

    public hub(hub: string) {
        return new ServiceHub(
            this.address, 
            this._notificationsHubs[hub] ?? "/notifications",
            this.name + "." + hub
        )
    }

    public setNamespace(namespace: string) {
        if (!this.name.includes("experiment") || !namespace || namespace === "")
            return;

        this._namespace = `/${namespace}`;
    }

    public toString() {
        return this.address;
    }

    public static build<T extends string>(source: any, namespace: string = ""): Connections<T> {
        let connections: Connections<any> = {};
    
        Object.keys(source).forEach(serviceName => {
            connections[serviceName] = new ServiceConnection(serviceName, source[serviceName]);
            connections[serviceName].setNamespace(namespace);
        });
    
        return <Connections<T>> connections;
    }
}
