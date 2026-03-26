import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminLayout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Posts from './pages/Posts'
import PostEditor from './pages/PostEditor'
import Categories from './pages/Categories'
import Tags from './pages/Tags'
import Comments from './pages/Comments'
import Media from './pages/Media'
import Resources from './pages/Resources'
import Settings from './pages/Settings'
import FriendLinks from './pages/FriendLinks'
import Series from './pages/Series'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/create" element={<PostEditor />} />
        <Route path="posts/edit/:id" element={<PostEditor />} />
        <Route path="categories" element={<Categories />} />
        <Route path="tags" element={<Tags />} />
        <Route path="comments" element={<Comments />} />
        <Route path="media" element={<Media />} />
        <Route path="resources" element={<Resources />} />
        <Route path="friend-links" element={<FriendLinks />} />
        <Route path="series" element={<Series />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App