import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { RegisterVersePage } from './pages/RegisterVersePage'
import { GalleryPage } from './pages/GalleryPage'
import { LearnPage } from './pages/LearnPage'
import { OrganizePage } from './pages/OrganizePage'
import { QuizPage } from './pages/QuizPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cadastrar" element={<RegisterVersePage />} />
      <Route path="/versiculos" element={<GalleryPage />} />
      <Route path="/versiculos/:verseId/aprender" element={<LearnPage />} />
      <Route
        path="/versiculos/:verseId/revisar/organizacao"
        element={<OrganizePage />}
      />
      <Route path="/versiculos/:verseId/revisar/quiz" element={<QuizPage />} />
      <Route path="/configuracoes" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
