import { Route, Routes } from "react-router";
import Root from "../layout/Root";
import Home from "../components/Home/Home";
import AdminLogin from "../pages/Admin/Auth/AdminLogin";
import Dashboard from "../pages/Admin/Dashboard";
import AdminLayout from "../layout/AdminLayout";
import NotFound from "../pages/NotFound/NotFound";
import PrivateRoute from "./PrivateRoute";
import Photography from "../pages/Photography/Photography";

import ManagePhotos from "../pages/Admin/Management/ManagePhotos";
import ManageArticles from "../pages/Admin/Management/ManageArticles";
import ManageQuotes from "../pages/Admin/Management/ManageQuotes";
import ManageHero from "../pages/Admin/Management/ManageHero";
import AddCategory from "../pages/Admin/AddNewItem/AddCategory";
import AddArticle from "../pages/Admin/AddNewItem/AddArticles";
import AddPhotography from "../pages/Admin/AddNewItem/AddPhotography";
import CategoryPage from "../pages/Category/CategoryPage";
import ArticleDetails from "../components/Article/ArticleDetails";
import Articles from "../components/Article/Articles";
import AddQuotes from "../pages/Admin/AddNewItem/AddQuotes";
import AddHero from "../pages/Admin/AddNewItem/AddHero";
import ThirdEye from "../pages/ThirdEye/ThirdEye";

const Router = () => {
  return (
    <Routes>
      {/* ════════════════════ PUBLIC ROUTES ════════════════════ */}
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:categorySlug" element={<CategoryPage />} />
        <Route
          path="/articles/:categorySlug/:articleSlug"
          element={<ArticleDetails />}
        />
        <Route path="/thirdeye" element={<ThirdEye />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ════════════════════ ADMIN LOGIN ════════════════════ */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* ════════════════════ ADMIN PRIVATE ROUTES ════════════════════ */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* ── Content (Add New) Routes ── */}
        <Route path="add-category" element={<AddCategory />} />
        <Route path="add-article" element={<AddArticle />} />
        <Route path="add-photography" element={<AddPhotography />} />
        <Route path="add-quotes" element={<AddQuotes />} />
        <Route path="add-hero" element={<AddHero />} />

        {/* ── Management Routes ── */}
        <Route path="management/articles" element={<ManageArticles />} />
        <Route path="management/categories" element={<AddCategory />} />
        <Route path="management/photos" element={<ManagePhotos />} />
        <Route path="management/quotes" element={<ManageQuotes />} />
        <Route path="management/heroes" element={<ManageHero />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Router;
