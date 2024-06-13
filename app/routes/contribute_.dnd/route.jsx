import { useState } from 'react';
import { GridContextProvider, GridDropZone, GridItem, swap, move } from 'react-grid-dnd';

export default function Asdasd() {
  const [items, setItems] = useState({
    left: [
      { id: 1, name: 'ben' },
      { id: 2, name: 'joe' },
      { id: 3, name: 'jason' },
      { id: 4, name: 'chris' },
      { id: 5, name: 'heather' },
      { id: 6, name: 'Richard' },
    ],
    right: [
      { id: 7, name: 'george' },
      { id: 8, name: 'rupert' },
      { id: 9, name: 'alice' },
      { id: 10, name: 'katherine' },
      { id: 11, name: 'pam' },
      { id: 12, name: 'katie' },
    ],
  });

  function onChange(sourceId, sourceIndex, targetIndex, targetId) {
    console.log('ONCHANG');
    if (targetId) {
      const result = move(items[sourceId], items[targetId], sourceIndex, targetIndex);
      return setItems({
        ...items,
        [sourceId]: result[0],
        [targetId]: result[1],
      });
    }

    const result = swap(items[sourceId], sourceIndex, targetIndex);
    return setItems({
      ...items,
      [sourceId]: result,
    });
  }

  return (
    <GridContextProvider onChange={onChange}>
      <div
        style={{ display: 'flex', touchAction: 'none', width: 800, margin: '1rem auto' }}
      >
        <GridDropZone
          style={{ flex: 1, height: 400, backgroundColor: '#aa00ff22' }}
          id="left"
          boxesPerRow={4}
          rowHeight={70}
        >
          {items.left.map(item => (
            <GridItem key={item.name}>
              <div
                style={{
                  width: 100,
                  height: 50,
                  boxSizing: 'border-box',
                  padding: 10,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: 'black',
                }}
              >
                <div className="grid-item-content">{item.name[0].toUpperCase()}</div>
                <p>{item.id}</p>
              </div>
            </GridItem>
          ))}
        </GridDropZone>
        <GridDropZone
          style={{ flex: 1, height: 400, backgroundColor: '#ffff0044' }}
          id="right"
          boxesPerRow={4}
          rowHeight={70}
        >
          {items.right.map(item => (
            <GridItem key={item.name}>
              <div
                style={{
                  width: 100,
                  height: 50,
                  boxSizing: 'border-box',
                  padding: 10,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: 'black',
                }}
              >
                <div className="grid-item-content">{item.name[0].toUpperCase()}</div>
              </div>
            </GridItem>
          ))}
        </GridDropZone>
      </div>
    </GridContextProvider>
  );
}
