export const disableValidationWarnings = () => {
    const warn = console.warn;    

    console.warn = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].startsWith('async-validator:')) 
            return

        warn(...args);
    }    
}