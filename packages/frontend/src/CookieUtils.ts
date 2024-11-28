export class CookieUtils {
 
    public static set(name: string, value: any, hours: number) {
      let expiry = new Date();
  
      expiry.setTime(expiry.getTime() + (hours*60*60*1000));
      let expires = "expires=" + expiry.toUTCString();
  
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

  
    public static get(name: string): string | undefined {
      name = name + "=";
  
      let ca = document.cookie.split(';');
  
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
  
        while (c.charAt(0) == ' ') 
          c = c.substring(1);
  
        if (c.indexOf(name) == 0) 
          return c.substring(name.length, c.length);
      }
      
      return undefined;
    }

  
    public static delete( name: string, path?: string, domain?: string ) {
      if( CookieUtils.get( name ) ) {
        document.cookie = name + "=" +
          ((path) ? ";path="+path:"")+
          ((domain) ?";domain="+domain:"") +
          ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      }
    }
  
  }