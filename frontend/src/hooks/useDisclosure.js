import { useCallback, useState } from 'react'

export const useDisclosure = () => {
    const [state, setState] = useState({ isOpen: false, payload: null })

    const open = useCallback((payload = null) => {
        setState({ isOpen: true, payload })
    }, [])

    const close = useCallback(() => {
        setState({ isOpen: false, payload: null })
    }, [])

    return { isOpen: state.isOpen, payload: state.payload, open, close }
}
