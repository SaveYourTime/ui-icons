import React, { SVGProps } from 'react';
import styled from 'styled-components';

const IconSize = {
  small: '12px',
  medium: '16px',
  original: '20px',
  navigation: '22px',
  large: '24px',
  logo: '28px',
} as const;

export interface IconProps extends SVGProps<SVGSVGElement> {
  actionable?: boolean;
  isActive?: boolean;
  size?: keyof typeof IconSize;
  transparent?: boolean;
  variant?: 'fill' | 'outline' | 'twoTone';
}

type StyledIconProps = Omit<IconProps, 'isActive'> & { $isActive?: boolean };

export const withStyled = (
  WrappedComponent: React.FC<SVGProps<SVGSVGElement>>,
) => styled(WrappedComponent)<StyledIconProps>`
  font-size: ${({ size = 'medium' }) => IconSize[size]};
  color: ${({ $isActive }) => $isActive && '#006fff'};
  opacity: ${({ transparent }) => transparent && 0.35};
  cursor: ${({ actionable }) => actionable && 'pointer'};
  &:hover {
    color: ${({ actionable }) => actionable && '#a4a7b5'};
  }
  [class='filled'] {
    display: ${({ variant }) => variant !== 'fill' && 'none'};
  }
  [class='outlined'] {
    display: ${({ variant }) => variant === 'fill' && 'none'};
  }
  [class='twoToned'] {
    display: ${({ variant, $isActive }) =>
      (variant !== 'twoTone' || !$isActive) && 'none'};
    color: ${({ $isActive }) => $isActive && '#e5f1ff'};
  }
`;

const withIconWrapper =
  (WrappedComponent: React.FC<StyledIconProps>) =>
  ({ isActive, ...restProps }: IconProps) =>
    <WrappedComponent $isActive={isActive} {...restProps} />;
export default withIconWrapper;
