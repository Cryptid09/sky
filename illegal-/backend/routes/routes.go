
package routes

import (
    "github.com/gorilla/mux"
    "backend/controllers"
)

func RegisterRoutes(router *mux.Router) {
    // Authentication routes
    router.HandleFunc("/auth/login", controllers.LoginUser).Methods("POST")
    router.HandleFunc("/auth/logout", controllers.LogoutUser).Methods("POST")
    router.HandleFunc("/auth/verify", controllers.VerifyToken).Methods("GET")

    // Reports routes (matching frontend expectations)
    router.HandleFunc("/reports", controllers.GetReports).Methods("GET")
    router.HandleFunc("/reports/{id}", controllers.GetReport).Methods("GET")
    router.HandleFunc("/reports", controllers.CreateReport).Methods("POST")
    router.HandleFunc("/reports/{id}/status", controllers.UpdateReportStatus).Methods("PATCH")
    router.HandleFunc("/reports/{id}", controllers.DeleteReport).Methods("DELETE")

    // Encroachments routes
    router.HandleFunc("/encroachments", controllers.GetEncroachments).Methods("GET")
    router.HandleFunc("/encroachments/{id}", controllers.GetEncroachment).Methods("GET")
    router.HandleFunc("/encroachments/{id}/status", controllers.UpdateEncroachmentStatus).Methods("PATCH")
    router.HandleFunc("/encroachments/area", controllers.GetEncroachmentsByArea).Methods("GET")

    // Alerts routes
    router.HandleFunc("/alerts", controllers.GetAlerts).Methods("GET")
    router.HandleFunc("/alerts/{id}/read", controllers.MarkAlertRead).Methods("PATCH")
    router.HandleFunc("/alerts/read-all", controllers.MarkAllAlertsRead).Methods("PATCH")
    router.HandleFunc("/alerts/unread-count", controllers.GetUnreadAlertsCount).Methods("GET")

    // Analytics routes
    router.HandleFunc("/analytics/dashboard", controllers.GetDashboardStats).Methods("GET")
    router.HandleFunc("/analytics/reports/timeline", controllers.GetReportsOverTime).Methods("GET")
    router.HandleFunc("/analytics/encroachments/regions", controllers.GetEncroachmentsByRegion).Methods("GET")

    // Construction routes (existing)
    router.HandleFunc("/constructions", controllers.GetConstructions).Methods("GET")
    router.HandleFunc("/constructions/{id}", controllers.GetConstruction).Methods("GET")
    router.HandleFunc("/constructions", controllers.CreateConstruction).Methods("POST")
    router.HandleFunc("/constructions/{id}", controllers.UpdateConstruction).Methods("PUT")
    router.HandleFunc("/constructions/{id}", controllers.DeleteConstruction).Methods("DELETE")

    // User routes (existing)
    router.HandleFunc("/users", controllers.GetUsers).Methods("GET")
    router.HandleFunc("/users", controllers.CreateUser).Methods("POST")

    // Complaint routes (existing)
    router.HandleFunc("/complaints", controllers.GetComplaints).Methods("GET")
    router.HandleFunc("/complaints", controllers.CreateComplaint).Methods("POST")

    // Property routes (existing)
    router.HandleFunc("/properties", controllers.GetProperties).Methods("GET")
    router.HandleFunc("/properties", controllers.CreateProperty).Methods("POST")
}