import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function SiteLayout() {
    return (
        <>
            <Header />
            <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
