import AddProduct from "~/components/Layout/AddProduct"
import ProductDetail from "~/components/Layout/ProductDetail"
import ManageProducts from "~/components/Layout/ManageProducts"
import AdminDashboard from "~/pages/AdminDashboard"
import Home from "~/pages/Home"
import Inbox from "~/pages/Inbox"
import SignIn from "~/pages/SignIn"
import UserPage from "~/pages/User"
import Cart from "~/components/Layout/Cart"
import Checkout from "~/components/Layout/CheckOut"
import OrdersAdmin from "~/components/Layout/OdersAdmin"
import OrdersUser from "~/components/Layout/OrdersUser"
import AdminRegister from "~/pages/AdminRegister"
import AdminCharts from "~/components/Layout/AdminCharts"


const publicRoutes = [
    
    { path: '/', component: Home},
    { path: '/sign-in', component: SignIn},
    { path: '/user', component: UserPage},
    { path: '/inbox', component: Inbox},
    { path: '/admin', component: AdminDashboard},
    { path: '/admin/register', component: AdminRegister},
    { path: '/admin/add-product', component: AddProduct},
    { path: '/admin/products', component: ManageProducts},
    { path: '/admin/charts', component: AdminCharts},
    { path: '/products/:id', component: ProductDetail},
    { path: '/cart', component: Cart},
    { path: '/checkout', component: Checkout},
    { path: '/admin/orders', component: OrdersAdmin},
    { path: '/orders', component: OrdersUser}

]


const privateRoutes = [

]

export {
    publicRoutes,
    privateRoutes
}
