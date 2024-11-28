import React from 'react';

export interface IState {}
export interface IActions {}

interface IListener<TState> {
    lastState: TState,
    listen: (state: TState) => void
}

export abstract class BaseStore<TState extends IState, TActions extends IActions> {
    protected state: TState;
    private actions: TActions;
    private listeners: IListener<TState>[];
    private isInitialized : boolean;
    
    public State: [TState, TActions];
    
    constructor(
        protected initialState: TState,
        protected _prototype: object
    ) {
        this.listeners = [];
        this.state = <TState> {};
        this.actions = <TActions> {};
        this.isInitialized = false;
    }

    private initialize(): void {
        if (this.isInitialized)
            return;

        this.state = this.initialState;
        this.actions = this.assignActions(this._prototype);
        this.isInitialized = true;
    }

    public use(): [TState, TActions] {
        this.initialize();

        const [ , hook ] = React.useState(Object.create(null));
        const state = this.state;
        const actions = React.useMemo<TActions>(() => this.actions, []);

        React.useEffect(() => {
            const nextListener: IListener<TState> = {
                lastState: <TState>{},
                listen: hook
            };

            this.listeners.push(nextListener);
            nextListener.listen(this.state);

            return () => {
                this.listeners = this.listeners.filter(
                    listener => listener !== nextListener
                );
            }
        }, []);                        

        return [state, actions];
    }

    protected setState(state: TState, afterUpdateCallback?: () => void) : void {        
        this.state = { ...this.state, ...state };

        this.listeners.forEach(listener => listener.listen(this.state));                  

        if (afterUpdateCallback)
            afterUpdateCallback();
    }

    public assignActions(actions: any): TActions {
        const associatedActions = <TActions>{};

        Object.getOwnPropertyNames(actions).forEach(key => {   
            if (typeof actions[key] === "function")
                associatedActions[key] = actions[key].bind(this);

            if (typeof actions[key] === "object") 
                associatedActions[key] = this.assignActions(actions[key]);
        });        

        return associatedActions;
    }

    public static bindActions<Actions extends IActions>(store: BaseStore<any, Actions>, actions: Partial<Actions>) {
        const [ acts ] = React.useState(actions);

        React.useEffect(() => { 
            store.actions = { ...store.actions, ...store.assignActions(acts)}
        }, [ store ]);
        
        return store.actions
    }
}