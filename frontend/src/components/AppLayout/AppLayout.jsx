import { Outlet } from 'react-router-dom'
import { SideBar } from '@/components/SideBar/SideBar.jsx'
import { TopBar } from '@/components/TopBar/TopBar.jsx'
import { Body, Content, Main, Shell } from './AppLayout.styles.js'

export const AppLayout = () => (
    <Shell>
        <TopBar />
        <Body>
            <SideBar />
            <Main>
                <Content>
                    <Outlet />
                </Content>
            </Main>
        </Body>
    </Shell>
)
