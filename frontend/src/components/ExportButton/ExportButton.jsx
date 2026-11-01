import { IconDownload } from '@tabler/icons-react'
import { useState } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { useToast } from '@/hooks/useToast.js'
import { getTodayIso } from '@/utils/dateRange.js'
import { downloadCsv, toCsv } from '@/utils/csv.js'

export const ExportButton = ({ filename, columns, getRows }) => {
    const toast = useToast()
    const [isExporting, setIsExporting] = useState(false)

    const handleClick = async () => {
        setIsExporting(true)
        try {
            const rows = await getRows()
            if (rows.length === 0) {
                toast.error('Não há registros para exportar.')
                return
            }
            downloadCsv(`${filename}-${getTodayIso()}.csv`, toCsv(rows, columns))
        } catch (error) {
            console.error('Falha ao exportar:', error.message)
            toast.error('Não foi possível exportar os dados.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button variant="outline" onClick={handleClick} disabled={isExporting}>
            <IconDownload size={18} stroke={2} />
            {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
    )
}
