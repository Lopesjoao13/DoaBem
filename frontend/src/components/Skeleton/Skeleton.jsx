import { StyledSkeleton } from './Skeleton.styles.js'

export const Skeleton = ({ width = '100%', height = 16 }) => (
    <StyledSkeleton $width={width} $height={height} aria-hidden="true" />
)
