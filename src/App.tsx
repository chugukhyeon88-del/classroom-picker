import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminPage } from './AdminPage'
import { GamePage } from './GamePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
