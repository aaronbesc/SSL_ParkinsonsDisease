import { useState } from 'react'
import UniversalButton from './components/universalButton'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <UniversalButton onClick = {() => console.log("Hello world")}>Working!</UniversalButton>
      </div>
    </>
  )
}

export default App
