import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthGuard } from './components/layout/AuthGuard'
import { AuthPage } from './pages/AuthPage'
import { ClosetPage } from './pages/ClosetPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { OutfitGeneratePage } from './pages/OutfitGeneratePage'
import { SavedOutfitsPage } from './pages/SavedOutfitsPage'
import { OutfitDetailPage } from './pages/OutfitDetailPage'
import { CapsulesPage } from './pages/CapsulesPage'
import { CapsuleDetailPage } from './pages/CapsuleDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="login" element={<AuthPage />} />
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/closet" replace />} />
            <Route path="closet" element={<ClosetPage />} />
            <Route path="closet/:id" element={<ItemDetailPage />} />
            <Route path="outfits/generate" element={<OutfitGeneratePage />} />
            <Route path="outfits/saved" element={<SavedOutfitsPage />} />
            <Route path="outfits/:id" element={<OutfitDetailPage />} />
            <Route path="capsules" element={<CapsulesPage />} />
            <Route path="capsules/:id" element={<CapsuleDetailPage />} />
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  )
}
