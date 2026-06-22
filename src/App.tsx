import { HashRouter, Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import TripList from './pages/TripList'
import TripDetail from './pages/TripDetail'
import Attractions from './pages/Attractions'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-full bg-gray-50 text-gray-900">
        <TopNav />
        <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4">
          <Routes>
            <Route path="/" element={<TripList />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/attractions" element={<Attractions />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
