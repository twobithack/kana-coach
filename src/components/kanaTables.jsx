import { useContext } from 'react';
import { Button } from '@mui/material';
import { ConfigContext } from './configProvider';
import { gojuon, dakuten, yoon, romanizations } from '../kana';

function KanaDisplay({ data, type })
{
  const [label, mora] = data;
  const [config] = useContext(ConfigContext);

  if (mora === null)
    return <th />

  const playPronunciation = () => 
  { 
    const pronunciation = new Audio(`audio/${config.voice}/${label}.mp3`);
    pronunciation.play();
  };

  return (
    <td>
      <Button 
        variant="contained"
        onClick={playPronunciation}
      >
        {mora[type]}
        <br />
        {romanizations[mora[type]][config.romanization]}
      </Button>
    </td>
  )
}

function KanaTable({ headers, data, type })
{
  return (
    <table>
      <thead>
        <tr>
          <th />
          {headers.map(header => (
            <th>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([label, mora]) => (
          <tr key={label}>
            <th>{label}</th>
            {Object.entries(mora).map((data, index) =>
              <KanaDisplay key={index} data={data} type={type} />
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function KanaTables({ type })
{
  const kanaHeaders = ['a', 'i', 'u', 'e', 'o'];
  const yoonHeaders = ['a', 'u', 'o'];

  return (
    <div className='kanaTables'>
      <div className='label'>
        <h1>{type}</h1>
        <h3>{type === 'hiragana' ? 'ひらがな' : 'カタカナ'}</h3>
      </div>
      <KanaTable 
        headers={kanaHeaders}
        data={gojuon}  
        type={type} 
      />
      <KanaTable 
        headers={kanaHeaders}
        data={dakuten}
        type={type}
      />
      <KanaTable 
        headers={yoonHeaders} 
        data={yoon}
        type={type} 
      />
    </div>
  )
}
