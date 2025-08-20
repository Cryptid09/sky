package controllers

import (
    "encoding/json"
    "net/http"
    "time"
    "backend/models"
    "backend/utils"
    "golang.org/x/crypto/bcrypt"
    "github.com/golang-jwt/jwt/v5"
    "fmt"
)

var jwtSecret = []byte("your-secret-key-change-in-production")

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
    Role     string `json:"role"`
}

type LoginResponse struct {
    Token string `json:"token"`
    User  struct {
        ID    string `json:"id"`
        Email string `json:"email"`
        Role  string `json:"role"`
        Name  string `json:"name"`
    } `json:"user"`
}

func LoginUser(w http.ResponseWriter, r *http.Request) {
    var loginReq LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Find user by email
    var user models.User
    if err := utils.DB.Where("email = ?", loginReq.Email).First(&user).Error; err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    // Check password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password)); err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    // Check role if specified
    if loginReq.Role != "" && user.Role != loginReq.Role {
        http.Error(w, "Invalid role", http.StatusUnauthorized)
        return
    }

    // Generate JWT token
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "email":   user.Email,
        "role":    user.Role,
        "exp":     time.Now().Add(time.Hour * 24).Unix(),
    })

    tokenString, err := token.SignedString(jwtSecret)
    if err != nil {
        http.Error(w, "Failed to generate token", http.StatusInternalServerError)
        return
    }

    // Prepare response
    response := LoginResponse{
        Token: tokenString,
        User: struct {
            ID    string `json:"id"`
            Email string `json:"email"`
            Role  string `json:"role"`
            Name  string `json:"name"`
        }{
            ID:    fmt.Sprintf("%d", user.ID),
            Email: user.Email,
            Role:  user.Role,
            Name:  user.Name,
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func LogoutUser(w http.ResponseWriter, r *http.Request) {
    // In a stateless JWT system, logout is handled client-side
    // But we can add token to a blacklist if needed
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func VerifyToken(w http.ResponseWriter, r *http.Request) {
    // Extract token from Authorization header
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "No authorization header", http.StatusUnauthorized)
        return
    }

    // Remove "Bearer " prefix
    if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
        http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
        return
    }
    tokenString := authHeader[7:]

    // Parse and validate token
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })

    if err != nil || !token.Valid {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]bool{"valid": true})
} 