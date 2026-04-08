import DashboardLayout from "@/layout/DashboardLayout.vue";
import MainLayout from "@/layout/MainLayout.vue";
import Dashboard from "@/pages/Admin/Dashboard.vue";
import Products from "@/pages/Admin/Products.vue";
import Reseller from "@/pages/Admin/Reseller.vue";
import Settings from "@/pages/Admin/Settings.vue";
import FindReseller from "@/pages/FindReseller.vue";
import FrontReseller from "@/pages/FrontReseller.vue";
import Home from "@/pages/Home.vue";
import HomeReal from "@/pages/HomeReal.vue";
import Login from "@/pages/Login.vue";
import Menu from "@/pages/Menu.vue";
import NotFound from "@/pages/NotFound.vue";
import ShoppingCart from "@/pages/ShoppingCart.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
    { path: "/menu", component: Menu },
    { path: "/find-reseller", component: FindReseller },
    { path: "/register-reseller", component: FrontReseller },
    { path: "/login", component: Login },

    { path: "/cart", name: 'Cart', component: ShoppingCart },
{ 
        path: "/", 
        component: MainLayout, 
        children: [
            { path: '', name: 'Home', component: HomeReal },
        ] 
    },
    
    /* Dashboard */
    {
        path: '/admin',
        component: DashboardLayout, // <-- The parent layout

        meta: { requiresAuth: true },
        children: [
        {
            path: '', // Matches /admin directly
            name: 'AdminDashboard',
            component: Dashboard,
 
 
 
 
 
 
 
 
        },
        {
            path: 'products', // Matches /admin/products
            name: 'AdminProducts',
            component: Products,
        },
        {
            path: 'resellers', // Matches /admin/resellers
            name: 'AdminResellers',
            component: Reseller,
        },
        {
            path: 'settings', // Matches /admin/settings
            name: 'AdminSettings',
            component: Settings,
        },
        ],
    },


    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },

]

export default createRouter({
    history: createWebHistory(),
    routes,
})