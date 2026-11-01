import { useDisclosure } from '@/hooks/useDisclosure.js'

export const useDiscardGuard = ({ isDirty, onClose }) => {
    const confirmation = useDisclosure()

    const requestClose = () => {
        if (isDirty) confirmation.open()
        else onClose()
    }

    return {
        isConfirmingDiscard: confirmation.isOpen,
        requestClose,
        keepEditing: confirmation.close,
        discard: onClose,
    }
}
