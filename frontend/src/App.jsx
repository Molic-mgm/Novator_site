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
import About from "./pages/About";
import Programs from "./pages/Programs";
import Parents from "./pages/Parents";
import Documents from "./pages/Documents";
import Vacancies from "./pages/Vacancies";

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
import SiteContentEditor from "./admin/SiteContentEditor";
import VacanciesAdmin from "./admin/VacanciesAdmin";
import AuditLogPage from "./admin/AuditLogPage";

export default function App() {
    return (
        <Routes>

            {/* ================= SITE ================= */}
            <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/shifts" element={<Shifts />} />
                <Route path="/about" element={<About />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/parents" element={<Parents />} />
                <Route path="/team" element={<Team />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/:id" element={<GalleryAlbum />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/vacancies" element={<Vacancies />} />
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
                <Route path="site" element={<SiteContentEditor />} />
                <Route path="contacts" element={<ContactsEditor />} />
                <Route path="team" element={<TeamEditor />} />
                <Route path="gallery" element={<GalleryAdmin />} />
                <Route path="bookings" element={<BookingsAdmin />} />
                <Route path="vacancies" element={<VacanciesAdmin />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="audit" element={<AuditLogPage />} />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
