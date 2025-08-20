package main

import (
    "fmt"
    "log"
    "net/http"

    "github.com/gorilla/mux"
    "github.com/gorilla/handlers"
    "backend/utils"
    "backend/routes"
)

func main() {
    // Connect to PostgreSQL
    utils.ConnectDB()

    // Initialize router
    r := mux.NewRouter()

    // Add CORS middleware
    corsMiddleware := handlers.CORS(
        handlers.AllowedOrigins([]string{"http://localhost:5173", "http://localhost:3000", "http://localhost:4173"}),
        handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"}),
        handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-Requested-With"}),
        handlers.AllowCredentials(),
    )

    // Apply CORS middleware
    r.Use(corsMiddleware)

    // API prefix - register all routes under /api
    apiRouter := r.PathPrefix("/api").Subrouter()
    routes.RegisterRoutes(apiRouter)

    // Simple health check route
    r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "✅ API is running and connected to PostgreSQL!")
    }).Methods("GET")

    // Start server
    fmt.Println("🚀 Server running on http://localhost:8080")
    fmt.Println("📱 API available at http://localhost:8080/api")
    log.Fatal(http.ListenAndServe(":8080", r))
}