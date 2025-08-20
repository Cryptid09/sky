package main

import (
	"fmt"
	"log"
	"net/http"

	"backend/routes"
	"backend/utils"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	// Connect to PostgreSQL
	utils.ConnectDB()

	// Initialize router
	r := mux.NewRouter()

	// API prefix - register all routes under /api
	apiRouter := r.PathPrefix("/api").Subrouter()
	routes.RegisterRoutes(apiRouter)

	// Handle preflight requests for all routes
	r.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		http.NotFound(w, r)
	})

	// Simple health check route
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "✅ API is running and connected to PostgreSQL!")
	}).Methods("GET")

	// Serve uploaded files at /uploads/
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Add CORS middleware and wrap the router
	corsMiddleware := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:8081", "http://localhost:3000", "http://localhost:4173"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-Requested-With"}),
		handlers.AllowCredentials(),
	)

	// Start server with CORS-wrapped router
	fmt.Println("🚀 Server running on http://localhost:8080")
	fmt.Println("📱 API available at http://localhost:8080/api")
	log.Fatal(http.ListenAndServe(":8080", corsMiddleware(r)))
}
