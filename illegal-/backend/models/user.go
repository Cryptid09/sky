package models

import "gorm.io/gorm"

// User represents a system user (official or citizen)
type User struct {
    gorm.Model
    Name     string `json:"name"`
    Email    string `json:"email" gorm:"unique"`
    Role     string `json:"role"` // "citizen", "officer", "admin"
    Password string `json:"password"` // hashed
}