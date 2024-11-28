import React, { FunctionComponent, PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { Endpoint, EndpointCollection, ILocation } from "./EndpointCollection";

interface Props extends PropsWithChildren {
    title: string,
    location: () => ILocation,
    endpoints: EndpointCollection
}

interface Context {
    title: string,
    endpoints: EndpointCollection,
    redirect: (location: string, resource?: Record<string, string>) => void,
    endpoint?: Endpoint
}

const initialContext: Context = {
    title: "App",
    endpoints: new EndpointCollection(),
    redirect: (location: string, resource?: Record<string, string>) => {},
    endpoint: undefined
}

export const EndpointContext = React.createContext<Context>(initialContext);

export const EndpointProvider: FunctionComponent<Props> = props => {
    const location = props.location();
    const navigate = useNavigate();
    const [ context, setContext ] = React.useState<Context>({
        title: props.title,
        endpoints: props.endpoints,
        redirect: initialContext.redirect,
        endpoint: initialContext.endpoint
    });    

    const handleRedirect = (location: string, resources?: Record<string, string>) => {        
        const path = context.endpoints.getPath(location, resources);

        if (path) {
            return navigate(path);
        }

        navigate(location);
    }
    
    React.useEffect(() => {
        const endpoint = context.endpoints.getEndpoint(location);

        if (endpoint) {
            endpoint.parse(location);
            document.title = `${props.title} | ${endpoint.name}`;  
        } else {
            document.title = props.title;
        }

        setContext({ ...context, endpoint, redirect: handleRedirect });    
    }, [ location ])
    
    return (
        <EndpointContext.Provider value={context}>
            { props.children }
        </EndpointContext.Provider>
    )
}