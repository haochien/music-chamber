import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'

// styles
import './Chamber.css'

export default function Chamber() {

	const { id } = useParams()
	const [url, setUrl] = useState('/api/get-chamber?id=' + id)
	const [objChamberInfo, setObjChamberInfo] = useState('')

	useEffect(() => {
		fetch(url)
      .then((response) => response.json())
      .then((data) => setObjChamberInfo(data))
	}, [url])


  return (
    <div>
        <p>Chamber ID: {objChamberInfo ? objChamberInfo.chamber_id : ''}</p>
        <p>Chamber Name: {objChamberInfo ? objChamberInfo.chamber_name : ''}</p>
        <p>Guest Can Pause: {objChamberInfo ? objChamberInfo.access_guest_can_pause.toString() : ''}</p>
        <p>Votes Required to Skip Song: {objChamberInfo ? objChamberInfo.votes_song_skip : ''}</p>
        <p>Chamber Created at: {objChamberInfo ? objChamberInfo.created_at : ''}</p>
        <p>Is Public Chamber: {objChamberInfo ? objChamberInfo.is_public.toString() : ''}</p>
        <p>Are You Host: {objChamberInfo ? objChamberInfo.is_host.toString() : ''}</p>
    </div>
  )
}
