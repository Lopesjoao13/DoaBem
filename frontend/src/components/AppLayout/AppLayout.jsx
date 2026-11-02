import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar/Sidebar.jsx'
import { TopBar } from '@/components/TopBar/TopBar.jsx'
import { STORAGE_KEYS } from '@/constants/storageKeys.js'
import { useCollapsed } from '@/hooks/useCollapsed.js'
import { Body, Content, Main, Shell } from './AppLayout.styles.js'

export const AppLayout = () => {
    const sidebar = useCollapsed(STORAGE_KEYS.SIDEBAR_COLLAPSED)

    return (
        <Shell>
            <TopBar />
            <Body $isCollapsed={sidebar.isCollapsed}>
                <Sidebar isCollapsed={sidebar.isCollapsed} onToggle={sidebar.toggle} />
                <Main>
                    <Content>
                        <Outlet />
                    </Content>
                </Main>
            </Body>
        </Shell>
    )
}
