import { useState, useEffect } from "react"

export const useSession = name => {

  const [data, setData] = useState(null)

  useEffect(() => {
      if (!document.cookie) {
        setData(null)
      } else {
        const xsrfCookies = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(name + '='));
      
        if (xsrfCookies.length === 0) {
          setData(null)
        } else {
          setData(decodeURIComponent(xsrfCookies[0].split('=')[1]))
        }
      }
    
      
  }, [name])

  return data; 

};

