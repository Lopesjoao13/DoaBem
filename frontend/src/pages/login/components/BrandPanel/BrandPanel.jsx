import { IconShieldCheck } from '@tabler/icons-react'
import { Logo } from '@/components/Logo/Logo.jsx'
import {
    Description,
    Eyebrow,
    Facts,
    Footer,
    Headline,
    Hero,
    Lead,
    Panel,
    Term,
} from './BrandPanel.styles.js'

export const BrandPanel = () => (
    <Panel>
        <Logo />

        <Hero>
            <Eyebrow>Gestão que acolhe</Eyebrow>
            <Headline>Doações certas, nas mãos de quem precisa.</Headline>
            <Lead>
                Controle estoque, solicitações e entregas com clareza, segurança e respeito.
            </Lead>
        </Hero>

        <Facts>
            <div>
                <Term>Entradas</Term>
                <Description>Por doador</Description>
            </div>
            <div>
                <Term>Reservas</Term>
                <Description>Na separação</Description>
            </div>
            <div>
                <Term>Histórico</Term>
                <Description>Com estorno</Description>
            </div>
        </Facts>

        <Footer>
            <IconShieldCheck size={18} stroke={2} />
            <span>Rastreabilidade completa de cada doação</span>
        </Footer>
    </Panel>
)
