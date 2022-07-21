import React from 'react';
import styled from 'styled-components';
import { IconProps } from '../withIconWrapper';
import Card from './Card';

const Wrapper = styled.main`
  margin: 32px 0px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 32px;
`;

type CardsProps = {
  icons: {
    name: string;
    Icon: React.MemoExoticComponent<React.FC<IconProps>>;
  }[];
};

const Cards = React.memo(({ icons }: CardsProps) => (
  <Wrapper>
    {icons.map(({ name, Icon }) => (
      <Card key={name}>
        <div>
          <Icon size='logo' variant='outline' />
          <Icon size='logo' variant='twoTone' />
          <Icon size='logo' variant='fill' />
        </div>
        <div>
          <Icon size='logo' variant='outline' isActive />
          <Icon size='logo' variant='twoTone' isActive />
          <Icon size='logo' variant='fill' isActive />
        </div>
        <span>{name}</span>
      </Card>
    ))}
  </Wrapper>
));
export default Cards;
