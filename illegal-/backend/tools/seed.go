package main

import (
	"fmt"
	"log"

	"backend/models"
	"backend/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func main() {
	utils.ConnectDB()
	db := utils.DB

	fmt.Println("⚠️  This will add demo domain data if missing (won't delete existing data). Proceeding...")

	// Create demo properties (use OwnerName+Address as uniqueness key)
	properties := []models.Property{
		{
			OwnerName: "Alice Owner",
			Address:   "123 Main St, Sample City",
			Area:      250.5,
			LandUse:   "residential",
		},
		{
			OwnerName: "Bob Holdings",
			Address:   "456 Market Rd, Sample City",
			Area:      1200.0,
			LandUse:   "commercial",
		},
	}

	for i := range properties {
		var p models.Property
		// find by owner+address, create if not exists
		if err := db.Where("owner_name = ? AND address = ?", properties[i].OwnerName, properties[i].Address).
			FirstOrCreate(&p, properties[i]).Error; err != nil {
			log.Fatalf("failed to create/find property %d: %v", i, err)
		}
		properties[i] = p
	}

	// Create demo constructions linked to properties (use Location as uniqueness)
	constructions := []models.Construction{
		{
			Location:        "Plot A - Near river",
			Latitude:        37.7749,
			Longitude:       -122.4194,
			Status:          "illegal",
			DetectionSource: "drone",
			PropertyID:      properties[0].ID,
		},
		{
			Location:        "Plot B - Market side",
			Latitude:        37.7755,
			Longitude:       -122.4189,
			Status:          "legal",
			DetectionSource: "manual",
			PropertyID:      properties[1].ID,
		},
	}

	for i := range constructions {
		var c models.Construction
		if err := db.Where("location = ?", constructions[i].Location).
			FirstOrCreate(&c, constructions[i]).Error; err != nil {
			log.Fatalf("failed to create/find construction %d: %v", i, err)
		}
		constructions[i] = c
	}

	// Create demo complaints (avoid duplicates by citizen email + construction id + description)
	complaints := []models.Complaint{
		{
			UserID:         0,
			ConstructionID: constructions[0].ID,
			CitizenName:    "Charlie Citizen",
			CitizenEmail:   "charlie@example.com",
			Location:       constructions[0].Location,
			Description:    "Unauthorized extension built near riverbank.",
			Status:         "pending",
		},
		{
			UserID:         0,
			ConstructionID: constructions[1].ID,
			CitizenName:    "Dana Resident",
			CitizenEmail:   "dana@example.com",
			Location:       constructions[1].Location,
			Description:    "Construction appears within permitted area but noisy at night.",
			Status:         "pending",
		},
	}

	for i := range complaints {
		var comp models.Complaint
		if err := db.Where("citizen_email = ? AND construction_id = ? AND description = ?",
			complaints[i].CitizenEmail, complaints[i].ConstructionID, complaints[i].Description).
			FirstOrCreate(&comp, complaints[i]).Error; err != nil {
			log.Fatalf("failed to create/find complaint %d: %v", i, err)
		}
		complaints[i] = comp
	}

	// Create demo alerts (avoid duplicates by title + location)
	alerts := []models.Alert{
		{
			Title:       "Illegal construction reported",
			Description: "New illegal construction detected near river.",
			Location:    constructions[0].Location,
			Status:      "open",
			IsRead:      false,
		},
		{
			Title:       "Inspection scheduled",
			Description: "Inspection for Plot B scheduled tomorrow.",
			Location:    constructions[1].Location,
			Status:      "open",
			IsRead:      false,
		},
	}

	for i := range alerts {
		var a models.Alert
		if err := db.Where("title = ? AND location = ?", alerts[i].Title, alerts[i].Location).
			FirstOrCreate(&a, alerts[i]).Error; err != nil {
			log.Fatalf("failed to create/find alert %d: %v", i, err)
		}
		alerts[i] = a
	}

	// Ensure an admin user exists (won't overwrite existing users)
	adminEmail := "admin@example.com"
	adminPassword := "password" // change for production

	var existing models.User
	if err := db.Where("email = ?", adminEmail).First(&existing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			hashed, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
			if err != nil {
				log.Fatalf("failed to hash admin password: %v", err)
			}
			admin := models.User{
				Name:     "Demo Admin",
				Email:    adminEmail,
				Role:     "admin",
				Password: string(hashed),
			}
			if err := db.Create(&admin).Error; err != nil {
				log.Fatalf("failed to create admin user: %v", err)
			}
			fmt.Println("Created admin user:", adminEmail, "password:", adminPassword)
		} else {
			log.Fatalf("failed to query users: %v", err)
		}
	} else {
		fmt.Println("Admin user already exists:", existing.Email)
	}

	fmt.Println("✅ Seed complete. Inserted/ensured demo data:")
	var pCount, cCount, compCount, aCount int64
	db.Model(&models.Property{}).Count(&pCount)
	db.Model(&models.Construction{}).Count(&cCount)
	db.Model(&models.Complaint{}).Count(&compCount)
	db.Model(&models.Alert{}).Count(&aCount)

	fmt.Printf(" - properties: %d\n - constructions: %d\n - complaints: %d\n - alerts: %d\n", pCount, cCount, compCount, aCount)
}
