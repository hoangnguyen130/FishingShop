import AddProduct from "~/components/Layout/AddProduct"
import ProductDetail from "~/components/Layout/ProductDetail"
import ManageProducts from "~/components/Layout/ManageProducts"
import EditProduct from "~/components/Layout/EditProduct"
import AdminDashboard from "~/pages/AdminDashboard"
import Home from "~/pages/Home"
import SignIn from "~/pages/SignIn"
import Register from "~/components/Layout/Register"
import UserPage from "~/pages/User"
import Cart from "~/components/Layout/Cart"
import Checkout from "~/components/Layout/CheckOut"
import OrdersAdmin from "~/components/Layout/OrdersAdmin"
import OrdersUser from "~/components/Layout/OrdersUser"
import AdminRegister from "~/pages/AdminRegister"
import AdminCharts from "~/components/Layout/AdminCharts"
import FishingRods from '../pages/FishingRods'
import FishingGear from '../pages/FishingGear'
import Accessories from '../pages/Accessories'
import FishingBait from '../pages/FishingBait'
import DefaultLayout from "~/components/Layout/DefaultLayout"
import SearchResults from "~/components/Layout/SearchResults"
import InventoryManagement from "~/components/Layout/InventoryManagement"
import ManageDiscountedProducts from '../components/Layout/ManageDiscountedProducts'


const publicRoutes = [
    { 
        path: '/', 
        component: Home,
        layout: DefaultLayout
    },
    { 
        path: '/cancau', 
        component: FishingRods,
        layout: DefaultLayout
    },
    { 
        path: '/docau', 
        component: FishingGear,
        layout: DefaultLayout
    },
    { 
        path: '/phukien', 
        component: Accessories,
        layout: DefaultLayout
    },
    { 
        path: '/moicau', 
        component: FishingBait,
        layout: DefaultLayout
    },
    { 
        path: '/search', 
        component: SearchResults,
        layout: DefaultLayout
    },
    { path: '/sign-in', component: SignIn},
    { path: '/register', component: Register},
    { path: '/user', component: UserPage},
    { path: '/admin/dashboard', component: AdminDashboard},
    { path: '/admin/register', component: AdminRegister},
    { path: '/admin/add-product', component: AddProduct},
    { path: '/admin/products', component: ManageProducts},
    { path: '/admin/products/edit/:id', component: EditProduct},
    { path: '/admin/charts', component: AdminCharts},
    { path: '/products/:id', component: ProductDetail},
    { path: '/cart', component: Cart},
    { path: '/checkout', component: Checkout},
    { path: '/admin/orders', component: OrdersAdmin},
    { path: '/orders', component: OrdersUser},
    { path: '/admin/inventory', component: InventoryManagement},
    { path: '/admin/discounted-products', component: ManageDiscountedProducts },
]

const privateRoutes = []

export {
    publicRoutes,
    privateRoutes
}
