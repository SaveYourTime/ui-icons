import styled from 'styled-components';

const Card = styled.div`
  width: 200px;
  padding: 32px 24px;
  border: 1px solid;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  svg {
    transition: transform 0.2s ease-in-out;
    &:not(:first-child) {
      margin-left: 8px;
    }
  }
  span {
    margin-top: 16px;
    word-break: break-all;
    transition: font-weight 0.2s ease-in-out;
  }
  &:hover {
    svg {
      transform: scale(1.2);
    }
    span {
      font-weight: bold;
    }
  }
`;
export default Card;
