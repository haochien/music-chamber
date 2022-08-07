export const checkIsAuth = async () => {
  const res_check_user_auth = await fetch("/api-spotify/check-user-auth")
  const data_check_user_auth = await res_check_user_auth.json()
  return data_check_user_auth.is_auth
}

export const authUser = async () => {
  const res_get_auth_url = await fetch("/api-spotify/get-auth-url")
  const data_get_auth_url = await res_get_auth_url.json()
  window.location.replace(data_get_auth_url.auth_url)
}

export const getSpotifyAccessToken = async () => {
  const res_get_access_token = await fetch("/api-spotify/get-access-token")
  const data_get_access_token = await res_get_access_token.json()
  return data_get_access_token.access_token
}