import { Modal, CircularProgress, Backdrop } from '@mui/material'

const LoadingModal = ({ open }: { open: boolean }) => {
  return (
    <Modal
      open={open}
      disableAutoFocus
      disableEscapeKeyDown
      closeAfterTransition
    >
      <Backdrop open={open} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <CircularProgress size={100} className='loading' />
      </Backdrop>
    </Modal>
  )
}

export default LoadingModal
