import { forwardRef } from 'react'
import { Snackbar  } from '@mui/material'
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function MsgBar({ showMsg, msgType, duration, msgContent, switchMsgBar }) {
  
  return (
    <Snackbar
      autoHideDuration={duration}
      open={showMsg}
      message="test"
      onClose={() => switchMsgBar(false)}
      anchorOrigin={{vertical:'top', horizontal:'center'}}
    >
      <Alert onClose={() => switchMsgBar(false)} severity={msgType} sx={{ width: '100%' }}>
        {msgContent}
      </Alert>
    </Snackbar>
  )
}
