import React, { useDeferredValue, useMemo, useState } from 'react';
import styled from 'styled-components';
import Cards from './components/Cards';
import * as icons from './icons';

const Title = styled.h2`
  text-align: center;
`;

const SearchInput = styled.input`
  display: block;
  margin: 0 auto;
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

function App() {
  const [search, setSearch] = useState('');

  const items = useMemo(
    () =>
      Object.entries(icons)
        .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
        .map(([name, Icon]) => ({ name, Icon })),
    [search],
  );

  const deferredItems = useDeferredValue(items);

  return (
    <>
      <Title>Shared Icons</Title>
      <SearchInput
        id='search'
        type='text'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder='Search...'
      />
      <Cards icons={deferredItems} />
    </>
  );
}
export default App;
