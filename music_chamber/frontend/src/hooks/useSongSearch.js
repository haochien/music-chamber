import { useState, useEffect } from 'react'


const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const processResultArray = (resultArray) => {
  if (resultArray.length > 0) {
    
    const finalResult = resultArray.map(songInfo => {
      const artistNames = songInfo.artists.map(artistInfo => artistInfo.name)
      const artist_string = artistNames.join(", ")
      
      const image_url = songInfo.album.images.length > 0 ? songInfo.album.images[0].url : ''
      return {'id': songInfo.id, 'title': songInfo.name, 'artist': artist_string, 'image_url': image_url}
    })
    return finalResult
  }
}


export const useSongSearch = (accessToken, query) => {
 

  const [searchedResult, setSearchedResult] = useState([]);

  const songSearch = () => {
    let shouldAddWildcard = false;
  
    if (query.length > 1) {
      const words = query.split(' ');
      const lastWord = words[words.length - 1];
      if (/^[a-z0-9\s]+$/i.test(lastWord) && query.lastIndexOf('*') !== query.length - 1) {
        shouldAddWildcard = true;
      }
    }
  
    const wildcardQuery = `${query}${shouldAddWildcard ? '*' : ''}`;
  
    if (query.length > 0) {
      const res = fetch(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(wildcardQuery)}&type=track&limit=10`, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      })
        .then(res => res.json())
        .then(res => {
          if ('tracks' in res) {
            setSearchedResult(processResultArray(res.tracks.items))
          }
        })
    
    }
  }


  useEffect(() => {
    songSearch()
  }, [query])

  return searchedResult


}
