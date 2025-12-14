import { Routes, Route, Navigate } from "react-router-dom";

// layouts
import SiteLayout from "./layouts/SiteLayout";
import AdminShell from "./admin/AdminShell";

// site pages
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Shifts from "./pages/Shifts";
import Team from "./pages/Team";
import Contacts from "./pages/Contacts";
import Gallery from "./pages/Gallery";
import GalleryAlbum from "./pages/GalleryAlbum";

// admin
import AdminLogin from "./admin/AdminLogin";
import PrivateRoute from "./admin/PrivateRoute";
import ContentEditor from "./admin/ContentEditor";
import ShiftEditor from "./admin/ShiftEditor";
import BookingsAdmin from "./admin/BookingsAdmin";
import UsersPage from "./admin/UsersPage";
import ContactsEditor from "./admin/ContactsEditor";
import TeamEditor from "./admin/TeamEditor";
import GalleryAdmin from "./admin/GalleryAdmin";

export default function App() {
    return (
        <Routes>

            {/* ================= SITE ================= */}
            <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/shifts" element={<Shifts />} />
                <Route path="/team" element={<Team />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/:id" element={<GalleryAlbum />} />
                <Route path="/contacts" element={<Contacts />} />
            </Route>

            {/* ================= ADMIN LOGIN ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ================= ADMIN (PROTECTED) ================= */}
            <Route
                path="/admin"
                element={
                    <PrivateRoute>
                        <AdminShell />
                    </PrivateRoute>
                }
            >
                <Route index element={<ShiftEditor />} />
                <Route path="content" element={<ContentEditor />} />
                <Route path="contacts" element={<ContactsEditor />} />
                <Route path="team" element={<TeamEditor />} />
                <Route path="gallery" element={<GalleryAdmin />} />
                <Route path="bookings" element={<BookingsAdmin />} />
                <Route path="users" element={<UsersPage />} />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
