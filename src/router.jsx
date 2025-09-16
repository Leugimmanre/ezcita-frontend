// src/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import AppLayout from "@/layouts/AppLayout.jsx";
import LoginView from "@/views/authViews/LoginView.jsx";
import RegistrationView from "@/views/authViews/RegistrationView";
import ResetPasswordView from "@/views/authViews/ResetPasswordView";
import VerifyView from "@/views/authViews/VerifyView";
import AppointmentsLayout from "@/layouts/AppointmentsLayout";
import NewAppointmentLayout from "@/layouts/NewAppointmentLayout";
import AppointmentView from "@/views/servicesViews/AppointmentView";
import GenerateTimeSlotsView from "@/views/settingsViews/GenerateTimeSlotsView";
import ServicesView from "@/views/servicesViews/ServicesView";
import SettingsHomeView from "@/views/settingsViews/SettingsHomeView";
import SettingsLayout from "@/layouts/SettingsLayout";
import MyAppointmentsView from "@/views/appointments/MyAppointmentsView";
import ForgotPasswordView from "@/views/authViews/ForgotPasswordView";
import UsersView from "./views/usersView/UsersView";
import EditAppointmentView from "@/views/appointments/EditAppointmentView";
import SettingsStaffView from "@/views/settingsViews/SettingsStaffView";
import SettingsAppointmentsView from "@/views/settingsViews/SettingsAppointmentsView";
import AdminRoute from "@/components/authComponents/AdminRoute";
import ProtectedRoute from "@/components/authComponents/ProtectedRoute";
import GuestRoute from "@/components/authComponents/GuestRoute";
import SupportView from "@/views/authViews/SupportView";
import SettingsServicesView from "@/views/settingsViews/SettingsServicesView";
import BrandSettingsPageView from "@/views/authViews/BrandSettingsPageView";
import UserDetailsView from "@/views/usersView/UserDetailsView";
import MyProfileView from "@/views/usersView/MyProfileView";
import MyAppointmentsHistoryView from "@/views/appointments/MyAppointmentsHistoryView";
import AdminMyAppointmentsHistoryView from "@/views/settingsViews/AdminMyAppointmentsHistoryView";
import AdminStatsDashboardView from "@/views/settingsViews/AdminStatsDashboardView";
import TermsAndConditionsUseView from "./views/settingsViews/TermsAndConditionsUseView";
import PrivacyPolicyView from "./views/settingsViews/PrivacyPolicyView";
import AdminLegalEditorView from "./views/settingsViews/AdminLegalEditorView";

export const router = createBrowserRouter([
  // Páginas legales (públicas)
  { path: "/legal/terms", element: <TermsAndConditionsUseView /> },
  { path: "/legal/privacy", element: <PrivacyPolicyView /> },

  // Auth (solo para invitados)
  {
    path: "/",
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { index: true, element: <LoginView /> },
      { path: "registration", element: <RegistrationView /> },
      { path: "forgot-password", element: <ForgotPasswordView /> },
      { path: "reset-password", element: <ResetPasswordView /> },
      { path: "reset-password/:token", element: <ResetPasswordView /> },
      { path: "verify", element: <VerifyView /> },
      { path: "support", element: <SupportView /> },
    ],
  },

  // Citas (requieren sesión)
  {
    path: "appointments",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "new",
        element: <NewAppointmentLayout />,
        children: [
          { index: true, element: <ServicesView /> },
          { path: "details", element: <AppointmentView /> },
        ],
      },
      { path: "edit/:id", element: <EditAppointmentView /> },
      {
        path: "my-appointments",
        element: <AppointmentsLayout />,
        children: [{ index: true, element: <MyAppointmentsView /> }],
      },
      { path: "history", element: <MyAppointmentsHistoryView /> },
    ],
  },

  // Configuración (admin)
  {
    path: "/settings",
    element: <AdminRoute />, // AdminRoute ya envuelve con <ProtectedRoute/>
    children: [
      {
        element: <SettingsLayout />,
        children: [
          { index: true, element: <AdminStatsDashboardView /> },
          { path: "configurations", element: <SettingsHomeView /> },
          { path: "generate-time-slots", element: <GenerateTimeSlotsView /> },
          { path: "services", element: <SettingsServicesView /> },
          { path: "staff", element: <SettingsStaffView /> },
          { path: "appointments", element: <SettingsAppointmentsView /> },
          { path: "users", element: <UsersView /> },
          { path: "users/:id", element: <UserDetailsView /> },
          { path: "brand", element: <BrandSettingsPageView /> },
          { path: "profile", element: <MyProfileView /> },
          { path: "history", element: <AdminMyAppointmentsHistoryView /> },
          { path: "legal", element: <AdminLegalEditorView /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
