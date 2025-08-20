package main

import (
	"fmt"
	"log"

	"backend/models"
	"backend/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func mustHash(p string) string {
	h, err := bcrypt.GenerateFromPassword([]byte(p), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}
	return string(h)
}

func truncateTables(db *gorm.DB) error {
	// add other table names here if you have more models
	sql := `TRUNCATE TABLE users, reports, encroachments, alerts RESTART IDENTITY CASCADE;`
	if err := db.Exec(sql).Error; err != nil {
		// If some tables don't exist, try truncating only users as fallback
		log.Printf("truncate error: %v — attempting to truncate users only", err)
		return db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE;").Error
	}
	return nil
}

func main() {
	utils.ConnectDB()
	db := utils.DB

	fmt.Println("⚠️  This will wipe specified tables and insert demo data. Proceeding...")

	if err := truncateTables(db); err != nil {
		log.Fatalf("failed to truncate tables: %v", err)
	}

	// Create demo users
	users := []models.User{
		{
			Name:     "Demo Admin",
			Email:    "admin@example.com",
			Role:     "admin",
			Password: mustHash("password"),
		},
		{
			Name:     "Demo Officer",
			Email:    "officer@example.com",
			Role:     "officer",
			Password: mustHash("password"),
		},
		{
			Name:     "Bob Citizen",
			Email:    "bob@example.com",
			Role:     "citizen",
			Password: mustHash("password"),
		},
	}

	for _, u := range users {
		if err := db.Create(&u).Error; err != nil {
			log.Fatalf("failed to create user %s: %v", u.Email, err)
		}
	}

	fmt.Println("✅ Seed complete. Users created:")
	var created []models.User
	if err := db.Find(&created).Error; err != nil {
		log.Fatalf("failed to list users: %v", err)
	}
	for _, u := range created {
		fmt.Printf(" - %s (%s) role=%s\n", u.Email, u.Name, u.Role)
	}

	fmt.Println("You can now log in with password: 'password' for the demo users.")
}
