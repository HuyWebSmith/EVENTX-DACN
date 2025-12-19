import HomePage from "../pages/HomePage/HomePage";
import OrderPage from "../pages/OrderPage/OrderPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import AdminPage from "../pages/AdminPage/AdminPage";
import UserPage from "../pages/UserPage/UserPage";
import TicketBookingPage from "../pages/TicketBookingPage/TicketBookingPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import OrderSuccessPage from "../pages/OrderSuccessPage/OrderSuccessPage";
import EventOrdersPage from "../pages/EventOrdersPage/EventOrdersPage";
import CheckInPage from "../pages/CheckInPage/CheckInPage";
import EventTicketsPage from "../pages/EventTicketsPage/EventTicketsPage";
import EventFilterPage from "../pages/EventFilterPage/EventFilterPage";
import CheckInFaceId from "../pages/CheckInFaceId/CheckInFaceId";
import WalletPage from "../pages/WalletPage/WalletPage";
import VerifyEmailPage from "../pages/VerifyEmailPage/VerifyEmailPage";
import WithdrawPage from "../pages/WithdrawPage/WithdrawPage";
import WalletHistoryPage from "../pages/WalletHistoryPage/WalletHistoryPage";

export const routes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
  },
  {
    path: "/order",
    page: OrderPage,
    isShowHeader: true,
  },
  {
    path: "/products",
    page: ProductsPage,
    isShowHeader: true,
  },
  {
    path: "/system/admin",
    page: AdminPage,
    isShowHeader: false,
    isPrivate: true,
  },
  {
    path: "/system/user",
    page: UserPage,
    isShowHeader: false,
  },
  {
    path: "/sign-in",
    page: SignInPage,
    isShowHeader: false,
  },
  {
    path: "/sign-up",
    page: SignUpPage,
    isShowHeader: false,
  },
  {
    path: "/product-details/:id",
    page: ProductDetailPage,
    isShowHeader: true,
  },
  {
    path: "/profile-user",
    page: ProfilePage,
    isShowHeader: true,
  },
  {
    path: "/type/:type",
    page: TypeProductPage,
    isShowHeader: true,
  },
  {
    path: "/event/:eventId/book",
    page: TicketBookingPage,
    isShowHeader: true,
  },
  {
    path: "*",
    page: NotFoundPage,
  },
  {
    path: "/checkout",
    page: CheckoutPage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/order-success/:orderId",
    page: OrderSuccessPage,
    isShowHeader: true,
  },
  {
    path: "/event/:eventId/orders",
    page: EventOrdersPage,
    isShowHeader: true,
  },
  {
    path: "/check-in/:eventId",
    page: CheckInPage,
    isShowHeader: false,
    isPrivate: false,
  },
  {
    path: "/check-in-face/:eventId",
    page: CheckInFaceId,
    isShowHeader: false,
    isPrivate: false,
  },

  {
    path: "/event/:eventId/tickets",
    page: EventTicketsPage,
    isShowHeader: true,
  },
  {
    path: "/events",
    page: EventFilterPage,
    isShowHeader: true,
  },
  {
    path: "/wallet",
    page: WalletPage,
    isShowHeader: true,
  },
  {
    path: "/wallet/withdraw",
    page: WithdrawPage,
    isShowHeader: true,
  },

  {
    path: "/verify-email",
    page: VerifyEmailPage,
    isShowHeader: false,
  },
  {
    path: "/wallet/history",
    page: WalletHistoryPage,
    isShowHeader: true,
    isPrivate: true,
  },
];
