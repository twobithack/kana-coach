import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Icon, IconButton } from '@mui/material';
import { ConfigContext } from './configProvider';
import { romanizations } from '../kana';
import * as data from '../userData';

function getRandomKana(questions)
{
  const kanaWeights = Object.entries(data.loadWeights())
                            .filter(([kana]) => questions.includes(kana));       
  const totalWeight = kanaWeights.reduce((sum, [_, weight]) => sum + weight, 0);
  
  let randomIndex = Math.random() * totalWeight;
  for (const [kana, weight] of kanaWeights)
  {
    randomIndex -= weight;
    if (randomIndex <= 0)
      return kana;
  }

  return kanaWeights.pop()[0];
}

function Quiz({ questions })
{
  const [config] = useContext(ConfigContext);

  const [input, setInput] = useState('');
  const [kana, setKana] = useState(getRandomKana(questions));
  const [missed, setMissed] = useState(false);
  const [mute, setMute] = useState(true);

  const containerRef = useRef();
  const inputRef = useRef();

  const romaji = romanizations[kana];
  const pronunciation = new Audio(`audio/${config.voice}/${romaji.nihon}.mp3`);

  useEffect(() => 
  {
    const focusInput = () => inputRef.current.focus({ preventScroll: true });
    containerRef.current.addEventListener('click', focusInput);
    focusInput();
  });

  const toggleMute = () => setMute(!mute);

  const handleRightAnswer = () =>
  {
    if (!missed)
      data.decreaseWeight(kana);

    setKana(getRandomKana(questions));
    setMissed(false);
    setInput('');
  };

  const handleWrongAnswer = () =>
  {
    if (!missed)
      data.increaseWeight(kana);

    if (!mute)
      pronunciation.play();
    
    setMissed(true);
    setInput('');
  };

  const handleInput = (event) => 
  {
    const isRightAnswer = (answer) => Object.values(romaji).includes(answer);
    const value = event.target.value.toLowerCase().trim();

    if (value === 'n' && 
        isRightAnswer(value))
    {
        handleRightAnswer();
        return;
    }

    if (value.length === 3 ||
        ['a', 'e', 'i', 'o', 'u'].includes(value.charAt(value.length - 1)))
    {
      if (isRightAnswer(value))
        handleRightAnswer();
      else
        handleWrongAnswer();
      return;
    }

    setInput(value);
  };

  return (
    <div 
      className="quiz"
      ref={containerRef}
    >
      <IconButton onClick={toggleMute}>
        <Icon>
          { mute ? 'volume_off' : 'volume_up' }
        </Icon>
      </IconButton>
      <div key={kana} className="prompt">{kana}</div>
      <input 
        className="answer"
        type="text"
        value={input}
        ref={inputRef}
        placeholder={missed ? romaji[config.romanization] : ''}
        onChange={handleInput}
        autoComplete="nope"
      />
    </div>
  )
}

function QuizSelect({ setQuestions })
{
  const selectFullPractice = () => setQuestions(Object.keys(romanizations));
  const selectHiraganaPractice = () => setQuestions(Object.keys(romanizations).slice(0, 107));
  const selectKatakanaPractice = () => setQuestions(Object.keys(romanizations).slice(107, 214));
  const selectErrorPractice = () => {
    const weights = Object.entries(data.loadWeights());
    weights.sort((a, b) => b[1] - a[1]);
    setQuestions(weights.slice(0, 10).map(entry => entry[0]));
  };

  return (
    <div className="quizSelect">
      <h1>Practice Menu</h1>
      <Button 
        variant="contained"
        onClick={selectFullPractice}
      >
        Full Practice
      </Button>
      <Button 
        variant="contained"
        onClick={selectHiraganaPractice}
      >
        Hiragana Practice
      </Button>
      <Button 
        variant="contained"
        onClick={selectKatakanaPractice}
      >
        Katakana Practice
      </Button>
      <Button 
        variant="contained"
        onClick={selectErrorPractice}
      >
        Mistake Practice
      </Button>
    </div>
  )
}

export default function KanaQuiz()
{
  const [questions, setQuestions] = useState([]);

  if (questions.length === 0)
    return <QuizSelect setQuestions={setQuestions} />

  return <Quiz questions={questions} />
}
