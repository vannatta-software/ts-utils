export interface ILocation {
    pathname: string;
    search: string;
}

interface Path {
    local: string;
    global: string;
}

export interface IEndpoint {
    name: string,
    path: string,
    root?: boolean,
    breadcrumbs?: string[],
    description?: string,
    children?: EndpointCollection
}

export type Navigation = NavigationOptions[];

export type NavigationOptions = {
    endpoint: string,
    label?: string,
    icon?: JSX.Element,
    children?: Navigation
}

export class Endpoint {
    public description: string;
    public query: Record<string, string> = {};
    public resources: Record<string, string> = {};
    public breadcrumbs: string[] = [];
    public isRoot: boolean = false;
    private _name: string;
    private _path: Path;
    private _children: EndpointCollection;
    public static DELIMITER: string = '/';
    public static SPLAT: string = ':';

    constructor(definition: IEndpoint) {
        this.description = definition.description ?? "";
        this._children = definition.children ?? new EndpointCollection();
        this.breadcrumbs = definition.breadcrumbs ?? [];
        this.isRoot = definition.root ?? false;
        this._name = definition.name;
        this._path = {
            local: definition.path,
            global: definition.path
        };

        this.parse({ pathname: "", search: "" });
    }

    // immutable properties
    public get name(): string { return this._name; }
    public get path(): Path { return { ...this._path }; }
    public get children(): EndpointCollection { return this._children; }    

    public prependGlobalPath(path: string) {
        if (this._path.global.includes(path))
            return;

        this._path.global = `${Endpoint.DELIMITER}${path}${Endpoint.DELIMITER}${this._path.global}`;
        this._path.global = this._path.global.replace(`${Endpoint.DELIMITER}${Endpoint.DELIMITER}`, Endpoint.DELIMITER);
    }

    public parse(location: ILocation) {
        const global = this._path.global.split(Endpoint.DELIMITER);
        const path = location.pathname.split(Endpoint.DELIMITER);

        this.resources = {};

        global.forEach((value, i) => {            
            if (!value.includes(Endpoint.SPLAT)) 
                return;
            
            const resource = value.replace(Endpoint.SPLAT, "");
            this.resources[resource] = "";

            if (i < path.length && path[i] != global[i]) 
                this.resources[resource] = path[i];
        }); 

        this.query = Object.fromEntries(new URLSearchParams(location.search).entries());          
    }
}

export class EndpointCollection {
    private _endpoints: Record<string, Endpoint>;
    private _paths: Record<string, Endpoint>;
    private _root: Endpoint;
    private static _splatRegex =  new RegExp(`${Endpoint.SPLAT}(.*?)\/|${Endpoint.SPLAT}(.*)`, "gm");

    constructor(...endpoints: Endpoint[]) {
        this._endpoints = {};
        this._paths = {};

        endpoints.forEach(endpoint => this.build(endpoint));       
        endpoints.forEach(endpoint => this.initialize(endpoint));       
    }

    private build(endpoint: Endpoint) {
        if (endpoint.isRoot)
            this._root = endpoint;

        if (!endpoint.breadcrumbs.length)
            endpoint.breadcrumbs.push(endpoint.name)
        
        Object.keys(endpoint.children._paths).forEach(path => {
            const child = endpoint.children._paths[path]
            
            child.prependGlobalPath(endpoint.path.local);
            child.breadcrumbs.unshift(...endpoint.breadcrumbs);
            this.build(child);
        });
    }

    private initialize(endpoint: Endpoint) {
        let path = (Endpoint.DELIMITER + endpoint.path.global)
            .replace(EndpointCollection._splatRegex, Endpoint.SPLAT + Endpoint.DELIMITER)
            .replace(`${Endpoint.DELIMITER}${Endpoint.DELIMITER}`, Endpoint.DELIMITER);

        if (path[path.length -1] == Endpoint.DELIMITER)
            path = path.slice(0, -1);

        this._endpoints[endpoint.name] = endpoint;
        this._paths[path] = endpoint;

        Object.keys(endpoint.children._paths).forEach(path => {
            const child = endpoint.children._paths[path]
            this.initialize(child);
        });

        if (!endpoint.isRoot && this._root)
            endpoint.breadcrumbs.unshift(this._root.name);
    }

    public getEndpoint(location: ILocation | string) {
        if (typeof location == "string")
            return this._endpoints[location];

        const parts = location.pathname.split(Endpoint.DELIMITER);
        let endpoint: Endpoint | undefined;
        let search = "";

        for (let i = 0; i < parts.length; i++) {
            if (!parts[i]) continue;

            let lastSearch = search;

            search = lastSearch + Endpoint.DELIMITER + parts[i];            
            endpoint = this._paths[search];

            if (endpoint) continue;

            search = lastSearch + Endpoint.DELIMITER + Endpoint.SPLAT;
            endpoint  = this._paths[search];
        }      
        
        return endpoint;
    }

    public getPath(name: string, resources?: Record<string, string>) {
        const endpoint = this._endpoints[name];

        if (!endpoint)
            return undefined;

        let path = endpoint.path.global;
        let actual = resources ?? {};

        Object.keys(actual).forEach(resource => {
            path = path.replace(`${Endpoint.SPLAT}${resource}`, actual[resource])
        });        

        return path;
    }
    
    public find(query: string): Endpoint[] {
        const matches : Endpoint[] = [];
        const search = query.trim().toLowerCase().replace(/[^a-zA-Z0-9 -]/gi, "*");

        Object.keys(this._endpoints).forEach(name => {
            const endpoint = this._endpoints[name];
            const nameMatches = name.toLowerCase().indexOf(search) >= 0;
            const descriptionMatches = endpoint.description && 
                endpoint.description.toLowerCase().indexOf(search) >= 0;

            if (nameMatches || descriptionMatches)
                matches.push(endpoint);
        });

        return matches;
    }
}