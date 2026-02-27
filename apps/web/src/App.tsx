import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthGuard } from './components/layout/AuthGuard'
import { AuthPage } from './pages/AuthPage'
import { LandingPage } from './pages/LandingPage'
import { ClosetPage } from './pages/ClosetPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { OutfitGeneratePage } from './pages/OutfitGeneratePage'
import { SavedOutfitsPage } from './pages/SavedOutfitsPage'
import { OutfitDetailPage } from './pages/OutfitDetailPage'
import { CapsulesPage } from './pages/CapsulesPage'
import { CapsuleDetailPage } from './pages/CapsuleDetailPage'
import { WelcomePage } from './pages/WelcomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — public, outside auth and app shell */}
        <Route index element={<LandingPage />} />

        {/* Auth-wrapped routes */}
        <Route element={<AuthGuard />}>
          <Route path="login" element={<AuthPage />} />
          <Route path="welcome" element={<WelcomePage />} />
          <Route element={<AppShell />}>
            <Route path="closet" element={<ClosetPage />} />
            <Route path="closet/:id" element={<ItemDetailPage />} />
            <Route path="outfits/generate" element={<OutfitGeneratePage />} />
            <Route path="outfits/saved" element={<SavedOutfitsPage />} />
            <Route path="outfits/:id" element={<OutfitDetailPage />} />
            <Route path="capsules" element={<CapsulesPage />} />
            <Route path="capsules/:id" element={<CapsuleDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
