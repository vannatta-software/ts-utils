type Connections<T extends string> = Record<T, ServiceConnection>;

interface ConnectionSetting {
    host?: string;
    path?: string;
    port?: number;
    hubs?: Record<string, string>;
}

export class ServiceHub {
    constructor(
        public baseAddress: string,
        public hub: string,
        public name: string
    ) {
        if (this.hub[0] !== "/") 
            this.hub = "/" + this.hub;
    }

    public get address() {
        return `${this.baseAddress}${this.hub}`;
    }

    // Allows for easier construction of hub URLs based on other services.
    public toString() {
        return this.address;
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

        // Default port to 80 if invalid
        if (isNaN(this._port))
            this._port = 80;

        if (this._path === "/")
            this._path = "";
    }

    private get port() {
        return this._port === 80 ? "" : `:${this._port}`;
    }

    public get address() {       
        return `${this._host}${this.port}${this._namespace}${this._path}`;
    }

    // Hub method to get a new ServiceHub for specific services
    public hub(hub: string) {
        const hubPath = this._notificationsHubs[hub] ?? "/notifications";
        return new ServiceHub(this.address, hubPath, this.name + "." + hub);
    }

    // Dynamically sets the namespace if applicable
    public setNamespace(namespace: string) {
        if (!this.name.includes("experiment") || !namespace || namespace === "")
            return;

        this._namespace = `/${namespace}`;
    }

    public toString() {
        return this.address;
    }

    // Static build method to create multiple ServiceConnections from a source
    public static build<T extends string>(source: Record<string, ConnectionSetting>, namespace: string = ""): Connections<T> {
        let connections: Connections<any> = {};

        // Ensure each service has the correct connection setup
        Object.keys(source).forEach(serviceName => {
            const connectionSetting = source[serviceName];
            if (!connectionSetting || !connectionSetting.host) {
                throw new Error(`Invalid connection setting for ${serviceName}`);
            }

            connections[serviceName] = new ServiceConnection(serviceName, connectionSetting);
            connections[serviceName].setNamespace(namespace);
        });

        return <Connections<T>>connections;
    }
}
