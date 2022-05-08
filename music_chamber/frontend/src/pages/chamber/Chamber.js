import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'

import SpotifyPlayback from '../../components/SpotifyPlayback'

// styles
import './Chamber.css'

export default function Chamber() {

	const { id } = useParams()
	const [url, setUrl] = useState('/api/get-chamber?id=' + id)
	const [objChamberInfo, setObjChamberInfo] = useState('')

  const [userAuthStatus, setUserAuthStatus] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  const loginSpotify = () => {
    fetch("/api-spotify/check-user-auth")
      .then((response) => response.json())
      .then((data) => {
        setUserAuthStatus(data.is_auth)

        if (!data.is_auth) {
          fetch("/api-spotify/get-auth-url")
            .then(response => response.json())
            .then((data) => {
              window.location.replace(data.auth_url)
            })
        } 
        else {
          fetch("/api-spotify/get-access-token")
            .then(response => response.json())
            .then((data) => {
              setAccessToken(data.access_token)
          })
        }

      })
  }


	useEffect(() => {
		fetch(url)
      .then((response) => response.json())
      .then((data) => setObjChamberInfo(data))
    
      loginSpotify()
	}, [])

  //useEffect(() => console.log(userAuthStatus), [userAuthStatus]);


  return (
    <div>
        <p>Chamber ID: {objChamberInfo ? objChamberInfo.chamber_id : ''}</p>
        <p>Chamber Name: {objChamberInfo ? objChamberInfo.chamber_name : ''}</p>
        <p>Guest Can Pause: {objChamberInfo ? objChamberInfo.access_guest_can_pause.toString() : ''}</p>
        <p>Votes Required to Skip Song: {objChamberInfo ? objChamberInfo.votes_song_skip : ''}</p>
        <p>Chamber Created at: {objChamberInfo ? objChamberInfo.created_at : ''}</p>
        <p>Is Public Chamber: {objChamberInfo ? objChamberInfo.is_public.toString() : ''}</p>
        <p>Are You Host: {objChamberInfo ? objChamberInfo.is_host.toString() : ''}</p>
        <SpotifyPlayback token={accessToken} />
    </div>
  )
}
