import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductTypes from './pages/ProductTypes';
import Materials from './pages/Materials';
import MaterialStyles from './pages/MaterialStyles';
import Frames from './pages/Frames';
import Wallpapers from './pages/Wallpapers';
import AddBorders from './pages/AddBorders';
import LollipopElements from './pages/LollipopElements';
import Pylons from './pages/Pylons';
import Bases from './pages/Bases';
import Thicknesses from './pages/Thicknesses';
import ImageAssets from './pages/ImageAssets';
import Elements from './pages/Elements';
import Fonts from './pages/Fonts';
import FontSizes from './pages/FontSizes';
import LetterStyles from './pages/LetterStyles';
import IlluminationOptions from './pages/IlluminationOptions';
import DimensionUnits from './pages/DimensionUnits';
import ShippingServices from './pages/ShippingServices';
import ListedProducts from './pages/ListedProducts';
import Colors from './pages/Colors';
import ShadowColors from './pages/ShadowColors';
import BorderColors from './pages/BorderColors';
import BaseColors from './pages/BaseColors';
import Vendors from './pages/Vendors';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import CmsPages from './pages/CmsPages';

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isSuperAdmin = roles.includes('super_admin');
  if (!isAuthenticated || !isSuperAdmin) return <Navigate to="/login" replace />;
  return children;
}

function LoginRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isSuperAdmin = roles.includes('super_admin');
  if (isAuthenticated && isSuperAdmin) return <Navigate to="/" replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="product-types" element={<ProductTypes />} />
          <Route path="materials" element={<Materials />} />
          <Route path="material-styles" element={<MaterialStyles />} />
          <Route path="frames" element={<Frames />} />
          <Route path="wallpapers" element={<Wallpapers />} />
          <Route path="add-borders" element={<AddBorders />} />
          <Route path="lollipop-elements" element={<LollipopElements />} />
          <Route path="pylons" element={<Pylons />} />
          <Route path="bases" element={<Bases />} />
          <Route path="thicknesses" element={<Thicknesses />} />
          <Route path="image-assets" element={<ImageAssets />} />
          <Route path="elements" element={<Elements />} />
          <Route path="fonts" element={<Fonts />} />
          <Route path="font-sizes" element={<FontSizes />} />
          <Route path="letter-styles" element={<LetterStyles />} />
          <Route path="illumination-options" element={<IlluminationOptions />} />
          <Route path="dimension-units" element={<DimensionUnits />} />
          <Route path="shipping-services" element={<ShippingServices />} />
          <Route path="listed-products" element={<ListedProducts />} />
          <Route path="colors" element={<Colors />} />
          <Route path="shadow-colors" element={<ShadowColors />} />
          <Route path="border-colors" element={<BorderColors />} />
          <Route path="base-colors" element={<BaseColors />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="cms-pages" element={<CmsPages />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
