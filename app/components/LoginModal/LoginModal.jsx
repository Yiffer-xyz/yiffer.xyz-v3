import { useState } from 'react';
import TopGradientBox from '../TopGradientBox';
import Login from './Login';

export default function LoginModal() {
  const [mode, setMode] = useState('login');

  return (
    <div>
      <div
        className="w-full h-full fixed top-0 left-0 z-10 hover:cursor-pointer"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      />
      <TopGradientBox
        className="fixed top-1/2 left-1/2 z-20 flex content-center px-4 sm:py-10
          sm:px-40 shadow-xl transform -translate-x-1/2 -translate-y-1/2"
      >
        {mode === 'login' && <Login setMode={setMode} />}
        {/* todo signup and forgotten password */}
      </TopGradientBox>
    </div>
  );
}
